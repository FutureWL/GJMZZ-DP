import { useCallback, useEffect, useMemo, useState } from 'react'
import type { ApiMenuItem } from '../api/menus'
import { fetchUserMenu, fetchUserMenuMock } from '../api/menus'
import type { MenuNode } from '../config/portals'
import { getIconByName } from '../config/iconMap'
import { buildMenuTree } from '../utils/menu'
import { useAuth } from './auth/useAuth'

type UserMenuState = {
  loading: boolean
  error: Error | null
  data: MenuNode[]
}

type UserMenuResult = UserMenuState & {
  reload: () => void
}

/*
  Debug 开关（本地压测边界场景用）：
  - mockDelayMs: 强制延迟（弱网）
  - mockError: 强制抛错（模拟 500）
  - mockBadIcon: 注入不存在的 iconName（测试 Icon Fallback）
  - useMockOnError: 请求失败时回退到 mock 菜单（仅用于本地联调）
*/
const DEBUG_MENU = {
  enabled: false,
  mockDelayMs: 0,
  mockError: false,
  mockBadIcon: false,
  useMockOnError: false,
}

function sleep(ms: number) {
  return new Promise<void>((resolve) => window.setTimeout(resolve, ms))
}

function normalizeTreeMenu(nodes: MenuNode[]): MenuNode[] {
  return nodes.map((n) => ({
    ...n,
    children: n.children?.length ? normalizeTreeMenu(n.children) : undefined,
  }))
}

function injectBadIcon(items: ApiMenuItem[]): ApiMenuItem[] {
  const idx = items.findIndex((x) => !!x.path)
  if (idx < 0) return items
  return items.map((x, i) => (i === idx ? { ...x, iconName: '___BAD_ICON___' } : x))
}

function ensureSalesOrdersEntry(items: ApiMenuItem[]): ApiMenuItem[] {
  const quote = items.find((x) => x.path === '/sales/business/quotes')
  if (!quote?.parentId) return items

  const parentId = quote.parentId
  const exists = items.some((x) => x.parentId === parentId && x.path === '/sales/order')
  if (exists) return items

  const order360 = items.find((x) => x.parentId === parentId && x.path === '/sales/business/order360')
  const qa = typeof quote.sortOrder === 'number' ? quote.sortOrder : 0
  const ob = typeof order360?.sortOrder === 'number' ? (order360?.sortOrder as number) : undefined
  const sortOrder = typeof ob === 'number' ? (qa + ob) / 2 : qa + 0.5

  return [
    ...items,
    {
      id: '/sales/order',
      portalId: quote.portalId,
      parentId,
      label: '销售订单',
      path: '/sales/order',
      iconName: 'ClipboardList',
      sortOrder,
      requiredRoles: [],
    },
  ]
}

function ensureSalesOrdersEntryTree(nodes: MenuNode[]): MenuNode[] {
  const insert = (list: MenuNode[]): MenuNode[] => {
    const idxQuote = list.findIndex((n) => n.to === '/sales/business/quotes')
    if (idxQuote >= 0) {
      const exists = list.some((n) => n.to === '/sales/order')
      if (exists) return list.map((n) => ({ ...n, children: n.children?.length ? insert(n.children) : undefined }))

      const next = [...list]
      next.splice(idxQuote + 1, 0, {
        id: '/sales/order',
        label: '销售订单',
        to: '/sales/order',
        icon: getIconByName('ClipboardList'),
      })
      return next.map((n) => ({ ...n, children: n.children?.length ? insert(n.children) : undefined }))
    }

    return list.map((n) => ({ ...n, children: n.children?.length ? insert(n.children) : undefined }))
  }

  return insert(nodes)
}

function isFlatMenuArray(value: unknown): value is ApiMenuItem[] {
  if (!Array.isArray(value)) return false
  return value.every((v) => v && typeof v === 'object' && 'id' in v && 'label' in v && 'parentId' in v)
}

function isTreeMenuArray(value: unknown): value is MenuNode[] {
  if (!Array.isArray(value)) return false
  return value.every((v) => v && typeof v === 'object' && 'id' in v && 'label' in v)
}

/**
 * 新版后端响应: { items: ApiMenuItem[], roles: string[], profilePosition: string|null, count: number }
 * 旧版响应: ApiMenuItem[] 或 MenuNode[] 直接返回
 * 这里统一提取出菜单项数组
 */
function extractItems(raw: unknown): { items: ApiMenuItem[] | MenuNode[]; isFlat: boolean } | null {
  if (isFlatMenuArray(raw)) return { items: raw, isFlat: true }
  if (isTreeMenuArray(raw)) return { items: raw, isFlat: false }
  if (raw && typeof raw === 'object' && 'items' in raw) {
    const items = (raw as { items?: unknown }).items
    if (isFlatMenuArray(items)) return { items, isFlat: true }
    if (isTreeMenuArray(items)) return { items, isFlat: false }
  }
  return null
}

export function useUserMenu() {
  const auth = useAuth()
  const token = auth.token

  const [state, setState] = useState<UserMenuState>({ loading: true, error: null, data: [] })
  const [reloadKey, setReloadKey] = useState(0)

  const reload = useCallback(() => {
    setReloadKey((v) => v + 1)
  }, [])

  useEffect(() => {
    if (!token) return
    let mounted = true
    setState({ loading: true, error: null, data: [] })
    ;(async () => {
      try {
        if (DEBUG_MENU.enabled && DEBUG_MENU.mockDelayMs > 0) {
          await sleep(DEBUG_MENU.mockDelayMs)
        }
        if (DEBUG_MENU.enabled && DEBUG_MENU.mockError) {
          throw new Error('Mock menu error')
        }

        const raw = await fetchUserMenu(token)
        if (!mounted) return
        const extracted = extractItems(raw)
        if (extracted?.isFlat) {
          const flat = extracted.items as ApiMenuItem[]
          const injected = ensureSalesOrdersEntry(flat)
          const items = DEBUG_MENU.enabled && DEBUG_MENU.mockBadIcon ? injectBadIcon(injected) : injected
          setState({ loading: false, error: null, data: buildMenuTree(items, getIconByName) })
          return
        }
        if (extracted && !extracted.isFlat) {
          const tree = extracted.items as MenuNode[]
          setState({ loading: false, error: null, data: ensureSalesOrdersEntryTree(normalizeTreeMenu(tree)) })
          return
        }
        throw new Error('Invalid menu response')
      } catch (e) {
        if (DEBUG_MENU.enabled && DEBUG_MENU.useMockOnError) {
          try {
            const mock = await fetchUserMenuMock()
            if (!mounted) return
            const items = DEBUG_MENU.mockBadIcon ? injectBadIcon(mock) : mock
            setState({ loading: false, error: null, data: buildMenuTree(items, getIconByName) })
            return
          } catch (mockErr) {
            console.error('[useUserMenu] mock fallback failed:', mockErr)
          }
        }

        if (!mounted) return
        setState({ loading: false, error: e instanceof Error ? e : new Error('Failed to load menu'), data: [] })
      }
    })()
    return () => {
      mounted = false
    }
  }, [reloadKey, token])

  return useMemo<UserMenuResult>(() => ({ ...state, reload }), [reload, state])
}
