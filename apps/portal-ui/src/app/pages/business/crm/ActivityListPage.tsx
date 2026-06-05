import { Link } from 'react-router-dom'
import { contacts, crmActivities } from '../../../mock/data'
import { useCrmData } from '../../../state/crm/CrmDataContext'
import { Badge, type Tone } from '../../../ui/Badge'
import { Card, CardBody, CardHeader, CardTitle } from '../../../ui/Card'
import { PageHeader } from '../../../ui/PageHeader'

function activityTypeTone(type: string): Tone {
  if (type === 'meeting') return 'info'
  if (type === 'call') return 'success'
  if (type === 'email') return 'neutral'
  return 'warning'
}

function activityStatusTone(status: string): Tone {
  if (status === 'done') return 'success'
  if (status === 'canceled') return 'error'
  return 'info'
}

export function ActivityListPage() {
  const { customers } = useCrmData()
  const customerName = (id: string) => customers.find((c) => c.id === id)?.name ?? id
  const contactName = (id: string | null) => {
    if (!id) return '-'
    return contacts.find((c) => c.id === id)?.name ?? id
  }

  const rows = [...crmActivities].sort((a, b) => b.createdAt.localeCompare(a.createdAt))

  return (
    <div>
      <PageHeader title="跟进记录" description="CRM：跟进记录（界面示例）" />
      <Card>
        <CardHeader>
          <CardTitle>跟进记录列表</CardTitle>
        </CardHeader>
        <CardBody>
          <div className="overflow-auto">
            <table className="w-full table-auto border-separate border-spacing-0 text-left text-sm">
              <thead>
                <tr className="text-xs text-[var(--color-text-tertiary)]">
                  <th className="border-b border-[var(--color-border-subtle)] px-3 py-2 font-semibold">主题</th>
                  <th className="border-b border-[var(--color-border-subtle)] px-3 py-2 font-semibold">类型</th>
                  <th className="border-b border-[var(--color-border-subtle)] px-3 py-2 font-semibold">客户</th>
                  <th className="border-b border-[var(--color-border-subtle)] px-3 py-2 font-semibold">联系人</th>
                  <th className="border-b border-[var(--color-border-subtle)] px-3 py-2 font-semibold">负责人</th>
                  <th className="border-b border-[var(--color-border-subtle)] px-3 py-2 font-semibold">状态</th>
                  <th className="border-b border-[var(--color-border-subtle)] px-3 py-2 font-semibold">计划时间</th>
                </tr>
              </thead>
              <tbody>
                {rows.map((a) => (
                  <tr key={a.id} className="hover:bg-black/5 dark:hover:bg-white/5">
                    <td className="border-b border-[var(--color-border-subtle)] px-3 py-2">
                      <div className="font-medium text-[var(--color-text-primary)]">{a.subject}</div>
                      <div className="mt-1 text-xs text-[var(--color-text-tertiary)]">{a.id}</div>
                    </td>
                    <td className="border-b border-[var(--color-border-subtle)] px-3 py-2">
                      <Badge tone={activityTypeTone(a.type)}>{a.type}</Badge>
                    </td>
                    <td className="border-b border-[var(--color-border-subtle)] px-3 py-2">
                      <Link
                        to={`/business/crm/customers/${encodeURIComponent(a.customerId)}`}
                        className="text-[var(--color-primary)] hover:underline"
                      >
                        {customerName(a.customerId)}
                      </Link>
                    </td>
                    <td className="border-b border-[var(--color-border-subtle)] px-3 py-2">
                      {a.contactId ? (
                        <Link
                          to={`/business/crm/contacts/${encodeURIComponent(a.contactId)}`}
                          className="text-[var(--color-primary)] hover:underline"
                        >
                          {contactName(a.contactId)}
                        </Link>
                      ) : (
                        '-'
                      )}
                    </td>
                    <td className="border-b border-[var(--color-border-subtle)] px-3 py-2">{a.owner}</td>
                    <td className="border-b border-[var(--color-border-subtle)] px-3 py-2">
                      <Badge tone={activityStatusTone(a.status)}>{a.status}</Badge>
                    </td>
                    <td className="border-b border-[var(--color-border-subtle)] px-3 py-2">{a.dueAt}</td>
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
