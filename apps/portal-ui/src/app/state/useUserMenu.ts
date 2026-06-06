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

function isFlatMenuArray(value: unknown): value is ApiMenuItem[] {
  if (!Array.isArray(value)) return false
  return value.every((v) => v && typeof v === 'object' && 'id' in v && 'label' in v && 'parentId' in v)
}

function isTreeMenuArray(value: unknown): value is MenuNode[] {
  if (!Array.isArray(value)) return false
  return value.every((v) => v && typeof v === 'object' && 'id' in v && 'label' in v)
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
        if (isFlatMenuArray(raw)) {
          const items = DEBUG_MENU.enabled && DEBUG_MENU.mockBadIcon ? injectBadIcon(raw) : raw
          setState({ loading: false, error: null, data: buildMenuTree(items, getIconByName) })
          return
        }
        if (isTreeMenuArray(raw)) {
          setState({ loading: false, error: null, data: normalizeTreeMenu(raw) })
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
          } catch {
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
