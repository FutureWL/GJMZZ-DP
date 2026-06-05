import { useEffect, type ReactNode } from 'react'
import { formatDocumentTitle } from '../appMeta'

export function PageHeader({
  title,
  description,
  right,
}: {
  title: ReactNode
  description?: ReactNode
  right?: ReactNode
}) {
  useEffect(() => {
    if (typeof title === 'string') {
      document.title = formatDocumentTitle(title)
    }
  }, [title])

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
