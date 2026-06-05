import { RouterProvider, createBrowserRouter } from 'react-router-dom'
import { HomePage } from './pages/HomePage'
import { ManagementScreen } from './pages/ManagementScreen'
import { ProductionScreen } from './pages/ProductionScreen'

const basename = import.meta.env.BASE_URL.endsWith('/')
  ? import.meta.env.BASE_URL.slice(0, -1)
  : import.meta.env.BASE_URL

const router = createBrowserRouter(
  [
    { path: '/', element: <HomePage /> },
    { path: '/screen/production', element: <ProductionScreen /> },
    { path: '/screen/management', element: <ManagementScreen /> },
  ],
  { basename },
)

export default function App() {
  return <RouterProvider router={router} />
}
