/* eslint-disable react-refresh/only-export-components */
import { createContext, useCallback, useEffect, useMemo, useRef, useState, type ReactNode } from 'react'
import type { AuthState, User } from './types'
import { apiGet, apiPut } from '../../api/client'
import { keycloak, supportsSubtleCrypto } from './keycloak'

export interface AuthContextValue {
  token: string | null
  user: User | null
  isLoading: boolean
  isAuthenticated: boolean
  signInWithPassword: (username: string, password: string) => Promise<void>
  signInWithSSO: (nextPath?: string) => Promise<void>
  signOut: () => void
  updateUser: (user: User) => void
}

export const AuthContext = createContext<AuthContextValue | null>(null)

function buildRedirectUri(nextPath?: string) {
  const baseUrl = import.meta.env.BASE_URL
  const normalizedBase = baseUrl.endsWith('/') ? baseUrl : `${baseUrl}/`
  const normalizedNext = (nextPath ?? '/').startsWith('/') ? (nextPath ?? '/') : `/${nextPath}`
  const rel = normalizedNext === '/' ? '' : normalizedNext.slice(1)
  return `${window.location.origin}${normalizedBase}${rel}`
}

interface ProfileResponse {
  user_id: string
  name: string
  employee_id: string
  department: string
  position: string
  phone: string
  email: string
  avatar_text: string
}

function buildUserFromToken(tokenParsed: Record<string, unknown>): User {
  const sub = typeof tokenParsed.sub === 'string' ? tokenParsed.sub : 'unknown'
  const preferredUsername =
    typeof tokenParsed.preferred_username === 'string' ? tokenParsed.preferred_username : undefined
  const name = typeof tokenParsed.name === 'string' ? tokenParsed.name : undefined
  const email = typeof tokenParsed.email === 'string' ? tokenParsed.email : 'user@example.com'

  const realmAccess = tokenParsed.realm_access as { roles?: unknown } | undefined
  const roles = Array.isArray(realmAccess?.roles) ? realmAccess?.roles.filter((r): r is string => typeof r === 'string') : []

  const displayName = name ?? preferredUsername ?? '用户'
  const avatarText = displayName.slice(0, 1).toUpperCase()

  return {
    id: sub,
    name: displayName,
    employeeId: preferredUsername ?? sub,
    department: '制造中心',
    position: '制造工程师',
    phone: '',
    email,
    avatarText,
    roles,
    permissions: roles,
    lastLoginAt: new Date().toISOString(),
    lastLoginIp: '',
  }
}

function mergeUserWithProfile(tokenUser: User, profile: ProfileResponse | null): User {
  if (!profile) return tokenUser
  return {
    ...tokenUser,
    name: profile.name || tokenUser.name,
    employeeId: profile.employee_id || tokenUser.employeeId,
    department: profile.department || tokenUser.department,
    position: profile.position || tokenUser.position,
    phone: profile.phone || tokenUser.phone,
    email: profile.email || tokenUser.email,
    avatarText: profile.avatar_text || tokenUser.avatarText,
  }
}

async function fetchProfile(token: string): Promise<ProfileResponse | null> {
  try {
    return await apiGet<ProfileResponse | null>('/profiles/me', token)
  } catch {
    return null
  }
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<AuthState | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const fetchingRef = useRef(false)

  useEffect(() => {
    let mounted = true
    ;(async () => {
      try {
        const authenticated = await keycloak.init({
          onLoad: 'check-sso',
          // secure context (localhost / https) 才能 PKCE; LAN IP 等走 false
          pkceMethod: supportsSubtleCrypto ? 'S256' : false,
          checkLoginIframe: false,
        })
        if (!mounted) return
        if (authenticated && keycloak.token && keycloak.tokenParsed) {
          const tokenUser = buildUserFromToken(keycloak.tokenParsed as Record<string, unknown>)
          const profile = await fetchProfile(keycloak.token)
          setState({ token: keycloak.token, user: mergeUserWithProfile(tokenUser, profile) })
        } else {
          setState(null)
        }
      } catch (e) {
        console.error('[auth] keycloak.init failed', e)
        if (mounted) setState(null)
      } finally {
        if (mounted) setIsLoading(false)
      }
    })()
    return () => {
      mounted = false
    }
  }, [])

  useEffect(() => {
    if (!state?.token) return
    const id = window.setInterval(() => {
      keycloak
        .updateToken(30)
        .then(async (refreshed) => {
          if (!refreshed) return
          if (fetchingRef.current) return
          fetchingRef.current = true
          try {
            const token = keycloak.token
            const tokenParsed = keycloak.tokenParsed
            if (!token || !tokenParsed) return
            const tokenUser = buildUserFromToken(tokenParsed as Record<string, unknown>)
            const profile = await fetchProfile(token)
            setState({ token, user: mergeUserWithProfile(tokenUser, profile) })
          } finally {
            fetchingRef.current = false
          }
        })
        .catch(() => {})
    }, 10_000)
    return () => window.clearInterval(id)
  }, [state?.token])

  const signInWithPassword = useCallback(async (username: string, password: string) => {
    const u = username.trim()
    const p = password.trim()
    if (!u || !p) {
      throw new Error('账号或密码不能为空')
    }
    await keycloak.login({ loginHint: u, redirectUri: buildRedirectUri('/production/overview') })
  }, [])

  const signInWithSSO = useCallback(async (nextPath?: string) => {
    await keycloak.login({ redirectUri: buildRedirectUri(nextPath) })
  }, [])

  const signOut = useCallback(() => {
    setState(null)
    keycloak.logout({ redirectUri: buildRedirectUri('/login') }).catch(() => {})
  }, [])

  const updateUser = useCallback(
    async (user: User) => {
      const currentToken = keycloak.token
      if (!currentToken) return
      try {
        await apiPut('/profiles/me', currentToken, {
          name: user.name,
          employee_id: user.employeeId,
          department: user.department,
          position: user.position,
          phone: user.phone,
          email: user.email,
          avatar_text: user.avatarText,
        })
      } catch (e) {
        console.error('[auth] failed to load profile:', e)
      }
      setState((prev) => {
        if (!prev) return prev
        return { ...prev, user }
      })
    },
    [],
  )

  const value = useMemo<AuthContextValue>(
    () => ({
      token: state?.token ?? null,
      user: state?.user ?? null,
      isLoading,
      isAuthenticated: !!state?.token,
      signInWithPassword,
      signInWithSSO,
      signOut,
      updateUser,
    }),
    [isLoading, signInWithPassword, signInWithSSO, signOut, state?.token, state?.user, updateUser],
  )

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}
