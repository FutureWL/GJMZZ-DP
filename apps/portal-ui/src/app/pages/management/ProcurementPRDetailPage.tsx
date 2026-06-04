import { Link, useParams } from 'react-router-dom'
import { purchaseRequests } from '../../mock/data'
import { Badge } from '../../ui/Badge'
import { Button } from '../../ui/Button'
import { Card, CardBody, CardHeader, CardTitle } from '../../ui/Card'
import { PageHeader } from '../../ui/PageHeader'

export function ProcurementPRDetailPage() {
  const { id } = useParams()
  const pr = purchaseRequests.find((x) => x.id === id)

  return (
    <div>
      <PageHeader
        title={pr ? `PR 详情：${pr.id}` : 'PR 详情'}
        description="用于演示采购闭环：PR → 审批 → RFQ/比价 → 定标 → PO"
        right={
          <div className="flex items-center gap-2">
            <Link to="/management/approval">
              <Button variant="secondary">去审批中心</Button>
            </Link>
            <Link to="/management/procurement/rfq/RFQ-20260605-001">
              <Button variant="secondary">查看 RFQ</Button>
            </Link>
            <Link to="/management/procurement/po/PO-20260605-018">
              <Button variant="primary">查看 PO</Button>
            </Link>
          </div>
        }
      />

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle>申请信息</CardTitle>
          </CardHeader>
          <CardBody>
            <div className="grid grid-cols-1 gap-3 text-sm md:grid-cols-2">
              <div>
                <div className="text-xs text-[var(--color-text-tertiary)]">标题</div>
                <div className="mt-1 text-[var(--color-text-primary)]">{pr?.title ?? '-'}</div>
              </div>
              <div>
                <div className="text-xs text-[var(--color-text-tertiary)]">状态</div>
                <div className="mt-1">
                  <Badge tone="info">{pr?.status ?? '-'}</Badge>
                </div>
              </div>
              <div>
                <div className="text-xs text-[var(--color-text-tertiary)]">申请人</div>
                <div className="mt-1 text-[var(--color-text-primary)]">{pr?.requester ?? '-'}</div>
              </div>
              <div>
                <div className="text-xs text-[var(--color-text-tertiary)]">金额</div>
                <div className="mt-1 text-[var(--color-text-primary)]">
                  {pr ? `¥${pr.amount.toLocaleString()}` : '-'}
                </div>
              </div>
              <div>
                <div className="text-xs text-[var(--color-text-tertiary)]">创建时间</div>
                <div className="mt-1 text-[var(--color-text-primary)]">{pr?.createdAt ?? '-'}</div>
              </div>
              <div>
                <div className="text-xs text-[var(--color-text-tertiary)]">备注</div>
                <div className="mt-1 text-[var(--color-text-primary)]">仅界面占位</div>
              </div>
            </div>

            <div className="mt-4 flex items-center gap-2">
              <Button variant="primary">发起审批（占位）</Button>
              <Button variant="secondary">保存草稿（占位）</Button>
            </div>
          </CardBody>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>审批轨迹（占位）</CardTitle>
          </CardHeader>
          <CardBody>
            <div className="space-y-3 text-sm text-[var(--color-text-secondary)]">
              <div className="rounded-[10px] border border-[var(--color-border-subtle)] bg-[var(--color-bg-surface)] p-3">
                <div className="flex items-center justify-between gap-3">
                  <div className="font-medium text-[var(--color-text-primary)]">提交</div>
                  <Badge tone="success">已完成</Badge>
                </div>
                <div className="mt-1 text-xs text-[var(--color-text-tertiary)]">2026-06-05 09:20</div>
              </div>
              <div className="rounded-[10px] border border-[var(--color-border-subtle)] bg-[var(--color-bg-surface)] p-3">
                <div className="flex items-center justify-between gap-3">
                  <div className="font-medium text-[var(--color-text-primary)]">部门负责人审批</div>
                  <Badge tone="info">进行中</Badge>
                </div>
                <div className="mt-1 text-xs text-[var(--color-text-tertiary)]">待处理</div>
              </div>
              <div className="rounded-[10px] border border-[var(--color-border-subtle)] bg-[var(--color-bg-surface)] p-3">
                <div className="flex items-center justify-between gap-3">
                  <div className="font-medium text-[var(--color-text-primary)]">采购审批</div>
                  <Badge tone="neutral">未开始</Badge>
                </div>
                <div className="mt-1 text-xs text-[var(--color-text-tertiary)]">占位</div>
              </div>
            </div>
          </CardBody>
        </Card>
      </div>
    </div>
  )
}

