import { createContext, useCallback, useMemo, useState, type ReactNode } from 'react'
import type { AuthState, User } from './types'
import { buildMockUser, clearAuthState, readAuthState, writeAuthState } from './storage'

export interface AuthContextValue {
  token: string | null
  user: User | null
  isAuthenticated: boolean
  signInWithPassword: (username: string, password: string) => Promise<void>
  signInWithSSO: () => Promise<void>
  signOut: () => void
  updateUser: (user: User) => void
}

export const AuthContext = createContext<AuthContextValue | null>(null)

function nowText() {
  const d = new Date()
  const pad = (n: number) => String(n).padStart(2, '0')
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())} ${pad(d.getHours())}:${pad(d.getMinutes())}`
}

function mockIp() {
  return '10.0.0.1'
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<AuthState | null>(() => readAuthState())

  const signInWithPassword = useCallback(async (username: string, password: string) => {
    const u = username.trim()
    const p = password.trim()
    if (!u || !p) {
      throw new Error('账号或密码不能为空')
    }
    const next: AuthState = {
      token: `mock-token-${Date.now()}`,
      user: buildMockUser({ username: u, loginAt: nowText(), loginIp: mockIp() }),
    }
    writeAuthState(next)
    setState(next)
  }, [])

  const signInWithSSO = useCallback(async () => {
    const next: AuthState = {
      token: `mock-sso-token-${Date.now()}`,
      user: buildMockUser({ username: 'SSO用户', loginAt: nowText(), loginIp: mockIp() }),
    }
    writeAuthState(next)
    setState(next)
  }, [])

  const signOut = useCallback(() => {
    clearAuthState()
    setState(null)
  }, [])

  const updateUser = useCallback((user: User) => {
    setState((prev) => {
      if (!prev) return prev
      const next: AuthState = { ...prev, user }
      writeAuthState(next)
      return next
    })
  }, [])

  const value = useMemo<AuthContextValue>(
    () => ({
      token: state?.token ?? null,
      user: state?.user ?? null,
      isAuthenticated: !!state?.token,
      signInWithPassword,
      signInWithSSO,
      signOut,
      updateUser,
    }),
    [signInWithPassword, signInWithSSO, signOut, state?.token, state?.user, updateUser],
  )

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

