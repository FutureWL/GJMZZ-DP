import { Link } from 'react-router-dom'
import { purchaseRequests } from '../../mock/data'
import { Badge, type Tone } from '../../ui/Badge'
import { Card, CardBody, CardHeader, CardTitle } from '../../ui/Card'
import { PageHeader } from '../../ui/PageHeader'

function flowTone(status: string): Tone {
  if (status === 'draft') return 'neutral'
  if (status === 'in_review') return 'info'
  if (status === 'approved') return 'success'
  if (status === 'rejected') return 'error'
  return 'neutral'
}

function flowLabel(status: string) {
  if (status === 'draft') return '草稿'
  if (status === 'in_review') return '审批中'
  if (status === 'approved') return '已通过'
  if (status === 'rejected') return '已驳回'
  return status
}

export function ProcurementPRListPage() {
  return (
    <div>
      <PageHeader title="采购申请（PR）" description="P0流程：PR → 审批 → RFQ/比价 → 定标 → PO（界面示例）" />

      <Card>
        <CardHeader>
          <CardTitle>PR 列表</CardTitle>
        </CardHeader>
        <CardBody>
          <div className="overflow-auto">
            <table className="w-full table-auto border-separate border-spacing-0 text-left text-sm">
              <thead>
                <tr className="text-xs text-[var(--color-text-tertiary)]">
                  <th className="border-b border-[var(--color-border-subtle)] px-3 py-2 font-semibold">PR编号</th>
                  <th className="border-b border-[var(--color-border-subtle)] px-3 py-2 font-semibold">标题</th>
                  <th className="border-b border-[var(--color-border-subtle)] px-3 py-2 font-semibold">申请人</th>
                  <th className="border-b border-[var(--color-border-subtle)] px-3 py-2 font-semibold">金额</th>
                  <th className="border-b border-[var(--color-border-subtle)] px-3 py-2 font-semibold">状态</th>
                  <th className="border-b border-[var(--color-border-subtle)] px-3 py-2 font-semibold">创建时间</th>
                </tr>
              </thead>
              <tbody>
                {purchaseRequests.map((pr) => (
                  <tr key={pr.id} className="hover:bg-black/5 dark:hover:bg-white/5">
                    <td className="border-b border-[var(--color-border-subtle)] px-3 py-2">
                      <Link
                        className="font-medium text-[var(--color-primary)] hover:underline"
                        to={`/management/procurement/pr/${encodeURIComponent(pr.id)}`}
                      >
                        {pr.id}
                      </Link>
                    </td>
                    <td className="border-b border-[var(--color-border-subtle)] px-3 py-2 text-[var(--color-text-primary)]">
                      {pr.title}
                    </td>
                    <td className="border-b border-[var(--color-border-subtle)] px-3 py-2">{pr.requester}</td>
                    <td className="border-b border-[var(--color-border-subtle)] px-3 py-2">
                      ¥{pr.amount.toLocaleString()}
                    </td>
                    <td className="border-b border-[var(--color-border-subtle)] px-3 py-2">
                      <Badge tone={flowTone(pr.status)}>{flowLabel(pr.status)}</Badge>
                    </td>
                    <td className="border-b border-[var(--color-border-subtle)] px-3 py-2">{pr.createdAt}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardBody>
      </Card>
    </div>
  )
}
