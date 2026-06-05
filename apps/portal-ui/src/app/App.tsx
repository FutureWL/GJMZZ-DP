import { BrowserRouter } from 'react-router-dom'
import { AppRoutes } from './routes/AppRoutes'
import { AuthProvider } from './state/auth/AuthContext'
import { CrmDataProvider } from './state/crm/CrmDataContext'
import { AdditionalDataProvider } from './state/additional/AdditionalDataContext'
import { IncidentDataProvider } from './state/production/IncidentDataContext'
import { RiskDataProvider } from './state/production/RiskDataContext'
import { ExpenseFlowProvider } from './state/expense/ExpenseFlowContext'
import { ProcurementFlowProvider } from './state/procurement/ProcurementFlowContext'
import { ContractFlowProvider } from './state/contract/ContractFlowContext'
import { MaintenanceFlowProvider } from './state/maintenance/MaintenanceFlowContext'

export default function App() {
  const basename = import.meta.env.BASE_URL.endsWith('/')
    ? import.meta.env.BASE_URL.slice(0, -1)
    : import.meta.env.BASE_URL

  return (
    <AuthProvider>
      <CrmDataProvider>
        <AdditionalDataProvider>
          <IncidentDataProvider>
            <RiskDataProvider>
              <ProcurementFlowProvider>
                <ContractFlowProvider>
                  <ExpenseFlowProvider>
                    <MaintenanceFlowProvider>
                      <BrowserRouter basename={basename}>
                        <AppRoutes />
                      </BrowserRouter>
                    </MaintenanceFlowProvider>
                  </ExpenseFlowProvider>
                </ContractFlowProvider>
              </ProcurementFlowProvider>
            </RiskDataProvider>
          </IncidentDataProvider>
        </AdditionalDataProvider>
      </CrmDataProvider>
    </AuthProvider>
  )
}
