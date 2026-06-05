export type OrderStatus =
  | 'new'
  | 'released'
  | 'in_production'
  | 'quality_hold'
  | 'shipped'
  | 'closed'

export type MilestoneStatus = 'todo' | 'doing' | 'done'

export interface OrderMilestone {
  key: string
  label: string
  status: MilestoneStatus
  at?: string
  note?: string
}

export type QualityDocKey = 'mtc' | 'cmm' | 'fai' | 'ipqc'
export type QualityDocStatus = 'missing' | 'collecting' | 'complete'

export interface QualityDocItem {
  key: QualityDocKey
  label: string
  status: QualityDocStatus
  updatedAt?: string
}

export interface OrderTimelineEntry {
  at: string
  actor: string
  action: string
  note?: string
}

export interface Order360Mock {
  id: string
  orderNo: string
  customerId: string
  partNo: string
  partName: string
  drawingVersion: string
  material: string
  surfaceTreatment: string
  qty: number
  dueDate: string
  status: OrderStatus
  erpOrderNo: string
  mesWorkOrderIds: string[]
  qmsBatchIds: string[]
  milestones: OrderMilestone[]
  qualityDocs: QualityDocItem[]
  timeline: OrderTimelineEntry[]
}

export const order360Mocks: Order360Mock[] = [
  {
    id: 'SO-202606-0012',
    orderNo: 'SO-202606-0012',
    customerId: 'CUST-001',
    partNo: 'PN-AXLE-001',
    partName: '精密轴套',
    drawingVersion: 'V3 / 2026-05-29',
    material: 'SUS304',
    surfaceTreatment: '钝化',
    qty: 120,
    dueDate: '2026-06-18',
    status: 'in_production',
    erpOrderNo: 'ERP-SO-0012',
    mesWorkOrderIds: ['WO-240605-001'],
    qmsBatchIds: ['BATCH-20260605-0008'],
    milestones: [
      { key: 'rfq', label: '需求确认', status: 'done', at: '2026-06-01 10:10' },
      { key: 'dfm', label: '工程评审', status: 'done', at: '2026-06-02 16:40' },
      { key: 'release', label: '订单下达', status: 'done', at: '2026-06-03 09:20' },
      { key: 'fai', label: '首件完成', status: 'doing', at: '2026-06-05 11:30' },
      { key: 'ipqc', label: '过程检验', status: 'todo' },
      { key: 'final', label: '终检/资料齐套', status: 'todo' },
      { key: 'ship', label: '发货', status: 'todo' },
    ],
    qualityDocs: [
      { key: 'mtc', label: '材质证书（含复验）', status: 'collecting', updatedAt: '2026-06-05 09:10' },
      { key: 'cmm', label: '三坐标报告', status: 'missing' },
      { key: 'fai', label: '首件报告', status: 'collecting', updatedAt: '2026-06-05 11:40' },
      { key: 'ipqc', label: '过程检验记录', status: 'missing' },
    ],
    timeline: [
      { at: '2026-06-05 11:40', actor: '质量-检验员', action: '首件报告录入（占位）', note: '等待三坐标输出' },
      { at: '2026-06-05 09:10', actor: '质量-实验室', action: '材质复验记录创建（占位）', note: '炉号：H2406-18' },
      { at: '2026-06-03 09:20', actor: '销售-赵', action: '订单下达', note: '交期锁定 2026-06-18' },
    ],
  },
  {
    id: 'SO-202606-0017',
    orderNo: 'SO-202606-0017',
    customerId: 'CUST-002',
    partNo: 'PN-GEAR-014',
    partName: '微型齿轮',
    drawingVersion: 'V1 / 2026-06-02',
    material: '20CrMnTi',
    surfaceTreatment: '渗碳淬火',
    qty: 500,
    dueDate: '2026-06-25',
    status: 'quality_hold',
    erpOrderNo: 'ERP-SO-0017',
    mesWorkOrderIds: ['WO-240605-002'],
    qmsBatchIds: ['SN-6F2A-19D0-77'],
    milestones: [
      { key: 'rfq', label: '需求确认', status: 'done', at: '2026-06-03 14:05' },
      { key: 'dfm', label: '工程评审', status: 'done', at: '2026-06-04 10:30' },
      { key: 'release', label: '订单下达', status: 'done', at: '2026-06-04 17:20' },
      { key: 'process', label: '加工中', status: 'done', at: '2026-06-05 09:30' },
      { key: 'qms', label: '质量处置', status: 'doing', note: '热处理后尺寸偏差待评估' },
      { key: 'ship', label: '发货', status: 'todo' },
    ],
    qualityDocs: [
      { key: 'mtc', label: '材质证书（含复验）', status: 'complete', updatedAt: '2026-06-05 08:20' },
      { key: 'cmm', label: '三坐标报告', status: 'collecting', updatedAt: '2026-06-05 10:05' },
      { key: 'fai', label: '首件报告', status: 'complete', updatedAt: '2026-06-04 19:10' },
      { key: 'ipqc', label: '过程检验记录', status: 'collecting', updatedAt: '2026-06-05 09:55' },
    ],
    timeline: [
      { at: '2026-06-05 10:05', actor: '质量-检验员', action: '三坐标复测中（占位）' },
      { at: '2026-06-05 09:45', actor: '质量-主管', action: '质量冻结（占位）', note: '等待处置结论' },
      { at: '2026-06-04 17:20', actor: '销售-钱', action: '订单下达' },
    ],
  },
  {
    id: 'SO-202606-0009',
    orderNo: 'SO-202606-0009',
    customerId: 'CUST-003',
    partNo: 'PN-MED-332',
    partName: '高精密连接件',
    drawingVersion: 'V2 / 2026-05-20',
    material: 'TC4',
    surfaceTreatment: '喷砂+清洁度',
    qty: 60,
    dueDate: '2026-06-12',
    status: 'shipped',
    erpOrderNo: 'ERP-SO-0009',
    mesWorkOrderIds: ['WO-240604-019'],
    qmsBatchIds: ['SN-9C3B-44A1-02'],
    milestones: [
      { key: 'release', label: '订单下达', status: 'done', at: '2026-05-25 09:10' },
      { key: 'fai', label: '首件完成', status: 'done', at: '2026-05-28 15:35' },
      { key: 'final', label: '终检/资料齐套', status: 'done', at: '2026-06-03 18:10' },
      { key: 'ship', label: '发货', status: 'done', at: '2026-06-04 10:20' },
    ],
    qualityDocs: [
      { key: 'mtc', label: '材质证书（含复验）', status: 'complete', updatedAt: '2026-06-03 09:20' },
      { key: 'cmm', label: '三坐标报告', status: 'complete', updatedAt: '2026-06-03 15:40' },
      { key: 'fai', label: '首件报告', status: 'complete', updatedAt: '2026-05-28 16:10' },
      { key: 'ipqc', label: '过程检验记录', status: 'complete', updatedAt: '2026-06-02 17:55' },
    ],
    timeline: [
      { at: '2026-06-04 10:20', actor: '仓库-发货', action: '已发货（占位）', note: '顺丰 1234567890' },
      { at: '2026-06-03 18:10', actor: '质量-检验员', action: '资料包齐套（占位）' },
      { at: '2026-05-25 09:10', actor: '销售-孙', action: '订单下达' },
    ],
  },
]

export interface OrderSummary {
  id: string
  orderNo: string
  customerId: string
  partNo: string
  partName: string
  qty: number
  dueDate: string
  status: OrderStatus
  updatedAt: string
}

export const orderSummaries: OrderSummary[] = order360Mocks.map((o) => ({
  id: o.id,
  orderNo: o.orderNo,
  customerId: o.customerId,
  partNo: o.partNo,
  partName: o.partName,
  qty: o.qty,
  dueDate: o.dueDate,
  status: o.status,
  updatedAt: o.timeline[0]?.at ?? o.dueDate,
}))

export function findOrder360(id?: string) {
  if (!id) return undefined
  return order360Mocks.find((o) => o.id === id || o.orderNo === id || o.erpOrderNo === id)
}

