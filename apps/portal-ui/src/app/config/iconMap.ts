import type { ComponentType } from 'react'
import {
  Activity,
  AlertOctagon,
  BadgeCheck,
  Boxes,
  Building2,
  CheckCircle,
  ClipboardList,
  Database,
  FileText,
  Handshake,
  LayoutGrid,
  LayoutDashboard,
  LayoutList,
  LifeBuoy,
  LineChart,
  Monitor,
  Receipt,
  Search,
  Shield,
  ShoppingCart,
  Target,
  Users,
  Wrench,
} from 'lucide-react'

export type IconComponent = ComponentType<{ className?: string }>

export const DefaultMenuIcon: IconComponent = FileText

export const IconMap: Record<string, IconComponent> = {
  Activity,
  AlertOctagon,
  BadgeCheck,
  Boxes,
  Building2,
  CheckCircle,
  ClipboardList,
  Database,
  FileText,
  Handshake,
  LayoutGrid,
  LayoutDashboard,
  LayoutList,
  LifeBuoy,
  LineChart,
  Monitor,
  Receipt,
  Search,
  Shield,
  ShoppingCart,
  Target,
  Users,
  Wrench,
}

export function getIconByName(iconName: string | null | undefined): IconComponent {
  if (!iconName) return DefaultMenuIcon
  return IconMap[iconName] ?? DefaultMenuIcon
}
