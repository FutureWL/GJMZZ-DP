import type { Alarm, ItTicket, PurchaseRequest, Supplier, TraceRecord, WorkOrder } from './models'

export const alarms: Alarm[] = [
  {
    id: 'ALM-20260605-001',
    title: '主轴振动超阈值',
    severity: 'critical',
    status: 'open',
    equipment: 'CNC-12',
    line: '产线A',
    startAt: '2026-06-05 08:12',
  },
  {
    id: 'ALM-20260605-002',
    title: '冷却液液位低',
    severity: 'medium',
    status: 'ack',
    equipment: 'CNC-07',
    line: '产线B',
    startAt: '2026-06-05 07:45',
  },
  {
    id: 'ALM-20260604-031',
    title: '温控偏差',
    severity: 'low',
    status: 'closed',
    equipment: 'CMM-02',
    line: '质检区',
    startAt: '2026-06-04 21:10',
  },
]

export const workOrders: WorkOrder[] = [
  {
    id: 'WO-240605-001',
    product: '精密轴套',
    line: '产线A',
    status: 'running',
    progress: 62,
    planStart: '2026-06-05 08:00',
    planEnd: '2026-06-05 18:00',
  },
  {
    id: 'WO-240605-002',
    product: '微型齿轮',
    line: '产线B',
    status: 'blocked',
    progress: 18,
    planStart: '2026-06-05 09:00',
    planEnd: '2026-06-05 20:00',
  },
  {
    id: 'WO-240604-019',
    product: '高精密连接件',
    line: '产线C',
    status: 'done',
    progress: 100,
    planStart: '2026-06-04 08:30',
    planEnd: '2026-06-04 16:00',
  },
]

export const traces: TraceRecord[] = [
  {
    id: 'BATCH-20260605-0008',
    type: 'batch',
    product: '精密轴套',
    workOrderId: 'WO-240605-001',
    lastStation: '精磨',
    quality: 'ok',
  },
  {
    id: 'SN-6F2A-19D0-77',
    type: 'serial',
    product: '微型齿轮',
    workOrderId: 'WO-240605-002',
    lastStation: '热处理',
    quality: 'hold',
  },
  {
    id: 'SN-9C3B-44A1-02',
    type: 'serial',
    product: '高精密连接件',
    workOrderId: 'WO-240604-019',
    lastStation: '终检',
    quality: 'ng',
  },
]

export const purchaseRequests: PurchaseRequest[] = [
  {
    id: 'PR-20260605-001',
    title: '刀具补充采购（铣刀/钻头）',
    status: 'in_review',
    amount: 128000,
    requester: '张工',
    createdAt: '2026-06-05 09:20',
  },
  {
    id: 'PR-20260604-017',
    title: '测头备件采购',
    status: 'approved',
    amount: 56000,
    requester: '李工',
    createdAt: '2026-06-04 15:10',
  },
  {
    id: 'PR-20260603-006',
    title: '清洗液采购',
    status: 'draft',
    amount: 12000,
    requester: '王工',
    createdAt: '2026-06-03 11:00',
  },
]

export const suppliers: Supplier[] = [
  { id: 'SUP-001', name: '华东刀具有限公司', risk: 'low', compliance: 'ok', otd: 96.2, ppm: 120 },
  {
    id: 'SUP-002',
    name: '精工材料科技',
    risk: 'medium',
    compliance: 'expiring',
    otd: 92.4,
    ppm: 360,
  },
  { id: 'SUP-003', name: 'XX外协加工厂', risk: 'high', compliance: 'ok', otd: 88.1, ppm: 980 },
  {
    id: 'SUP-004',
    name: '不合规供应商示例',
    risk: 'critical',
    compliance: 'blacklist',
    otd: 61.0,
    ppm: 5200,
  },
]

export const itTickets: ItTicket[] = [
  {
    id: 'IT-20260605-011',
    title: 'MES 账号权限申请',
    status: 'new',
    requester: '生产一线-班组长',
    createdAt: '2026-06-05 08:40',
    sla: 'normal',
  },
  {
    id: 'IT-20260604-092',
    title: '工位平板无法联网',
    status: 'processing',
    requester: '工艺部-工程师',
    createdAt: '2026-06-04 16:25',
    sla: 'overdue',
  },
  {
    id: 'IT-20260603-031',
    title: '报表导出异常',
    status: 'verifying',
    requester: '质量部-检验员',
    createdAt: '2026-06-03 10:12',
    sla: 'normal',
  },
]

