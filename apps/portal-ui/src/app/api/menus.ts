export type ApiMenuItem = {
  id: string
  portalId: string
  parentId: string | null
  label: string
  path: string | null
  iconName: string | null
  sortOrder: number
  requiredRoles: string[]
}

export async function fetchUserMenu(token: string): Promise<unknown> {
  const res = await fetch(`/api/menus/me`, {
    headers: { Authorization: `Bearer ${token}` },
  })
  if (!res.ok) {
    throw new Error(`GET /menus/me failed: HTTP ${res.status}`)
  }
  return (await res.json()) as unknown
}

const MOCK_MENU_JSON = JSON.stringify([
  { id: 'workbench', portalId: 'main', parentId: null, label: '工作台', path: null, iconName: null, sortOrder: 1, requiredRoles: [] },
  { id: '/workbench', portalId: 'main', parentId: 'workbench', label: '我的工作台', path: '/workbench', iconName: 'LayoutDashboard', sortOrder: 1, requiredRoles: [] },
  { id: '/search', portalId: 'main', parentId: 'workbench', label: '全局搜索', path: '/search', iconName: 'Activity', sortOrder: 2, requiredRoles: [] },

  { id: 'quality-equipment', portalId: 'main', parentId: null, label: '质量与设备', path: null, iconName: null, sortOrder: 60, requiredRoles: [] },
  { id: 'quality-management', portalId: 'main', parentId: 'quality-equipment', label: '质量管控', path: null, iconName: null, sortOrder: 1, requiredRoles: [] },
  { id: '/quality/delivery-overview', portalId: 'main', parentId: 'quality-management', label: '交付风险总览', path: '/quality/delivery-overview', iconName: 'LayoutGrid', sortOrder: 1, requiredRoles: [] },
  { id: '/quality/delivery-pool', portalId: 'main', parentId: 'quality-management', label: '交付风险池', path: '/quality/delivery-pool', iconName: 'LayoutList', sortOrder: 2, requiredRoles: [] },
  { id: '/quality/alerts', portalId: 'main', parentId: 'quality-management', label: '告警中心', path: '/quality/alerts', iconName: 'AlertOctagon', sortOrder: 3, requiredRoles: [] },
  { id: '/quality/exceptions', portalId: 'main', parentId: 'quality-management', label: '异常中心', path: '/quality/exceptions', iconName: 'Activity', sortOrder: 4, requiredRoles: [] },
  { id: '/quality/inspections', portalId: 'main', parentId: 'quality-management', label: '检验任务', path: '/quality/inspections', iconName: 'CheckCircle', sortOrder: 5, requiredRoles: [] },
  { id: '/quality/traceability', portalId: 'main', parentId: 'quality-management', label: '追溯查询', path: '/quality/traceability', iconName: 'Search', sortOrder: 6, requiredRoles: [] },
  { id: 'equipment-maintenance', portalId: 'main', parentId: 'quality-equipment', label: '设备运维', path: null, iconName: null, sortOrder: 2, requiredRoles: [] },
  { id: '/equipment/monitoring', portalId: 'main', parentId: 'equipment-maintenance', label: '设备监控（占位）', path: '/equipment/monitoring', iconName: 'Monitor', sortOrder: 1, requiredRoles: [] },
  { id: '/equipment/workorders', portalId: 'main', parentId: 'equipment-maintenance', label: '维修工单', path: '/equipment/workorders', iconName: 'Wrench', sortOrder: 2, requiredRoles: [] },
  { id: '/equipment/dashboard', portalId: 'main', parentId: 'equipment-maintenance', label: '维修看板', path: '/equipment/dashboard', iconName: 'LineChart', sortOrder: 3, requiredRoles: [] },

  { id: 'admin', portalId: 'main', parentId: null, label: '综合管理', path: null, iconName: null, sortOrder: 90, requiredRoles: [] },
  { id: 'admin.compliance', portalId: 'main', parentId: 'admin', label: '流程与合规', path: null, iconName: null, sortOrder: 1, requiredRoles: [] },
  { id: '/management/approval', portalId: 'main', parentId: 'admin.compliance', label: '审批中心', path: '/management/approval', iconName: 'BadgeCheck', sortOrder: 1, requiredRoles: [] },
  { id: '/management/notifications', portalId: 'main', parentId: 'admin.compliance', label: '通知中心', path: '/management/notifications', iconName: 'Activity', sortOrder: 2, requiredRoles: [] },
  { id: '/management/audit/log', portalId: 'main', parentId: 'admin.compliance', label: '审计日志', path: '/management/audit/log', iconName: 'ClipboardList', sortOrder: 3, requiredRoles: [] },
  { id: '/management/security/permissions', portalId: 'main', parentId: 'admin.compliance', label: '权限矩阵', path: '/management/security/permissions', iconName: 'Shield', sortOrder: 4, requiredRoles: [] },

  { id: 'admin.finance', portalId: 'main', parentId: 'admin', label: '财务与费控', path: null, iconName: null, sortOrder: 2, requiredRoles: [] },
  { id: '/management/erp/expenses', portalId: 'main', parentId: 'admin.finance', label: '费用报销', path: '/management/erp/expenses', iconName: 'Receipt', sortOrder: 1, requiredRoles: [] },
  { id: '/management/expense/dashboard', portalId: 'main', parentId: 'admin.finance', label: '费用流程看板', path: '/management/expense/dashboard', iconName: 'LineChart', sortOrder: 2, requiredRoles: [] },
])

export async function fetchUserMenuMock(): Promise<ApiMenuItem[]> {
  return await new Promise((resolve) => {
    window.setTimeout(() => {
      resolve(JSON.parse(MOCK_MENU_JSON) as ApiMenuItem[])
    }, 450)
  })
}
