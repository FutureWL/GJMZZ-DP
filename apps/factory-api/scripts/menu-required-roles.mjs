/**
 * 菜单 → requiredRoles 映射
 * 与 apps/portal-ui/src/app/api/menus.ts 的 MOCK_MENU_JSON 同 id 对齐
 *
 * 角色枚举(对应 15 角色用户的 profile.position):
 *   - approver       (10 人:ceo / ceo-deputy / vp-sales / vp-mfg / vp-finance / mgr-procurement / mgr-it / worker-leader / planner / warehouse)
 *   - manager        (1 人:mgr-production)
 *   - quality_manager(1 人:mgr-quality)
 *   - quality        (1 人:inspector)
 *   - plant_manager  (2 人:mgr-equipment / tech)
 *
 * 语义:
 *   - requiredRoles = [] 或 null → 全部人可见(默认)
 *   - requiredRoles = [...] → 用户的"角色集合"包含任一元素即可见
 *   - 用户的角色集合 = JWT.realm_access.roles ∪ profile.position
 *
 * 容器节点(顶层组、子组)保持 []:菜单结构始终显示,叶子按权限过滤
 * 容器若空(无可见子项),Sidebar 的 buildMenuTree 会自动隐藏(已实现)
 */

export const MENU_REQUIRED_ROLES = {
  // 工作台(全部人)
  '/workbench': [],
  '/search': [],

  // 营销与客户(高层 + 生产经理)
  '/sales/crm/customers': ['approver', 'manager'],
  '/sales/crm/contacts': ['approver', 'manager'],
  '/sales/crm/activities': ['approver', 'manager'],
  '/sales/business/opportunities': ['approver', 'manager'],
  '/sales/business/quotes': ['approver', 'manager'],
  '/sales/order': ['approver', 'manager'],
  '/sales/business/order360': ['approver', 'manager'],
  '/sales/business/dashboard': ['approver', 'manager'],

  // 计划与生产
  '/production/dashboards/factory': ['approver', 'manager'],
  '/production/dashboards/morning-meeting': ['approver', 'manager'],
  '/production/execution/scheduling': ['approver', 'manager'],
  '/production/execution/workorders': ['approver', 'manager'],
  '/production/execution/dispatch': ['approver', 'manager'],
  '/production/execution/reporting': ['approver', 'manager', 'plant_manager'],

  // 质量管控
  '/quality/delivery-overview': ['approver', 'manager', 'quality_manager'],
  '/quality/delivery-pool': ['approver', 'manager', 'quality_manager'],
  '/quality/alerts': ['approver', 'manager', 'quality_manager', 'quality', 'plant_manager'],
  '/quality/exceptions': ['approver', 'manager', 'quality_manager', 'quality', 'plant_manager'],
  '/quality/inspections': ['approver', 'manager', 'quality_manager', 'quality'],
  '/quality/traceability': ['approver', 'manager', 'quality_manager', 'quality'],

  // 设备运维(质量经理也需看设备问题根因)
  '/equipment/monitoring': ['approver', 'manager', 'quality_manager', 'plant_manager'],
  '/equipment/workorders': ['approver', 'manager', 'quality_manager', 'plant_manager'],
  '/equipment/dashboard': ['approver', 'manager', 'quality_manager', 'plant_manager'],

  // 采购与供应链
  '/supply/procurement/orders': ['approver', 'manager'],
  '/supply/procurement/create-pr': ['approver', 'manager'],
  '/supply/suppliers/list': ['approver', 'manager'],
  '/supply/suppliers/contracts': ['approver', 'manager'],
  '/supply/suppliers/outsourcing': ['approver', 'manager'],

  // 综合管理
  '/management/approval': [
    'approver', 'manager', 'quality_manager', 'quality', 'plant_manager',
  ],
  '/management/notifications': [],
  '/management/audit/log': ['approver', 'manager'],
  '/management/security/permissions': ['manager', 'quality_manager', 'plant_manager'],
  '/management/erp/expenses': [
    'approver', 'manager', 'quality_manager', 'plant_manager',
  ],
  '/management/expense/dashboard': [
    'approver', 'manager', 'quality_manager', 'plant_manager',
  ],
}

/**
 * 用法:
 *   import { MENU_REQUIRED_ROLES } from './menu-required-roles.mjs'
 *   items.map(it => ({ ...it, requiredRoles: MENU_REQUIRED_ROLES[it.id] ?? it.requiredRoles ?? [] }))
 */