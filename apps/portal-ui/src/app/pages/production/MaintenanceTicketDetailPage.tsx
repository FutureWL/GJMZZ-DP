import { useParams } from 'react-router-dom'
import { Badge } from '../../ui/Badge'
import { Button } from '../../ui/Button'
import { Card, CardBody, CardHeader, CardTitle } from '../../ui/Card'
import { PageHeader } from '../../ui/PageHeader'

export function MaintenanceTicketDetailPage() {
  const { id } = useParams()

  return (
    <div>
      <PageHeader
        title={`维修工单详情：${id ?? '-'}`}
        description="派工/进度/用料/完工记录（仅界面占位）"
        right={
          <div className="flex items-center gap-2">
            <Button variant="secondary">到场（占位）</Button>
            <Button variant="primary">完工（占位）</Button>
          </div>
        }
      />

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle>工单信息</CardTitle>
          </CardHeader>
          <CardBody>
            <div className="grid grid-cols-1 gap-3 text-sm md:grid-cols-2">
              <div>
                <div className="text-xs text-[var(--color-text-tertiary)]">设备</div>
                <div className="mt-1 text-[var(--color-text-primary)]">CNC-12</div>
              </div>
              <div>
                <div className="text-xs text-[var(--color-text-tertiary)]">SLA</div>
                <div className="mt-1">
                  <Badge tone="warning">超时</Badge>
                </div>
              </div>
              <div className="md:col-span-2">
                <div className="text-xs text-[var(--color-text-tertiary)]">现象描述</div>
                <div className="mt-1 text-[var(--color-text-primary)]">主轴异响，伴随振动告警（占位）</div>
              </div>
            </div>
          </CardBody>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>状态推进</CardTitle>
          </CardHeader>
          <CardBody>
            <div className="space-y-2 text-sm text-[var(--color-text-secondary)]">
              <div className="flex items-center justify-between gap-3 rounded-[10px] border border-[var(--color-border-subtle)] bg-[var(--color-bg-surface)] p-3">
                <div>接单</div>
                <Badge tone="success">已完成</Badge>
              </div>
              <div className="flex items-center justify-between gap-3 rounded-[10px] border border-[var(--color-border-subtle)] bg-[var(--color-bg-surface)] p-3">
                <div>到场</div>
                <Badge tone="info">进行中</Badge>
              </div>
              <div className="flex items-center justify-between gap-3 rounded-[10px] border border-[var(--color-border-subtle)] bg-[var(--color-bg-surface)] p-3">
                <div>完工</div>
                <Badge tone="neutral">未开始</Badge>
              </div>
            </div>
          </CardBody>
        </Card>
      </div>
    </div>
  )
}

