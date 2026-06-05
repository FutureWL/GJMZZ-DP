import clsx from 'clsx'
import { useEffect, useRef } from 'react'

export function Menu({
  open,
  onClose,
  className,
  children,
}: {
  open: boolean
  onClose: () => void
  className?: string
  children: React.ReactNode
}) {
  const ref = useRef<HTMLDivElement | null>(null)

  useEffect(() => {
    if (!open) return
    const onDown = (e: MouseEvent) => {
      const el = ref.current
      if (!el) return
      if (e.target instanceof Node && el.contains(e.target)) return
      onClose()
    }
    window.addEventListener('mousedown', onDown)
    return () => window.removeEventListener('mousedown', onDown)
  }, [onClose, open])

  if (!open) return null

  return (
    <div
      ref={ref}
      className={clsx(
        'absolute right-0 top-[calc(100%+8px)] z-40 w-[240px] rounded-[12px] border border-[var(--color-border-subtle)] bg-[var(--color-bg-surface)] p-1 shadow-[var(--shadow-2)]',
        className,
      )}
    >
      {children}
    </div>
  )
}

export function MenuItem({
  onClick,
  children,
  danger,
}: {
  onClick?: () => void
  children: React.ReactNode
  danger?: boolean
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={clsx(
        'flex w-full items-center gap-2 rounded-[10px] px-3 py-2 text-left text-sm hover:bg-black/5 dark:hover:bg-white/5',
        danger ? 'text-[var(--color-status-fault)]' : 'text-[var(--color-text-primary)]',
      )}
    >
      {children}
    </button>
  )
}

