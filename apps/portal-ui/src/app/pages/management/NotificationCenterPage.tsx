import { Link } from 'react-router-dom'
import { notifications } from '../../mock/data'
import { Badge, type Tone } from '../../ui/Badge'
import { Button } from '../../ui/Button'
import { Card, CardBody, CardHeader, CardTitle } from '../../ui/Card'
import { PageHeader } from '../../ui/PageHeader'

function levelTone(level: string): Tone {
  if (level === 'error') return 'error'
  if (level === 'warning') return 'warning'
  return 'info'
}

export function NotificationCenterPage() {
  return (
    <div>
      <PageHeader
        title="通知中心"
        description="站内通知与待办提醒（mock）"
        right={
          <div className="flex flex-wrap items-center gap-2">
            <Link to="/management/approval?from=notification-center">
              <Button variant="secondary">审批中心</Button>
            </Link>
          </div>
        }
      />

      <Card>
        <CardHeader>
          <CardTitle>最新通知</CardTitle>
        </CardHeader>
        <CardBody>
          <div className="space-y-2">
            {notifications.map((n) => (
              <div
                key={n.id}
                className="flex flex-wrap items-start justify-between gap-3 rounded-[10px] border border-[var(--color-border-subtle)] bg-[var(--color-bg-surface)] p-3"
              >
                <div className="min-w-0">
                  <div className="flex flex-wrap items-center gap-2">
                    <div className="truncate text-sm font-medium text-[var(--color-text-primary)]">{n.title}</div>
                    <Badge tone={levelTone(n.level)}>{n.level}</Badge>
                    {n.read ? <Badge tone="neutral">已读</Badge> : <Badge tone="info">未读</Badge>}
                  </div>
                  <div className="mt-1 text-sm text-[var(--color-text-secondary)]">{n.body}</div>
                  <div className="mt-2 text-xs text-[var(--color-text-tertiary)]">{n.createdAt}</div>
                </div>
                {n.link ? (
                  <Link to={n.link} className="text-sm text-[var(--color-primary)] hover:underline">
                    打开
                  </Link>
                ) : null}
              </div>
            ))}
          </div>
        </CardBody>
      </Card>
    </div>
  )
}

