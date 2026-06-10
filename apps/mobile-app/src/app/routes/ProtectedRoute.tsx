import { Navigate, Outlet } from 'react-router-dom'
import { useAuth } from '../state/auth/useAuth'

export function ProtectedRoute() {
  const { isAuthenticated, isLoading, user } = useAuth()

  // 调试日志
  console.log('[ProtectedRoute] Auth state:', {
    isAuthenticated,
    isLoading,
    user: user?.name,
  })

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-4 border-primary-500 border-t-transparent mx-auto mb-4"></div>
          <p className="text-gray-600">正在验证登录状态...</p>
        </div>
      </div>
    )
  }

  if (!isAuthenticated) {
    console.log('[ProtectedRoute] Not authenticated, redirecting to login')
    return <Navigate to="/login" replace />
  }

  console.log('[ProtectedRoute] Authenticated, rendering content')
  return <Outlet />
}
