import { Navigate, Route, Routes, useParams } from 'react-router-dom'
import { AppLayout } from '../layout/AppLayout'
import { SearchPage } from '../pages/SearchPage'
import { PlaceholderPage } from '../pages/PlaceholderPage'
import { WorkbenchPage } from '../pages/workbench/WorkbenchPage'
import { WorkflowTaskPage } from '../pages/workflow/WorkflowTaskPage'
import { BusinessDashboardPage } from '../pages/business/BusinessDashboardPage'
import { ActivityListPage } from '../pages/business/crm/ActivityListPage'
import { ContactDetailPage } from '../pages/business/crm/ContactDetailPage'
import { ContactListPage } from '../pages/business/crm/ContactListPage'
import { CustomerDetailPage } from '../pages/business/crm/CustomerDetailPage'
import { CustomerListPage } from '../pages/business/crm/CustomerListPage'
import { OpportunityDetailPage } from '../pages/business/crm/OpportunityDetailPage'
import { OpportunityListPage } from '../pages/business/crm/OpportunityListPage'
import { QuoteDetailPage } from '../pages/business/crm/QuoteDetailPage'
import { QuoteListPage } from '../pages/business/crm/QuoteListPage'
import { Order360DetailPage } from '../pages/business/orders/Order360DetailPage'
import { CreateSalesOrderPage } from '../pages/business/orders/CreateSalesOrderPage'
import { OrderListPage } from '../pages/business/orders/OrderListPage'
import { SalesOrderListPage } from '../pages/business/orders/SalesOrderListPage'
import { LoginPage } from '../pages/auth/LoginPage'
import { AccountLayout } from '../pages/account/AccountLayout'
import { ProfilePage } from '../pages/account/ProfilePage'
import { SecurityPage } from '../pages/account/SecurityPage'
import { RolesPage } from '../pages/account/RolesPage'
import { SessionsPage } from '../pages/account/SessionsPage'
import { ApprovalCenterPage } from '../pages/management/ApprovalCenterPage'
import { ApprovalDetailPage } from '../pages/management/ApprovalDetailPage'
import { AuditLogPage } from '../pages/management/AuditLogPage'
import { NotificationCenterPage } from '../pages/management/NotificationCenterPage'
import { PermissionMatrixPage } from '../pages/management/PermissionMatrixPage'
import { PODetailPage } from '../pages/management/PODetailPage'
import { ProcurementPRDetailPage } from '../pages/management/ProcurementPRDetailPage'
import { ProcurementPRListPage } from '../pages/management/ProcurementPRListPage'
import { RFQDetailPage } from '../pages/management/RFQDetailPage'
import { SupplierDetailPage } from '../pages/management/SupplierDetailPage'
import { SupplierListPage } from '../pages/management/SupplierListPage'
import { ContractGuidePage } from '../pages/management/contract/ContractGuidePage'
import { ContractReviewDetailPage } from '../pages/management/contract/ContractReviewDetailPage'
import { ContractReviewNewPage } from '../pages/management/contract/ContractReviewNewPage'
import { ExpenseClaimDetailPage } from '../pages/management/expense/ExpenseClaimDetailPage'
import { ExpenseClaimNewPage } from '../pages/management/expense/ExpenseClaimNewPage'
import { ExpenseFlowDashboardPage } from '../pages/management/expense/ExpenseFlowDashboardPage'
import { ExpenseFlowGuidePage } from '../pages/management/expense/ExpenseFlowGuidePage'
import { ProcurementPRNewPage } from '../pages/management/procurement/ProcurementPRNewPage'
import { ExpenseDetailPage } from '../pages/management/erp/ExpenseDetailPage'
import { ExpenseListPage } from '../pages/management/erp/ExpenseListPage'
import { InventoryDetailPage } from '../pages/management/erp/InventoryDetailPage'
import { InventoryListPage } from '../pages/management/erp/InventoryListPage'
import { MasterDataPage } from '../pages/management/erp/MasterDataPage'
import { AlarmCenterPage } from '../pages/production/AlarmCenterPage'
import { MaintenanceTicketDetailPage } from '../pages/production/MaintenanceTicketDetailPage'
import { MaintenanceTicketListPage } from '../pages/production/MaintenanceTicketListPage'
import { ProductionOverviewPage } from '../pages/production/ProductionOverviewPage'
import { TracePage } from '../pages/production/TracePage'
import { WorkOrderDetailPage } from '../pages/production/WorkOrderDetailPage'
import { WorkOrderListPage } from '../pages/production/WorkOrderListPage'
import { MaintenanceDashboardPage } from '../pages/production/maintenance/MaintenanceDashboardPage'
import { MaintenanceTicketNewPage } from '../pages/production/maintenance/MaintenanceTicketNewPage'
import { DispatchListPage } from '../pages/production/mes/DispatchListPage'
import { QualityTaskDetailPage } from '../pages/production/mes/QualityTaskDetailPage'
import { QualityTaskListPage } from '../pages/production/mes/QualityTaskListPage'
import { ReportPage } from '../pages/production/mes/ReportPage'
import { IncidentDetailPage } from '../pages/production/incidents/IncidentDetailPage'
import { IncidentListPage } from '../pages/production/incidents/IncidentListPage'
import { IncidentUpsertPage } from '../pages/production/incidents/IncidentUpsertPage'
import { BottlenecksPage } from '../pages/production/delivery/BottlenecksPage'
import { DeliveryRiskOverviewPage } from '../pages/production/delivery/DeliveryRiskOverviewPage'
import { MaterialShortagePage } from '../pages/production/delivery/MaterialShortagePage'
import { QualityHoldsPage } from '../pages/production/delivery/QualityHoldsPage'
import { MorningMeetingFactoryPage } from '../pages/production/meeting/MorningMeetingFactoryPage'
import { MorningMeetingGroupPage } from '../pages/production/meeting/MorningMeetingGroupPage'
import { MorningMeetingRiskDetailPage } from '../pages/production/meeting/MorningMeetingRiskDetailPage'
import { RiskDetailPage } from '../pages/production/risks/RiskDetailPage'
import { RiskListPage } from '../pages/production/risks/RiskListPage'
import { ItTicketDetailPage } from '../pages/support/ItTicketDetailPage'
import { ItTicketListPage } from '../pages/support/ItTicketListPage'
import { SupportAnnouncementPage } from '../pages/support/SupportAnnouncementPage'
import { SupportHomePage } from '../pages/support/SupportHomePage'
import { SupportKnowledgeBasePage } from '../pages/support/SupportKnowledgeBasePage'
import { SupportRequestDetailPage } from '../pages/support/SupportRequestDetailPage'
import { SupportRequestListPage } from '../pages/support/SupportRequestListPage'
import { SupportTicketDetailPage } from '../pages/support/SupportTicketDetailPage'
import { SupportTicketListPage } from '../pages/support/SupportTicketListPage'
import { CockpitPrototypePage } from '../pages/prototypes/CockpitPrototypePage'
import { MobileCrmPrototypePage } from '../pages/prototypes/MobileCrmPrototypePage'
import { MobilePortalPrototypePage } from '../pages/prototypes/MobilePortalPrototypePage'
import { PrototypeHubPage } from '../pages/prototypes/PrototypeHubPage'
import { TvWallboardPrototypePage } from '../pages/prototypes/TvWallboardPrototypePage'
import {
  AdditionalAdminContentsPage,
  AdditionalAdminHomePage,
  AdditionalAdminPermissionsPage,
  AdditionalAdminRequestsPage,
  AdditionalAdminServicesPage,
  AdditionalApplyPage,
  AdditionalCenterPage,
  AdditionalContentListPage,
  AdditionalGlobalAdminCentersPage,
  AdditionalGlobalAdminContentsPage,
  AdditionalGlobalAdminHomePage,
  AdditionalGlobalAdminPermissionsPage,
  AdditionalGlobalAdminRequestsPage,
  AdditionalGlobalAdminServicesPage,
  AdditionalHomePage,
  AdditionalRequestDetailPage,
  AdditionalRequestsPage,
  AdditionalServiceDetailPage,
  AdditionalServiceListPage,
} from '../pages/additional/AdditionalModulePages'
import { ProtectedRoute } from './ProtectedRoute'
import { useAuth } from '../state/auth/useAuth'

