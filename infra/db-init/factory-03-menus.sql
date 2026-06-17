-- Auto-generated from apps/portal-ui/src/app/api/menus.ts (MOCK_MENU_JSON)
-- DO NOT EDIT BY HAND;regenerate via apps/factory-api/scripts/seed-menus.mjs

create table if not exists public.menu_item (
  id            text primary key,
  portal_id     text not null,
  parent_id     text references public.menu_item(id) on delete cascade,
  label         text not null,
  path          text,
  icon_name     text,
  sort_order    integer not null default 0,
  required_roles text[],
  enabled       boolean not null default true,
  created_at    timestamptz not null default now(),
  updated_at    timestamptz not null default now()
);

create index if not exists menu_item_portal_idx on public.menu_item (portal_id);
create index if not exists menu_item_parent_idx on public.menu_item (parent_id);
create index if not exists menu_item_sort_idx on public.menu_item (portal_id, sort_order);

truncate table public.menu_item restart identity cascade;

insert into public.menu_item (id, portal_id, parent_id, label, path, icon_name, sort_order, required_roles, enabled) values
  ('workbench', 'main', null, '工作台', null, null, 1, null, true),
  ('sales-customers', 'main', null, '营销与客户', null, null, 20, null, true),
  ('planning-production', 'main', null, '计划与生产', null, null, 30, null, true),
  ('quality-equipment', 'main', null, '质量与设备', null, null, 60, null, true),
  ('procurement-supply', 'main', null, '采购与供应链', null, null, 70, null, true),
  ('admin', 'main', null, '综合管理', null, null, 90, null, true),
  ('admin.compliance', 'main', 'admin', '流程与合规', null, null, 1, null, true),
  ('admin.finance', 'main', 'admin', '财务与费控', null, null, 2, null, true),
  ('/management/approval', 'main', 'admin.compliance', '审批中心', '/management/approval', 'BadgeCheck', 1, null, true),
  ('/management/notifications', 'main', 'admin.compliance', '通知中心', '/management/notifications', 'Activity', 2, null, true),
  ('/management/audit/log', 'main', 'admin.compliance', '审计日志', '/management/audit/log', 'ClipboardList', 3, null, true),
  ('/management/security/permissions', 'main', 'admin.compliance', '权限矩阵', '/management/security/permissions', 'Shield', 4, null, true),
  ('/management/erp/expenses', 'main', 'admin.finance', '费用报销', '/management/erp/expenses', 'Receipt', 1, null, true),
  ('/management/expense/dashboard', 'main', 'admin.finance', '费用流程看板', '/management/expense/dashboard', 'LineChart', 2, null, true),
  ('/equipment/monitoring', 'main', 'equipment-maintenance', '设备监控（占位）', '/equipment/monitoring', 'Monitor', 1, null, true),
  ('/equipment/workorders', 'main', 'equipment-maintenance', '维修工单', '/equipment/workorders', 'Wrench', 2, null, true),
  ('/equipment/dashboard', 'main', 'equipment-maintenance', '维修看板', '/equipment/dashboard', 'LineChart', 3, null, true),
  ('production-dashboards', 'main', 'planning-production', '生产看板', null, null, 1, null, true),
  ('production-execution', 'main', 'planning-production', '计划与执行', null, null, 2, null, true),
  ('/supply/procurement/orders', 'main', 'procurement-management', '采购 PR/PO', '/supply/procurement/orders', 'ShoppingCart', 1, null, true),
  ('/supply/procurement/create-pr', 'main', 'procurement-management', '新增采购PR', '/supply/procurement/create-pr', 'FilePlus', 2, null, true),
  ('procurement-management', 'main', 'procurement-supply', '采购管理', null, null, 1, null, true),
  ('supplier-collaboration', 'main', 'procurement-supply', '供应商协同', null, null, 2, null, true),
  ('/production/dashboards/factory', 'main', 'production-dashboards', '工厂总览', '/production/dashboards/factory', 'LayoutDashboard', 1, null, true),
  ('/production/dashboards/morning-meeting', 'main', 'production-dashboards', '晨会总览', '/production/dashboards/morning-meeting', 'Presentation', 2, null, true),
  ('/production/execution/scheduling', 'main', 'production-execution', '排程（占位）', '/production/execution/scheduling', 'CalendarDays', 1, null, true),
  ('/production/execution/workorders', 'main', 'production-execution', '工单', '/production/execution/workorders', 'ClipboardList', 2, null, true),
  ('/production/execution/dispatch', 'main', 'production-execution', '派工任务', '/production/execution/dispatch', 'UserCog', 3, null, true),
  ('/production/execution/reporting', 'main', 'production-execution', '报工', '/production/execution/reporting', 'Hammer', 4, null, true),
  ('quality-management', 'main', 'quality-equipment', '质量管控', null, null, 1, null, true),
  ('equipment-maintenance', 'main', 'quality-equipment', '设备运维', null, null, 2, null, true),
  ('/quality/delivery-overview', 'main', 'quality-management', '交付风险总览', '/quality/delivery-overview', 'LayoutGrid', 1, null, true),
  ('/quality/delivery-pool', 'main', 'quality-management', '交付风险池', '/quality/delivery-pool', 'LayoutList', 2, null, true),
  ('/quality/alerts', 'main', 'quality-management', '告警中心', '/quality/alerts', 'AlertOctagon', 3, null, true),
  ('/quality/exceptions', 'main', 'quality-management', '异常中心', '/quality/exceptions', 'Activity', 4, null, true),
  ('/quality/inspections', 'main', 'quality-management', '检验任务', '/quality/inspections', 'CheckCircle', 5, null, true),
  ('/quality/traceability', 'main', 'quality-management', '追溯查询', '/quality/traceability', 'Search', 6, null, true),
  ('/sales/business/opportunities', 'main', 'sales-business', '机会', '/sales/business/opportunities', 'Target', 1, null, true),
  ('/sales/business/quotes', 'main', 'sales-business', '报价', '/sales/business/quotes', 'FileSignature', 2, null, true),
  ('/sales/order', 'main', 'sales-business', '销售订单', '/sales/order', 'ClipboardList', 3, null, true),
  ('/sales/business/order360', 'main', 'sales-business', '订单360', '/sales/business/order360', 'PackageSearch', 4, null, true),
  ('/sales/business/dashboard', 'main', 'sales-business', '经营驾驶舱', '/sales/business/dashboard', 'BarChart4', 5, null, true),
  ('/sales/crm/customers', 'main', 'sales-crm', '客户', '/sales/crm/customers', 'Building2', 1, null, true),
  ('/sales/crm/contacts', 'main', 'sales-crm', '联系人', '/sales/crm/contacts', 'Contact', 2, null, true),
  ('/sales/crm/activities', 'main', 'sales-crm', '跟进记录', '/sales/crm/activities', 'History', 3, null, true),
  ('sales-crm', 'main', 'sales-customers', '客户管理', null, null, 1, null, true),
  ('sales-business', 'main', 'sales-customers', '销售与订单', null, null, 2, null, true),
  ('/supply/suppliers/list', 'main', 'supplier-collaboration', '供应商', '/supply/suppliers/list', 'Handshake', 1, null, true),
  ('/supply/suppliers/contracts', 'main', 'supplier-collaboration', '合同评审', '/supply/suppliers/contracts', 'FileCheck', 2, null, true),
  ('/supply/suppliers/outsourcing', 'main', 'supplier-collaboration', '外协工厂（占位）', '/supply/suppliers/outsourcing', 'Factory', 3, null, true),
  ('/workbench', 'main', 'workbench', '我的工作台', '/workbench', 'LayoutDashboard', 1, null, true),
  ('/search', 'main', 'workbench', '全局搜索', '/search', 'Activity', 2, null, true);
