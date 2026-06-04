import { Link } from 'react-router-dom'
import { itTickets } from '../../mock/data'
import { Badge } from '../../ui/Badge'
import { Card, CardBody, CardHeader, CardTitle } from '../../ui/Card'
import { PageHeader } from '../../ui/PageHeader'

export function SupportHomePage() {
  const overdue = itTickets.filter((t) => t.sla === 'overdue').length
  const open = itTickets.filter((t) => t.status !== 'closed').length

  return (
    <div>
      <PageHeader title="支持门户首页" description="服务台摘要：待办、SLA、风险提示（示例）" />

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-4">
        <Card>
          <CardHeader>
            <CardTitle>支持请求</CardTitle>
          </CardHeader>
          <CardBody>
            <div className="text-3xl font-semibold text-[var(--color-text-primary)]">{open}</div>
            <div className="mt-2 text-sm text-[var(--color-text-tertiary)]">未关闭工单</div>
          </CardBody>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>SLA 超时</CardTitle>
          </CardHeader>
          <CardBody>
            <div className="text-3xl font-semibold text-[var(--color-text-primary)]">{overdue}</div>
            <div className="mt-2 text-sm text-[var(--color-text-tertiary)]">需要优先处理</div>
          </CardBody>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>数据访问异常</CardTitle>
          </CardHeader>
          <CardBody>
            <div className="text-3xl font-semibold text-[var(--color-text-primary)]">1</div>
            <div className="mt-2 text-sm text-[var(--color-text-tertiary)]">占位</div>
          </CardBody>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>EHS 隐患</CardTitle>
          </CardHeader>
          <CardBody>
            <div className="text-3xl font-semibold text-[var(--color-text-primary)]">3</div>
            <div className="mt-2 text-sm text-[var(--color-text-tertiary)]">未闭环（占位）</div>
          </CardBody>
        </Card>
      </div>

      <div className="mt-4 grid grid-cols-1 gap-4 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>IT 工单（最新）</CardTitle>
          </CardHeader>
          <CardBody>
            <div className="space-y-2">
              {itTickets.slice(0, 3).map((t) => (
                <div
                  key={t.id}
                  className="flex items-center justify-between gap-3 rounded-[10px] border border-[var(--color-border-subtle)] bg-[var(--color-bg-surface)] p-3"
                >
                  <div className="min-w-0">
                    <div className="truncate text-sm font-medium text-[var(--color-text-primary)]">{t.title}</div>
                    <div className="mt-1 text-xs text-[var(--color-text-tertiary)]">
                      {t.id} · {t.requester}
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    {t.sla === 'overdue' ? <Badge tone="warning">超时</Badge> : <Badge tone="neutral">正常</Badge>}
                    <Link
                      className="text-sm text-[var(--color-primary)] hover:underline"
                      to={`/support/it/tickets/${encodeURIComponent(t.id)}`}
                    >
                      查看
                    </Link>
                  </div>
                </div>
              ))}
              <Link className="text-sm text-[var(--color-primary)] hover:underline" to="/support/it/tickets">
                查看全部 IT 工单
              </Link>
            </div>
          </CardBody>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>支持模块入口（占位）</CardTitle>
          </CardHeader>
          <CardBody>
            <div className="flex flex-wrap gap-2 text-sm">
              {['人事', '财务', '审计', '体系', '安保', '数据安全', 'EHS'].map((x) => (
                <span
                  key={x}
                  className="rounded-[10px] border border-[var(--color-border-subtle)] bg-[var(--color-bg-surface)] px-3 py-2 text-[var(--color-text-secondary)]"
                >
                  {x}
                </span>
              ))}
            </div>
          </CardBody>
        </Card>
      </div>
    </div>
  )
}

