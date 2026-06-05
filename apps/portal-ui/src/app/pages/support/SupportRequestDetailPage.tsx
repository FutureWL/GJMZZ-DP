import { Link, useParams } from 'react-router-dom'
import { Badge } from '../../ui/Badge'
import { Button } from '../../ui/Button'
import { Card, CardBody, CardHeader, CardTitle } from '../../ui/Card'
import { PageHeader } from '../../ui/PageHeader'
import { supportRequests } from './mockSupport'

export function SupportRequestDetailPage() {
  const { id } = useParams()
  const req = supportRequests.find((x) => x.id === id)

  return (
    <div>
      <PageHeader
        title={req ? `服务请求：${req.id}` : '服务请求'}
        description="详情页骨架（功能后续接入）"
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
            <CardTitle>信息</CardTitle>
          </CardHeader>
          <CardBody>
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
                <div className="text-xs text-[var(--color-text-tertiary)]">优先级</div>
                <div className="mt-1">
                  <Badge tone={req?.priority === 'p0' ? 'error' : req?.priority === 'p1' ? 'warning' : 'neutral'}>
                    {req?.priority ?? '-'}
                  </Badge>
                </div>
              </div>
              <div>
                <div className="text-xs text-[var(--color-text-tertiary)]">状态</div>
                <div className="mt-1">
                  <Badge tone={req?.status === 'done' ? 'success' : req?.status === 'canceled' ? 'neutral' : 'info'}>
                    {req?.status ?? '-'}
                  </Badge>
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
              <div>
                <div className="text-xs text-[var(--color-text-tertiary)]">期望完成</div>
                <div className="mt-1 text-[var(--color-text-primary)]">{req?.dueAt ?? '-'}</div>
              </div>
            </div>
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
                to="/support/requests"
              >
                返回请求列表
              </Link>
              <Link
                className="block rounded-[10px] border border-[var(--color-border-subtle)] bg-[var(--color-bg-surface)] p-3 font-medium text-[var(--color-primary)] hover:underline"
                to="/support/tickets"
              >
                打开工单中心
              </Link>
            </div>
          </CardBody>
        </Card>
      </div>
    </div>
  )
}
