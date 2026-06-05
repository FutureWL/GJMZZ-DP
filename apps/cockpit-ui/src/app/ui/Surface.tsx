import { type ReactNode } from 'react'
import clsx from 'clsx'

export function Surface(props: { children: ReactNode; className?: string }) {
  return (
    <div
      className={clsx(
        'rounded-2xl border border-[var(--color-border-subtle)] bg-[var(--color-bg-surface)] shadow-[var(--shadow-1)] backdrop-blur',
        props.className,
      )}
    >
      {props.children}
    </div>
  )
}
