import { type ReactNode } from 'react'
import clsx from 'clsx'
import { Surface } from './Surface'

export function Section(props: { title: string; subtitle?: string; children: ReactNode; className?: string }) {
  return (
    <Surface className={clsx('p-5', props.className)}>
      <div className="flex items-start justify-between gap-4">
        <div>
          <div className="text-sm font-semibold text-[var(--color-text-primary)]">{props.title}</div>
          {props.subtitle ? <div className="mt-1 text-xs text-[var(--color-text-tertiary)]">{props.subtitle}</div> : null}
        </div>
      </div>
      <div className="mt-4">{props.children}</div>
    </Surface>
  )
}

