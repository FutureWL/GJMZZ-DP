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

