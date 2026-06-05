import type { HTMLAttributes } from 'react'
import clsx from 'clsx'

export type Tone = 'neutral' | 'success' | 'warning' | 'error' | 'info'

const toneVar: Record<Tone, string> = {
  neutral: '--color-text-tertiary',
  success: '--color-status-running',
  warning: '--color-status-stopped',
  error: '--color-status-fault',
  info: '--color-primary',
}

export function Badge({
  className,
  tone = 'neutral',
  ...props
}: HTMLAttributes<HTMLSpanElement> & { tone?: Tone }) {
  const color = `var(${toneVar[tone]})`
  return (
    <span
      className={clsx('inline-flex items-center gap-1 rounded-[6px] border px-2 py-0.5 text-xs font-medium', className)}
      style={{
        borderColor: `color-mix(in srgb, ${color} 35%, transparent)`,
        backgroundColor: `color-mix(in srgb, ${color} 12%, transparent)`,
        color: 'var(--color-text-primary)',
      }}
      {...props}
    />
  )
}

