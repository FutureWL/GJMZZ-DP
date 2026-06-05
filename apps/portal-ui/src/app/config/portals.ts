import type { ComponentType } from 'react'
import {
  Activity,
  BadgeCheck,
  BriefcaseBusiness,
  Building2,
  ClipboardList,
  Database,
  Factory,
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
  to: string
  icon?: ComponentType<{ className?: string }>
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
    id: 'business',
    label: '经营',
    domainColorVar: '--color-domain-business',
    defaultPath: '/business/dashboard',
    sections: [
      {
        label: '总览',
        items: [
          { label: '经营驾驶舱', to: '/business/dashboard', icon: LayoutDashboard },
          { label: '经营分析', to: '/business/analysis', icon: LineChart },
        ],
      },
      {
        label: '营销（占位）',
        items: [{ label: '客户与机会', to: '/business/sales', icon: BriefcaseBusiness }],
      },
      {
        label: 'CRM',
        items: [
          { label: '业务流程指导', to: '/business/crm/guide', icon: ClipboardList },
          { label: '客户', to: '/business/crm/customers', icon: Building2 },
          { label: '机会', to: '/business/crm/opportunities', icon: Target },
          { label: '联系人', to: '/business/crm/contacts', icon: Users },
          { label: '跟进记录', to: '/business/crm/activities', icon: Activity },
          { label: '报价', to: '/business/crm/quotes', icon: FileText },
        ],
      },
      {
        label: '订单',
        items: [{ label: '订单360', to: '/business/orders', icon: ShoppingCart }],
      },
    ],
  },
  {
    id: 'management',
    label: '管理',
    domainColorVar: '--color-domain-management',
    defaultPath: '/management/procurement/pr',
    sections: [
      {
        label: '供应链',
        items: [
          { label: '采购流程指导', to: '/management/procurement/guide', icon: ClipboardList },
          { label: '采购 PR/PO', to: '/management/procurement/pr', icon: ShoppingCart },
          { label: '合同流程指导', to: '/management/contract/guide', icon: FileText },
          { label: '供应商 SRM', to: '/management/srm/suppliers', icon: Handshake },
          { label: '外协工厂', to: '/management/outsourcing/factories', icon: Factory },
        ],
      },
      {
        label: 'ERP',
        items: [
          { label: '库存台账', to: '/management/erp/inventory', icon: Boxes },
          { label: '费用报销', to: '/management/erp/expenses', icon: Receipt },
          { label: '费用报销（流程）', to: '/management/expense/guide', icon: Receipt },
          { label: '费用流程看板', to: '/management/expense/dashboard', icon: LineChart },
          { label: '主数据（占位）', to: '/management/erp/master-data', icon: Database },
        ],
      },
      {
        label: '流程合规',
        items: [
          { label: '通知中心', to: '/management/notifications', icon: Activity },
          { label: '审批中心', to: '/management/approval', icon: BadgeCheck },
          { label: '制度流程（占位）', to: '/management/policy', icon: FileText },
          { label: '审计日志', to: '/management/audit/log', icon: ClipboardList },
          { label: '权限矩阵', to: '/management/security/permissions', icon: Shield },
        ],
      },
      {
        label: '运营计划（占位）',
        items: [{ label: '目标/KPI', to: '/management/kpi', icon: Activity }],
      },
    ],
  },
  {
    id: 'production',
    label: '生产',
    domainColorVar: '--color-domain-production',
    defaultPath: '/production/overview',
    sections: [
      {
        label: 'MES',
        items: [
          { label: '派工任务', to: '/production/mes/dispatch', icon: ClipboardList },
          { label: '报工', to: '/production/mes/report', icon: FileText },
          { label: '检验任务', to: '/production/mes/quality', icon: BadgeCheck },
        ],
      },
      {
        label: '总览',
        items: [
          { label: '晨会总览', to: '/production/meeting', icon: LayoutDashboard },
          { label: '交付风险总览', to: '/production/delivery/overview', icon: LayoutDashboard },
          { label: '交付风险池', to: '/production/risks', icon: LayoutDashboard },
          { label: '工厂总览', to: '/production/overview', icon: LayoutDashboard },
          { label: '告警中心', to: '/production/alarms', icon: Shield },
          { label: '异常中心', to: '/production/incidents', icon: Activity },
        ],
      },
      {
        label: '生产与排程',
        items: [
          { label: '工单', to: '/production/workorders', icon: ClipboardList },
          { label: '排程（占位）', to: '/production/schedule', icon: LineChart },
        ],
      },
      {
        label: '质量与追溯',
        items: [{ label: '追溯查询', to: '/production/trace', icon: Building2 }],
      },
      {
        label: '设备与维护',
        items: [
          { label: '设备监控（占位）', to: '/production/equipment', icon: Activity },
          { label: '维修流程指导', to: '/production/maintenance/guide', icon: Wrench },
          { label: '维修工单', to: '/production/maintenance', icon: Wrench },
          { label: '维修看板', to: '/production/maintenance/dashboard', icon: LineChart },
        ],
      },
    ],
  },
  {
    id: 'support',
    label: '支持',
    domainColorVar: '--color-domain-support',
    defaultPath: '/support/home',
    sections: [
      {
        label: '服务台',
        items: [
          { label: '支持工作台', to: '/support/home', icon: LifeBuoy },
          { label: '工单中心', to: '/support/tickets', icon: ClipboardList },
          { label: '服务请求', to: '/support/requests', icon: FileText },
          { label: '公告', to: '/support/notices', icon: Activity },
          { label: '知识库/SOP', to: '/support/kb', icon: FileText },
        ],
      },
      {
        label: '支持模块（占位）',
        items: [
          { label: '人事', to: '/support/hr', icon: Users },
          { label: '财务', to: '/support/finance', icon: LineChart },
          { label: '体系', to: '/support/qms', icon: FileText },
          { label: '安保', to: '/support/security', icon: Shield },
          { label: '数据安全', to: '/support/data-security', icon: Shield },
          { label: '安全环保', to: '/support/ehs', icon: Activity },
        ],
      },
      {
        label: '历史入口',
        items: [{ label: 'IT 工单（原入口）', to: '/support/it/tickets', icon: Wrench }],
      },
    ],
  },
  {
    id: 'additional',
    label: '附加',
    domainColorVar: '--color-domain-additional',
    defaultPath: '/additional/home',
    sections: [
      {
        label: '附加门户',
        items: [
          { label: '首页', to: '/additional/home', icon: LayoutDashboard },
          { label: '我的申请', to: '/additional/requests', icon: ClipboardList },
          { label: '总后台', to: '/additional/admin', icon: BadgeCheck },
        ],
      },
      {
        label: '专项中心',
        items: [
          { label: '人才发展中心', to: '/additional/tdc', icon: Users },
          { label: '党群', to: '/additional/party', icon: Building2 },
          { label: '工会', to: '/additional/union', icon: Building2 },
          { label: '妇联', to: '/additional/women', icon: Building2 },
        ],
      },
      {
        label: '原型',
        items: [{ label: '多端 UI 原型', to: '/additional/prototypes', icon: LayoutDashboard }],
      },
    ],
  },
]

export const PORTAL_BY_ID: Record<PortalId, PortalConfig> = Object.fromEntries(
  PORTALS.map((p) => [p.id, p]),
) as Record<PortalId, PortalConfig>
