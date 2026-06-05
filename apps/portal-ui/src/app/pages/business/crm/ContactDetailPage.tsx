import { Link, useParams } from 'react-router-dom'
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

export function ContactDetailPage() {
  const { id } = useParams()
  const { customers } = useCrmData()
  const contact = contacts.find((c) => c.id === id)
  const customer = customers.find((c) => c.id === contact?.customerId)
  const relatedActivities = crmActivities
    .filter((a) => a.contactId === id)
    .sort((a, b) => b.createdAt.localeCompare(a.createdAt))

  return (
    <div>
      <PageHeader
        title={contact ? `联系人详情：${contact.name}` : '联系人详情'}
        description="基础信息 / 近期互动（界面示例）"
      />

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle>基础信息</CardTitle>
          </CardHeader>
          <CardBody>
            <div className="grid grid-cols-1 gap-3 text-sm md:grid-cols-2">
              <div>
                <div className="text-xs text-[var(--color-text-tertiary)]">联系人ID</div>
                <div className="mt-1 text-[var(--color-text-primary)]">{contact?.id ?? '-'}</div>
              </div>
              <div>
                <div className="text-xs text-[var(--color-text-tertiary)]">所属客户</div>
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
                <div className="text-xs text-[var(--color-text-tertiary)]">职务</div>
                <div className="mt-1 text-[var(--color-text-primary)]">{contact?.title ?? '-'}</div>
              </div>
              <div>
                <div className="text-xs text-[var(--color-text-tertiary)]">最近联系</div>
                <div className="mt-1 text-[var(--color-text-primary)]">{contact?.lastContactAt ?? '-'}</div>
              </div>
              <div>
                <div className="text-xs text-[var(--color-text-tertiary)]">电话</div>
                <div className="mt-1 text-[var(--color-text-primary)]">{contact?.phone ?? '-'}</div>
              </div>
              <div>
                <div className="text-xs text-[var(--color-text-tertiary)]">邮箱</div>
                <div className="mt-1 text-[var(--color-text-primary)]">{contact?.email ?? '-'}</div>
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
                to="/business/crm/contacts"
                className="block rounded-[10px] border border-[var(--color-border-subtle)] bg-[var(--color-bg-surface)] p-3 text-[var(--color-primary)] hover:underline"
              >
                返回联系人列表
              </Link>
              <Link
                to="/business/crm/activities"
                className="block rounded-[10px] border border-[var(--color-border-subtle)] bg-[var(--color-bg-surface)] p-3 text-[var(--color-primary)] hover:underline"
              >
                查看全部活动
              </Link>
            </div>
          </CardBody>
        </Card>
      </div>

      <div className="mt-4">
        <Card>
          <CardHeader>
            <CardTitle>近期互动</CardTitle>
          </CardHeader>
          <CardBody>
            <div className="space-y-2">
              {relatedActivities.map((a) => (
                <div
                  key={a.id}
                  className="rounded-[10px] border border-[var(--color-border-subtle)] bg-[var(--color-bg-surface)] p-3"
                >
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <div className="text-sm font-medium text-[var(--color-text-primary)]">{a.subject}</div>
                    <div className="flex items-center gap-2">
                      <Badge tone={activityTypeTone(a.type)}>{a.type}</Badge>
                      <Badge tone={activityStatusTone(a.status)}>{a.status}</Badge>
                    </div>
                  </div>
                  <div className="mt-1 text-xs text-[var(--color-text-tertiary)]">
                    {a.owner} · 计划 {a.dueAt} · 创建 {a.createdAt}
                  </div>
                </div>
              ))}
              {relatedActivities.length === 0 ? (
                <div className="text-sm text-[var(--color-text-tertiary)]">暂无互动记录</div>
              ) : null}
            </div>
          </CardBody>
        </Card>
      </div>
    </div>
  )
}
