import { Link, useParams } from 'react-router-dom'
import { suppliers } from '../../mock/data'
import { Badge, type Tone } from '../../ui/Badge'
import { Button } from '../../ui/Button'
import { Card, CardBody, CardHeader, CardTitle } from '../../ui/Card'
import { PageHeader } from '../../ui/PageHeader'

function riskTone(risk: string): Tone {
  if (risk === 'low') return 'success'
  if (risk === 'medium') return 'warning'
  if (risk === 'high') return 'error'
  if (risk === 'critical') return 'error'
  return 'neutral'
}

function complianceTone(compliance: string): Tone {
  if (compliance === 'ok') return 'success'
  if (compliance === 'expiring') return 'warning'
  if (compliance === 'blacklist') return 'error'
  return 'neutral'
}

export function SupplierDetailPage() {
  const { id } = useParams()
  const s = suppliers.find((x) => x.id === id)

  return (
    <div>
      <PageHeader
        title={s ? `供应商详情：${s.name}` : '供应商详情'}
        description="证照/风险/绩效摘要（界面示例）"
        right={
          <div className="flex items-center gap-2">
            <Link to="/management/approval">
              <Button variant="secondary">去审批中心</Button>
            </Link>
            <Button variant="primary">发起准入审批（占位）</Button>
          </div>
        }
      />

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle>概览</CardTitle>
          </CardHeader>
          <CardBody>
            <div className="grid grid-cols-1 gap-3 text-sm md:grid-cols-2">
              <div>
                <div className="text-xs text-[var(--color-text-tertiary)]">供应商ID</div>
                <div className="mt-1 text-[var(--color-text-primary)]">{s?.id ?? '-'}</div>
              </div>
              <div>
                <div className="text-xs text-[var(--color-text-tertiary)]">风险等级</div>
                <div className="mt-1">{s ? <Badge tone={riskTone(s.risk)}>{s.risk}</Badge> : '-'}</div>
              </div>
              <div>
                <div className="text-xs text-[var(--color-text-tertiary)]">合规状态</div>
                <div className="mt-1">
                  {s ? <Badge tone={complianceTone(s.compliance)}>{s.compliance}</Badge> : '-'}
                </div>
              </div>
              <div>
                <div className="text-xs text-[var(--color-text-tertiary)]">交付及时率（OTD）</div>
                <div className="mt-1 text-[var(--color-text-primary)]">{s ? `${s.otd}%` : '-'}</div>
              </div>
              <div>
                <div className="text-xs text-[var(--color-text-tertiary)]">来料质量（PPM）</div>
                <div className="mt-1 text-[var(--color-text-primary)]">{s ? s.ppm : '-'}</div>
              </div>
              <div>
                <div className="text-xs text-[var(--color-text-tertiary)]">证照到期</div>
                <div className="mt-1 text-[var(--color-text-primary)]">占位</div>
              </div>
            </div>
          </CardBody>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>风险与合规事件（占位）</CardTitle>
          </CardHeader>
          <CardBody>
            <div className="space-y-2 text-sm text-[var(--color-text-secondary)]">
              <div className="flex items-center justify-between gap-3 rounded-[10px] border border-[var(--color-border-subtle)] bg-[var(--color-bg-surface)] p-3">
                <div>证照到期提醒</div>
                <Badge tone="warning">30天</Badge>
              </div>
              <div className="flex items-center justify-between gap-3 rounded-[10px] border border-[var(--color-border-subtle)] bg-[var(--color-bg-surface)] p-3">
                <div>重大投诉</div>
                <Badge tone="neutral">0</Badge>
              </div>
            </div>
          </CardBody>
        </Card>
      </div>
    </div>
  )
}

