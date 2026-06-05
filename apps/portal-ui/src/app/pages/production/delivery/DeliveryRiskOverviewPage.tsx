import { Link } from 'react-router-dom'
import { useMemo } from 'react'
import type { DeliveryRisk } from '../../../mock/models'
import { useRiskData } from '../../../state/production/RiskDataContext'
import { Badge, type Tone } from '../../../ui/Badge'
import { Button } from '../../../ui/Button'
import { Card, CardBody, CardHeader, CardTitle } from '../../../ui/Card'
import { PageHeader } from '../../../ui/PageHeader'

function severityTone(sev: DeliveryRisk['severity']): Tone {
  if (sev === 'critical') return 'error'
  if (sev === 'high') return 'warning'
  if (sev === 'medium') return 'info'
  return 'neutral'
}

const typeLabel: Record<DeliveryRisk['type'], string> = {
  material_shortage: '欠料',
  bottleneck: '瓶颈',
  quality: '质量',
}

function severityWeight(sev: DeliveryRisk['severity']) {
  if (sev === 'critical') return 4
  if (sev === 'high') return 3
  if (sev === 'medium') return 2
  return 1
}

export function DeliveryRiskOverviewPage() {
  const { risks } = useRiskData()

  const active = useMemo(() => risks.filter((r) => r.status !== 'archived'), [risks])
  const total = risks.length
  const activeCount = active.length
  const criticalHigh = useMemo(
    () => active.filter((r) => r.severity === 'critical' || r.severity === 'high').length,
    [active],
  )

  const byType = useMemo(() => {
    return {
      material_shortage: active.filter((r) => r.type === 'material_shortage').length,
      bottleneck: active.filter((r) => r.type === 'bottleneck').length,
      quality: active.filter((r) => r.type === 'quality').length,
    }
  }, [active])

  const top = useMemo(() => {
    return active
      .slice()
      .sort((a, b) => {
        const w = severityWeight(b.severity) - severityWeight(a.severity)
        if (w !== 0) return w
        return (b.delayMinutes ?? 0) - (a.delayMinutes ?? 0)
      })
      .slice(0, 8)
  }, [active])

  return (
    <div>
      <PageHeader
        title="交付风险总览"
        description="规则生成 · 欠料/瓶颈/质量 三类优先覆盖"
        right={
          <div className="flex items-center gap-2">
            <Link to="/production/risks">
              <Button variant="primary">进入风险池</Button>
            </Link>
          </div>
        }
      />

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-4">
        <Card>
          <CardHeader>
            <CardTitle>总风险</CardTitle>
          </CardHeader>
          <CardBody>
            <div className="text-3xl font-semibold text-[var(--color-text-primary)]">{total}</div>
            <div className="mt-2 text-sm text-[var(--color-text-tertiary)]">包含已归档</div>
          </CardBody>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>活跃风险</CardTitle>
          </CardHeader>
          <CardBody>
            <div className="text-3xl font-semibold text-[var(--color-text-primary)]">{activeCount}</div>
            <div className="mt-2 text-sm text-[var(--color-text-tertiary)]">open + watching</div>
          </CardBody>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>高优先级</CardTitle>
          </CardHeader>
          <CardBody>
            <div className="text-3xl font-semibold text-[var(--color-text-primary)]">{criticalHigh}</div>
            <div className="mt-2 text-sm text-[var(--color-text-tertiary)]">critical / high</div>
          </CardBody>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>类型结构</CardTitle>
          </CardHeader>
          <CardBody>
            <div className="flex flex-col gap-2 text-sm">
              <div className="flex items-center justify-between gap-3">
                <div className="text-[var(--color-text-secondary)]">欠料</div>
                <Badge tone="warning">{byType.material_shortage}</Badge>
              </div>
              <div className="flex items-center justify-between gap-3">
                <div className="text-[var(--color-text-secondary)]">瓶颈</div>
                <Badge tone="warning">{byType.bottleneck}</Badge>
              </div>
              <div className="flex items-center justify-between gap-3">
                <div className="text-[var(--color-text-secondary)]">质量</div>
                <Badge tone="warning">{byType.quality}</Badge>
              </div>
            </div>
          </CardBody>
        </Card>
      </div>

      <div className="mt-4 grid grid-cols-1 gap-4 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Top 风险</CardTitle>
          </CardHeader>
          <CardBody>
            <div className="space-y-2">
              {top.map((r) => (
                <div
                  key={r.riskId}
                  className="flex items-start justify-between gap-3 rounded-[10px] border border-[var(--color-border-subtle)] bg-[var(--color-bg-surface)] p-3"
                >
                  <div className="min-w-0">
                    <div className="flex flex-wrap items-center gap-2">
                      <Link
                        className="truncate text-sm font-medium text-[var(--color-primary)] hover:underline"
                        to={`/production/risks/${encodeURIComponent(r.riskId)}`}
                      >
                        {r.title}
                      </Link>
                      <Badge tone={severityTone(r.severity)}>{r.severity}</Badge>
                      <Badge tone="neutral">{typeLabel[r.type]}</Badge>
                    </div>
                    <div className="mt-1 text-xs text-[var(--color-text-tertiary)]">
                      {r.factoryName}
                      {r.line ? ` · ${r.line}` : ''} · 更新时间：{r.updatedAt}
                    </div>
                    <div className="mt-2 line-clamp-2 text-sm text-[var(--color-text-secondary)]">{r.summary}</div>
                  </div>
                  <div className="shrink-0 text-right text-xs text-[var(--color-text-tertiary)]">
                    <div>交期：{r.dueAt ?? '-'}</div>
                    <div>
                      ETA：{r.etaAt ?? '-'}
                      {r.delayMinutes != null ? ` · +${r.delayMinutes}m` : ''}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardBody>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>原因专题</CardTitle>
          </CardHeader>
          <CardBody>
            <div className="flex flex-col gap-2 text-sm">
              <Link className="text-[var(--color-primary)] hover:underline" to="/production/delivery/material-shortage">
                欠料清单
              </Link>
              <Link className="text-[var(--color-primary)] hover:underline" to="/production/delivery/bottlenecks">
                瓶颈清单
              </Link>
              <Link className="text-[var(--color-primary)] hover:underline" to="/production/delivery/quality-holds">
                质量隔离清单
              </Link>
            </div>
          </CardBody>
        </Card>
      </div>
    </div>
  )
}

