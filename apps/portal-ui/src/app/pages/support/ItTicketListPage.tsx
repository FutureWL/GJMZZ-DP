import { Link } from 'react-router-dom'
import { itTickets } from '../../mock/data'
import { Badge } from '../../ui/Badge'
import { Card, CardBody, CardHeader, CardTitle } from '../../ui/Card'
import { PageHeader } from '../../ui/PageHeader'

export function ItTicketListPage() {
  return (
    <div>
      <PageHeader title="IT 工单" description="支持域典型闭环：提交 → 受理 → 处理 → 验收 → 关闭（P0演示）" />
      <Card>
        <CardHeader>
          <CardTitle>工单列表</CardTitle>
        </CardHeader>
        <CardBody>
          <div className="space-y-2">
            {itTickets.map((t) => (
              <div
                key={t.id}
                className="flex flex-wrap items-center justify-between gap-3 rounded-[10px] border border-[var(--color-border-subtle)] bg-[var(--color-bg-surface)] p-3"
              >
                <div className="min-w-0">
                  <div className="truncate text-sm font-medium text-[var(--color-text-primary)]">{t.title}</div>
                  <div className="mt-1 text-xs text-[var(--color-text-tertiary)]">
                    {t.id} · {t.requester} · {t.createdAt}
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  {t.sla === 'overdue' ? <Badge tone="warning">超时</Badge> : <Badge tone="neutral">正常</Badge>}
                  <Badge tone={t.status === 'closed' ? 'success' : t.status === 'processing' ? 'info' : 'neutral'}>
                    {t.status}
                  </Badge>
                  <Link
                    className="text-sm text-[var(--color-primary)] hover:underline"
                    to={`/support/it/tickets/${encodeURIComponent(t.id)}`}
                  >
                    查看
                  </Link>
                </div>
              </div>
            ))}
          </div>
        </CardBody>
      </Card>
    </div>
  )
}

