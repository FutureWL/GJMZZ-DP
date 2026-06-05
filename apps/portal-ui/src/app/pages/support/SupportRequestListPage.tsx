import { Link } from 'react-router-dom'
import { Badge } from '../../ui/Badge'
import { Card, CardBody, CardHeader, CardTitle } from '../../ui/Card'
import { PageHeader } from '../../ui/PageHeader'
import { supportRequests } from './mockSupport'

export function SupportRequestListPage() {
  return (
    <div>
      <PageHeader title="服务请求" description="账号权限 / 行政办公 / 体系合规 等（示例数据）" />
      <Card>
        <CardHeader>
          <CardTitle>请求列表</CardTitle>
        </CardHeader>
        <CardBody>
          <div className="space-y-2">
            {supportRequests.map((r) => (
              <div
                key={r.id}
                className="flex items-center justify-between gap-3 rounded-[10px] border border-[var(--color-border-subtle)] bg-[var(--color-bg-surface)] p-3"
              >
                <div className="min-w-0">
                  <div className="truncate text-sm font-medium text-[var(--color-text-primary)]">{r.title}</div>
                  <div className="mt-1 text-xs text-[var(--color-text-tertiary)]">
                    {r.id} · {r.category} · {r.requester}
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Badge tone={r.status === 'done' ? 'success' : r.status === 'canceled' ? 'neutral' : 'info'}>
                    {r.status}
                  </Badge>
                  <Link className="text-sm text-[var(--color-primary)] hover:underline" to={`/support/requests/${encodeURIComponent(r.id)}`}>
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

