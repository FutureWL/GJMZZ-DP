import { Link } from 'react-router-dom'
import { Badge } from '../../ui/Badge'
import { Card, CardBody, CardHeader, CardTitle } from '../../ui/Card'
import { PageHeader } from '../../ui/PageHeader'

const tickets = [
  { id: 'MT-20260605-003', title: 'CNC-12 主轴异响', status: 'processing', sla: 'overdue' },
  { id: 'MT-20260605-004', title: 'CNC-07 冷却液泄漏', status: 'new', sla: 'normal' },
  { id: 'MT-20260604-021', title: 'AGV 充电异常', status: 'closed', sla: 'normal' },
]

export function MaintenanceTicketListPage() {
  return (
    <div>
      <PageHeader title="维修工单" description="P0闭环：列表 → 详情 → 状态推进（界面示例）" />
      <Card>
        <CardHeader>
          <CardTitle>工单列表</CardTitle>
        </CardHeader>
        <CardBody>
          <div className="space-y-2">
            {tickets.map((t) => (
              <div
                key={t.id}
                className="flex flex-wrap items-center justify-between gap-3 rounded-[10px] border border-[var(--color-border-subtle)] bg-[var(--color-bg-surface)] p-3"
              >
                <div className="min-w-0">
                  <div className="truncate text-sm font-medium text-[var(--color-text-primary)]">{t.title}</div>
                  <div className="mt-1 flex items-center gap-2 text-xs text-[var(--color-text-tertiary)]">
                    <span>{t.id}</span>
                    {t.sla === 'overdue' ? <Badge tone="warning">超时</Badge> : <Badge tone="neutral">正常</Badge>}
                    <Badge tone={t.status === 'closed' ? 'success' : t.status === 'processing' ? 'info' : 'neutral'}>
                      {t.status}
                    </Badge>
                  </div>
                </div>
                <Link
                  className="text-sm text-[var(--color-primary)] hover:underline"
                  to={`/production/maintenance/${encodeURIComponent(t.id)}`}
                >
                  查看详情
                </Link>
              </div>
            ))}
          </div>
        </CardBody>
      </Card>
    </div>
  )
}

