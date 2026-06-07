export type Severity = 'critical' | 'high' | 'medium' | 'low'

export interface Alarm {
  id: string
  title: string
  severity: Severity
  status: 'open' | 'ack' | 'closed'
  equipment: string
  line: string
  startAt: string
}

export interface WorkOrder {
  id: string
  product: string
  line: string
  status: 'planned' | 'running' | 'blocked' | 'done'
  progress: number
  planStart: string
  planEnd: string
}

export interface TraceRecord {
  id: string
  type: 'batch' | 'serial'
  product: string
  workOrderId: string
  lastStation: string
  quality: 'ok' | 'ng' | 'hold'
}

export interface PurchaseRequest {
  id: string
  title: string
  status: 'draft' | 'in_review' | 'approved' | 'rejected'
  amount: number
  requester: string
  createdAt: string
}

export interface Supplier {
  id: string
  name: string
  risk: 'low' | 'medium' | 'high' | 'critical'
  compliance: 'ok' | 'expiring' | 'blacklist'
  otd: number
  ppm: number
}

export interface ItTicket {
  id: string
  title: string
  status: 'new' | 'accepted' | 'processing' | 'verifying' | 'closed'
  requester: string
  createdAt: string
  sla: 'normal' | 'overdue'
}

export interface Customer {
  id: string
  name: string
  industry: string
  level: 'A' | 'B' | 'C'
  owner: string
  lastContactAt: string
  status: 'active' | 'inactive'
  tags?: string[]
  risk?: 'low' | 'medium' | 'high' | 'critical'
  credit?: number
  nextFollowUpAt?: string
  nextFollowUpNote?: string
}

export interface Opportunity {
  id: string
  name: string
  customerId: string
  stage: 'lead' | 'proposal' | 'negotiation' | 'won' | 'lost'
  amount: number
  closeDate: string
  owner: string
}

export interface MesDispatch {
  id: string
  workOrderId: string
  line: string
  station: string
  assignee: string
  status: 'new' | 'doing' | 'done'
  planQty: number
  doneQty: number
}

export interface QualityTask {
  id: string
  workOrderId: string
  type: 'incoming' | 'process' | 'final'
  status: 'todo' | 'doing' | 'done'
  result: 'ok' | 'ng' | 'hold' | null
  inspector: string
  createdAt: string
}

export interface Material {
  id: string
  name: string
  spec: string
  uom: string
  category: string
}

export interface InventoryItem {
  materialId: string
  materialName: string
  warehouse: string
  qty: number
  reservedQty: number
}

export interface Expense {
  id: string
  title: string
  applicant: string
  amount: number
  status: 'draft' | 'in_review' | 'approved' | 'rejected'
  createdAt: string
}

export interface Department {
  id: string
  name: string
  leader: string
}

export interface Project {
  id: string
  name: string
  owner: string
}

export interface CostCenter {
  id: string
  name: string
  owner: string
  departmentId: string
}

export type ExpenseClaimStatus =
  | 'draft'
  | 'in_review'
  | 'approved'
  | 'rejected'
  | 'returned'
  | 'paid'
  | 'archived'
  | 'canceled'

export type ExpensePayeeType = 'personal' | 'corporate'

export interface ExpenseClaimLine {
  id: string
  occurredAt: string
  category: string
  subject: string
  amount: number
  invoiceType: string | null
  invoiceNo: string | null
  taxRate: number | null
  paymentMethod: string
}

export type ExpenseApprovalNodeStatus = 'pending' | 'done' | 'skipped'

export interface ExpenseApprovalNode {
  key: string
  label: string
  assignee: string
  status: ExpenseApprovalNodeStatus
  completedAt: string | null
}

export interface ExpenseClaimTimelineEntry {
  at: string
  actor: string
  action: string
  note?: string
}

export interface ExpenseClaim {
  id: string
  title: string
  applicant: string
  departmentId: string
  departmentName: string
  projectId: string
  projectName: string
  costCenterId: string
  costCenterName: string
  claimType: string
  payeeType: ExpensePayeeType
  payeeName: string
  bankAccount: string | null
  amountTotal: number
  isOverBudget: boolean
  isOverStandard: boolean
  overBudgetReason: string | null
  overStandardReason: string | null
  status: ExpenseClaimStatus
  createdAt: string
  updatedAt: string
  currentNodeKey: string | null
  currentAssignee: string | null
  lines: ExpenseClaimLine[]
  attachments: string[]
  nodes: ExpenseApprovalNode[]
  timeline: ExpenseClaimTimelineEntry[]
}

export type ProcurementRequestStatus =
  | 'draft'
  | 'in_review'
  | 'approved'
  | 'rejected'
  | 'returned'
  | 'canceled'

