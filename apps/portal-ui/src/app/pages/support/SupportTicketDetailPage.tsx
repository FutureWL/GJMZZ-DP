import { Link, useParams } from 'react-router-dom'
import { itTickets } from '../../mock/data'
import { Badge } from '../../ui/Badge'
import { Button } from '../../ui/Button'
import { Card, CardBody, CardHeader, CardTitle } from '../../ui/Card'
import { PageHeader } from '../../ui/PageHeader'
import { supportRequests, type SupportRequest } from './mockSupport'

function isSupportRequest(id?: string) {
  return Boolean(id && id.startsWith('SR-'))
}

function getSupportRequest(id?: string) {
  if (!id) return undefined
  return supportRequests.find((x) => x.id === id)
}

function getTicket(id?: string) {
  if (!id) return undefined
  return itTickets.find((x) => x.id === id)
}

function requestStatusTone(status: SupportRequest['status']) {
  if (status === 'submitted' || status === 'accepted' || status === 'in_progress') return 'info'
  if (status === 'done') return 'success'
  if (status === 'canceled') return 'neutral'
  return 'neutral'
}

export function SupportTicketDetailPage() {
  const { id } = useParams()
  const isReq = isSupportRequest(id)
  const req = isReq ? getSupportRequest(id) : undefined
  const t = !isReq ? getTicket(id) : undefined

  return (
    <div>
      <PageHeader
        title={id ? `工单详情：${id}` : '工单详情'}
        description="统一详情页（示例）：根据编号前缀区分工单/服务请求"
        right={
          <div className="flex items-center gap-2">
            <Button variant="secondary">指派（占位）</Button>
            <Button variant="primary">更新状态（占位）</Button>
          </div>
        }
      />

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle>概览</CardTitle>
          </CardHeader>
          <CardBody>
            {isReq ? (
              <div className="grid grid-cols-1 gap-3 text-sm md:grid-cols-2">
                <div className="md:col-span-2">
                  <div className="text-xs text-[var(--color-text-tertiary)]">标题</div>
                  <div className="mt-1 text-[var(--color-text-primary)]">{req?.title ?? '-'}</div>
                </div>
                <div>
                  <div className="text-xs text-[var(--color-text-tertiary)]">类别</div>
                  <div className="mt-1 text-[var(--color-text-primary)]">{req?.category ?? '-'}</div>
                </div>
                <div>
                  <div className="text-xs text-[var(--color-text-tertiary)]">状态</div>
                  <div className="mt-1">
                    <Badge tone={req ? requestStatusTone(req.status) : 'neutral'}>{req?.status ?? '-'}</Badge>
                  </div>
                </div>
                <div>
                  <div className="text-xs text-[var(--color-text-tertiary)]">申请人</div>
                  <div className="mt-1 text-[var(--color-text-primary)]">{req?.requester ?? '-'}</div>
                </div>
                <div>
                  <div className="text-xs text-[var(--color-text-tertiary)]">创建时间</div>
                  <div className="mt-1 text-[var(--color-text-primary)]">{req?.createdAt ?? '-'}</div>
                </div>
                <div className="md:col-span-2">
                  <div className="text-xs text-[var(--color-text-tertiary)]">期望完成</div>
                  <div className="mt-1 text-[var(--color-text-primary)]">{req?.dueAt ?? '-'}</div>
                </div>
              </div>
            ) : (
              <div className="grid grid-cols-1 gap-3 text-sm md:grid-cols-2">
                <div className="md:col-span-2">
                  <div className="text-xs text-[var(--color-text-tertiary)]">标题</div>
                  <div className="mt-1 text-[var(--color-text-primary)]">{t?.title ?? '-'}</div>
                </div>
                <div>
                  <div className="text-xs text-[var(--color-text-tertiary)]">状态</div>
                  <div className="mt-1">
                    <Badge tone={t?.status === 'closed' ? 'neutral' : 'info'}>{t?.status ?? '-'}</Badge>
                  </div>
                </div>
                <div>
                  <div className="text-xs text-[var(--color-text-tertiary)]">SLA</div>
                  <div className="mt-1">
                    <Badge tone={t?.sla === 'overdue' ? 'warning' : 'neutral'}>{t?.sla ?? '-'}</Badge>
                  </div>
                </div>
                <div>
                  <div className="text-xs text-[var(--color-text-tertiary)]">申请人</div>
                  <div className="mt-1 text-[var(--color-text-primary)]">{t?.requester ?? '-'}</div>
                </div>
                <div>
                  <div className="text-xs text-[var(--color-text-tertiary)]">创建时间</div>
                  <div className="mt-1 text-[var(--color-text-primary)]">{t?.createdAt ?? '-'}</div>
                </div>
              </div>
            )}
          </CardBody>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>快捷跳转</CardTitle>
          </CardHeader>
          <CardBody>
            <div className="space-y-2 text-sm">
              <Link
                className="block rounded-[10px] border border-[var(--color-border-subtle)] bg-[var(--color-bg-surface)] p-3 font-medium text-[var(--color-primary)] hover:underline"
                to="/support/tickets"
              >
                返回工单中心
              </Link>
              {!isReq && t ? (
                <Link
                  className="block rounded-[10px] border border-[var(--color-border-subtle)] bg-[var(--color-bg-surface)] p-3 font-medium text-[var(--color-primary)] hover:underline"
                  to={`/support/it/tickets/${encodeURIComponent(t.id)}`}
                >
                  打开IT工单详情页（原入口）
                </Link>
              ) : null}
            </div>
          </CardBody>
        </Card>
      </div>
    </div>
  )
}

