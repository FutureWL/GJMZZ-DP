import type { SelectHTMLAttributes } from 'react'
import clsx from 'clsx'

export function Select({ className, ...props }: SelectHTMLAttributes<HTMLSelectElement>) {
  return (
    <select
      className={clsx(
        'h-9 w-full rounded-[6px] border border-[var(--color-border-subtle)] bg-[var(--color-bg-surface)] px-3 text-sm text-[var(--color-text-primary)] outline-none focus:ring-2 focus:ring-[var(--color-focus)]',
        className,
      )}
      {...props}
    />
  )
}

