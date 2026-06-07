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

  { id: 'procurement-supply', portalId: 'main', parentId: null, label: '采购与供应链', path: null, iconName: null, sortOrder: 70, requiredRoles: [] },
  { id: 'procurement-management', portalId: 'main', parentId: 'procurement-supply', label: '采购管理', path: null, iconName: null, sortOrder: 1, requiredRoles: [] },
  { id: '/supply/procurement/orders', portalId: 'main', parentId: 'procurement-management', label: '采购 PR/PO', path: '/supply/procurement/orders', iconName: 'ShoppingCart', sortOrder: 1, requiredRoles: [] },
  { id: '/supply/procurement/create-pr', portalId: 'main', parentId: 'procurement-management', label: '新增采购PR', path: '/supply/procurement/create-pr', iconName: 'FilePlus', sortOrder: 2, requiredRoles: [] },
  { id: 'supplier-collaboration', portalId: 'main', parentId: 'procurement-supply', label: '供应商协同', path: null, iconName: null, sortOrder: 2, requiredRoles: [] },
  { id: '/supply/suppliers/list', portalId: 'main', parentId: 'supplier-collaboration', label: '供应商', path: '/supply/suppliers/list', iconName: 'Handshake', sortOrder: 1, requiredRoles: [] },
  { id: '/supply/suppliers/contracts', portalId: 'main', parentId: 'supplier-collaboration', label: '合同评审', path: '/supply/suppliers/contracts', iconName: 'FileCheck', sortOrder: 2, requiredRoles: [] },
  { id: '/supply/suppliers/outsourcing', portalId: 'main', parentId: 'supplier-collaboration', label: '外协工厂（占位）', path: '/supply/suppliers/outsourcing', iconName: 'Factory', sortOrder: 3, requiredRoles: [] },

  { id: 'sales-customers', portalId: 'main', parentId: null, label: '营销与客户', path: null, iconName: null, sortOrder: 20, requiredRoles: [] },
  { id: 'sales-crm', portalId: 'main', parentId: 'sales-customers', label: '客户管理', path: null, iconName: null, sortOrder: 1, requiredRoles: [] },
  { id: '/sales/crm/customers', portalId: 'main', parentId: 'sales-crm', label: '客户', path: '/sales/crm/customers', iconName: 'Building2', sortOrder: 1, requiredRoles: [] },
  { id: '/sales/crm/contacts', portalId: 'main', parentId: 'sales-crm', label: '联系人', path: '/sales/crm/contacts', iconName: 'Contact', sortOrder: 2, requiredRoles: [] },
  { id: '/sales/crm/activities', portalId: 'main', parentId: 'sales-crm', label: '跟进记录', path: '/sales/crm/activities', iconName: 'History', sortOrder: 3, requiredRoles: [] },
  { id: 'sales-business', portalId: 'main', parentId: 'sales-customers', label: '销售与订单', path: null, iconName: null, sortOrder: 2, requiredRoles: [] },
  { id: '/sales/business/opportunities', portalId: 'main', parentId: 'sales-business', label: '机会', path: '/sales/business/opportunities', iconName: 'Target', sortOrder: 1, requiredRoles: [] },
  { id: '/sales/business/quotes', portalId: 'main', parentId: 'sales-business', label: '报价', path: '/sales/business/quotes', iconName: 'FileSignature', sortOrder: 2, requiredRoles: [] },
  { id: '/sales/business/order360', portalId: 'main', parentId: 'sales-business', label: '订单360', path: '/sales/business/order360', iconName: 'PackageSearch', sortOrder: 3, requiredRoles: [] },
  { id: '/sales/business/dashboard', portalId: 'main', parentId: 'sales-business', label: '经营驾驶舱', path: '/sales/business/dashboard', iconName: 'BarChart4', sortOrder: 4, requiredRoles: [] },

  { id: 'planning-production', portalId: 'main', parentId: null, label: '计划与生产', path: null, iconName: null, sortOrder: 30, requiredRoles: [] },
  { id: 'production-dashboards', portalId: 'main', parentId: 'planning-production', label: '生产看板', path: null, iconName: null, sortOrder: 1, requiredRoles: [] },
  { id: '/production/dashboards/factory', portalId: 'main', parentId: 'production-dashboards', label: '工厂总览', path: '/production/dashboards/factory', iconName: 'LayoutDashboard', sortOrder: 1, requiredRoles: [] },
  { id: '/production/dashboards/morning-meeting', portalId: 'main', parentId: 'production-dashboards', label: '晨会总览', path: '/production/dashboards/morning-meeting', iconName: 'Presentation', sortOrder: 2, requiredRoles: [] },
  { id: 'production-execution', portalId: 'main', parentId: 'planning-production', label: '计划与执行', path: null, iconName: null, sortOrder: 2, requiredRoles: [] },
  { id: '/production/execution/scheduling', portalId: 'main', parentId: 'production-execution', label: '排程（占位）', path: '/production/execution/scheduling', iconName: 'CalendarDays', sortOrder: 1, requiredRoles: [] },
  { id: '/production/execution/workorders', portalId: 'main', parentId: 'production-execution', label: '工单', path: '/production/execution/workorders', iconName: 'ClipboardList', sortOrder: 2, requiredRoles: [] },
  { id: '/production/execution/dispatch', portalId: 'main', parentId: 'production-execution', label: '派工任务', path: '/production/execution/dispatch', iconName: 'UserCog', sortOrder: 3, requiredRoles: [] },
  { id: '/production/execution/reporting', portalId: 'main', parentId: 'production-execution', label: '报工', path: '/production/execution/reporting', iconName: 'Hammer', sortOrder: 4, requiredRoles: [] },

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
