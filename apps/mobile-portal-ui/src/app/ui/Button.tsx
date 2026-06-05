import type { ButtonHTMLAttributes } from 'react'
import clsx from 'clsx'

type Variant = 'primary' | 'secondary' | 'ghost' | 'danger'
type Size = 'sm' | 'md'

export function Button({
  className,
  variant = 'secondary',
  size = 'md',
  ...props
}: ButtonHTMLAttributes<HTMLButtonElement> & { variant?: Variant; size?: Size }) {
  return (
    <button
      className={clsx(
        'inline-flex items-center justify-center gap-2 rounded-[6px] border px-3 py-2 text-sm font-medium outline-none transition',
        size === 'sm' && 'h-8 px-2 text-xs',
        size === 'md' && 'h-9',
        variant === 'primary' &&
          'border-transparent bg-[var(--color-primary)] text-white hover:bg-[var(--color-primary-hover)] focus-visible:ring-2 focus-visible:ring-[var(--color-focus)]',
        variant === 'secondary' &&
          'border-[var(--color-border-subtle)] bg-[var(--color-bg-surface)] text-[var(--color-text-primary)] hover:bg-black/5 dark:hover:bg-white/5 focus-visible:ring-2 focus-visible:ring-[var(--color-focus)]',
        variant === 'ghost' &&
          'border-transparent bg-transparent text-[var(--color-text-primary)] hover:bg-black/5 dark:hover:bg-white/5 focus-visible:ring-2 focus-visible:ring-[var(--color-focus)]',
        variant === 'danger' &&
          'border-transparent bg-[var(--color-status-fault)] text-white hover:opacity-90 focus-visible:ring-2 focus-visible:ring-[var(--color-focus)]',
        props.disabled && 'cursor-not-allowed opacity-60',
        className,
      )}
      {...props}
    />
  )
}

