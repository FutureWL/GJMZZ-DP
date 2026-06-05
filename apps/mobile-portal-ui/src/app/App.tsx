import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom'
import { LoginPage } from './pages/auth/LoginPage'
import { HomePage } from './pages/HomePage'
import { TasksPage } from './pages/TasksPage'
import { CrmHomePage } from './pages/crm/CrmHomePage'
import { CustomerProfilePage } from './pages/crm/CustomerProfilePage'
import { NewFollowUpPage } from './pages/crm/NewFollowUpPage'
import { VisitCheckInPage } from './pages/crm/VisitCheckInPage'
import { VisitDetailPage } from './pages/crm/VisitDetailPage'
import { VisitPlanUpsertPage } from './pages/crm/VisitPlanUpsertPage'
import { MePage } from './pages/MePage'
import { ProtectedRoute } from './routes/ProtectedRoute'
import { AuthProvider } from './state/auth/AuthContext'
import { MobileCrmProvider } from './state/crm/MobileCrmContext'

export default function App() {
  const basename = import.meta.env.BASE_URL.endsWith('/')
    ? import.meta.env.BASE_URL.slice(0, -1)
    : import.meta.env.BASE_URL

  return (
    <AuthProvider>
      <MobileCrmProvider>
        <BrowserRouter basename={basename}>
          <Routes>
            <Route path="/login" element={<LoginPage />} />
            <Route element={<ProtectedRoute />}>
              <Route path="/" element={<HomePage />} />
              <Route path="/tasks" element={<TasksPage />} />
              <Route path="/crm" element={<CrmHomePage />} />
              <Route path="/crm/plans/new" element={<VisitPlanUpsertPage />} />
              <Route path="/crm/plans/:id/edit" element={<VisitPlanUpsertPage />} />
              <Route path="/crm/customers/:id" element={<CustomerProfilePage />} />
              <Route path="/crm/visits/:id" element={<VisitDetailPage />} />
              <Route path="/crm/visits/:id/check-in" element={<VisitCheckInPage />} />
              <Route path="/crm/follow-ups/new" element={<NewFollowUpPage />} />
              <Route path="/me" element={<MePage />} />
              <Route path="*" element={<Navigate to="/" replace />} />
            </Route>
          </Routes>
        </BrowserRouter>
      </MobileCrmProvider>
    </AuthProvider>
  )
}
