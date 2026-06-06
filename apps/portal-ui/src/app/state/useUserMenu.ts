import { useEffect, useMemo, useState } from 'react'
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

  useEffect(() => {
    if (!token) return
    let mounted = true
    setState({ loading: true, error: null, data: [] })
    ;(async () => {
      try {
        const raw = await fetchUserMenu(token)
        if (!mounted) return
        if (isFlatMenuArray(raw)) {
          setState({ loading: false, error: null, data: buildMenuTree(raw, getIconByName) })
          return
        }
        if (isTreeMenuArray(raw)) {
          setState({ loading: false, error: null, data: raw })
          return
        }
        throw new Error('Invalid menu response')
      } catch {
        try {
          const mock = await fetchUserMenuMock()
          if (!mounted) return
          setState({ loading: false, error: null, data: buildMenuTree(mock, getIconByName) })
        } catch (e) {
          if (!mounted) return
          setState({ loading: false, error: e instanceof Error ? e : new Error('Failed to load menu'), data: [] })
        }
      }
    })()
    return () => {
      mounted = false
    }
  }, [token])

  return useMemo(() => state, [state])
}

