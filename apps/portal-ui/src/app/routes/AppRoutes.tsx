import { Navigate, Route, Routes } from 'react-router-dom'
import { AppLayout } from '../layout/AppLayout'
import { SearchPage } from '../pages/SearchPage'
import { PlaceholderPage } from '../pages/PlaceholderPage'
import { BusinessDashboardPage } from '../pages/business/BusinessDashboardPage'
import { ApprovalCenterPage } from '../pages/management/ApprovalCenterPage'
import { ApprovalDetailPage } from '../pages/management/ApprovalDetailPage'
import { PODetailPage } from '../pages/management/PODetailPage'
import { ProcurementPRDetailPage } from '../pages/management/ProcurementPRDetailPage'
import { ProcurementPRListPage } from '../pages/management/ProcurementPRListPage'
import { RFQDetailPage } from '../pages/management/RFQDetailPage'
import { SupplierDetailPage } from '../pages/management/SupplierDetailPage'
import { SupplierListPage } from '../pages/management/SupplierListPage'
import { AlarmCenterPage } from '../pages/production/AlarmCenterPage'
import { MaintenanceTicketDetailPage } from '../pages/production/MaintenanceTicketDetailPage'
import { MaintenanceTicketListPage } from '../pages/production/MaintenanceTicketListPage'
import { ProductionOverviewPage } from '../pages/production/ProductionOverviewPage'
import { TracePage } from '../pages/production/TracePage'
import { WorkOrderDetailPage } from '../pages/production/WorkOrderDetailPage'
import { WorkOrderListPage } from '../pages/production/WorkOrderListPage'
import { ItTicketDetailPage } from '../pages/support/ItTicketDetailPage'
import { ItTicketListPage } from '../pages/support/ItTicketListPage'
import { SupportHomePage } from '../pages/support/SupportHomePage'

export function AppRoutes() {
  return (
    <Routes>
      <Route path="/" element={<Navigate to="/production/overview" replace />} />
      <Route path="/search" element={<SearchPage />} />

      <Route path="/business" element={<AppLayout portalId="business" />}>
        <Route path="dashboard" element={<BusinessDashboardPage />} />
        <Route path="analysis" element={<PlaceholderPage title="经营分析（占位）" />} />
        <Route path="sales" element={<PlaceholderPage title="客户与机会（占位）" />} />
        <Route path="*" element={<Navigate to="/business/dashboard" replace />} />
      </Route>

      <Route path="/management" element={<AppLayout portalId="management" />}>
        <Route path="approval" element={<ApprovalCenterPage />} />
        <Route path="approval/detail/:id" element={<ApprovalDetailPage />} />
        <Route path="procurement/pr" element={<ProcurementPRListPage />} />
        <Route path="procurement/pr/:id" element={<ProcurementPRDetailPage />} />
        <Route path="procurement/rfq/:id" element={<RFQDetailPage />} />
        <Route path="procurement/po/:id" element={<PODetailPage />} />
        <Route path="srm/suppliers" element={<SupplierListPage />} />
        <Route path="srm/suppliers/:id" element={<SupplierDetailPage />} />
        <Route path="outsourcing/factories" element={<PlaceholderPage title="外协工厂（占位）" />} />
        <Route path="policy" element={<PlaceholderPage title="制度流程库（占位）" />} />
        <Route path="audit" element={<PlaceholderPage title="内控审计（占位）" />} />
        <Route path="kpi" element={<PlaceholderPage title="目标/KPI（占位）" />} />
        <Route path="*" element={<Navigate to="/management/procurement/pr" replace />} />
      </Route>

      <Route path="/production" element={<AppLayout portalId="production" />}>
        <Route path="overview" element={<ProductionOverviewPage />} />
        <Route path="alarms" element={<AlarmCenterPage />} />
        <Route path="workorders" element={<WorkOrderListPage />} />
        <Route path="workorders/:id" element={<WorkOrderDetailPage />} />
        <Route path="schedule" element={<PlaceholderPage title="排程（占位）" />} />
        <Route path="trace" element={<TracePage />} />
        <Route path="equipment" element={<PlaceholderPage title="设备监控（占位）" />} />
        <Route path="maintenance" element={<MaintenanceTicketListPage />} />
        <Route path="maintenance/:id" element={<MaintenanceTicketDetailPage />} />
        <Route path="*" element={<Navigate to="/production/overview" replace />} />
      </Route>

      <Route path="/support" element={<AppLayout portalId="support" />}>
        <Route path="home" element={<SupportHomePage />} />
        <Route path="it/tickets" element={<ItTicketListPage />} />
        <Route path="it/tickets/:id" element={<ItTicketDetailPage />} />
        <Route path="hr" element={<PlaceholderPage title="人事（占位）" />} />
        <Route path="finance" element={<PlaceholderPage title="财务（占位）" />} />
        <Route path="qms" element={<PlaceholderPage title="体系（占位）" />} />
        <Route path="security" element={<PlaceholderPage title="安保（占位）" />} />
        <Route path="data-security" element={<PlaceholderPage title="数据安全（占位）" />} />
        <Route path="ehs" element={<PlaceholderPage title="安全环保（占位）" />} />
        <Route path="*" element={<Navigate to="/support/home" replace />} />
      </Route>

      <Route path="/additional" element={<AppLayout portalId="additional" />}>
        <Route path="home" element={<PlaceholderPage title="附加门户首页（占位）" />} />
        <Route path="tdc" element={<PlaceholderPage title="人才发展中心（占位）" />} />
        <Route path="party" element={<PlaceholderPage title="党群（占位）" />} />
        <Route path="union" element={<PlaceholderPage title="工会（占位）" />} />
        <Route path="women" element={<PlaceholderPage title="妇联（占位）" />} />
        <Route path="*" element={<Navigate to="/additional/home" replace />} />
      </Route>

      <Route path="*" element={<Navigate to="/production/overview" replace />} />
    </Routes>
  )
}

