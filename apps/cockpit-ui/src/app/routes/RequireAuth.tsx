import { Navigate, useLocation } from 'react-router-dom'
import type { ReactNode } from 'react'
import { useAuth } from '../state/auth/useAuth'

export function RequireAuth(props: { children: ReactNode }) {
  const auth = useAuth()
  const loc = useLocation()

  if (auth.isLoading) {
    return null
  }

  if (!auth.isAuthenticated) {
    const next = encodeURIComponent(`${loc.pathname}${loc.search}`)
    return <Navigate to={`/login?next=${next}`} replace />
  }

  return props.children
}
