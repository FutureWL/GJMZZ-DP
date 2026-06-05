import { Link } from 'react-router-dom'
import { Badge } from '../../ui/Badge'
import { BottomNav } from '../../ui/BottomNav'
import { Card, CardBody, CardHeader, CardTitle } from '../../ui/Card'
import { PageHeader } from '../../ui/PageHeader'
import { useMobileCrm } from '../../state/crm/MobileCrmContext'

function statusLabel(status: string) {
  if (status === 'planned') return { text: '待拜访', tone: 'warning' as const }
  if (status === 'checked_in') return { text: '已签到', tone: 'success' as const }
  if (status === 'done') return { text: '已完成', tone: 'neutral' as const }
  return { text: '取消', tone: 'neutral' as const }
}

export function CrmHomePage() {
  const crm = useMobileCrm()
  const planned = crm.visits.filter((v) => v.state.status === 'planned').length
  const checked = crm.visits.filter((v) => v.state.status === 'checked_in').length
  const done = crm.visits.filter((v) => v.state.status === 'done').length
  const todoTasks = crm.tasks.filter((t) => t.status === 'todo').length

  return (
    <div className="p-4">
      <PageHeader
        title="CRM 外勤闭环"
        description="拜访计划 → 签到 → 跟进记录（示例数据）"
        right={<Badge tone="info">Mobile</Badge>}
      />

      <div className="mx-auto max-w-[520px]">
        <div className="mb-3 flex items-center justify-between gap-2">
          <Link
            to="/crm/plans/new"
            className="rounded-[10px] border border-[var(--color-border-subtle)] px-3 py-2 text-sm text-[var(--color-text-primary)] hover:bg-black/5 dark:hover:bg-white/5"
          >
            新建拜访
          </Link>
          <Link to="/tasks" className="text-sm text-[var(--color-primary)]">
            任务 {todoTasks}
          </Link>
        </div>
        <div className="grid grid-cols-3 gap-3">
          <Card className="shadow-none">
            <CardBody className="p-3">
              <div className="text-xs text-[var(--color-text-tertiary)]">待拜访</div>
              <div className="mt-1 text-2xl font-semibold text-[var(--color-text-primary)]">{planned}</div>
            </CardBody>
          </Card>
          <Card className="shadow-none">
            <CardBody className="p-3">
              <div className="text-xs text-[var(--color-text-tertiary)]">已签到</div>
              <div className="mt-1 text-2xl font-semibold text-[var(--color-text-primary)]">{checked}</div>
            </CardBody>
          </Card>
          <Card className="shadow-none">
            <CardBody className="p-3">
              <div className="text-xs text-[var(--color-text-tertiary)]">已完成</div>
              <div className="mt-1 text-2xl font-semibold text-[var(--color-text-primary)]">{done}</div>
            </CardBody>
          </Card>
        </div>

        <div className="mt-4">
          <Card className="shadow-none">
            <CardHeader className="pb-2">
              <CardTitle>拜访列表</CardTitle>
              <Badge tone="neutral">{crm.visits.length}</Badge>
            </CardHeader>
            <CardBody className="pt-0">
              <div className="flex flex-col gap-3">
                {crm.visits.map((item) => {
                  const s = statusLabel(item.state.status)
                  return (
                    <Link
                      key={item.visit.id}
                      to={`/crm/visits/${item.visit.id}`}
                      className="rounded-[12px] border border-[var(--color-border-subtle)] p-3 hover:bg-black/5 dark:hover:bg-white/5"
                    >
                      <div className="flex items-start justify-between gap-3">
                        <div className="min-w-0">
                          <div className="truncate text-sm font-semibold text-[var(--color-text-primary)]">
                            {item.customer.name}
                          </div>
                          <div className="mt-1 truncate text-xs text-[var(--color-text-tertiary)]">
                            {(item.contact?.name ?? '未指定联系人') + ' · ' + item.visit.planStart.slice(11) + '-' + item.visit.planEnd.slice(11)}
                          </div>
                        </div>
                        <Badge tone={s.tone}>{s.text}</Badge>
                      </div>
                      <div className="mt-2 truncate text-xs text-[var(--color-text-tertiary)]">{item.visit.purpose}</div>
                      <div className="mt-2 truncate text-xs text-[var(--color-text-tertiary)]">{item.visit.address}</div>
                    </Link>
                  )
                })}
              </div>
            </CardBody>
          </Card>
        </div>
      </div>

      <BottomNav />
    </div>
  )
}
