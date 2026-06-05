import { Link } from 'react-router-dom'
import { useMemo } from 'react'
import { useRiskData } from '../../../state/production/RiskDataContext'
import { Badge } from '../../../ui/Badge'
import { Card, CardBody, CardHeader, CardTitle } from '../../../ui/Card'
import { PageHeader } from '../../../ui/PageHeader'

export function MaterialShortagePage() {
  const { risks } = useRiskData()

  const items = useMemo(() => {
    return risks
      .filter((r) => r.type === 'material_shortage' && r.status !== 'archived')
      .slice()
      .sort((a, b) => (b.delayMinutes ?? 0) - (a.delayMinutes ?? 0))
  }, [risks])

  return (
    <div>
      <PageHeader
        title="欠料影响清单"
        description="交付风险原因专题（欠料）"
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
          <CardTitle>当前欠料风险</CardTitle>
        </CardHeader>
        <CardBody>
          <div className="space-y-2">
            {items.map((r) => {
              const material = r.evidence.find((e) => e.key === 'material')?.value
              const eta = r.evidence.find((e) => e.key === 'eta')?.value
              const impact = r.evidence.find((e) => e.key === 'impact')?.value
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
                      <div className="text-xs text-[var(--color-text-tertiary)]">欠料物料</div>
                      <div className="mt-1 text-[var(--color-text-primary)]">{material ?? '-'}</div>
                    </div>
                    <div>
                      <div className="text-xs text-[var(--color-text-tertiary)]">预计到线</div>
                      <div className="mt-1 text-[var(--color-text-primary)]">{eta ?? '-'}</div>
                    </div>
                    <div>
                      <div className="text-xs text-[var(--color-text-tertiary)]">影响窗口</div>
                      <div className="mt-1 text-[var(--color-text-primary)]">{impact ?? '-'}</div>
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

