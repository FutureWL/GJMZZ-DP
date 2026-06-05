import { Link, Navigate, useNavigate, useParams } from 'react-router-dom'
import { factories, morningMeetingFactoryKpis, morningMeetingRisks } from '../../../mock/data'
import type { MorningMeetingKpi, MorningRisk } from '../../../mock/models'
import { Badge, type Tone } from '../../../ui/Badge'
import { Button } from '../../../ui/Button'
import { Card, CardBody, CardHeader, CardTitle } from '../../../ui/Card'
import { PageHeader } from '../../../ui/PageHeader'
import { Select } from '../../../ui/Select'

function kpiTone(status: MorningMeetingKpi['status']): Tone {
  if (status === 'good') return 'success'
  if (status === 'warn') return 'warning'
  return 'error'
}

function riskTone(severity: MorningRisk['severity']): Tone {
  if (severity === 'critical') return 'error'
  if (severity === 'high') return 'warning'
  if (severity === 'medium') return 'info'
  return 'neutral'
}

export function MorningMeetingFactoryPage() {
  const { factoryId } = useParams()
  const navigate = useNavigate()

  const factory = factories.find((x) => x.id === factoryId)
  if (!factoryId || !factory) {
    return <Navigate to="/production/meeting" replace />
  }

  const kpis = morningMeetingFactoryKpis[factoryId] ?? []
  const updatedAt = kpis[0]?.updatedAt ?? '-'
  const risks = morningMeetingRisks.filter((r) => r.factoryId === factoryId)

  return (
    <div>
      <PageHeader
        title={`晨会驾驶舱：${factory.name}`}
        description={`数据更新时间：${updatedAt}（示例数据）`}
        right={
          <div className="flex items-center gap-2">
            <div className="w-[140px]">
              <Select
                value={factoryId}
                onChange={(e) => navigate(`/production/meeting/factories/${encodeURIComponent(e.target.value)}`)}
              >
                {factories.map((f) => (
                  <option key={f.id} value={f.id}>
                    {f.name}
                  </option>
                ))}
              </Select>
            </div>
            <Link to="/production/meeting">
              <Button variant="secondary">返回集团</Button>
            </Link>
          </div>
        }
      />

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-4">
        {kpis.map((kpi) => (
          <Card key={kpi.key}>
            <CardHeader>
              <CardTitle className="flex items-center justify-between gap-3">
                <span>{kpi.label}</span>
                <Badge tone={kpiTone(kpi.status)}>{kpi.status === 'good' ? '正常' : kpi.status === 'warn' ? '关注' : '风险'}</Badge>
              </CardTitle>
            </CardHeader>
            <CardBody>
              <div className="text-3xl font-semibold text-[var(--color-text-primary)]">{kpi.value}</div>
              <div className="mt-2 text-sm text-[var(--color-text-tertiary)]">{kpi.helper ?? '-'}</div>
              <div className="mt-2 text-xs text-[var(--color-text-tertiary)]">
                来源：{kpi.source} · 更新时间：{kpi.updatedAt}
              </div>
            </CardBody>
          </Card>
        ))}
      </div>

      <div className="mt-4 grid grid-cols-1 gap-4 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>风险清单（本工厂）</CardTitle>
          </CardHeader>
          <CardBody>
            <div className="space-y-2">
              {risks.length ? (
                risks.map((r) => (
                  <div
                    key={r.id}
                    className="flex items-start justify-between gap-3 rounded-[10px] border border-[var(--color-border-subtle)] bg-[var(--color-bg-surface)] p-3"
                  >
                    <div className="min-w-0">
                      <div className="flex flex-wrap items-center gap-2">
                        <Link
                          className="truncate text-sm font-medium text-[var(--color-primary)] hover:underline"
                          to={`/production/risks/${encodeURIComponent(r.id)}`}
                        >
                          {r.title}
                        </Link>
                        <Badge tone={riskTone(r.severity)}>{r.severity}</Badge>
                      </div>
                      <div className="mt-1 text-xs text-[var(--color-text-tertiary)]">
                        {r.line ? `${r.line} · ` : ''}更新时间：{r.updatedAt}
                      </div>
                      <div className="mt-2 text-sm text-[var(--color-text-secondary)]">{r.summary}</div>
                    </div>
                  </div>
                ))
              ) : (
                <div className="text-sm text-[var(--color-text-tertiary)]">暂无风险（示例）</div>
              )}
            </div>
          </CardBody>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>常用入口</CardTitle>
          </CardHeader>
          <CardBody>
            <div className="flex flex-col gap-2 text-sm">
              <Link className="text-[var(--color-primary)] hover:underline" to="/production/workorders">
                工单列表
              </Link>
              <Link className="text-[var(--color-primary)] hover:underline" to="/production/alarms">
                告警中心
              </Link>
              <Link className="text-[var(--color-primary)] hover:underline" to="/production/incidents">
                异常中心
              </Link>
            </div>
          </CardBody>
        </Card>
      </div>
    </div>
  )
}
