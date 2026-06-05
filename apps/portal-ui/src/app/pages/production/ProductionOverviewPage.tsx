import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { alarms, workOrders } from '../../mock/data'
import { useAuth } from '../../state/auth/useAuth'
import { Badge } from '../../ui/Badge'
import { Card, CardBody, CardHeader, CardTitle } from '../../ui/Card'
import { PageHeader } from '../../ui/PageHeader'

export function ProductionOverviewPage() {
  const auth = useAuth()
  const [factoryCount, setFactoryCount] = useState<number | null>(null)
  const [factoryError, setFactoryError] = useState<string | null>(null)

  useEffect(() => {
    if (!auth.token) return
    fetch('/api/factories', {
      headers: {
        Authorization: `Bearer ${auth.token}`,
      },
    })
      .then(async (res) => {
        if (!res.ok) {
          throw new Error(`HTTP ${res.status}`)
        }
        return (await res.json()) as unknown
      })
      .then((data) => {
        if (!Array.isArray(data)) {
          throw new Error('Invalid response')
        }
        setFactoryCount(data.length)
        setFactoryError(null)
      })
      .catch((e) => {
        setFactoryCount(null)
        setFactoryError(e instanceof Error ? e.message : 'Request failed')
      })
  }, [auth.token])

  return (
    <div>
      <PageHeader title="工厂总览" description="生产域：摘要 + 异常优先（示例数据）" />

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-5">
        <Card>
          <CardHeader>
            <CardTitle>工厂（API）</CardTitle>
          </CardHeader>
          <CardBody>
            <div className="text-3xl font-semibold text-[var(--color-text-primary)]">
              {factoryCount ?? '--'}
            </div>
            <div className="mt-2 text-sm text-[var(--color-text-tertiary)]">
              {factoryError ? `请求失败：${factoryError}` : '来自 factory-api /factories'}
            </div>
          </CardBody>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>产量（今日）</CardTitle>
          </CardHeader>
          <CardBody>
            <div className="text-3xl font-semibold text-[var(--color-text-primary)]">12,480</div>
            <div className="mt-2 text-sm text-[var(--color-text-tertiary)]">达成率 93%（占位）</div>
          </CardBody>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>良率</CardTitle>
          </CardHeader>
          <CardBody>
            <div className="text-3xl font-semibold text-[var(--color-text-primary)]">98.6%</div>
            <div className="mt-2 text-sm text-[var(--color-text-tertiary)]">PPM 320（占位）</div>
          </CardBody>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>OEE</CardTitle>
          </CardHeader>
          <CardBody>
            <div className="text-3xl font-semibold text-[var(--color-text-primary)]">81.2%</div>
            <div className="mt-2 text-sm text-[var(--color-text-tertiary)]">A/P/Q 分解占位</div>
          </CardBody>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>严重告警</CardTitle>
          </CardHeader>
          <CardBody>
            <div className="flex items-end justify-between gap-3">
              <div className="text-3xl font-semibold text-[var(--color-text-primary)]">1</div>
              <Link className="text-sm text-[var(--color-primary)] hover:underline" to="/production/alarms">
                进入告警中心
              </Link>
            </div>
            <div className="mt-2 text-sm text-[var(--color-text-tertiary)]">未关闭告警 2（占位）</div>
          </CardBody>
        </Card>
      </div>

      <div className="mt-4 grid grid-cols-1 gap-4 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>最新告警</CardTitle>
          </CardHeader>
          <CardBody>
            <div className="space-y-2">
              {alarms.slice(0, 3).map((a) => (
                <div
                  key={a.id}
                  className="flex items-center justify-between gap-3 rounded-[10px] border border-[var(--color-border-subtle)] bg-[var(--color-bg-surface)] p-3"
                >
                  <div className="min-w-0">
                    <div className="truncate text-sm font-medium text-[var(--color-text-primary)]">{a.title}</div>
                    <div className="mt-1 text-xs text-[var(--color-text-tertiary)]">
                      {a.equipment} · {a.line} · {a.startAt}
                    </div>
                  </div>
                  <Badge tone={a.severity === 'critical' ? 'error' : a.severity === 'medium' ? 'warning' : 'neutral'}>
                    {a.severity}
                  </Badge>
                </div>
              ))}
            </div>
          </CardBody>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>在制工单</CardTitle>
          </CardHeader>
          <CardBody>
            <div className="space-y-2">
              {workOrders.slice(0, 3).map((w) => (
                <div
                  key={w.id}
                  className="flex items-center justify-between gap-3 rounded-[10px] border border-[var(--color-border-subtle)] bg-[var(--color-bg-surface)] p-3"
                >
                  <div className="min-w-0">
                    <div className="truncate text-sm font-medium text-[var(--color-text-primary)]">{w.id}</div>
                    <div className="mt-1 text-xs text-[var(--color-text-tertiary)]">
                      {w.product} · {w.line} · {w.progress}%
                    </div>
                  </div>
                  <Link
                    className="text-sm text-[var(--color-primary)] hover:underline"
                    to={`/production/workorders/${encodeURIComponent(w.id)}`}
                  >
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
