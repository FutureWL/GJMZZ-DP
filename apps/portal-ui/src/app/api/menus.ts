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

