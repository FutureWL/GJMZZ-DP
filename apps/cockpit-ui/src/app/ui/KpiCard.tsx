import { type ReactNode } from 'react'
import clsx from 'clsx'
import { Surface } from './Surface'

export function KpiCard(props: {
  label: string
  value: ReactNode
  helper?: ReactNode
  status?: 'good' | 'warn' | 'bad'
}) {
  const badge = (() => {
    if (!props.status) return null
    const color =
      props.status === 'good'
        ? 'bg-emerald-500/15 text-emerald-200'
        : props.status === 'warn'
          ? 'bg-amber-500/15 text-amber-200'
          : 'bg-rose-500/15 text-rose-200'
    const text = props.status === 'good' ? '良好' : props.status === 'warn' ? '关注' : '风险'
    return (
      <span className={clsx('inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-xs font-medium', color)}>
        <span className="h-1.5 w-1.5 rounded-full bg-current opacity-80" />
        {text}
      </span>
    )
  })()

  return (
    <Surface className="p-4">
      <div className="flex items-start justify-between gap-3">
        <div className="text-sm font-medium text-[var(--color-text-tertiary)]">{props.label}</div>
        {badge}
      </div>
      <div className="mt-2 text-[40px] font-semibold tracking-tight text-[var(--color-text-primary)] leading-none">
        {props.value}
      </div>
      {props.helper ? <div className="mt-2 text-sm text-[var(--color-text-secondary)]">{props.helper}</div> : null}
    </Surface>
  )
}
