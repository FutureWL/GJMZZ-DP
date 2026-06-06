import type { ComponentType } from 'react'
import type { PortalId } from '../types'

export interface MenuNode {
  id: string
  label: string
  to?: string
  icon?: ComponentType<{ className?: string }>
  children?: MenuNode[]
}

export interface PortalConfig {
  id: PortalId
  label: string
  domainColorVar: string
  defaultPath: string
  menu: MenuNode[]
}

export const PORTALS: PortalConfig[] = [
  {
    id: 'main',
    label: '数字化平台',
    domainColorVar: '--color-domain-production',
    defaultPath: '/workbench',
    menu: [],
  },
]

export const PORTAL_BY_ID: Record<PortalId, PortalConfig> = Object.fromEntries(
  PORTALS.map((p) => [p.id, p]),
) as Record<PortalId, PortalConfig>
