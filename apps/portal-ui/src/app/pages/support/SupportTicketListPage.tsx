import { useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { itTickets } from '../../mock/data'
import { Badge, type Tone } from '../../ui/Badge'
import { Card, CardBody, CardHeader, CardTitle } from '../../ui/Card'
import { Input } from '../../ui/Input'
import { PageHeader } from '../../ui/PageHeader'
import { Select } from '../../ui/Select'
import { supportRequests, toWorkItems, type SupportWorkItem, type SupportWorkItemType } from './mockSupport'

function typeLabel(t: SupportWorkItemType) {
  if (t === 'ticket') return '工单'
  return '服务请求'
}

function typeTone(t: SupportWorkItemType): Tone {
  if (t === 'ticket') return 'neutral'
  return 'info'
}

function priorityTone(p: SupportWorkItem['priority']): Tone {
  if (p === 'p0') return 'error'
  if (p === 'p1') return 'warning'
  if (p === 'p2') return 'info'
  return 'neutral'
}

function priorityLabel(p: SupportWorkItem['priority']) {
  if (p === 'p0') return 'P0'
  if (p === 'p1') return 'P1'
  if (p === 'p2') return 'P2'
  return 'P3'
}

export function SupportTicketListPage() {
  const [q, setQ] = useState('')
  const [type, setType] = useState<SupportWorkItemType | ''>('')

  const items = useMemo(() => toWorkItems({ tickets: itTickets, requests: supportRequests }), [])

  const rows = useMemo(() => {
    const query = q.trim().toLowerCase()
    return items.filter((x) => {
      if (type && x.type !== type) return false
      if (!query) return true
      return x.id.toLowerCase().includes(query) || x.title.toLowerCase().includes(query) || x.requester.toLowerCase().includes(query)
    })
  }, [items, q, type])

  return (
    <div>
      <PageHeader title="工单中心" description="统一入口：IT工单 + 服务请求（示例数据）" />
      <Card>
        <CardHeader>
          <CardTitle>工单与请求</CardTitle>
        </CardHeader>
        <CardBody>
          <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
            <Input placeholder="搜索编号/标题/申请人" value={q} onChange={(e) => setQ(e.target.value)} />
            <Select value={type} onChange={(e) => setType(e.target.value as SupportWorkItemType | '')}>
              <option value="">全部类型</option>
              <option value="ticket">工单</option>
              <option value="request">服务请求</option>
            </Select>
          </div>

          <div className="mt-3 overflow-auto">
            <table className="w-full table-auto border-separate border-spacing-0 text-left text-sm">
              <thead>
                <tr className="text-xs text-[var(--color-text-tertiary)]">
                  <th className="border-b border-[var(--color-border-subtle)] px-3 py-2 font-semibold">编号</th>
                  <th className="border-b border-[var(--color-border-subtle)] px-3 py-2 font-semibold">类型</th>
                  <th className="border-b border-[var(--color-border-subtle)] px-3 py-2 font-semibold">标题</th>
                  <th className="border-b border-[var(--color-border-subtle)] px-3 py-2 font-semibold">优先级</th>
                  <th className="border-b border-[var(--color-border-subtle)] px-3 py-2 font-semibold">状态</th>
                  <th className="border-b border-[var(--color-border-subtle)] px-3 py-2 font-semibold">申请人</th>
                  <th className="border-b border-[var(--color-border-subtle)] px-3 py-2 font-semibold">创建时间</th>
                </tr>
              </thead>
              <tbody>
                {rows.length ? (
                  rows.map((x) => (
                    <tr key={x.id} className="hover:bg-black/5 dark:hover:bg-white/5">
                      <td className="border-b border-[var(--color-border-subtle)] px-3 py-2">
                        <Link
                          className="font-medium text-[var(--color-primary)] hover:underline"
                          to={`/support/tickets/${encodeURIComponent(x.id)}`}
                        >
                          {x.id}
                        </Link>
                      </td>
                      <td className="border-b border-[var(--color-border-subtle)] px-3 py-2">
                        <Badge tone={typeTone(x.type)}>{typeLabel(x.type)}</Badge>
                      </td>
                      <td className="border-b border-[var(--color-border-subtle)] px-3 py-2 text-[var(--color-text-primary)]">
                        {x.title}
                      </td>
                      <td className="border-b border-[var(--color-border-subtle)] px-3 py-2">
                        <Badge tone={priorityTone(x.priority)}>{priorityLabel(x.priority)}</Badge>
                      </td>
                      <td className="border-b border-[var(--color-border-subtle)] px-3 py-2 text-xs text-[var(--color-text-tertiary)]">
                        {x.status}
                      </td>
                      <td className="border-b border-[var(--color-border-subtle)] px-3 py-2">{x.requester}</td>
                      <td className="border-b border-[var(--color-border-subtle)] px-3 py-2 text-xs text-[var(--color-text-tertiary)]">
                        {x.createdAt}
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td
                      colSpan={7}
                      className="border-b border-[var(--color-border-subtle)] px-3 py-8 text-center text-sm text-[var(--color-text-tertiary)]"
                    >
                      暂无数据
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </CardBody>
      </Card>
    </div>
  )
}
