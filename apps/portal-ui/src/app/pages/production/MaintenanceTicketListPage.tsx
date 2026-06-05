import { Link } from 'react-router-dom'
import { Badge } from '../../ui/Badge'
import { Button } from '../../ui/Button'
import { Card, CardBody, CardHeader, CardTitle } from '../../ui/Card'
import { PageHeader } from '../../ui/PageHeader'
import { useMaintenanceFlow } from '../../state/maintenance/MaintenanceFlowContext'

function statusLabel(status: string) {
  if (status === 'reported') return '报修'
  if (status === 'dispatched') return '已派工'
  if (status === 'accepted') return '已接单'
  if (status === 'on_site') return '已到场'
  if (status === 'repairing') return '维修中'
  if (status === 'done') return '已完工'
  if (status === 'verified') return '已验收'
  if (status === 'closed') return '已关闭'
  if (status === 'canceled') return '已取消'
  return status
}

export function MaintenanceTicketListPage() {
  const flow = useMaintenanceFlow()
  return (
    <div>
      <PageHeader
        title="维修工单"
        description="P0闭环：报修 → 派工 → 接单 → 到场 → 维修 → 完工 → 验收 → 关闭"
        right={
          <div className="flex flex-wrap items-center gap-2">
            <Link to="/production/maintenance/guide">
              <Button variant="secondary">流程说明</Button>
            </Link>
            <Link to="/production/maintenance/new">
              <Button variant="primary">发起报修</Button>
            </Link>
            <Link to="/production/maintenance/dashboard">
              <Button variant="secondary">维修看板</Button>
            </Link>
          </div>
        }
      />
      <Card>
        <CardHeader>
          <CardTitle>工单列表</CardTitle>
        </CardHeader>
        <CardBody>
          <div className="space-y-2">
            {flow.tickets.map((t) => (
              <div
                key={t.id}
                className="flex flex-wrap items-center justify-between gap-3 rounded-[10px] border border-[var(--color-border-subtle)] bg-[var(--color-bg-surface)] p-3"
              >
                <div className="min-w-0">
                  <div className="truncate text-sm font-medium text-[var(--color-text-primary)]">{t.title}</div>
                  <div className="mt-1 flex items-center gap-2 text-xs text-[var(--color-text-tertiary)]">
                    <span>{t.id}</span>
                    {flow.isOverdue(t) ? <Badge tone="warning">超时</Badge> : <Badge tone="neutral">正常</Badge>}
                    <Badge
                      tone={
                        t.status === 'closed'
                          ? 'success'
                          : t.status === 'repairing' || t.status === 'on_site' || t.status === 'accepted' || t.status === 'dispatched'
                            ? 'info'
                            : t.status === 'canceled'
                              ? 'error'
                              : 'neutral'
                      }
                    >
                      {statusLabel(t.status)}
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
