import { Link } from 'react-router-dom'
import { Surface } from '../ui/Surface'

export function ScreenHeader(props: { title: string; subtitle?: string; metaRight?: string }) {
  return (
    <Surface className="px-6 py-4">
      <div className="flex items-start justify-between gap-6">
        <div className="min-w-0">
          <div className="text-3xl font-semibold tracking-tight text-[var(--color-text-primary)]">{props.title}</div>
          {props.subtitle ? <div className="mt-1 text-sm text-[var(--color-text-secondary)]">{props.subtitle}</div> : null}
        </div>
        <div className="flex items-center gap-4">
          {props.metaRight ? (
            <div className="rounded-full border border-[var(--color-border-subtle)] bg-[var(--color-bg-surface-strong)] px-4 py-2 text-sm text-[var(--color-text-tertiary)]">
              {props.metaRight}
            </div>
          ) : null}
          <Link
            to="/"
            className="rounded-full border border-[var(--color-border-subtle)] bg-[var(--color-bg-surface-strong)] px-4 py-2 text-sm font-medium text-[var(--color-text-secondary)] hover:text-[var(--color-text-primary)]"
          >
            返回
          </Link>
        </div>
      </div>
    </Surface>
  )
}

