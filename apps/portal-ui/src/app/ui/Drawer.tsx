import clsx from 'clsx'
import type { ReactNode } from 'react'
import { useEffect, useState } from 'react'
import { createPortal } from 'react-dom'

export function Drawer({
  open,
  title,
  onClose,
  children,
}: {
  open: boolean
  title: ReactNode
  onClose: () => void
  children: ReactNode
}) {
  const [entered, setEntered] = useState(false)

  useEffect(() => {
    if (!open) return
    const id = window.setTimeout(() => setEntered(true), 16)
    return () => {
      window.clearTimeout(id)
    }
  }, [open])

  if (!open) return null

  return createPortal(
    <div className="fixed inset-0 z-50">
      <div
        className="absolute inset-0 bg-black/40"
        onClick={onClose}
        role="button"
        tabIndex={-1}
      />
      <div
        className={clsx(
          'absolute inset-y-0 right-0 w-full max-w-[520px] border-l border-[var(--color-border-subtle)] bg-[var(--color-bg-page)] shadow-[var(--shadow-2)] transition-transform duration-200 ease-out',
          entered ? 'translate-x-0' : 'translate-x-full',
        )}
      >
        <div className="flex h-14 items-center justify-between gap-3 border-b border-[var(--color-border-subtle)] bg-[var(--color-bg-surface)] px-4">
          <div className="min-w-0 truncate text-sm font-semibold text-[var(--color-text-primary)]">
            {title}
          </div>
          <button
            className={clsx(
              'h-8 rounded-[6px] px-2 text-sm text-[var(--color-text-secondary)] hover:bg-black/5 dark:hover:bg-white/5',
            )}
            onClick={onClose}
          >
            关闭
          </button>
        </div>
        <div className="h-[calc(100%-56px)] overflow-auto p-4">{children}</div>
      </div>
    </div>,
    document.body,
  )
}