function RedirectRiskDetail() {
  const { riskId } = useParams()
  return <Navigate to={riskId ? `/quality/delivery-pool/${riskId}` : '/quality/delivery-pool'} replace />
}

function RedirectIncidentDetail() {
  const { id } = useParams()
  return <Navigate to={id ? `/quality/exceptions/${id}` : '/quality/exceptions'} replace />
}

function RedirectIncidentEdit() {
  const { id } = useParams()
  return <Navigate to={id ? `/quality/exceptions/${id}/edit` : '/quality/exceptions'} replace />
}

function RedirectInspectionDetail() {
  const { id } = useParams()
  return <Navigate to={id ? `/quality/inspections/${id}` : '/quality/inspections'} replace />
}

function RedirectMaintenanceDetail() {
  const { id } = useParams()
  return <Navigate to={id ? `/equipment/workorders/${id}` : '/equipment/workorders'} replace />
}

function RedirectProcurementPrDetail() {
  const { id } = useParams()
  return <Navigate to={id ? `/supply/procurement/orders/${id}` : '/supply/procurement/orders'} replace />
}

function RedirectSupplierDetail() {
  const { id } = useParams()
  return <Navigate to={id ? `/supply/suppliers/list/${id}` : '/supply/suppliers/list'} replace />
}

