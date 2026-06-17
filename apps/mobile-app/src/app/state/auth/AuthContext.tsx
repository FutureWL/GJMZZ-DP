/* eslint-disable react-refresh/only-export-components */
import { createContext, useCallback, useEffect, useMemo, useState, type ReactNode } from 'react'
import type { KeycloakOnLoad } from 'keycloak-js'
import type { AuthState, User } from './types'
import { keycloak } from './keycloak'

export interface AuthContextValue {
  token: string | null
  user: User | null
  isLoading: boolean
  isAuthenticated: boolean
  signInWithSSO: (nextPath?: string) => Promise<void>
  signOut: () => void
}

export const AuthContext = createContext<AuthContextValue | null>(null)

function buildRedirectUri(nextPath?: string) {
  const normalizedBase = window.location.pathname.startsWith('/m/app') ? '/m/app/' : '/'
  const normalizedNext = (nextPath ?? '/').startsWith('/') ? (nextPath ?? '/') : `/${nextPath}`
  const rel = normalizedNext === '/' ? '' : normalizedNext.slice(1)
  return `${window.location.origin}${normalizedBase}${rel}`
}

function buildUserFromToken(tokenParsed: Record<string, unknown>): User {
  const sub = typeof tokenParsed.sub === 'string' ? tokenParsed.sub : 'unknown'
  const preferredUsername =
    typeof tokenParsed.preferred_username === 'string' ? tokenParsed.preferred_username : undefined
  const name = typeof tokenParsed.name === 'string' ? tokenParsed.name : undefined
  const email = typeof tokenParsed.email === 'string' ? tokenParsed.email : 'user@example.com'

  const realmAccess = tokenParsed.realm_access as { roles?: unknown } | undefined
  const roles = Array.isArray(realmAccess?.roles)
    ? realmAccess?.roles.filter((r): r is string => typeof r === 'string')
    : []

  const displayName = name ?? preferredUsername ?? '用户'
  const avatarText = displayName.slice(0, 1).toUpperCase()

  return {
    id: sub,
    name: displayName,
    employeeId: preferredUsername ?? sub,
    department: '移动App',
    position: '',
    phone: '',
    email,
    avatarText,
    roles,
    permissions: roles,
    lastLoginAt: new Date().toISOString(),
    lastLoginIp: '',
  }
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<AuthState | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    let mounted = true

    const initKeycloak = async () => {
      try {
        const authenticated = await keycloak.init({
          onLoad: 'check-sso' as KeycloakOnLoad,
          pkceMethod: 'S256',
          checkLoginIframe: false,
          redirectUri: buildRedirectUri('/'),
        })

        if (!mounted) return

        if (authenticated && keycloak.token && keycloak.tokenParsed) {
          setState({
            token: keycloak.token,
            user: buildUserFromToken(keycloak.tokenParsed as Record<string, unknown>),
          })
        } else {
          setState(null)
        }
      } catch (error) {
        console.error('Keycloak init error:', error)
        if (mounted) setState(null)
      } finally {
        if (mounted) setIsLoading(false)
      }
    }

    initKeycloak()

    return () => {
      mounted = false
    }
  }, [])

  useEffect(() => {
    if (!state?.token) return
    const id = window.setInterval(() => {
      keycloak
        .updateToken(30)
        .then((refreshed) => {
          if (!refreshed) return
          if (!keycloak.token || !keycloak.tokenParsed) return
          setState({
            token: keycloak.token,
            user: buildUserFromToken(keycloak.tokenParsed as Record<string, unknown>),
          })
        })
        .catch(() => {})
    }, 10_000)
    return () => window.clearInterval(id)
  }, [state?.token])

  const signInWithSSO = useCallback(async (nextPath?: string) => {
    await keycloak.login({ redirectUri: buildRedirectUri(nextPath) })
  }, [])

  const signOut = useCallback(() => {
    setState(null)
    keycloak.logout({ redirectUri: buildRedirectUri('/login') }).catch(() => {})
  }, [])

  const value = useMemo<AuthContextValue>(
    () => ({
      token: state?.token ?? null,
      user: state?.user ?? null,
      isLoading,
      isAuthenticated: !!state?.token,
      signInWithSSO,
      signOut,
    }),
    [isLoading, signInWithSSO, signOut, state?.token, state?.user],
  )

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}
