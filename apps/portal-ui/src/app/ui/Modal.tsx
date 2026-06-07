import clsx from 'clsx'
import { X } from 'lucide-react'
import type { ReactNode } from 'react'
import { useEffect, useState } from 'react'
import { createPortal } from 'react-dom'
import { Button } from './Button'

export function Modal({
  open,
  title,
  children,
  onClose,
  onConfirm,
  confirmText = '确定',
  cancelText = '取消',
}: {
  open: boolean
  title: ReactNode
  children: ReactNode
  onClose: () => void
  onConfirm: () => void
  confirmText?: string
  cancelText?: string
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
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div
        className={clsx(
          'absolute inset-0 bg-black/50 backdrop-blur-sm transition-opacity duration-150',
          entered ? 'opacity-100' : 'opacity-0',
        )}
        onClick={onClose}
        role="button"
        tabIndex={-1}
      />

      <div
        className={clsx(
          'relative w-full max-w-[720px] overflow-hidden rounded-[12px] border border-[var(--color-border-subtle)] bg-[var(--color-bg-page)] shadow-[var(--shadow-3)] transition-all duration-200 ease-out',
          entered ? 'translate-y-0 opacity-100' : 'translate-y-2 opacity-0',
        )}
      >
        <div className="flex h-14 items-center justify-between gap-3 border-b border-[var(--color-border-subtle)] bg-[var(--color-bg-surface)] px-4">
          <div className="min-w-0 truncate text-sm font-semibold text-[var(--color-text-primary)]">{title}</div>
          <button
            type="button"
            className="inline-flex h-8 w-8 items-center justify-center rounded-[6px] text-[var(--color-text-secondary)] hover:bg-black/5 dark:hover:bg-white/5"
            onClick={onClose}
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        <div className="max-h-[70vh] overflow-auto p-4">{children}</div>

        <div className="flex items-center justify-end gap-2 border-t border-[var(--color-border-subtle)] bg-[var(--color-bg-surface)] px-4 py-3">
          <Button variant="secondary" onClick={onClose}>
            {cancelText}
          </Button>
          <Button variant="primary" onClick={onConfirm}>
            {confirmText}
          </Button>
        </div>
      </div>
    </div>,
    document.body,
  )
}

