import { Link } from 'react-router-dom'
import { itTickets } from '../../mock/data'
import { Badge } from '../../ui/Badge'
import { Card, CardBody, CardHeader, CardTitle } from '../../ui/Card'
import { PageHeader } from '../../ui/PageHeader'
import { supportAnnouncements, supportKnowledgeArticles, supportRequests, toWorkItems } from './mockSupport'

export function SupportHomePage() {
  const items = toWorkItems({ tickets: itTickets, requests: supportRequests })
  const todoItems = items.filter((x) => x.status !== 'closed' && x.status !== 'done' && x.status !== 'canceled')
  const overdue = itTickets.filter((t) => t.sla === 'overdue').length
  const openTickets = itTickets.filter((t) => t.status !== 'closed').length
  const openRequests = supportRequests.filter((r) => r.status !== 'done' && r.status !== 'canceled').length

  return (
    <div>
      <PageHeader title="支持工作台" description="统一入口：待办 / 工单 / 服务请求 / 公告 / 知识库（示例数据）" />

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-4">
        <Card>
          <CardHeader>
            <CardTitle>待办</CardTitle>
          </CardHeader>
          <CardBody>
            <div className="text-3xl font-semibold text-[var(--color-text-primary)]">{todoItems.length}</div>
            <div className="mt-2 text-sm text-[var(--color-text-tertiary)]">待我处理/待协作</div>
          </CardBody>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>工单</CardTitle>
          </CardHeader>
          <CardBody>
            <div className="text-3xl font-semibold text-[var(--color-text-primary)]">{openTickets}</div>
            <div className="mt-2 text-sm text-[var(--color-text-tertiary)]">未关闭 · SLA超时 {overdue}</div>
          </CardBody>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>服务请求</CardTitle>
          </CardHeader>
          <CardBody>
            <div className="text-3xl font-semibold text-[var(--color-text-primary)]">{openRequests}</div>
            <div className="mt-2 text-sm text-[var(--color-text-tertiary)]">进行中</div>
          </CardBody>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>公告</CardTitle>
          </CardHeader>
          <CardBody>
            <div className="text-3xl font-semibold text-[var(--color-text-primary)]">{supportAnnouncements.length}</div>
            <div className="mt-2 text-sm text-[var(--color-text-tertiary)]">最近发布</div>
          </CardBody>
        </Card>
      </div>

      <div className="mt-4 grid grid-cols-1 gap-4 lg:grid-cols-3">
        <Card>
          <CardHeader>
            <CardTitle>我的待办（最新）</CardTitle>
          </CardHeader>
          <CardBody>
            <div className="space-y-2">
              {todoItems.slice(0, 5).map((t) => (
                <div
                  key={t.id}
                  className="flex items-center justify-between gap-3 rounded-[10px] border border-[var(--color-border-subtle)] bg-[var(--color-bg-surface)] p-3"
                >
                  <div className="min-w-0">
                    <div className="truncate text-sm font-medium text-[var(--color-text-primary)]">{t.title}</div>
                    <div className="mt-1 text-xs text-[var(--color-text-tertiary)]">
                      {t.id} · {t.requester}
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Link
                      className="text-sm text-[var(--color-primary)] hover:underline"
                      to={`/support/tickets/${encodeURIComponent(t.id)}`}
                    >
                      查看
                    </Link>
                  </div>
                </div>
              ))}
              <Link className="text-sm text-[var(--color-primary)] hover:underline" to="/support/tickets">
                打开工单中心
              </Link>
            </div>
          </CardBody>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>工单（最新）</CardTitle>
          </CardHeader>
          <CardBody>
            <div className="space-y-2">
              {itTickets.slice(0, 4).map((t) => (
                <div
                  key={t.id}
                  className="flex items-center justify-between gap-3 rounded-[10px] border border-[var(--color-border-subtle)] bg-[var(--color-bg-surface)] p-3"
                >
                  <div className="min-w-0">
                    <div className="truncate text-sm font-medium text-[var(--color-text-primary)]">{t.title}</div>
                    <div className="mt-1 text-xs text-[var(--color-text-tertiary)]">
                      {t.id} · {t.requester}
                    </div>
                  </div>
                  {t.sla === 'overdue' ? <Badge tone="warning">超时</Badge> : <Badge tone="neutral">正常</Badge>}
                </div>
              ))}
              <Link className="text-sm text-[var(--color-primary)] hover:underline" to="/support/it/tickets">
                打开 IT 工单（原入口）
              </Link>
            </div>
          </CardBody>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>服务请求（最新）</CardTitle>
          </CardHeader>
          <CardBody>
            <div className="space-y-2">
              {supportRequests.slice(0, 4).map((r) => (
                <div
                  key={r.id}
                  className="flex items-center justify-between gap-3 rounded-[10px] border border-[var(--color-border-subtle)] bg-[var(--color-bg-surface)] p-3"
                >
                  <div className="min-w-0">
                    <div className="truncate text-sm font-medium text-[var(--color-text-primary)]">{r.title}</div>
                    <div className="mt-1 text-xs text-[var(--color-text-tertiary)]">
                      {r.id} · {r.category}
                    </div>
                  </div>
                  <Badge tone={r.status === 'done' ? 'success' : r.status === 'canceled' ? 'neutral' : 'info'}>{r.status}</Badge>
                </div>
              ))}
              <Link className="text-sm text-[var(--color-primary)] hover:underline" to="/support/requests">
                查看全部服务请求
              </Link>
            </div>
          </CardBody>
        </Card>
      </div>

      <div className="mt-4 grid grid-cols-1 gap-4 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>公告</CardTitle>
          </CardHeader>
          <CardBody>
            <div className="space-y-2">
              {supportAnnouncements.slice(0, 4).map((a) => (
                <div
                  key={a.id}
                  className="flex items-center justify-between gap-3 rounded-[10px] border border-[var(--color-border-subtle)] bg-[var(--color-bg-surface)] p-3"
                >
                  <div className="min-w-0">
                    <div className="truncate text-sm font-medium text-[var(--color-text-primary)]">{a.title}</div>
                    <div className="mt-1 text-xs text-[var(--color-text-tertiary)]">{a.publishedAt}</div>
                  </div>
                  <Badge tone={a.level === 'warning' ? 'warning' : 'neutral'}>{a.level === 'warning' ? '重要' : '通知'}</Badge>
                </div>
              ))}
              <Link className="text-sm text-[var(--color-primary)] hover:underline" to="/support/notices">
                查看全部公告
              </Link>
            </div>
          </CardBody>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>知识库 / SOP</CardTitle>
          </CardHeader>
          <CardBody>
            <div className="space-y-2">
              {supportKnowledgeArticles.slice(0, 4).map((a) => (
                <div
                  key={a.id}
                  className="flex items-center justify-between gap-3 rounded-[10px] border border-[var(--color-border-subtle)] bg-[var(--color-bg-surface)] p-3"
                >
                  <div className="min-w-0">
                    <div className="truncate text-sm font-medium text-[var(--color-text-primary)]">{a.title}</div>
                    <div className="mt-1 text-xs text-[var(--color-text-tertiary)]">
                      {a.updatedAt} · {a.tags.join(' / ')}
                    </div>
                  </div>
                </div>
              ))}
              <Link className="text-sm text-[var(--color-primary)] hover:underline" to="/support/kb">
                打开知识库
              </Link>
            </div>
          </CardBody>
        </Card>
      </div>
    </div>
  )
}
