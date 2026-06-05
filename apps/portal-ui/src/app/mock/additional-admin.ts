import type { AdditionalMember, AdditionalRole, AdditionalRoleBinding } from './models'

export const additionalRoles: AdditionalRole[] = [
  {
    id: 'additional:global_admin',
    name: '附加服务总管理员',
    description: '管理全部中心、事项、申请与权限配置',
  },
  {
    id: 'additional:center_admin',
    name: '中心管理员',
    description: '管理本中心事项、内容、权限与处理台',
  },
  {
    id: 'additional:center_agent',
    name: '中心专员',
    description: '处理本中心申请单、可维护内容（按授权）',
  },
  {
    id: 'additional:viewer',
    name: '只读',
    description: '仅可查看，无处理权限',
  },
]

export const additionalMembers: AdditionalMember[] = [
  { id: 'M-001', name: '人才发展专员', department: '人才发展中心', email: 'tdc@example.com' },
  { id: 'M-002', name: '党群专员', department: '党群工作部', email: 'party@example.com' },
  { id: 'M-003', name: '工会专员', department: '工会', email: 'union@example.com' },
  { id: 'M-004', name: '妇联专员', department: '妇联', email: 'women@example.com' },
  { id: 'M-005', name: '附加服务管理员', department: '信息化', email: 'admin@example.com' },
]

export const additionalRoleBindings: AdditionalRoleBinding[] = [
  { id: 'RB-001', memberId: 'M-005', roleId: 'additional:global_admin', scopeCenterId: 'all', createdAt: '2026-06-01 09:00' },
  { id: 'RB-002', memberId: 'M-001', roleId: 'additional:center_admin', scopeCenterId: 'tdc', createdAt: '2026-06-01 09:00' },
  { id: 'RB-003', memberId: 'M-002', roleId: 'additional:center_admin', scopeCenterId: 'party', createdAt: '2026-06-01 09:00' },
  { id: 'RB-004', memberId: 'M-003', roleId: 'additional:center_admin', scopeCenterId: 'union', createdAt: '2026-06-01 09:00' },
  { id: 'RB-005', memberId: 'M-004', roleId: 'additional:center_admin', scopeCenterId: 'women', createdAt: '2026-06-01 09:00' },
]

