import { Badge } from '../../ui/Badge'
import { Card, CardBody, CardHeader, CardTitle } from '../../ui/Card'
import { PageHeader } from '../../ui/PageHeader'
import { supportAnnouncements } from './mockSupport'

export function SupportAnnouncementPage() {
  return (
    <div>
      <PageHeader title="公告" description="维护窗口、升级通知、策略变更（示例数据）" />
      <Card>
        <CardHeader>
          <CardTitle>公告列表</CardTitle>
        </CardHeader>
        <CardBody>
          <div className="space-y-2">
            {supportAnnouncements.map((a) => (
              <div
                key={a.id}
                className="flex items-center justify-between gap-3 rounded-[10px] border border-[var(--color-border-subtle)] bg-[var(--color-bg-surface)] p-3"
              >
                <div className="min-w-0">
                  <div className="truncate text-sm font-medium text-[var(--color-text-primary)]">{a.title}</div>
                  <div className="mt-1 text-xs text-[var(--color-text-tertiary)]">
                    {a.id} · {a.publishedAt}
                  </div>
                </div>
                <Badge tone={a.level === 'warning' ? 'warning' : 'neutral'}>{a.level === 'warning' ? '重要' : '通知'}</Badge>
              </div>
            ))}
          </div>
        </CardBody>
      </Card>
    </div>
  )
}

