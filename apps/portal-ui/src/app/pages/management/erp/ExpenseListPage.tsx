import { Link } from 'react-router-dom'
import { expenses } from '../../../mock/data'
import { Badge, type Tone } from '../../../ui/Badge'
import { Card, CardBody, CardHeader, CardTitle } from '../../../ui/Card'
import { PageHeader } from '../../../ui/PageHeader'

function flowTone(status: string): Tone {
  if (status === 'draft') return 'neutral'
  if (status === 'in_review') return 'info'
  if (status === 'approved') return 'success'
  if (status === 'rejected') return 'error'
  return 'neutral'
}

export function ExpenseListPage() {
  return (
    <div>
      <PageHeader title="费用报销" description="ERP：费用/报销台账（界面示例）" />
      <Card>
        <CardHeader>
          <CardTitle>台账</CardTitle>
        </CardHeader>
        <CardBody>
          <div className="overflow-auto">
            <table className="w-full table-auto border-separate border-spacing-0 text-left text-sm">
              <thead>
                <tr className="text-xs text-[var(--color-text-tertiary)]">
                  <th className="border-b border-[var(--color-border-subtle)] px-3 py-2 font-semibold">单据</th>
                  <th className="border-b border-[var(--color-border-subtle)] px-3 py-2 font-semibold">申请人</th>
                  <th className="border-b border-[var(--color-border-subtle)] px-3 py-2 font-semibold">金额</th>
                  <th className="border-b border-[var(--color-border-subtle)] px-3 py-2 font-semibold">状态</th>
                  <th className="border-b border-[var(--color-border-subtle)] px-3 py-2 font-semibold">创建时间</th>
                </tr>
              </thead>
              <tbody>
                {expenses.map((e) => (
                  <tr key={e.id} className="hover:bg-black/5 dark:hover:bg-white/5">
                    <td className="border-b border-[var(--color-border-subtle)] px-3 py-2">
                      <Link
                        className="font-medium text-[var(--color-primary)] hover:underline"
                        to={`/management/erp/expenses/${encodeURIComponent(e.id)}`}
                      >
                        {e.title}
                      </Link>
                      <div className="mt-1 text-xs text-[var(--color-text-tertiary)]">{e.id}</div>
                    </td>
                    <td className="border-b border-[var(--color-border-subtle)] px-3 py-2">{e.applicant}</td>
                    <td className="border-b border-[var(--color-border-subtle)] px-3 py-2">¥{e.amount.toLocaleString()}</td>
                    <td className="border-b border-[var(--color-border-subtle)] px-3 py-2">
                      <Badge tone={flowTone(e.status)}>{e.status}</Badge>
                    </td>
                    <td className="border-b border-[var(--color-border-subtle)] px-3 py-2">{e.createdAt}</td>
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

