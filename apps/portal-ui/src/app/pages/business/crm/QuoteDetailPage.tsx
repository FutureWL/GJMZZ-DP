import { Link, useParams } from 'react-router-dom'
import { opportunities, quoteLines, quotes } from '../../../mock/data'
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

export function QuoteDetailPage() {
  const { id } = useParams()
  const { customers } = useCrmData()
  const quote = quotes.find((q) => q.id === id)
  const customer = customers.find((c) => c.id === quote?.customerId)
  const opportunity = opportunities.find((o) => o.id === quote?.opportunityId)
  const lines = quoteLines.filter((l) => l.quoteId === id)

  return (
    <div>
      <PageHeader
        title={quote ? `报价详情：${quote.title}` : '报价详情'}
        description="报价信息 / 明细行（界面示例）"
      />

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle>报价信息</CardTitle>
          </CardHeader>
          <CardBody>
            <div className="grid grid-cols-1 gap-3 text-sm md:grid-cols-2">
              <div>
                <div className="text-xs text-[var(--color-text-tertiary)]">报价ID</div>
                <div className="mt-1 text-[var(--color-text-primary)]">{quote?.id ?? '-'}</div>
              </div>
              <div>
                <div className="text-xs text-[var(--color-text-tertiary)]">状态</div>
                <div className="mt-1">{quote ? <Badge tone={quoteStatusTone(quote.status)}>{quote.status}</Badge> : '-'}</div>
              </div>
              <div>
                <div className="text-xs text-[var(--color-text-tertiary)]">客户</div>
                <div className="mt-1 text-[var(--color-text-primary)]">
                  {customer ? (
                    <Link
                      to={`/business/crm/customers/${encodeURIComponent(customer.id)}`}
                      className="text-[var(--color-primary)] hover:underline"
                    >
                      {customer.name}
                    </Link>
                  ) : (
                    '-'
                  )}
                </div>
              </div>
              <div>
                <div className="text-xs text-[var(--color-text-tertiary)]">关联机会</div>
                <div className="mt-1 text-[var(--color-text-primary)]">
                  {opportunity ? (
                    <Link
                      to={`/business/crm/opportunities/${encodeURIComponent(opportunity.id)}`}
                      className="text-[var(--color-primary)] hover:underline"
                    >
                      {opportunity.name}
                    </Link>
                  ) : (
                    '-'
                  )}
                </div>
              </div>
              <div>
                <div className="text-xs text-[var(--color-text-tertiary)]">币种</div>
                <div className="mt-1 text-[var(--color-text-primary)]">{quote?.currency ?? '-'}</div>
              </div>
              <div>
                <div className="text-xs text-[var(--color-text-tertiary)]">总金额</div>
                <div className="mt-1 text-[var(--color-text-primary)]">
                  {quote ? `${quote.currency} ${quote.totalAmount.toLocaleString()}` : '-'}
                </div>
              </div>
              <div>
                <div className="text-xs text-[var(--color-text-tertiary)]">创建时间</div>
                <div className="mt-1 text-[var(--color-text-primary)]">{quote?.createdAt ?? '-'}</div>
              </div>
              <div>
                <div className="text-xs text-[var(--color-text-tertiary)]">有效期</div>
                <div className="mt-1 text-[var(--color-text-primary)]">{quote?.validUntil ?? '-'}</div>
              </div>
            </div>
          </CardBody>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>快捷入口</CardTitle>
          </CardHeader>
          <CardBody>
            <div className="space-y-2 text-sm">
              <Link
                to="/business/crm/quotes"
                className="block rounded-[10px] border border-[var(--color-border-subtle)] bg-[var(--color-bg-surface)] p-3 text-[var(--color-primary)] hover:underline"
              >
                返回报价列表
              </Link>
              {opportunity ? (
                <Link
                  to={`/business/crm/opportunities/${encodeURIComponent(opportunity.id)}`}
                  className="block rounded-[10px] border border-[var(--color-border-subtle)] bg-[var(--color-bg-surface)] p-3 text-[var(--color-primary)] hover:underline"
                >
                  查看机会详情
                </Link>
              ) : null}
            </div>
          </CardBody>
        </Card>
      </div>

      <div className="mt-4">
        <Card>
          <CardHeader>
            <CardTitle>明细行</CardTitle>
          </CardHeader>
          <CardBody>
            <div className="overflow-auto">
              <table className="w-full table-auto border-separate border-spacing-0 text-left text-sm">
                <thead>
                  <tr className="text-xs text-[var(--color-text-tertiary)]">
                    <th className="border-b border-[var(--color-border-subtle)] px-3 py-2 font-semibold">产品/服务</th>
                    <th className="border-b border-[var(--color-border-subtle)] px-3 py-2 font-semibold">规格</th>
                    <th className="border-b border-[var(--color-border-subtle)] px-3 py-2 font-semibold">数量</th>
                    <th className="border-b border-[var(--color-border-subtle)] px-3 py-2 font-semibold">单价</th>
                    <th className="border-b border-[var(--color-border-subtle)] px-3 py-2 font-semibold">金额</th>
                  </tr>
                </thead>
                <tbody>
                  {lines.map((l) => (
                    <tr key={l.id} className="hover:bg-black/5 dark:hover:bg-white/5">
                      <td className="border-b border-[var(--color-border-subtle)] px-3 py-2">
                        <div className="font-medium text-[var(--color-text-primary)]">{l.product}</div>
                        <div className="mt-1 text-xs text-[var(--color-text-tertiary)]">{l.id}</div>
                      </td>
                      <td className="border-b border-[var(--color-border-subtle)] px-3 py-2">{l.spec}</td>
                      <td className="border-b border-[var(--color-border-subtle)] px-3 py-2">{l.qty.toLocaleString()}</td>
                      <td className="border-b border-[var(--color-border-subtle)] px-3 py-2">{l.unitPrice.toLocaleString()}</td>
                      <td className="border-b border-[var(--color-border-subtle)] px-3 py-2">{l.amount.toLocaleString()}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            {lines.length === 0 ? <div className="mt-2 text-sm text-[var(--color-text-tertiary)]">暂无明细行</div> : null}
          </CardBody>
        </Card>
      </div>
    </div>
  )
}