function RedirectContractReviewDetail() {
  const { id } = useParams()
  return <Navigate to={id ? `/supply/suppliers/contracts/${id}` : '/supply/suppliers/contracts'} replace />
}

function RedirectCustomerDetail() {
  const { id } = useParams()
  return <Navigate to={id ? `/sales/crm/customers/${id}` : '/sales/crm/customers'} replace />
}

function RedirectContactDetail() {
  const { id } = useParams()
  return <Navigate to={id ? `/sales/crm/contacts/${id}` : '/sales/crm/contacts'} replace />
}

function RedirectOpportunityDetail() {
  const { id } = useParams()
  return <Navigate to={id ? `/sales/business/opportunities/${id}` : '/sales/business/opportunities'} replace />
}

function RedirectQuoteDetail() {
  const { id } = useParams()
  return <Navigate to={id ? `/sales/business/quotes/${id}` : '/sales/business/quotes'} replace />
}

function RedirectOrder360Detail() {
  const { id } = useParams()
  return <Navigate to={id ? `/sales/business/order360/${id}` : '/sales/business/order360'} replace />
}

function RedirectMorningMeetingFactory() {
  const { factoryId } = useParams()
  return <Navigate to={factoryId ? `/production/dashboards/morning-meeting/factories/${factoryId}` : '/production/dashboards/morning-meeting'} replace />
}

function RedirectMorningMeetingRisk() {
  const { id } = useParams()
  return <Navigate to={id ? `/production/dashboards/morning-meeting/risks/${id}` : '/production/dashboards/morning-meeting'} replace />
}

function RedirectWorkOrderDetail() {
  const { id } = useParams()
  return <Navigate to={id ? `/production/execution/workorders/${id}` : '/production/execution/workorders'} replace />
}

