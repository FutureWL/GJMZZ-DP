import { Navigate, Outlet, useLocation } from 'react-router-dom'
import { useAuth } from '../state/auth/useAuth'

export function ProtectedRoute() {
  const auth = useAuth()
  const loc = useLocation()
  if (!auth.isAuthenticated) {
    const next = encodeURIComponent(`${loc.pathname}${loc.search}`)
    return <Navigate to={`/login?next=${next}`} replace />
  }
  return <Outlet />
}

