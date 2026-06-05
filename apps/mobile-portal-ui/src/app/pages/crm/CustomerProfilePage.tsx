import { contacts, customers, opportunities } from '@factory/mock-data'
import { Link, useParams } from 'react-router-dom'
import { Badge } from '../../ui/Badge'
import { BottomNav } from '../../ui/BottomNav'
import { Card, CardBody, CardHeader, CardTitle } from '../../ui/Card'
import { PageHeader } from '../../ui/PageHeader'
import { useMobileCrm } from '../../state/crm/MobileCrmContext'

export function CustomerProfilePage() {
  const { id } = useParams()
  const crm = useMobileCrm()
  const customer = customers.find((c) => c.id === id)

  if (!customer) {
    return (
      <div className="p-4">
        <PageHeader title="客户全景" description="客户不存在" right={<Badge tone="error">404</Badge>} />
        <BottomNav />
      </div>
    )
  }

  const customerContacts = contacts.filter((c) => c.customerId === customer.id)
  const customerOpps = opportunities.filter((o) => o.customerId === customer.id)
  const visits = crm.getCustomerVisits(customer.id)
  const tasks = crm.getCustomerTasks(customer.id).filter((t) => t.status === 'todo')

  return (
    <div className="p-4">
      <PageHeader title="客户全景" description={customer.name} right={<Badge tone="info">CRM</Badge>} />

      <div className="mx-auto max-w-[520px]">
        <div className="flex items-center justify-between gap-3">
          <div className="text-sm text-[var(--color-text-tertiary)]">
            {customer.industry} · 等级 {customer.level} · 负责人 {customer.owner}
          </div>
          <Link
            to={`/crm/plans/new?customerId=${encodeURIComponent(customer.id)}`}
            className="rounded-[10px] border border-[var(--color-border-subtle)] px-3 py-2 text-sm text-[var(--color-text-primary)] hover:bg-black/5 dark:hover:bg-white/5"
          >
            发起拜访
          </Link>
        </div>

        <div className="mt-4 grid grid-cols-2 gap-3">
          <Card className="shadow-none">
            <CardBody className="p-3">
              <div className="text-xs text-[var(--color-text-tertiary)]">待办任务</div>
              <div className="mt-1 text-2xl font-semibold text-[var(--color-text-primary)]">{tasks.length}</div>
            </CardBody>
          </Card>
          <Card className="shadow-none">
            <CardBody className="p-3">
              <div className="text-xs text-[var(--color-text-tertiary)]">历史拜访</div>
              <div className="mt-1 text-2xl font-semibold text-[var(--color-text-primary)]">{visits.length}</div>
            </CardBody>
          </Card>
        </div>

        <div className="mt-4">
          <Card className="shadow-none">
            <CardHeader className="pb-2">
              <CardTitle>联系人</CardTitle>
              <Badge tone="neutral">{customerContacts.length}</Badge>
            </CardHeader>
            <CardBody className="pt-0">
              {customerContacts.length ? (
                <div className="divide-y divide-[var(--color-border-subtle)]">
                  {customerContacts.map((c) => (
                    <div key={c.id} className="py-3">
                      <div className="flex items-center justify-between gap-3">
                        <div className="truncate text-sm font-medium text-[var(--color-text-primary)]">{c.name}</div>
                        <div className="text-xs text-[var(--color-text-tertiary)]">{c.title}</div>
                      </div>
                      <div className="mt-1 text-xs text-[var(--color-text-tertiary)]">{c.phone}</div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="py-8 text-center text-sm text-[var(--color-text-tertiary)]">暂无联系人</div>
              )}
            </CardBody>
          </Card>
        </div>

        <div className="mt-4">
          <Card className="shadow-none">
            <CardHeader className="pb-2">
              <CardTitle>机会</CardTitle>
              <Badge tone="neutral">{customerOpps.length}</Badge>
            </CardHeader>
            <CardBody className="pt-0">
              {customerOpps.length ? (
                <div className="divide-y divide-[var(--color-border-subtle)]">
                  {customerOpps.map((o) => (
                    <div key={o.id} className="py-3">
                      <div className="truncate text-sm font-medium text-[var(--color-text-primary)]">{o.name}</div>
                      <div className="mt-1 text-xs text-[var(--color-text-tertiary)]">
                        阶段 {o.stage} · 金额 {o.amount.toLocaleString()} · 预计 {o.closeDate}
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="py-8 text-center text-sm text-[var(--color-text-tertiary)]">暂无机会</div>
              )}
            </CardBody>
          </Card>
        </div>

        <div className="mt-4">
          <Card className="shadow-none">
            <CardHeader className="pb-2">
              <CardTitle>拜访与跟进</CardTitle>
              <Badge tone="neutral">{visits.length}</Badge>
            </CardHeader>
            <CardBody className="pt-0">
              {visits.length ? (
                <div className="flex flex-col gap-3">
                  {visits.map((v) => (
                    <Link
                      key={v.visit.id}
                      to={`/crm/visits/${v.visit.id}`}
                      className="rounded-[12px] border border-[var(--color-border-subtle)] p-3 hover:bg-black/5 dark:hover:bg-white/5"
                    >
                      <div className="flex items-start justify-between gap-3">
                        <div className="min-w-0">
                          <div className="truncate text-sm font-medium text-[var(--color-text-primary)]">{v.visit.purpose}</div>
                          <div className="mt-1 truncate text-xs text-[var(--color-text-tertiary)]">{v.visit.planStart + ' - ' + v.visit.planEnd.slice(11)}</div>
                        </div>
                        <Badge tone={v.state.status === 'done' ? 'neutral' : v.state.status === 'checked_in' ? 'success' : v.state.status === 'canceled' ? 'neutral' : 'warning'}>
                          {v.state.status === 'done' ? '已完成' : v.state.status === 'checked_in' ? '已签到' : v.state.status === 'canceled' ? '已取消' : '待拜访'}
                        </Badge>
                      </div>
                      <div className="mt-2 truncate text-xs text-[var(--color-text-tertiary)]">{v.followUps[0]?.note ?? '暂无跟进记录'}</div>
                    </Link>
                  ))}
                </div>
              ) : (
                <div className="py-8 text-center text-sm text-[var(--color-text-tertiary)]">暂无记录</div>
              )}
            </CardBody>
          </Card>
        </div>
      </div>

      <BottomNav />
    </div>
  )
}

