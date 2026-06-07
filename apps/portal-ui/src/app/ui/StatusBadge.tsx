import type { ReactNode } from 'react'
import { Badge, type Tone } from './Badge'

export type StatusBadgeVariant = 'default' | 'success' | 'warning' | 'error' | 'info'

const toneByVariant: Record<StatusBadgeVariant, Tone> = {
  default: 'neutral',
  success: 'success',
  warning: 'warning',
  error: 'error',
  info: 'info',
}

export function StatusBadge({
  variant = 'default',
  children,
}: {
  variant?: StatusBadgeVariant
  children: ReactNode
}) {
  return <Badge tone={toneByVariant[variant]}>{children}</Badge>
}

