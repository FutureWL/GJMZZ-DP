import type { ComponentType } from 'react'
import {
  Activity,
  BadgeCheck,
  Boxes,
  Building2,
  ClipboardList,
  Database,
  FileText,
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

export type IconComponent = ComponentType<{ className?: string }>

export const IconMap: Record<string, IconComponent> = {
  Activity,
  BadgeCheck,
  Boxes,
  Building2,
  ClipboardList,
  Database,
  FileText,
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
}

export function getIconByName(iconName: string | null | undefined): IconComponent | undefined {
  if (!iconName) return undefined
  return IconMap[iconName]
}

