import type { ComponentType } from 'react'
import {
  Activity,
  BadgeCheck,
  BriefcaseBusiness,
  Building2,
  ClipboardList,
  Factory,
  FileText,
  Handshake,
  LayoutDashboard,
  LifeBuoy,
  LineChart,
  Shield,
  ShoppingCart,
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
          { label: '采购 PR/PO', to: '/management/procurement/pr', icon: ShoppingCart },
          { label: '供应商 SRM', to: '/management/srm/suppliers', icon: Handshake },
          { label: '外协工厂', to: '/management/outsourcing/factories', icon: Factory },
        ],
      },
      {
        label: '流程合规',
        items: [
          { label: '审批中心', to: '/management/approval', icon: BadgeCheck },
          { label: '制度流程（占位）', to: '/management/policy', icon: FileText },
          { label: '内控审计（占位）', to: '/management/audit', icon: ClipboardList },
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
        label: '总览',
        items: [
          { label: '工厂总览', to: '/production/overview', icon: LayoutDashboard },
          { label: '告警中心', to: '/production/alarms', icon: Shield },
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
          { label: '维修工单', to: '/production/maintenance', icon: Wrench },
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
          { label: '支持首页', to: '/support/home', icon: LifeBuoy },
          { label: 'IT 工单', to: '/support/it/tickets', icon: Wrench },
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
    ],
  },
  {
    id: 'additional',
    label: '附加',
    domainColorVar: '--color-domain-additional',
    defaultPath: '/additional/home',
    sections: [
      {
        label: '专项机构（占位）',
        items: [
          { label: '人才发展中心', to: '/additional/tdc', icon: Users },
          { label: '党群', to: '/additional/party', icon: Building2 },
          { label: '工会', to: '/additional/union', icon: Building2 },
          { label: '妇联', to: '/additional/women', icon: Building2 },
        ],
      },
    ],
  },
]

export const PORTAL_BY_ID: Record<PortalId, PortalConfig> = Object.fromEntries(
  PORTALS.map((p) => [p.id, p]),
) as Record<PortalId, PortalConfig>

