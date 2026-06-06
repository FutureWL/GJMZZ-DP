import type { ComponentType } from 'react'
import {
  Activity,
  BadgeCheck,
  Building2,
  ClipboardList,
  Database,
  FileText,
  Boxes,
  Handshake,
  LayoutDashboard,
  LifeBuoy,
  LineChart,
  Receipt,
  Shield,
  ShoppingCart,
  Target,
  Users,
  Wrench,
} from 'lucide-react'
import type { PortalId } from '../types'

export interface NavItem {
  label: string
  to?: string
  icon?: ComponentType<{ className?: string }>
  children?: NavItem[]
}

export interface NavSection {
  label: string
  items: NavItem[]
}

export interface PortalConfig {
  id: PortalId
  label: string
  domainColorVar: string
  defaultPath: string
  sections: NavSection[]
}

export const PORTALS: PortalConfig[] = [
  {
    id: 'main',
    label: '数字化平台',
    domainColorVar: '--color-domain-production',
    defaultPath: '/workbench',
    sections: [
      {
        label: '工作台',
        items: [
          { label: '我的工作台', to: '/workbench', icon: LayoutDashboard },
          { label: '全局搜索', to: '/search', icon: Activity },
        ],
      },
      {
        label: '营销与客户',
        items: [
          { label: '客户', to: '/business/crm/customers', icon: Building2 },
          { label: '机会', to: '/business/crm/opportunities', icon: Target },
          { label: '联系人', to: '/business/crm/contacts', icon: Users },
          { label: '跟进记录', to: '/business/crm/activities', icon: Activity },
          { label: '报价', to: '/business/crm/quotes', icon: FileText },
          { label: '订单360', to: '/business/orders', icon: ShoppingCart },
          { label: '经营驾驶舱', to: '/business/dashboard', icon: LineChart },
        ],
      },
      {
        label: '计划与生产',
        items: [
          { label: '工厂总览', to: '/production/overview', icon: LayoutDashboard },
          { label: '晨会总览', to: '/production/meeting', icon: LayoutDashboard },
          { label: '工单', to: '/production/workorders', icon: ClipboardList },
          { label: '派工任务', to: '/production/mes/dispatch', icon: ClipboardList },
          { label: '报工', to: '/production/mes/report', icon: FileText },
          { label: '排程（占位）', to: '/production/schedule', icon: LineChart },
        ],
      },
      {
        label: '采购与供应链',
        items: [
          { label: '采购 PR/PO', to: '/management/procurement/pr', icon: ShoppingCart },
          { label: '新增采购PR', to: '/management/procurement/pr/new', icon: ClipboardList },
          { label: '供应商', to: '/management/srm/suppliers', icon: Handshake },
          { label: '合同评审', to: '/management/contract/reviews/new', icon: FileText },
          { label: '外协工厂（占位）', to: '/management/outsourcing/factories', icon: Building2 },
        ],
      },
      {
        label: '仓储与物流',
        items: [
          { label: '库存台账', to: '/management/erp/inventory', icon: Boxes },
          { label: '主数据（占位）', to: '/management/erp/master-data', icon: Database },
        ],
      },
      {
        label: '质量与设备',
        items: [
          { label: '交付风险总览', to: '/production/delivery/overview', icon: LayoutDashboard },
          { label: '交付风险池', to: '/production/risks', icon: LayoutDashboard },
          { label: '告警中心', to: '/production/alarms', icon: Shield },
          { label: '异常中心', to: '/production/incidents', icon: Activity },
          { label: '检验任务', to: '/production/mes/quality', icon: BadgeCheck },
          { label: '追溯查询', to: '/production/trace', icon: Building2 },
          { label: '设备监控（占位）', to: '/production/equipment', icon: Activity },
          { label: '维修工单', to: '/production/maintenance', icon: Wrench },
          { label: '维修看板', to: '/production/maintenance/dashboard', icon: LineChart },
        ],
      },
      {
        label: '综合管理',
        items: [
          {
            label: '流程与合规',
            children: [
              { label: '审批中心', to: '/management/approval', icon: BadgeCheck },
              { label: '通知中心', to: '/management/notifications', icon: Activity },
              { label: '审计日志', to: '/management/audit/log', icon: ClipboardList },
              { label: '权限矩阵', to: '/management/security/permissions', icon: Shield },
            ],
          },
          {
            label: '财务与费控',
            children: [
              { label: '费用报销', to: '/management/erp/expenses', icon: Receipt },
              { label: '费用流程看板', to: '/management/expense/dashboard', icon: LineChart },
            ],
          },
          {
            label: '员工服务与IT',
            children: [
              { label: '员工服务工作台', to: '/support/home', icon: LifeBuoy },
              { label: '工单中心', to: '/support/tickets', icon: ClipboardList },
              { label: '服务请求', to: '/support/requests', icon: FileText },
              { label: '公告', to: '/support/notices', icon: Activity },
              { label: '知识库/SOP', to: '/support/kb', icon: FileText },
              { label: '人事（占位）', to: '/support/hr', icon: Users },
              { label: '财务（占位）', to: '/support/finance', icon: LineChart },
              { label: 'IT 工单（原入口）', to: '/support/it/tickets', icon: Wrench },
            ],
          },
          {
            label: '附加与个人',
            children: [
              { label: '附加中心', to: '/additional/home', icon: LayoutDashboard },
              { label: '我的申请（附加）', to: '/additional/requests', icon: ClipboardList },
              { label: '多端 UI 原型', to: '/additional/prototypes', icon: LayoutDashboard },
              { label: '总后台（附加）', to: '/additional/admin', icon: BadgeCheck },
              { label: '个人信息', to: '/account/profile', icon: Users },
            ],
          },
        ],
      },
    ],
  },
]

export const PORTAL_BY_ID: Record<PortalId, PortalConfig> = Object.fromEntries(
  PORTALS.map((p) => [p.id, p]),
) as Record<PortalId, PortalConfig>
