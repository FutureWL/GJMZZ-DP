import { RouterProvider, createBrowserRouter } from 'react-router-dom'
import { LoginPage } from './pages/auth/LoginPage'
import { HomePage } from './pages/HomePage'
import { ManagementScreen } from './pages/ManagementScreen'
import { ProductionScreen } from './pages/ProductionScreen'
import { RequireAuth } from './routes/RequireAuth'
import { AuthProvider } from './state/auth/AuthContext'

const basename = import.meta.env.BASE_URL.endsWith('/')
  ? import.meta.env.BASE_URL.slice(0, -1)
  : import.meta.env.BASE_URL

const router = createBrowserRouter(
  [
    { path: '/login', element: <LoginPage /> },
    {
      path: '/',
      element: (
        <RequireAuth>
          <HomePage />
        </RequireAuth>
      ),
    },
    {
      path: '/screen/production',
      element: (
        <RequireAuth>
          <ProductionScreen />
        </RequireAuth>
      ),
    },
    {
      path: '/screen/management',
      element: (
        <RequireAuth>
          <ManagementScreen />
        </RequireAuth>
      ),
    },
  ],
  { basename },
)

export default function App() {
  return (
    <AuthProvider>
      <RouterProvider router={router} />
    </AuthProvider>
  )
}
