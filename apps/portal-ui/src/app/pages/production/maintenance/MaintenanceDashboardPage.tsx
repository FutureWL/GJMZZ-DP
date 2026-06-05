import { Area, AreaChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts'
import { Link } from 'react-router-dom'
import { Badge } from '../../../ui/Badge'
import { Button } from '../../../ui/Button'
import { Card, CardBody, CardHeader, CardTitle } from '../../../ui/Card'
import { PageHeader } from '../../../ui/PageHeader'
import { useMaintenanceFlow } from '../../../state/maintenance/MaintenanceFlowContext'

function dayOf(ts: string) {
  const m = ts.match(/(\d{4})-(\d{2})-(\d{2})/)
  if (!m) return ts
  return `${m[2]}-${m[3]}`
}

export function MaintenanceDashboardPage() {
  const flow = useMaintenanceFlow()

  const open = flow.tickets.filter((t) => t.status !== 'closed' && t.status !== 'canceled').length
  const overdue = flow.tickets.filter((t) => flow.isOverdue(t)).length
  const closed = flow.tickets.filter((t) => t.status === 'closed').length

  const trend = Array.from(
    flow.tickets.reduce((map, t) => {
      const k = dayOf(t.createdAt)
      const prev = map.get(k) ?? { day: k, count: 0 }
      map.set(k, { day: k, count: prev.count + 1 })
      return map
    }, new Map<string, { day: string; count: number }>()),
  )
    .map(([, v]) => v)
    .sort((a, b) => (a.day < b.day ? -1 : 1))

  return (
    <div>
      <PageHeader
        title="维修看板"
        description="积压/SLA/趋势（mock）"
        right={
          <div className="flex flex-wrap items-center gap-2">
            <Badge tone="domain-production">生产</Badge>
            <Link to="/production/maintenance/new">
              <Button variant="primary">发起报修</Button>
            </Link>
            <Link to="/production/maintenance">
              <Button variant="secondary">工单列表</Button>
            </Link>
          </div>
        }
      />

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-4">
        <Card>
          <CardHeader>
            <CardTitle>未关闭</CardTitle>
          </CardHeader>
          <CardBody>
            <div className="text-3xl font-semibold text-[var(--color-text-primary)]">{open}</div>
            <div className="mt-2 text-sm text-[var(--color-text-tertiary)]">当前处理中与待派工</div>
          </CardBody>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>超时</CardTitle>
          </CardHeader>
          <CardBody>
            <div className="text-3xl font-semibold text-[var(--color-text-primary)]">{overdue}</div>
            <div className="mt-2 text-sm text-[var(--color-text-tertiary)]">SLA 逾期（示例）</div>
          </CardBody>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>已关闭</CardTitle>
          </CardHeader>
          <CardBody>
            <div className="text-3xl font-semibold text-[var(--color-text-primary)]">{closed}</div>
            <div className="mt-2 text-sm text-[var(--color-text-tertiary)]">完成闭环</div>
          </CardBody>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>一次修复率</CardTitle>
          </CardHeader>
          <CardBody>
            <div className="text-3xl font-semibold text-[var(--color-text-primary)]">—</div>
            <div className="mt-2 text-sm text-[var(--color-text-tertiary)]">占位（后续接真实口径）</div>
          </CardBody>
        </Card>
      </div>

      <div className="mt-4 grid grid-cols-1 gap-4 lg:grid-cols-3">
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle>报修趋势（数量）</CardTitle>
          </CardHeader>
          <CardBody>
            <div className="h-[280px]">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={trend} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                  <defs>
                    <linearGradient id="mt" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="var(--color-domain-production)" stopOpacity={0.35} />
                      <stop offset="95%" stopColor="var(--color-domain-production)" stopOpacity={0.02} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid stroke="var(--color-border-subtle)" strokeDasharray="3 3" />
                  <XAxis dataKey="day" stroke="var(--color-text-tertiary)" fontSize={12} />
                  <YAxis stroke="var(--color-text-tertiary)" fontSize={12} />
                  <Tooltip
                    formatter={(value) => [`${value ?? 0}`, '工单数']}
                    contentStyle={{
                      background: 'var(--color-bg-surface)',
                      border: '1px solid var(--color-border-subtle)',
                      borderRadius: 10,
                    }}
                  />
                  <Area type="monotone" dataKey="count" stroke="var(--color-domain-production)" fill="url(#mt)" strokeWidth={2} />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </CardBody>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>最新工单</CardTitle>
          </CardHeader>
          <CardBody>
            <div className="space-y-2">
              {flow.tickets.slice(0, 6).map((t) => (
                <div
                  key={t.id}
                  className="flex flex-wrap items-center justify-between gap-3 rounded-[10px] border border-[var(--color-border-subtle)] bg-[var(--color-bg-surface)] p-3"
                >
                  <div className="min-w-0">
                    <div className="truncate text-sm font-medium text-[var(--color-text-primary)]">{t.title}</div>
                    <div className="mt-1 flex flex-wrap items-center gap-2 text-xs text-[var(--color-text-tertiary)]">
                      <span>{t.id}</span>
                      {flow.isOverdue(t) ? <Badge tone="warning">超时</Badge> : <Badge tone="neutral">正常</Badge>}
                      <Badge tone={t.status === 'closed' ? 'success' : t.status === 'canceled' ? 'error' : 'info'}>{t.status}</Badge>
                    </div>
                  </div>
                  <Link to={`/production/maintenance/${encodeURIComponent(t.id)}`} className="text-sm text-[var(--color-primary)] hover:underline">
                    查看
                  </Link>
                </div>
              ))}
            </div>
          </CardBody>
        </Card>
      </div>
    </div>
  )
}
