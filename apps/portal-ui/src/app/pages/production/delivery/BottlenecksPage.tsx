import { Link } from 'react-router-dom'
import { useMemo } from 'react'
import { useRiskData } from '../../../state/production/RiskDataContext'
import { Badge } from '../../../ui/Badge'
import { Card, CardBody, CardHeader, CardTitle } from '../../../ui/Card'
import { PageHeader } from '../../../ui/PageHeader'

export function BottlenecksPage() {
  const { risks } = useRiskData()

  const items = useMemo(() => {
    return risks
      .filter((r) => r.type === 'bottleneck' && r.status !== 'archived')
      .slice()
      .sort((a, b) => (b.delayMinutes ?? 0) - (a.delayMinutes ?? 0))
  }, [risks])

  return (
    <div>
      <PageHeader
        title="瓶颈清单"
        description="交付风险原因专题（瓶颈）"
        right={
          <div className="flex items-center gap-2">
            <Link className="text-sm text-[var(--color-primary)] hover:underline" to="/production/delivery/overview">
              返回总览
            </Link>
            <Link className="text-sm text-[var(--color-primary)] hover:underline" to="/production/risks">
              进入风险池
            </Link>
          </div>
        }
      />

      <Card>
        <CardHeader>
          <CardTitle>当前瓶颈风险</CardTitle>
        </CardHeader>
        <CardBody>
          <div className="space-y-2">
            {items.map((r) => {
              const station = r.evidence.find((e) => e.key === 'station')?.value
              const wip = r.evidence.find((e) => e.key === 'wip')?.value
              const cap = r.evidence.find((e) => e.key === 'cap')?.value
              return (
                <div
                  key={r.riskId}
                  className="rounded-[10px] border border-[var(--color-border-subtle)] bg-[var(--color-bg-surface)] p-3"
                >
                  <div className="flex flex-wrap items-center justify-between gap-3">
                    <div className="min-w-0">
                      <Link
                        className="truncate text-sm font-medium text-[var(--color-primary)] hover:underline"
                        to={`/production/risks/${encodeURIComponent(r.riskId)}`}
                      >
                        {r.title}
                      </Link>
                      <div className="mt-1 text-xs text-[var(--color-text-tertiary)]">
                        {r.factoryName}
                        {r.line ? ` · ${r.line}` : ''} · 更新时间：{r.updatedAt}
                      </div>
                    </div>
                    <div className="shrink-0 text-right text-xs text-[var(--color-text-tertiary)]">
                      <div>交期：{r.dueAt ?? '-'}</div>
                      <div>
                        ETA：{r.etaAt ?? '-'}
                        {r.delayMinutes != null ? ` · +${r.delayMinutes}m` : ''}
                      </div>
                    </div>
                  </div>
                  <div className="mt-2 grid grid-cols-1 gap-2 text-sm md:grid-cols-3">
                    <div>
                      <div className="text-xs text-[var(--color-text-tertiary)]">瓶颈工序</div>
                      <div className="mt-1 text-[var(--color-text-primary)]">{station ?? r.line ?? '-'}</div>
                    </div>
                    <div>
                      <div className="text-xs text-[var(--color-text-tertiary)]">在制/排队</div>
                      <div className="mt-1 text-[var(--color-text-primary)]">{wip ?? '-'}</div>
                    </div>
                    <div>
                      <div className="text-xs text-[var(--color-text-tertiary)]">产能假设</div>
                      <div className="mt-1 text-[var(--color-text-primary)]">{cap ?? '-'}</div>
                    </div>
                  </div>
                  <div className="mt-2 flex flex-wrap items-center gap-2 text-xs text-[var(--color-text-tertiary)]">
                    <Badge tone="neutral">{(r.orderIds ?? []).join(', ') || '无订单号'}</Badge>
                    <Badge tone="neutral">{(r.workOrderIds ?? []).join(', ') || '无工单号'}</Badge>
                  </div>
                </div>
              )
            })}
          </div>
          {items.length === 0 ? <div className="text-sm text-[var(--color-text-tertiary)]">暂无数据。</div> : null}
        </CardBody>
      </Card>
    </div>
  )
}

