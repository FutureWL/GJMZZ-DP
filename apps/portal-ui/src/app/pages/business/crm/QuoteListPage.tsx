import { Link } from 'react-router-dom'
import { opportunities, quotes } from '../../../mock/data'
import { useCrmData } from '../../../state/crm/CrmDataContext'
import { Badge, type Tone } from '../../../ui/Badge'
import { Card, CardBody, CardHeader, CardTitle } from '../../../ui/Card'
import { PageHeader } from '../../../ui/PageHeader'

function quoteStatusTone(status: string): Tone {
  if (status === 'sent') return 'info'
  if (status === 'accepted') return 'success'
  if (status === 'rejected') return 'error'
  if (status === 'expired') return 'warning'
  return 'neutral'
}

export function QuoteListPage() {
  const { customers } = useCrmData()
  const customerName = (id: string) => customers.find((c) => c.id === id)?.name ?? id
  const oppName = (id: string | null) => {
    if (!id) return '-'
    return opportunities.find((o) => o.id === id)?.name ?? id
  }

  return (
    <div>
      <PageHeader title="报价" description="CRM：报价单（界面示例）" />
      <Card>
        <CardHeader>
          <CardTitle>报价列表</CardTitle>
        </CardHeader>
        <CardBody>
          <div className="overflow-auto">
            <table className="w-full table-auto border-separate border-spacing-0 text-left text-sm">
              <thead>
                <tr className="text-xs text-[var(--color-text-tertiary)]">
                  <th className="border-b border-[var(--color-border-subtle)] px-3 py-2 font-semibold">报价单</th>
                  <th className="border-b border-[var(--color-border-subtle)] px-3 py-2 font-semibold">客户</th>
                  <th className="border-b border-[var(--color-border-subtle)] px-3 py-2 font-semibold">机会</th>
                  <th className="border-b border-[var(--color-border-subtle)] px-3 py-2 font-semibold">状态</th>
                  <th className="border-b border-[var(--color-border-subtle)] px-3 py-2 font-semibold">金额</th>
                  <th className="border-b border-[var(--color-border-subtle)] px-3 py-2 font-semibold">创建时间</th>
                  <th className="border-b border-[var(--color-border-subtle)] px-3 py-2 font-semibold">有效期</th>
                </tr>
              </thead>
              <tbody>
                {quotes.map((q) => (
                  <tr key={q.id} className="hover:bg-black/5 dark:hover:bg-white/5">
                    <td className="border-b border-[var(--color-border-subtle)] px-3 py-2">
                      <Link
                        to={`/business/crm/quotes/${encodeURIComponent(q.id)}`}
                        className="font-medium text-[var(--color-primary)] hover:underline"
                      >
                        {q.title}
                      </Link>
                      <div className="mt-1 text-xs text-[var(--color-text-tertiary)]">{q.id}</div>
                    </td>
                    <td className="border-b border-[var(--color-border-subtle)] px-3 py-2">
                      <Link
                        to={`/business/crm/customers/${encodeURIComponent(q.customerId)}`}
                        className="text-[var(--color-primary)] hover:underline"
                      >
                        {customerName(q.customerId)}
                      </Link>
                    </td>
                    <td className="border-b border-[var(--color-border-subtle)] px-3 py-2">
                      {q.opportunityId ? (
                        <Link
                          to={`/business/crm/opportunities/${encodeURIComponent(q.opportunityId)}`}
                          className="text-[var(--color-primary)] hover:underline"
                        >
                          {oppName(q.opportunityId)}
                        </Link>
                      ) : (
                        '-'
                      )}
                    </td>
                    <td className="border-b border-[var(--color-border-subtle)] px-3 py-2">
                      <Badge tone={quoteStatusTone(q.status)}>{q.status}</Badge>
                    </td>
                    <td className="border-b border-[var(--color-border-subtle)] px-3 py-2">
                      {q.currency} {q.totalAmount.toLocaleString()}
                    </td>
                    <td className="border-b border-[var(--color-border-subtle)] px-3 py-2">{q.createdAt}</td>
                    <td className="border-b border-[var(--color-border-subtle)] px-3 py-2">{q.validUntil}</td>
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
