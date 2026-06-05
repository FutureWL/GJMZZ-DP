import { Link } from 'react-router-dom'
import { opportunities } from '../../../mock/data'
import { useCrmData } from '../../../state/crm/CrmDataContext'
import { Badge, type Tone } from '../../../ui/Badge'
import { Card, CardBody, CardHeader, CardTitle } from '../../../ui/Card'
import { PageHeader } from '../../../ui/PageHeader'

function stageTone(stage: string): Tone {
  if (stage === 'won') return 'success'
  if (stage === 'lost') return 'error'
  if (stage === 'negotiation') return 'warning'
  if (stage === 'proposal') return 'info'
  return 'neutral'
}

export function OpportunityListPage() {
  const { customers } = useCrmData()
  const customerName = (id: string) => customers.find((c) => c.id === id)?.name ?? id

  return (
    <div>
      <PageHeader title="机会" description="CRM：销售机会（界面示例）" />
      <Card>
        <CardHeader>
          <CardTitle>机会列表</CardTitle>
        </CardHeader>
        <CardBody>
          <div className="overflow-auto">
            <table className="w-full table-auto border-separate border-spacing-0 text-left text-sm">
              <thead>
                <tr className="text-xs text-[var(--color-text-tertiary)]">
                  <th className="border-b border-[var(--color-border-subtle)] px-3 py-2 font-semibold">机会</th>
                  <th className="border-b border-[var(--color-border-subtle)] px-3 py-2 font-semibold">客户</th>
                  <th className="border-b border-[var(--color-border-subtle)] px-3 py-2 font-semibold">阶段</th>
                  <th className="border-b border-[var(--color-border-subtle)] px-3 py-2 font-semibold">金额</th>
                  <th className="border-b border-[var(--color-border-subtle)] px-3 py-2 font-semibold">预计成交</th>
                  <th className="border-b border-[var(--color-border-subtle)] px-3 py-2 font-semibold">负责人</th>
                </tr>
              </thead>
              <tbody>
                {opportunities.map((o) => (
                  <tr key={o.id} className="hover:bg-black/5 dark:hover:bg-white/5">
                    <td className="border-b border-[var(--color-border-subtle)] px-3 py-2">
                      <Link
                        to={`/business/crm/opportunities/${encodeURIComponent(o.id)}`}
                        className="font-medium text-[var(--color-primary)] hover:underline"
                      >
                        {o.name}
                      </Link>
                      <div className="mt-1 text-xs text-[var(--color-text-tertiary)]">{o.id}</div>
                    </td>
                    <td className="border-b border-[var(--color-border-subtle)] px-3 py-2">
                      {customerName(o.customerId)}
                    </td>
                    <td className="border-b border-[var(--color-border-subtle)] px-3 py-2">
                      <Badge tone={stageTone(o.stage)}>{o.stage}</Badge>
                    </td>
                    <td className="border-b border-[var(--color-border-subtle)] px-3 py-2">
                      ¥{o.amount.toLocaleString()}
                    </td>
                    <td className="border-b border-[var(--color-border-subtle)] px-3 py-2">{o.closeDate}</td>
                    <td className="border-b border-[var(--color-border-subtle)] px-3 py-2">{o.owner}</td>
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
