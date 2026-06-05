import { Link, useParams } from 'react-router-dom'
import { morningMeetingRisks } from '../../../mock/data'
import type { MorningRisk } from '../../../mock/models'
import { Badge, type Tone } from '../../../ui/Badge'
import { Card, CardBody, CardHeader, CardTitle } from '../../../ui/Card'
import { PageHeader } from '../../../ui/PageHeader'

function riskTone(severity: MorningRisk['severity']): Tone {
  if (severity === 'critical') return 'error'
  if (severity === 'high') return 'warning'
  if (severity === 'medium') return 'info'
  return 'neutral'
}

const typeLabel: Record<MorningRisk['type'], string> = {
  delivery: '交付',
  material_shortage: '欠料',
  quality: '质量',
  equipment: '设备',
  plan: '计划偏差',
  other: '其他',
}

export function MorningMeetingRiskDetailPage() {
  const { id } = useParams()
  const risk = morningMeetingRisks.find((x) => x.id === id)

  return (
    <div>
      <PageHeader
        title={`风险详情：${id ?? '-'}`}
        description="系统推荐风险（示例数据）"
        right={risk ? <Badge tone={riskTone(risk.severity)}>{risk.severity}</Badge> : null}
      />

      {!risk ? (
        <Card>
          <CardBody>
            <div className="text-sm text-[var(--color-text-tertiary)]">未找到该风险。</div>
            <div className="mt-3">
              <Link className="text-sm text-[var(--color-primary)] hover:underline" to="/production/meeting">
                返回晨会总览
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
                  <div className="text-xs text-[var(--color-text-tertiary)]">工厂</div>
                  <div className="mt-1 text-[var(--color-text-primary)]">{risk.factoryName}</div>
                </div>
                <div>
                  <div className="text-xs text-[var(--color-text-tertiary)]">产线</div>
                  <div className="mt-1 text-[var(--color-text-primary)]">{risk.line ?? '-'}</div>
                </div>
                <div>
                  <div className="text-xs text-[var(--color-text-tertiary)]">更新时间</div>
                  <div className="mt-1 text-[var(--color-text-primary)]">{risk.updatedAt}</div>
                </div>
                <div className="md:col-span-2">
                  <div className="text-xs text-[var(--color-text-tertiary)]">摘要</div>
                  <div className="mt-1 text-[var(--color-text-primary)]">{risk.summary}</div>
                </div>
              </div>

              <div className="mt-4">
                <div className="text-xs font-semibold text-[var(--color-text-tertiary)]">证据/原因</div>
                <div className="mt-2 space-y-2 text-sm">
                  {risk.evidence.map((e) => (
                    <div
                      key={e}
                      className="rounded-[10px] border border-[var(--color-border-subtle)] bg-[var(--color-bg-surface)] p-3 text-[var(--color-text-secondary)]"
                    >
                      {e}
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
                  <div className="text-xs text-[var(--color-text-tertiary)]">工单</div>
                  <div className="mt-1">
                    {risk.workOrderId ? (
                      <Link
                        className="text-[var(--color-primary)] hover:underline"
                        to={`/production/workorders/${encodeURIComponent(risk.workOrderId)}`}
                      >
                        {risk.workOrderId}
                      </Link>
                    ) : (
                      <span className="text-[var(--color-text-primary)]">-</span>
                    )}
                  </div>
                </div>
                <div>
                  <div className="text-xs text-[var(--color-text-tertiary)]">订单号</div>
                  <div className="mt-1 text-[var(--color-text-primary)]">{risk.orderId ?? '-'}</div>
                </div>
                <div>
                  <div className="text-xs text-[var(--color-text-tertiary)]">返回</div>
                  <div className="mt-1">
                    <Link
                      className="text-[var(--color-primary)] hover:underline"
                      to={`/production/meeting/factories/${encodeURIComponent(risk.factoryId)}`}
                    >
                      返回工厂驾驶舱
                    </Link>
                  </div>
                  <div className="mt-1">
                    <Link className="text-[var(--color-primary)] hover:underline" to="/production/meeting">
                      返回集团总览
                    </Link>
                  </div>
                </div>
              </div>
            </CardBody>
          </Card>
        </div>
      )}
    </div>
  )
}

