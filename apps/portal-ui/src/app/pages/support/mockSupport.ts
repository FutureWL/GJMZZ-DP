export type SupportTicketStatus = 'new' | 'accepted' | 'processing' | 'verifying' | 'closed'
export type SupportRequestStatus = 'draft' | 'submitted' | 'accepted' | 'in_progress' | 'done' | 'canceled'
export type SupportPriority = 'p0' | 'p1' | 'p2' | 'p3'

export interface SupportRequest {
  id: string
  title: string
  category: string
  priority: SupportPriority
  status: SupportRequestStatus
  requester: string
  createdAt: string
  dueAt?: string
}

export interface SupportAnnouncement {
  id: string
  title: string
  level: 'info' | 'warning'
  publishedAt: string
}

export interface SupportKnowledgeArticle {
  id: string
  title: string
  tags: string[]
  updatedAt: string
  summary: string
}

export const supportRequests: SupportRequest[] = [
  {
    id: 'SR-20260605-003',
    title: '新员工入职：账号/邮箱/权限开通',
    category: '账号权限',
    priority: 'p1',
    status: 'submitted',
    requester: '人事-王',
    createdAt: '2026-06-05 09:05',
    dueAt: '2026-06-05 18:00',
  },
  {
    id: 'SR-20260604-018',
    title: '质量体系文件权限申请（QMS）',
    category: '体系/合规',
    priority: 'p2',
    status: 'in_progress',
    requester: '质量-李',
    createdAt: '2026-06-04 15:30',
    dueAt: '2026-06-06 18:00',
  },
  {
    id: 'SR-20260603-011',
    title: '会议室投影设备报修',
    category: '行政/办公',
    priority: 'p3',
    status: 'accepted',
    requester: '制造-周',
    createdAt: '2026-06-03 10:20',
  },
]

export const supportAnnouncements: SupportAnnouncement[] = [
  { id: 'ANN-20260605-001', title: 'ERP 计划维护窗口：2026-06-06 20:00-22:00', level: 'warning', publishedAt: '2026-06-05 08:30' },
  { id: 'ANN-20260604-006', title: 'VPN 客户端升级通知（Windows）', level: 'info', publishedAt: '2026-06-04 17:10' },
  { id: 'ANN-20260603-003', title: '密码策略更新：强制90天更换', level: 'info', publishedAt: '2026-06-03 09:00' },
]

export const supportKnowledgeArticles: SupportKnowledgeArticle[] = [
  {
    id: 'KB-IT-001',
    title: 'MES 账号权限申请与常见审批路径',
    tags: ['MES', '账号', '权限'],
    updatedAt: '2026-06-04 11:10',
    summary: '适用于生产一线、工艺、质量等角色的权限开通；包含必填信息、常见驳回原因与处理建议。',
  },
  {
    id: 'KB-SEC-002',
    title: 'USB 存储介质管控与例外申请流程',
    tags: ['数据安全', '合规', '流程'],
    updatedAt: '2026-06-03 16:40',
    summary: '说明可用介质类型、审批节点、留痕要求与审计注意事项。',
  },
  {
    id: 'KB-OPS-010',
    title: 'ERP/MES/QMS 集成故障排查清单（占位）',
    tags: ['集成', 'ERP', 'MES', 'QMS'],
    updatedAt: '2026-06-05 10:00',
    summary: '当出现数据不同步、单据状态不一致时，按此清单快速定位问题与收集证据。',
  },
]

export type SupportWorkItemType = 'ticket' | 'request'

export interface SupportWorkItem {
  id: string
  type: SupportWorkItemType
  title: string
  status: string
  priority: SupportPriority
  requester: string
  createdAt: string
  dueAt?: string
}

export function toWorkItems(args: { tickets: Array<{ id: string; title: string; status: string; requester: string; createdAt: string; sla?: string }>; requests: SupportRequest[] }) {
  const ticketItems: SupportWorkItem[] = args.tickets.map((t) => ({
    id: t.id,
    type: 'ticket',
    title: t.title,
    status: t.status,
    priority: t.sla === 'overdue' ? 'p0' : 'p2',
    requester: t.requester,
    createdAt: t.createdAt,
    dueAt: undefined,
  }))

  const requestItems: SupportWorkItem[] = args.requests.map((r) => ({
    id: r.id,
    type: 'request',
    title: r.title,
    status: r.status,
    priority: r.priority,
    requester: r.requester,
    createdAt: r.createdAt,
    dueAt: r.dueAt,
  }))

  return [...ticketItems, ...requestItems].sort((a, b) => b.createdAt.localeCompare(a.createdAt))
}

