import { useParams } from 'react-router-dom'
import { workOrders } from '../../mock/data'
import { Badge } from '../../ui/Badge'
import { Button } from '../../ui/Button'
import { Card, CardBody, CardHeader, CardTitle } from '../../ui/Card'
import { PageHeader } from '../../ui/PageHeader'

export function WorkOrderDetailPage() {
  const { id } = useParams()
  const w = workOrders.find((x) => x.id === id)

  return (
    <div>
      <PageHeader
        title={w ? `工单详情：${w.id}` : '工单详情'}
        description="总览—明细—关联对象—历史（此处仅示例）"
        right={
          <div className="flex items-center gap-2">
            <Button variant="secondary">推进状态（占位）</Button>
            <Button variant="primary">异常报备（占位）</Button>
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
                <div className="text-xs text-[var(--color-text-tertiary)]">产品</div>
                <div className="mt-1 text-[var(--color-text-primary)]">{w?.product ?? '-'}</div>
              </div>
              <div>
                <div className="text-xs text-[var(--color-text-tertiary)]">产线</div>
                <div className="mt-1 text-[var(--color-text-primary)]">{w?.line ?? '-'}</div>
              </div>
              <div>
                <div className="text-xs text-[var(--color-text-tertiary)]">进度</div>
                <div className="mt-1 text-[var(--color-text-primary)]">{w ? `${w.progress}%` : '-'}</div>
              </div>
              <div>
                <div className="text-xs text-[var(--color-text-tertiary)]">状态</div>
                <div className="mt-1">
                  <Badge tone={w?.status === 'running' ? 'success' : w?.status === 'blocked' ? 'warning' : 'neutral'}>
                    {w?.status ?? '-'}
                  </Badge>
                </div>
              </div>
              <div className="md:col-span-2">
                <div className="text-xs text-[var(--color-text-tertiary)]">计划</div>
                <div className="mt-1 text-[var(--color-text-primary)]">
                  {w ? `${w.planStart} ~ ${w.planEnd}` : '-'}
                </div>
              </div>
            </div>
          </CardBody>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>关联对象</CardTitle>
          </CardHeader>
          <CardBody>
            <div className="space-y-2 text-sm text-[var(--color-text-secondary)]">
              <div className="flex items-center justify-between gap-3 rounded-[10px] border border-[var(--color-border-subtle)] bg-[var(--color-bg-surface)] p-3">
                <div>关联设备</div>
                <Badge tone="neutral">3</Badge>
              </div>
              <div className="flex items-center justify-between gap-3 rounded-[10px] border border-[var(--color-border-subtle)] bg-[var(--color-bg-surface)] p-3">
                <div>关联检验</div>
                <Badge tone="neutral">2</Badge>
              </div>
              <div className="flex items-center justify-between gap-3 rounded-[10px] border border-[var(--color-border-subtle)] bg-[var(--color-bg-surface)] p-3">
                <div>关联告警</div>
                <Badge tone="warning">1</Badge>
              </div>
            </div>
          </CardBody>
        </Card>
      </div>
    </div>
  )
}

