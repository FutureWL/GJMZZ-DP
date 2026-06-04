import type { ReactNode } from 'react'

export function PageHeader({
  title,
  description,
  right,
}: {
  title: ReactNode
  description?: ReactNode
  right?: ReactNode
}) {
  return (
    <div className="mb-4 flex flex-wrap items-start justify-between gap-3">
      <div>
        <div className="text-lg font-semibold text-[var(--color-text-primary)]">{title}</div>
        {description ? (
          <div className="mt-1 text-sm text-[var(--color-text-tertiary)]">{description}</div>
        ) : null}
      </div>
      {right ? <div className="shrink-0">{right}</div> : null}
    </div>
  )
}

