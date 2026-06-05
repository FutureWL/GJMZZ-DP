import { Navigate, Route, Routes } from 'react-router-dom'
import { AppLayout } from '../layout/AppLayout'
import { SearchPage } from '../pages/SearchPage'
import { PlaceholderPage } from '../pages/PlaceholderPage'
import { BusinessDashboardPage } from '../pages/business/BusinessDashboardPage'
import { ActivityListPage } from '../pages/business/crm/ActivityListPage'
import { ContactDetailPage } from '../pages/business/crm/ContactDetailPage'
import { ContactListPage } from '../pages/business/crm/ContactListPage'
import { CustomerDetailPage } from '../pages/business/crm/CustomerDetailPage'
import { CustomerListPage } from '../pages/business/crm/CustomerListPage'
import { CrmProcessGuidePage } from '../pages/business/crm/CrmProcessGuidePage'
import { OpportunityDetailPage } from '../pages/business/crm/OpportunityDetailPage'
import { OpportunityListPage } from '../pages/business/crm/OpportunityListPage'
import { QuoteDetailPage } from '../pages/business/crm/QuoteDetailPage'
import { QuoteListPage } from '../pages/business/crm/QuoteListPage'
import { Order360DetailPage } from '../pages/business/orders/Order360DetailPage'
import { OrderListPage } from '../pages/business/orders/OrderListPage'
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
import { ProcurementGuidePage } from '../pages/management/procurement/ProcurementGuidePage'
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
import { MaintenanceGuidePage } from '../pages/production/maintenance/MaintenanceGuidePage'
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

