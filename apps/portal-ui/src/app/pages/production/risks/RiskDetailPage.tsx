import { Link, useParams } from 'react-router-dom'
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

const statusLabel: Record<DeliveryRisk['status'], string> = {
  open: '打开',
  watching: '关注',
  archived: '已归档',
}

export function RiskDetailPage() {
  const { riskId } = useParams()
  const { risks, setRiskStatus, archiveRisk } = useRiskData()
  const risk = risks.find((x) => x.riskId === riskId)

  return (
    <div>
      <PageHeader
        title={`交付风险详情：${riskId ?? '-'}`}
        description={risk ? `${typeLabel[risk.type]} · ${risk.factoryName} · 更新时间：${risk.updatedAt}` : '风险详情'}
        right={
          risk ? (
            <div className="flex items-center gap-2">
              <Button variant="secondary" onClick={() => setRiskStatus(risk.riskId, 'open', '手动标记')}>
                标记打开
              </Button>
              <Button variant="secondary" onClick={() => setRiskStatus(risk.riskId, 'watching', '手动标记')}>
                标记关注
              </Button>
              <Button variant="secondary" onClick={() => archiveRisk(risk.riskId, '手动归档')} disabled={risk.status === 'archived'}>
                归档
              </Button>
              <Badge tone={severityTone(risk.severity)}>{risk.severity}</Badge>
            </div>
          ) : null
        }
      />

      {!risk ? (
        <Card>
          <CardBody>
            <div className="text-sm text-[var(--color-text-tertiary)]">未找到该风险。</div>
            <div className="mt-3">
              <Link className="text-sm text-[var(--color-primary)] hover:underline" to="/production/risks">
                返回风险池
              </Link>
            </div>
          </CardBody>
        </Card>
      ) : (
        <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
          <Card className="lg:col-span-2">
            <CardHeader>
              <CardTitle>{risk.title}</CardTitle>
            </CardHeader>
            <CardBody>
              <div className="grid grid-cols-1 gap-3 text-sm md:grid-cols-2">
                <div>
                  <div className="text-xs text-[var(--color-text-tertiary)]">类型</div>
                  <div className="mt-1 text-[var(--color-text-primary)]">{typeLabel[risk.type]}</div>
                </div>
                <div>
                  <div className="text-xs text-[var(--color-text-tertiary)]">状态</div>
                  <div className="mt-1 text-[var(--color-text-primary)]">{statusLabel[risk.status]}</div>
                </div>
                <div>
                  <div className="text-xs text-[var(--color-text-tertiary)]">工厂</div>
                  <div className="mt-1 text-[var(--color-text-primary)]">{risk.factoryName}</div>
                </div>
                <div>
                  <div className="text-xs text-[var(--color-text-tertiary)]">产线/工序</div>
                  <div className="mt-1 text-[var(--color-text-primary)]">{risk.line ?? '-'}</div>
                </div>
                <div>
                  <div className="text-xs text-[var(--color-text-tertiary)]">交期</div>
                  <div className="mt-1 text-[var(--color-text-primary)]">{risk.dueAt ?? '-'}</div>
                </div>
                <div>
                  <div className="text-xs text-[var(--color-text-tertiary)]">ETA</div>
                  <div className="mt-1 text-[var(--color-text-primary)]">
                    {risk.etaAt ?? '-'}
                    {risk.delayMinutes != null ? `（+${risk.delayMinutes}m）` : ''}
                  </div>
                </div>
                <div className="md:col-span-2">
                  <div className="text-xs text-[var(--color-text-tertiary)]">摘要</div>
                  <div className="mt-1 text-[var(--color-text-primary)]">{risk.summary}</div>
                </div>
              </div>

              <div className="mt-4">
                <div className="text-xs font-semibold text-[var(--color-text-tertiary)]">证据/规则解释</div>
                <div className="mt-2 space-y-2 text-sm">
                  {risk.evidence.map((e) => (
                    <div
                      key={e.key}
                      className="rounded-[10px] border border-[var(--color-border-subtle)] bg-[var(--color-bg-surface)] p-3 text-[var(--color-text-secondary)]"
                    >
                      <div className="text-xs text-[var(--color-text-tertiary)]">{e.label}</div>
                      <div className="mt-1 text-[var(--color-text-primary)]">{e.value}</div>
                    </div>
                  ))}
                </div>
              </div>
            </CardBody>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>关联对象</CardTitle>
            </CardHeader>
            <CardBody>
              <div className="space-y-3 text-sm">
                <div>
                  <div className="text-xs text-[var(--color-text-tertiary)]">订单号</div>
                  <div className="mt-1 text-[var(--color-text-primary)]">{(risk.orderIds ?? []).join(', ') || '-'}</div>
                </div>
                <div>
                  <div className="text-xs text-[var(--color-text-tertiary)]">工单</div>
                  <div className="mt-1 space-y-1">
                    {(risk.workOrderIds ?? []).length ? (
                      risk.workOrderIds?.map((id) => (
                        <div key={id}>
                          <Link
                            className="text-[var(--color-primary)] hover:underline"
                            to={`/production/workorders/${encodeURIComponent(id)}`}
                          >
                            {id}
                          </Link>
                        </div>
                      ))
                    ) : (
                      <div className="text-[var(--color-text-primary)]">-</div>
                    )}
                  </div>
                </div>
                <div>
                  <div className="text-xs text-[var(--color-text-tertiary)]">建议入口</div>
                  <div className="mt-1 space-y-1">
                    <Link className="text-[var(--color-primary)] hover:underline" to="/production/delivery/overview">
                      交付风险总览
                    </Link>
                    <div>
                      <Link className="text-[var(--color-primary)] hover:underline" to="/production/risks">
                        返回风险池
                      </Link>
                    </div>
                  </div>
                </div>
              </div>
            </CardBody>
          </Card>

          <Card className="lg:col-span-3">
            <CardHeader>
              <CardTitle>时间线</CardTitle>
            </CardHeader>
            <CardBody>
              <div className="space-y-2 text-sm">
                {risk.timeline
                  .slice()
                  .reverse()
                  .map((t, idx) => (
                    <div
                      key={`${t.at}-${idx}`}
                      className="flex flex-wrap items-center justify-between gap-3 rounded-[10px] border border-[var(--color-border-subtle)] bg-[var(--color-bg-surface)] p-3"
                    >
                      <div className="text-[var(--color-text-primary)]">{t.action}</div>
                      <div className="text-xs text-[var(--color-text-tertiary)]">
                        {t.at}
                        {t.note ? ` · ${t.note}` : ''}
                      </div>
                    </div>
                  ))}
              </div>
            </CardBody>
          </Card>
        </div>
      )}
    </div>
  )
}

