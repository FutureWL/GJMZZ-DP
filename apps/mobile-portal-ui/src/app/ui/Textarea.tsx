import type { TextareaHTMLAttributes } from 'react'
import clsx from 'clsx'

export function Textarea({ className, ...props }: TextareaHTMLAttributes<HTMLTextAreaElement>) {
  return (
    <textarea
      className={clsx(
        'min-h-[96px] w-full resize-none rounded-[6px] border border-[var(--color-border-subtle)] bg-[var(--color-bg-surface)] px-3 py-2 text-sm text-[var(--color-text-primary)] outline-none placeholder:text-[var(--color-text-tertiary)] focus:ring-2 focus:ring-[var(--color-focus)]',
        className,
      )}
      {...props}
    />
  )
}

