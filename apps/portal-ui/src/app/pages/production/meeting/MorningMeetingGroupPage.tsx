import { Link } from 'react-router-dom'
import { factories, morningMeetingGroupKpis, morningMeetingFactoryKpis, morningMeetingRisks } from '../../../mock/data'
import type { MorningMeetingKpi, MorningRisk } from '../../../mock/models'
import { Badge, type Tone } from '../../../ui/Badge'
import { Button } from '../../../ui/Button'
import { Card, CardBody, CardHeader, CardTitle } from '../../../ui/Card'
import { PageHeader } from '../../../ui/PageHeader'

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

function kpiValue(kpis: MorningMeetingKpi[], key: string) {
  return kpis.find((x) => x.key === key)?.value ?? '-'
}

export function MorningMeetingGroupPage() {
  const updatedAt = morningMeetingGroupKpis[0]?.updatedAt ?? '-'

  return (
    <div>
      <PageHeader
        title="晨会总览（集团）"
        description={`数据更新时间：${updatedAt}（示例数据，后续替换中台接口）`}
        right={
          <div className="flex items-center gap-2">
            <Link to="/production/delivery/overview">
              <Button variant="secondary">交付风险</Button>
            </Link>
            <Link to="/production/incidents">
              <Button variant="secondary">异常中心</Button>
            </Link>
            <Badge tone="domain-production">生产</Badge>
          </div>
        }
      />

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-6">
        {morningMeetingGroupKpis.map((kpi) => (
          <Card key={kpi.key} className="lg:col-span-2">
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
            <CardTitle>工厂对比</CardTitle>
          </CardHeader>
          <CardBody>
            <div className="overflow-auto">
              <table className="w-full table-auto border-separate border-spacing-0 text-left text-sm">
                <thead>
                  <tr className="text-xs text-[var(--color-text-tertiary)]">
                    <th className="border-b border-[var(--color-border-subtle)] px-3 py-2 font-semibold">工厂</th>
                    <th className="border-b border-[var(--color-border-subtle)] px-3 py-2 font-semibold">OTD</th>
                    <th className="border-b border-[var(--color-border-subtle)] px-3 py-2 font-semibold">计划达成</th>
                    <th className="border-b border-[var(--color-border-subtle)] px-3 py-2 font-semibold">OEE</th>
                    <th className="border-b border-[var(--color-border-subtle)] px-3 py-2 font-semibold">一次通过</th>
                  </tr>
                </thead>
                <tbody>
                  {factories.map((f) => {
                    const kpis = morningMeetingFactoryKpis[f.id] ?? []
                    return (
                      <tr key={f.id} className="hover:bg-black/5 dark:hover:bg-white/5">
                        <td className="border-b border-[var(--color-border-subtle)] px-3 py-2">
                          <Link
                            className="font-medium text-[var(--color-primary)] hover:underline"
                            to={`/production/meeting/factories/${encodeURIComponent(f.id)}`}
                          >
                            {f.name}
                          </Link>
                        </td>
                        <td className="border-b border-[var(--color-border-subtle)] px-3 py-2">{kpiValue(kpis, 'otd')}</td>
                        <td className="border-b border-[var(--color-border-subtle)] px-3 py-2">{kpiValue(kpis, 'plan')}</td>
                        <td className="border-b border-[var(--color-border-subtle)] px-3 py-2">{kpiValue(kpis, 'oee')}</td>
                        <td className="border-b border-[var(--color-border-subtle)] px-3 py-2">{kpiValue(kpis, 'fpyt')}</td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            </div>
          </CardBody>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>风险清单（系统推荐）</CardTitle>
          </CardHeader>
          <CardBody>
            <div className="space-y-2">
              {morningMeetingRisks.map((r) => (
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
                      {r.factoryName}
                      {r.line ? ` · ${r.line}` : ''} · 更新时间：{r.updatedAt}
                    </div>
                    <div className="mt-2 line-clamp-2 text-sm text-[var(--color-text-secondary)]">{r.summary}</div>
                  </div>
                </div>
              ))}
            </div>
          </CardBody>
        </Card>
      </div>
    </div>
  )
}