export function AppRoutes() {
  const auth = useAuth()
  return (
    <Routes>
      <Route
        path="/"
        element={
          auth.isAuthenticated ? (
            <Navigate to="/production/overview" replace />
          ) : (
            <Navigate to="/login" replace />
          )
        }
      />
      <Route path="/login" element={<LoginPage />} />

      <Route element={<ProtectedRoute />}>
        <Route path="/search" element={<SearchPage />} />

        <Route path="/account" element={<AccountLayout />}>
          <Route path="profile" element={<ProfilePage />} />
          <Route path="security" element={<SecurityPage />} />
          <Route path="roles" element={<RolesPage />} />
          <Route path="sessions" element={<SessionsPage />} />
          <Route path="*" element={<Navigate to="/account/profile" replace />} />
        </Route>

        <Route path="/business" element={<AppLayout portalId="business" />}>
          <Route path="dashboard" element={<BusinessDashboardPage />} />
          <Route path="analysis" element={<PlaceholderPage title="经营分析（占位）" />} />
          <Route path="sales" element={<PlaceholderPage title="客户与机会（占位）" />} />
          <Route path="crm/guide" element={<CrmProcessGuidePage />} />
          <Route path="crm/customers" element={<CustomerListPage />} />
          <Route path="crm/customers/:id" element={<CustomerDetailPage />} />
          <Route path="crm/opportunities" element={<OpportunityListPage />} />
          <Route path="crm/opportunities/:id" element={<OpportunityDetailPage />} />
          <Route path="crm/contacts" element={<ContactListPage />} />
          <Route path="crm/contacts/:id" element={<ContactDetailPage />} />
          <Route path="crm/activities" element={<ActivityListPage />} />
          <Route path="crm/quotes" element={<QuoteListPage />} />
          <Route path="crm/quotes/:id" element={<QuoteDetailPage />} />
          <Route path="orders" element={<OrderListPage />} />
          <Route path="orders/:id" element={<Order360DetailPage />} />
          <Route path="*" element={<Navigate to="/business/dashboard" replace />} />
        </Route>

        <Route path="/management" element={<AppLayout portalId="management" />}>
          <Route path="approval" element={<ApprovalCenterPage />} />
          <Route path="approval/detail/:id" element={<ApprovalDetailPage />} />
          <Route path="notifications" element={<NotificationCenterPage />} />
          <Route path="audit/log" element={<AuditLogPage />} />
          <Route path="security/permissions" element={<PermissionMatrixPage />} />
          <Route path="expense/guide" element={<ExpenseFlowGuidePage />} />
          <Route path="expense/claims/new" element={<ExpenseClaimNewPage />} />
          <Route path="expense/claims/:id" element={<ExpenseClaimDetailPage />} />
          <Route path="expense/dashboard" element={<ExpenseFlowDashboardPage />} />
          <Route path="procurement/guide" element={<ProcurementGuidePage />} />
          <Route path="procurement/pr/new" element={<ProcurementPRNewPage />} />
          <Route path="procurement/pr" element={<ProcurementPRListPage />} />
          <Route path="procurement/pr/:id" element={<ProcurementPRDetailPage />} />
          <Route path="procurement/rfq/:id" element={<RFQDetailPage />} />
          <Route path="procurement/po/:id" element={<PODetailPage />} />
          <Route path="contract/guide" element={<ContractGuidePage />} />
          <Route path="contract/reviews/new" element={<ContractReviewNewPage />} />
          <Route path="contract/reviews/:id" element={<ContractReviewDetailPage />} />
          <Route path="srm/suppliers" element={<SupplierListPage />} />
          <Route path="srm/suppliers/:id" element={<SupplierDetailPage />} />
          <Route path="erp/inventory" element={<InventoryListPage />} />
          <Route path="erp/inventory/:id" element={<InventoryDetailPage />} />
          <Route path="erp/expenses" element={<ExpenseListPage />} />
          <Route path="erp/expenses/:id" element={<ExpenseDetailPage />} />
          <Route path="erp/master-data" element={<MasterDataPage />} />
          <Route path="outsourcing/factories" element={<PlaceholderPage title="外协工厂（占位）" />} />
          <Route path="policy" element={<PlaceholderPage title="制度流程库（占位）" />} />
          <Route path="audit" element={<PlaceholderPage title="内控审计（占位）" />} />
          <Route path="kpi" element={<PlaceholderPage title="目标/KPI（占位）" />} />
          <Route path="*" element={<Navigate to="/management/procurement/pr" replace />} />
        </Route>

        <Route path="/production" element={<AppLayout portalId="production" />}>
          <Route path="overview" element={<ProductionOverviewPage />} />
          <Route path="meeting" element={<MorningMeetingGroupPage />} />
          <Route path="meeting/factories/:factoryId" element={<MorningMeetingFactoryPage />} />
          <Route path="meeting/risks/:id" element={<MorningMeetingRiskDetailPage />} />
          <Route path="delivery/overview" element={<DeliveryRiskOverviewPage />} />
          <Route path="delivery/material-shortage" element={<MaterialShortagePage />} />
          <Route path="delivery/bottlenecks" element={<BottlenecksPage />} />
          <Route path="delivery/quality-holds" element={<QualityHoldsPage />} />
          <Route path="risks" element={<RiskListPage />} />
          <Route path="risks/:riskId" element={<RiskDetailPage />} />
          <Route path="alarms" element={<AlarmCenterPage />} />
          <Route path="incidents" element={<IncidentListPage />} />
          <Route path="incidents/new" element={<IncidentUpsertPage mode="create" />} />
          <Route path="incidents/:id" element={<IncidentDetailPage />} />
          <Route path="incidents/:id/edit" element={<IncidentUpsertPage mode="edit" />} />
          <Route path="mes/dispatch" element={<DispatchListPage />} />
          <Route path="mes/report" element={<ReportPage />} />
          <Route path="mes/quality" element={<QualityTaskListPage />} />
          <Route path="mes/quality/:id" element={<QualityTaskDetailPage />} />
          <Route path="workorders" element={<WorkOrderListPage />} />
          <Route path="workorders/:id" element={<WorkOrderDetailPage />} />
          <Route path="schedule" element={<PlaceholderPage title="排程（占位）" />} />
          <Route path="trace" element={<TracePage />} />
          <Route path="equipment" element={<PlaceholderPage title="设备监控（占位）" />} />
          <Route path="maintenance/guide" element={<MaintenanceGuidePage />} />
          <Route path="maintenance/new" element={<MaintenanceTicketNewPage />} />
          <Route path="maintenance/dashboard" element={<MaintenanceDashboardPage />} />
          <Route path="maintenance" element={<MaintenanceTicketListPage />} />
          <Route path="maintenance/:id" element={<MaintenanceTicketDetailPage />} />
          <Route path="*" element={<Navigate to="/production/overview" replace />} />
        </Route>

        <Route path="/support" element={<AppLayout portalId="support" />}>
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

        <Route path="/additional" element={<AppLayout portalId="additional" />}>
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

      <Route path="*" element={<Navigate to="/production/overview" replace />} />
    </Routes>
  )
}
