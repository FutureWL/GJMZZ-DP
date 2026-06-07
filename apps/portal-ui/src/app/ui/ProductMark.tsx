import { APP_TITLE } from '../appMeta'

export function ProductMark({
  title = APP_TITLE,
  subtitle = 'ERP · MES · CRM · 五域门户 (开发版)',
}: {
  title?: string
  subtitle?: string
}) {
  return (
    <div className="hidden min-w-0 flex-col lg:flex">
      <div className="truncate text-sm font-semibold text-[var(--color-text-primary)]">{title}</div>
      <div className="truncate text-xs text-[var(--color-text-tertiary)]">{subtitle}</div>
    </div>
  )
}
