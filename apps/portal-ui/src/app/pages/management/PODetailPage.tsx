import { useParams } from 'react-router-dom'
import { Badge } from '../../ui/Badge'
import { Card, CardBody, CardHeader, CardTitle } from '../../ui/Card'
import { PageHeader } from '../../ui/PageHeader'

export function PODetailPage() {
  const { id } = useParams()

  return (
    <div>
      <PageHeader title={`PO 详情：${id ?? '-'}`} description="交付/收货节点位（界面示例）" />

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle>订单信息</CardTitle>
          </CardHeader>
          <CardBody>
            <div className="grid grid-cols-1 gap-3 text-sm md:grid-cols-2">
              <div>
                <div className="text-xs text-[var(--color-text-tertiary)]">供应商</div>
                <div className="mt-1 text-[var(--color-text-primary)]">华东刀具有限公司</div>
              </div>
              <div>
                <div className="text-xs text-[var(--color-text-tertiary)]">金额</div>
                <div className="mt-1 text-[var(--color-text-primary)]">¥120,000</div>
              </div>
              <div>
                <div className="text-xs text-[var(--color-text-tertiary)]">预计交期</div>
                <div className="mt-1 text-[var(--color-text-primary)]">2026-06-12</div>
              </div>
              <div>
                <div className="text-xs text-[var(--color-text-tertiary)]">状态</div>
                <div className="mt-1">
                  <Badge tone="info">执行中</Badge>
                </div>
              </div>
            </div>
          </CardBody>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>节点</CardTitle>
          </CardHeader>
          <CardBody>
            <div className="space-y-3 text-sm">
              <div className="flex items-center justify-between gap-3 rounded-[10px] border border-[var(--color-border-subtle)] bg-[var(--color-bg-surface)] p-3">
                <div className="text-[var(--color-text-primary)]">下单</div>
                <Badge tone="success">已完成</Badge>
              </div>
              <div className="flex items-center justify-between gap-3 rounded-[10px] border border-[var(--color-border-subtle)] bg-[var(--color-bg-surface)] p-3">
                <div className="text-[var(--color-text-primary)]">发货</div>
                <Badge tone="info">进行中</Badge>
              </div>
              <div className="flex items-center justify-between gap-3 rounded-[10px] border border-[var(--color-border-subtle)] bg-[var(--color-bg-surface)] p-3">
                <div className="text-[var(--color-text-primary)]">收货</div>
                <Badge tone="neutral">未开始</Badge>
              </div>
            </div>
          </CardBody>
        </Card>
      </div>
    </div>
  )
}

