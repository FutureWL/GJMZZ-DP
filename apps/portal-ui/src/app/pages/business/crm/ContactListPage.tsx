import { Link } from 'react-router-dom'
import { contacts } from '../../../mock/data'
import { useCrmData } from '../../../state/crm/CrmDataContext'
import { Card, CardBody, CardHeader, CardTitle } from '../../../ui/Card'
import { PageHeader } from '../../../ui/PageHeader'

export function ContactListPage() {
  const { customers } = useCrmData()
  const customerName = (id: string) => customers.find((c) => c.id === id)?.name ?? id

  return (
    <div>
      <PageHeader title="联系人" description="CRM：联系人（界面示例）" />
      <Card>
        <CardHeader>
          <CardTitle>联系人列表</CardTitle>
        </CardHeader>
        <CardBody>
          <div className="overflow-auto">
            <table className="w-full table-auto border-separate border-spacing-0 text-left text-sm">
              <thead>
                <tr className="text-xs text-[var(--color-text-tertiary)]">
                  <th className="border-b border-[var(--color-border-subtle)] px-3 py-2 font-semibold">联系人</th>
                  <th className="border-b border-[var(--color-border-subtle)] px-3 py-2 font-semibold">客户</th>
                  <th className="border-b border-[var(--color-border-subtle)] px-3 py-2 font-semibold">职务</th>
                  <th className="border-b border-[var(--color-border-subtle)] px-3 py-2 font-semibold">电话</th>
                  <th className="border-b border-[var(--color-border-subtle)] px-3 py-2 font-semibold">邮箱</th>
                  <th className="border-b border-[var(--color-border-subtle)] px-3 py-2 font-semibold">最近联系</th>
                </tr>
              </thead>
              <tbody>
                {contacts.map((c) => (
                  <tr key={c.id} className="hover:bg-black/5 dark:hover:bg-white/5">
                    <td className="border-b border-[var(--color-border-subtle)] px-3 py-2">
                      <Link
                        to={`/business/crm/contacts/${encodeURIComponent(c.id)}`}
                        className="font-medium text-[var(--color-primary)] hover:underline"
                      >
                        {c.name}
                      </Link>
                      <div className="mt-1 text-xs text-[var(--color-text-tertiary)]">{c.id}</div>
                    </td>
                    <td className="border-b border-[var(--color-border-subtle)] px-3 py-2">
                      <Link
                        to={`/business/crm/customers/${encodeURIComponent(c.customerId)}`}
                        className="text-[var(--color-primary)] hover:underline"
                      >
                        {customerName(c.customerId)}
                      </Link>
                    </td>
                    <td className="border-b border-[var(--color-border-subtle)] px-3 py-2">{c.title}</td>
                    <td className="border-b border-[var(--color-border-subtle)] px-3 py-2">{c.phone}</td>
                    <td className="border-b border-[var(--color-border-subtle)] px-3 py-2">{c.email}</td>
                    <td className="border-b border-[var(--color-border-subtle)] px-3 py-2">{c.lastContactAt}</td>
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