export interface ProcurementRequestLine {
  id: string
  material: string
  spec: string
  qty: number
  uom: string
  unitPrice: number
  amount: number
  needBy: string
  category: string
}

export interface ProcurementRequestTimelineEntry {
  at: string
  actor: string
  action: string
  note?: string
}

export interface ProcurementRequestFlowNode {
  key: string
  label: string
  assignee: string
  status: ExpenseApprovalNodeStatus
  completedAt: string | null
}

export interface ProcurementRequestFlow {
  id: string
  title: string
  requester: string
  departmentId: string
  departmentName: string
  projectId: string
  projectName: string
  costCenterId: string
  costCenterName: string
  amountTotal: number
  status: ProcurementRequestStatus
  createdAt: string
  updatedAt: string
  currentNodeKey: string | null
  currentAssignee: string | null
  lines: ProcurementRequestLine[]
  attachments: string[]
  nodes: ProcurementRequestFlowNode[]
  timeline: ProcurementRequestTimelineEntry[]
}

export type ContractReviewStatus =
  | 'draft'
  | 'in_review'
  | 'approved'
  | 'rejected'
  | 'returned'
  | 'signed'
  | 'archived'
  | 'canceled'

export type ContractRiskLevel = 'low' | 'medium' | 'high'

export interface ContractReviewTimelineEntry {
  at: string
  actor: string
  action: string
  note?: string
}

export interface ContractReviewFlowNode {
  key: string
  label: string
  assignee: string
  status: ExpenseApprovalNodeStatus
  completedAt: string | null
}

export interface ContractReviewFlow {
  id: string
  title: string
  applicant: string
  departmentId: string
  departmentName: string
  projectId: string
  projectName: string
  costCenterId: string
  costCenterName: string
  contractType: string
  counterparty: string
  amountTotal: number
  paymentTerms: string
  riskLevel: ContractRiskLevel
  status: ContractReviewStatus
  createdAt: string
  updatedAt: string
  currentNodeKey: string | null
  currentAssignee: string | null
  attachments: string[]
  nodes: ContractReviewFlowNode[]
  timeline: ContractReviewTimelineEntry[]
}

export type ApprovalWorkItemStatus = 'todo' | 'done'

export interface ApprovalWorkItem {
  id: string
  title: string
  domain: 'management' | 'support' | 'production' | 'business' | 'additional'
  status: ApprovalWorkItemStatus
  overdue: boolean
  businessType: 'expense_claim' | 'procurement_pr' | 'contract_review'
  businessId: string
  createdAt: string
  assignee: string | null
}

export type NoticeLevel = 'info' | 'warning' | 'error'

export interface NotificationItem {
  id: string
  title: string
  body: string
  level: NoticeLevel
  createdAt: string
  read: boolean
  link: string | null
}

export interface AuditLogEntry {
  id: string
  at: string
  actor: string
  action: string
  resourceType: string
  resourceId: string
  detail: string
  ip: string
}

export interface Contact {
  id: string
  customerId: string
  name: string
  title: string
  phone: string
  email: string
  lastContactAt: string
}

export interface CrmActivity {
  id: string
  type: 'call' | 'meeting' | 'email' | 'visit'
  subject: string
  customerId: string
  contactId: string | null
  owner: string
  status: 'planned' | 'in_progress' | 'done' | 'canceled'
  dueAt: string
  createdAt: string
}

export interface Quote {
  id: string
  title: string
  customerId: string
  opportunityId: string | null
  status: 'draft' | 'sent' | 'accepted' | 'rejected' | 'expired'
  currency: 'CNY' | 'USD' | 'EUR'
  totalAmount: number
  createdAt: string
  validUntil: string
}

export interface QuoteLine {
  id: string
  quoteId: string
  product: string
  spec: string
  qty: number
  unitPrice: number
  amount: number
}

export type AdditionalCenterId = 'tdc' | 'party' | 'union' | 'women'

export interface AdditionalCenter {
  id: AdditionalCenterId
  name: string
  description: string
  contactName: string
  contactEmail: string
}

export type AdditionalServiceType = 'apply' | 'enroll' | 'query'

export interface AdditionalService {
  id: string
  centerId: AdditionalCenterId
  name: string
  category: string
  description: string
  type: AdditionalServiceType
  enabled: boolean
  requireApproval: boolean
  formSchema: { key: string; label: string; required?: boolean; placeholder?: string }[]
}

export type AdditionalRequestStatus =
  | 'draft'
  | 'submitted'
  | 'accepted'
  | 'in_progress'
  | 'done'
  | 'rejected'
  | 'canceled'

export interface AdditionalRequestTimelineEntry {
  at: string
  actor: string
  action: string
  note?: string
}