export function AppRoutes() {
  const auth = useAuth()
  return (
    <Routes>
      <Route
        path="/"
        element={
          auth.isAuthenticated ? (
            <Navigate to="/workbench" replace />
          ) : (
            <Navigate to="/login" replace />
          )
        }
      />
      <Route path="/login" element={<LoginPage />} />

      <Route element={<ProtectedRoute />}>
        <Route element={<AppLayout portalId="main" />}>
          <Route path="/workbench" element={<WorkbenchPage />} />
            <Route path="/workflow/tasks/:id" element={<WorkflowTaskPage />} />
          <Route path="/search" element={<SearchPage />} />

          <Route path="/sales">
            <Route path="crm/customers" element={<CustomerListPage />} />
            <Route path="crm/customers/:id" element={<CustomerDetailPage />} />
            <Route path="crm/contacts" element={<ContactListPage />} />
            <Route path="crm/contacts/:id" element={<ContactDetailPage />} />
            <Route path="crm/activities" element={<ActivityListPage />} />
            <Route path="business/opportunities" element={<OpportunityListPage />} />
            <Route path="business/opportunities/:id" element={<OpportunityDetailPage />} />
            <Route path="business/quotes" element={<QuoteListPage />} />
            <Route path="business/quotes/:id" element={<QuoteDetailPage />} />
            <Route path="business/order360" element={<OrderListPage />} />
            <Route path="business/orders/new" element={<Navigate to="/sales/order/create" replace />} />
            <Route path="business/order360/:id" element={<Order360DetailPage />} />
            <Route path="business/dashboard" element={<BusinessDashboardPage />} />
            <Route path="order" element={<SalesOrderListPage />} />
            <Route path="order/create" element={<CreateSalesOrderPage />} />
            <Route path="*" element={<Navigate to="/sales/business/dashboard" replace />} />
          </Route>

          <Route path="/account" element={<AccountLayout />}>
            <Route path="profile" element={<ProfilePage />} />
            <Route path="security" element={<SecurityPage />} />
            <Route path="roles" element={<RolesPage />} />
            <Route path="sessions" element={<SessionsPage />} />
            <Route path="*" element={<Navigate to="/account/profile" replace />} />
          </Route>

          <Route path="/business">
            <Route path="dashboard" element={<Navigate to="/sales/business/dashboard" replace />} />
            <Route path="analysis" element={<Navigate to="/sales/business/dashboard" replace />} />
            <Route path="sales" element={<Navigate to="/sales/business/dashboard" replace />} />
            <Route path="crm/guide" element={<Navigate to="/sales/crm/customers" replace />} />
            <Route path="crm/customers" element={<Navigate to="/sales/crm/customers" replace />} />
            <Route path="crm/customers/:id" element={<RedirectCustomerDetail />} />
            <Route path="crm/opportunities" element={<Navigate to="/sales/business/opportunities" replace />} />
            <Route path="crm/opportunities/:id" element={<RedirectOpportunityDetail />} />
            <Route path="crm/contacts" element={<Navigate to="/sales/crm/contacts" replace />} />
            <Route path="crm/contacts/:id" element={<RedirectContactDetail />} />
            <Route path="crm/activities" element={<Navigate to="/sales/crm/activities" replace />} />
            <Route path="crm/quotes" element={<Navigate to="/sales/business/quotes" replace />} />
            <Route path="crm/quotes/:id" element={<RedirectQuoteDetail />} />
            <Route path="orders" element={<Navigate to="/sales/business/order360" replace />} />
            <Route path="orders/new" element={<Navigate to="/sales/order/create" replace />} />
            <Route path="orders/:id" element={<RedirectOrder360Detail />} />
            <Route path="*" element={<Navigate to="/sales/business/dashboard" replace />} />
          </Route>

          <Route path="/management">
            <Route path="approval" element={<ApprovalCenterPage />} />
            <Route path="approval/detail/:id" element={<ApprovalDetailPage />} />
            <Route path="notifications" element={<NotificationCenterPage />} />
            <Route path="audit/log" element={<AuditLogPage />} />
            <Route path="security/permissions" element={<PermissionMatrixPage />} />
            <Route path="expense/guide" element={<ExpenseFlowGuidePage />} />
            <Route path="expense/claims/new" element={<ExpenseClaimNewPage />} />
            <Route path="expense/claims/:id" element={<ExpenseClaimDetailPage />} />
            <Route path="expense/dashboard" element={<ExpenseFlowDashboardPage />} />
            <Route path="procurement/guide" element={<Navigate to="/supply/procurement/orders" replace />} />
            <Route path="procurement/pr/new" element={<Navigate to="/supply/procurement/create-pr" replace />} />
            <Route path="procurement/pr" element={<Navigate to="/supply/procurement/orders" replace />} />
            <Route path="procurement/pr/:id" element={<RedirectProcurementPrDetail />} />
            <Route path="procurement/rfq/:id" element={<RFQDetailPage />} />
            <Route path="procurement/po/:id" element={<PODetailPage />} />
            <Route path="contract/guide" element={<ContractGuidePage />} />
            <Route path="contract/reviews/new" element={<Navigate to="/supply/suppliers/contracts" replace />} />
            <Route path="contract/reviews/:id" element={<RedirectContractReviewDetail />} />
            <Route path="srm/suppliers" element={<Navigate to="/supply/suppliers/list" replace />} />
            <Route path="srm/suppliers/:id" element={<RedirectSupplierDetail />} />
            <Route path="erp/inventory" element={<InventoryListPage />} />
            <Route path="erp/inventory/:id" element={<InventoryDetailPage />} />
            <Route path="erp/expenses" element={<ExpenseListPage />} />
            <Route path="erp/expenses/:id" element={<ExpenseDetailPage />} />
            <Route path="erp/master-data" element={<MasterDataPage />} />
            <Route path="outsourcing/factories" element={<Navigate to="/supply/suppliers/outsourcing" replace />} />
            <Route path="policy" element={<PlaceholderPage title="制度流程库（占位）" />} />
            <Route path="audit" element={<PlaceholderPage title="内控审计（占位）" />} />
            <Route path="kpi" element={<PlaceholderPage title="目标/KPI（占位）" />} />
            <Route path="*" element={<Navigate to="/management/procurement/pr" replace />} />
          </Route>

          <Route path="/quality">
            <Route path="delivery-overview" element={<DeliveryRiskOverviewPage />} />
            <Route path="delivery-pool" element={<RiskListPage />} />
            <Route path="delivery-pool/:riskId" element={<RiskDetailPage />} />
            <Route path="alerts" element={<AlarmCenterPage />} />
            <Route path="exceptions" element={<IncidentListPage />} />
            <Route path="exceptions/new" element={<IncidentUpsertPage mode="create" />} />
            <Route path="exceptions/:id" element={<IncidentDetailPage />} />
            <Route path="exceptions/:id/edit" element={<IncidentUpsertPage mode="edit" />} />
            <Route path="inspections" element={<QualityTaskListPage />} />
            <Route path="inspections/:id" element={<QualityTaskDetailPage />} />
            <Route path="traceability" element={<TracePage />} />
            <Route path="*" element={<Navigate to="/quality/delivery-overview" replace />} />
          </Route>

          <Route path="/equipment">
            <Route path="monitoring" element={<PlaceholderPage title="设备监控（占位）" />} />
            <Route path="workorders" element={<MaintenanceTicketListPage />} />
            <Route path="workorders/new" element={<MaintenanceTicketNewPage />} />
            <Route path="workorders/:id" element={<MaintenanceTicketDetailPage />} />
            <Route path="dashboard" element={<MaintenanceDashboardPage />} />
            <Route path="*" element={<Navigate to="/equipment/workorders" replace />} />
          </Route>

          <Route path="/supply">
            <Route path="procurement/orders" element={<ProcurementPRListPage />} />
            <Route path="procurement/orders/:id" element={<ProcurementPRDetailPage />} />
            <Route path="procurement/create-pr" element={<ProcurementPRNewPage />} />
            <Route path="suppliers/list" element={<SupplierListPage />} />
            <Route path="suppliers/list/:id" element={<SupplierDetailPage />} />
            <Route path="suppliers/contracts" element={<ContractReviewNewPage />} />
            <Route path="suppliers/contracts/:id" element={<ContractReviewDetailPage />} />
            <Route path="suppliers/outsourcing" element={<PlaceholderPage title="外协工厂（占位）" />} />
            <Route path="*" element={<Navigate to="/supply/procurement/orders" replace />} />
          </Route>

          <Route path="/production">
            <Route path="dashboards/factory" element={<ProductionOverviewPage />} />
            <Route path="dashboards/morning-meeting" element={<MorningMeetingGroupPage />} />
            <Route path="dashboards/morning-meeting/factories/:factoryId" element={<MorningMeetingFactoryPage />} />
            <Route path="dashboards/morning-meeting/risks/:id" element={<MorningMeetingRiskDetailPage />} />
            <Route path="execution/scheduling" element={<PlaceholderPage title="排程（占位）" />} />
            <Route path="execution/workorders" element={<WorkOrderListPage />} />
            <Route path="execution/workorders/:id" element={<WorkOrderDetailPage />} />
            <Route path="execution/dispatch" element={<DispatchListPage />} />
            <Route path="execution/reporting" element={<ReportPage />} />
            <Route path="overview" element={<Navigate to="/production/dashboards/factory" replace />} />
            <Route path="meeting" element={<Navigate to="/production/dashboards/morning-meeting" replace />} />
            <Route path="meeting/factories/:factoryId" element={<RedirectMorningMeetingFactory />} />
            <Route path="meeting/risks/:id" element={<RedirectMorningMeetingRisk />} />
            <Route path="delivery/overview" element={<Navigate to="/quality/delivery-overview" replace />} />
            <Route path="delivery/material-shortage" element={<MaterialShortagePage />} />
            <Route path="delivery/bottlenecks" element={<BottlenecksPage />} />
            <Route path="delivery/quality-holds" element={<QualityHoldsPage />} />
            <Route path="risks" element={<Navigate to="/quality/delivery-pool" replace />} />
            <Route path="risks/:riskId" element={<RedirectRiskDetail />} />
            <Route path="alarms" element={<Navigate to="/quality/alerts" replace />} />
            <Route path="incidents" element={<Navigate to="/quality/exceptions" replace />} />
            <Route path="incidents/new" element={<Navigate to="/quality/exceptions/new" replace />} />
            <Route path="incidents/:id" element={<RedirectIncidentDetail />} />
            <Route path="incidents/:id/edit" element={<RedirectIncidentEdit />} />
            <Route path="mes/dispatch" element={<Navigate to="/production/execution/dispatch" replace />} />
            <Route path="mes/report" element={<Navigate to="/production/execution/reporting" replace />} />
            <Route path="mes/quality" element={<Navigate to="/quality/inspections" replace />} />
            <Route path="mes/quality/:id" element={<RedirectInspectionDetail />} />
            <Route path="workorders" element={<Navigate to="/production/execution/workorders" replace />} />
            <Route path="workorders/:id" element={<RedirectWorkOrderDetail />} />
            <Route path="schedule" element={<Navigate to="/production/execution/scheduling" replace />} />
            <Route path="trace" element={<Navigate to="/quality/traceability" replace />} />
            <Route path="equipment" element={<Navigate to="/equipment/monitoring" replace />} />
            <Route path="maintenance/guide" element={<Navigate to="/equipment/workorders" replace />} />
            <Route path="maintenance/new" element={<Navigate to="/equipment/workorders/new" replace />} />
            <Route path="maintenance/dashboard" element={<Navigate to="/equipment/dashboard" replace />} />
            <Route path="maintenance" element={<Navigate to="/equipment/workorders" replace />} />
            <Route path="maintenance/:id" element={<RedirectMaintenanceDetail />} />
            <Route path="*" element={<Navigate to="/production/dashboards/factory" replace />} />
          </Route>

          <Route path="/support">
            <Route path="home" element={<SupportHomePage />} />
            <Route path="tickets" element={<SupportTicketListPage />} />
            <Route path="tickets/:id" element={<SupportTicketDetailPage />} />
            <Route path="requests" element={<SupportRequestListPage />} />
            <Route path="requests/:id" element={<SupportRequestDetailPage />} />
            <Route path="notices" element={<SupportAnnouncementPage />} />
            <Route path="kb" element={<SupportKnowledgeBasePage />} />
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

          <Route path="/additional">
            <Route path="home" element={<AdditionalHomePage />} />
            <Route path="requests" element={<AdditionalRequestsPage />} />
            <Route path="requests/:id" element={<AdditionalRequestDetailPage />} />
            <Route path="admin" element={<AdditionalGlobalAdminHomePage />} />
            <Route path="admin/centers" element={<AdditionalGlobalAdminCentersPage />} />
            <Route path="admin/services" element={<AdditionalGlobalAdminServicesPage />} />
            <Route path="admin/requests" element={<AdditionalGlobalAdminRequestsPage />} />
            <Route path="admin/contents" element={<AdditionalGlobalAdminContentsPage />} />
            <Route path="admin/permissions" element={<AdditionalGlobalAdminPermissionsPage />} />
            <Route path="prototypes" element={<PrototypeHubPage />} />
            <Route path="prototypes/mobile-portal" element={<MobilePortalPrototypePage />} />
            <Route path="prototypes/mobile-crm" element={<MobileCrmPrototypePage />} />
            <Route path="prototypes/tv-wallboard" element={<TvWallboardPrototypePage />} />
            <Route path="prototypes/cockpit" element={<CockpitPrototypePage />} />
            <Route path=":center" element={<AdditionalCenterPage />} />
            <Route path=":center/services" element={<AdditionalServiceListPage />} />
            <Route path=":center/services/:serviceId" element={<AdditionalServiceDetailPage />} />
            <Route path=":center/apply/:serviceId" element={<AdditionalApplyPage />} />
            <Route path=":center/requests" element={<AdditionalRequestsPage />} />
            <Route path=":center/content/:type" element={<AdditionalContentListPage />} />
            <Route path=":center/admin" element={<AdditionalAdminHomePage />} />
            <Route path=":center/admin/services" element={<AdditionalAdminServicesPage />} />
            <Route path=":center/admin/requests" element={<AdditionalAdminRequestsPage />} />
            <Route path=":center/admin/contents" element={<AdditionalAdminContentsPage />} />
            <Route path=":center/admin/permissions" element={<AdditionalAdminPermissionsPage />} />
            <Route path="*" element={<Navigate to="/additional/home" replace />} />
          </Route>
        </Route>
      </Route>

      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  )
}
