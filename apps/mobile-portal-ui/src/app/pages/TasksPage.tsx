import { Link } from 'react-router-dom'
import { Badge } from '../ui/Badge'
import { BottomNav } from '../ui/BottomNav'
import { Button } from '../ui/Button'
import { Card, CardBody, CardHeader, CardTitle } from '../ui/Card'
import { PageHeader } from '../ui/PageHeader'
import { useMobileCrm } from '../state/crm/MobileCrmContext'

function sortKey(dueAt: string | null) {
  if (!dueAt) return '9999-99-99 99:99'
  return dueAt
}

export function TasksPage() {
  const crm = useMobileCrm()
  const todos = crm.tasks.filter((t) => t.status === 'todo').sort((a, b) => sortKey(a.dueAt).localeCompare(sortKey(b.dueAt)))
  const done = crm.tasks.filter((t) => t.status === 'done').slice(0, 20)

  return (
    <div className="p-4">
      <PageHeader title="任务与提醒" description="由下次跟进自动生成（示例）" right={<Badge tone="info">Tasks</Badge>} />

      <div className="mx-auto max-w-[520px]">
        <Card className="shadow-none">
          <CardHeader className="pb-2">
            <CardTitle>待办</CardTitle>
            <Badge tone="warning">{todos.length}</Badge>
          </CardHeader>
          <CardBody className="pt-0">
            {todos.length ? (
              <div className="divide-y divide-[var(--color-border-subtle)]">
                {todos.map((t) => (
                  <div key={t.id} className="flex items-start justify-between gap-3 py-3">
                    <div className="min-w-0">
                      <div className="truncate text-sm font-medium text-[var(--color-text-primary)]">{t.title}</div>
                      <div className="mt-1 truncate text-xs text-[var(--color-text-tertiary)]">
                        {t.dueAt ? `到期：${t.dueAt}` : '未设置到期'}
                      </div>
                      {t.relatedVisitId ? (
                        <Link to={`/crm/visits/${t.relatedVisitId}`} className="mt-1 inline-block text-xs text-[var(--color-primary)]">
                          打开拜访
                        </Link>
                      ) : null}
                    </div>
                    <Button variant="primary" size="sm" onClick={() => crm.markTaskDone(t.id)}>
                      完成
                    </Button>
                  </div>
                ))}
              </div>
            ) : (
              <div className="py-8 text-center text-sm text-[var(--color-text-tertiary)]">暂无待办</div>
            )}
          </CardBody>
        </Card>

        <div className="mt-4">
          <Card className="shadow-none">
            <CardHeader className="pb-2">
              <CardTitle>已完成（最近）</CardTitle>
              <Badge tone="neutral">{done.length}</Badge>
            </CardHeader>
            <CardBody className="pt-0">
              {done.length ? (
                <div className="divide-y divide-[var(--color-border-subtle)]">
                  {done.map((t) => (
                    <div key={t.id} className="py-3">
                      <div className="truncate text-sm text-[var(--color-text-primary)]">{t.title}</div>
                      <div className="mt-1 truncate text-xs text-[var(--color-text-tertiary)]">{t.dueAt ? `到期：${t.dueAt}` : '未设置到期'}</div>
                    </div>
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