export interface AdditionalRequest {
  id: string
  centerId: AdditionalCenterId
  serviceId: string
  serviceName: string
  applicant: string
  status: AdditionalRequestStatus
  createdAt: string
  updatedAt: string
  currentAssignee: string | null
  formData: Record<string, string>
  timeline: AdditionalRequestTimelineEntry[]
}

export type AdditionalContentType = 'notice' | 'policy' | 'faq'

export interface AdditionalContent {
  id: string
  centerId: AdditionalCenterId
  type: AdditionalContentType
  title: string
  body: string
  createdAt: string
  pinned?: boolean
}

export type AdditionalRoleId =
  | 'additional:global_admin'
  | 'additional:center_admin'
  | 'additional:center_agent'
  | 'additional:viewer'

export interface AdditionalRole {
  id: AdditionalRoleId
  name: string
  description: string
}

export interface AdditionalMember {
  id: string
  name: string
  department: string
  email: string
}

export interface AdditionalRoleBinding {
  id: string
  memberId: string
  roleId: AdditionalRoleId
  scopeCenterId: AdditionalCenterId | 'all'
  createdAt: string
}

export interface Factory {
  id: string
  name: string
}

export type MorningMeetingKpiStatus = 'good' | 'warn' | 'bad'

export interface MorningMeetingKpi {
  key: string
  label: string
  value: string
  helper?: string
  status: MorningMeetingKpiStatus
  updatedAt: string
  source: string
}

export type MorningRiskType = 'delivery' | 'material_shortage' | 'quality' | 'equipment' | 'plan' | 'other'

export interface MorningRisk {
  id: string
  type: MorningRiskType
  severity: Severity
  title: string
  summary: string
  factoryId: string
  factoryName: string
  line?: string
  workOrderId?: string
  orderId?: string
  evidence: string[]
  updatedAt: string
}

export type DeliveryRiskType = 'material_shortage' | 'bottleneck' | 'quality'
export type DeliveryRiskStatus = 'open' | 'watching' | 'archived'

export interface DeliveryRiskEvidenceItem {
  key: string
  label: string
  value: string
}

export interface DeliveryRiskTimelineEntry {
  at: string
  action: string
  note?: string
}

export interface DeliveryRisk {
  riskId: string
  type: DeliveryRiskType
  severity: Severity
  status: DeliveryRiskStatus
  title: string
  summary: string
  factoryId: string
  factoryName: string
  line?: string
  product?: string
  orderIds?: string[]
  workOrderIds?: string[]
  dueAt?: string
  etaAt?: string
  delayMinutes?: number
  evidence: DeliveryRiskEvidenceItem[]
  timeline: DeliveryRiskTimelineEntry[]
  updatedAt: string
  source: 'rule' | 'manual'
}

export type IncidentType = 'quality' | 'equipment' | 'material_shortage' | 'plan' | 'safety' | 'other'
export type IncidentStatus = 'recording' | 'archived'

export interface Incident {
  id: string
  occurredAt: string
  reportedBy: string
  type: IncidentType
  severity: Severity
  status: IncidentStatus
  factoryId: string
  factoryName: string
  line?: string
  workOrderId?: string
  orderId?: string
  equipment?: string
  material?: string
  description: string
  attachments: string[]
  createdAt: string
  updatedAt: string
}

export interface EquipmentAsset {
  id: string
  name: string
  factory: string
  line: string
  location: string
}

export type MaintenanceTicketPriority = 'low' | 'medium' | 'high' | 'critical'

export type MaintenanceTicketStatus =
  | 'reported'
  | 'dispatched'
  | 'accepted'
  | 'on_site'
  | 'repairing'
  | 'done'
  | 'verified'
  | 'closed'
  | 'canceled'

export interface MaintenanceFlowNode {
  key:
    | 'reported'
    | 'dispatched'
    | 'accepted'
    | 'on_site'
    | 'repairing'
    | 'done'
    | 'verified'
    | 'closed'
    | 'canceled'
  label: string
  status: 'pending' | 'done' | 'skipped'
  completedAt: string | null
}

export interface MaintenanceSpareUsage {
  id: string
  partId: string
  partName: string
  qty: number
  uom: string
}

export interface MaintenanceTimelineEntry {
  at: string
  actor: string
  action: string
  note?: string
}

export interface MaintenanceTicket {
  id: string
  title: string
  equipmentId: string
  equipmentName: string
  factory: string
  line: string
  location: string
  priority: MaintenanceTicketPriority
  status: MaintenanceTicketStatus
  reporter: string
  assignee: string | null
  symptom: string
  cause: string | null
  solution: string | null
  createdAt: string
  updatedAt: string
  slaDueAt: string
  attachments: string[]
  spareParts: MaintenanceSpareUsage[]
  nodes: MaintenanceFlowNode[]
  timeline: MaintenanceTimelineEntry[]
}
