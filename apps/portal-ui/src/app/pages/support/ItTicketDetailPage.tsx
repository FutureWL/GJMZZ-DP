import { useMemo, useState } from 'react'
import { useParams } from 'react-router-dom'
import { itTickets } from '../../mock/data'
import type { ItTicket } from '../../mock/models'
import { Badge } from '../../ui/Badge'
import { Button } from '../../ui/Button'
import { Card, CardBody, CardHeader, CardTitle } from '../../ui/Card'
import { PageHeader } from '../../ui/PageHeader'

const steps: ItTicket['status'][] = ['new', 'accepted', 'processing', 'verifying', 'closed']

export function ItTicketDetailPage() {
  const { id } = useParams()
  const initial = itTickets.find((x) => x.id === id)
  const [status, setStatus] = useState<ItTicket['status']>(initial?.status ?? 'new')

  const currentIdx = useMemo(() => steps.indexOf(status), [status])

  return (
    <div>
      <PageHeader
        title={`IT 工单详情：${id ?? '-'}`}
        description="支持域P0闭环（仅界面演示，状态在前端本地变化）"
        right={
          <div className="flex items-center gap-2">
            <Button variant="secondary" onClick={() => setStatus('accepted')} disabled={currentIdx >= 1}>
              受理
            </Button>
            <Button variant="secondary" onClick={() => setStatus('processing')} disabled={currentIdx >= 2}>
              处理中
            </Button>
            <Button variant="secondary" onClick={() => setStatus('verifying')} disabled={currentIdx >= 3}>
              验收中
            </Button>
            <Button variant="primary" onClick={() => setStatus('closed')} disabled={currentIdx >= 4}>
              关闭
            </Button>
          </div>
        }
      />

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle>工单信息</CardTitle>
          </CardHeader>
          <CardBody>
            <div className="grid grid-cols-1 gap-3 text-sm md:grid-cols-2">
              <div>
                <div className="text-xs text-[var(--color-text-tertiary)]">标题</div>
                <div className="mt-1 text-[var(--color-text-primary)]">{initial?.title ?? '-'}</div>
              </div>
              <div>
                <div className="text-xs text-[var(--color-text-tertiary)]">状态</div>
                <div className="mt-1">
                  <Badge tone={status === 'closed' ? 'success' : status === 'processing' ? 'info' : 'neutral'}>
                    {status}
                  </Badge>
                </div>
              </div>
              <div>
                <div className="text-xs text-[var(--color-text-tertiary)]">申请人</div>
                <div className="mt-1 text-[var(--color-text-primary)]">{initial?.requester ?? '-'}</div>
              </div>
              <div>
                <div className="text-xs text-[var(--color-text-tertiary)]">创建时间</div>
                <div className="mt-1 text-[var(--color-text-primary)]">{initial?.createdAt ?? '-'}</div>
              </div>
              <div className="md:col-span-2">
                <div className="text-xs text-[var(--color-text-tertiary)]">描述</div>
                <div className="mt-1 text-[var(--color-text-primary)]">问题描述/截图/附件位（占位）</div>
              </div>
            </div>
          </CardBody>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>流程</CardTitle>
          </CardHeader>
          <CardBody>
            <div className="space-y-2 text-sm">
              {steps.map((s, idx) => (
                <div
                  key={s}
                  className="flex items-center justify-between gap-3 rounded-[10px] border border-[var(--color-border-subtle)] bg-[var(--color-bg-surface)] p-3"
                >
                  <div className="text-[var(--color-text-primary)]">{s}</div>
                  {idx < currentIdx ? (
                    <Badge tone="success">已完成</Badge>
                  ) : idx === currentIdx ? (
                    <Badge tone="info">当前</Badge>
                  ) : (
                    <Badge tone="neutral">未开始</Badge>
                  )}
                </div>
              ))}
            </div>
          </CardBody>
        </Card>
      </div>
    </div>
  )
}

