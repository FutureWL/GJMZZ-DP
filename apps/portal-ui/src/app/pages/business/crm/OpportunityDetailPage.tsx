import { useMemo, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { contacts, crmActivities, opportunities, quotes } from '../../../mock/data'
import { useCrmData } from '../../../state/crm/CrmDataContext'
import { Badge } from '../../../ui/Badge'
import { Button } from '../../../ui/Button'
import { Card, CardBody, CardHeader, CardTitle } from '../../../ui/Card'
import { PageHeader } from '../../../ui/PageHeader'

const stages = ['lead', 'proposal', 'negotiation', 'won', 'lost'] as const

export function OpportunityDetailPage() {
  const { id } = useParams()
  const { customers } = useCrmData()
  const opp = opportunities.find((o) => o.id === id)
  const customer = customers.find((c) => c.id === opp?.customerId)
  const [stage, setStage] = useState<(typeof stages)[number]>(opp?.stage ?? 'lead')
  const relatedQuotes = quotes.filter((q) => q.opportunityId === id)
  const relatedActivities = [...crmActivities]
    .filter((a) => a.customerId === opp?.customerId)
    .sort((a, b) => b.createdAt.localeCompare(a.createdAt))

  const idx = useMemo(() => stages.indexOf(stage), [stage])

  return (
    <div>
      <PageHeader
        title={opp ? `机会详情：${opp.name}` : '机会详情'}
        description="阶段推进（仅界面演示）"
        right={
          <div className="flex flex-wrap items-center gap-2">
            <Button variant="secondary" onClick={() => setStage('proposal')} disabled={idx >= 1}>
              进入方案
            </Button>
            <Button variant="secondary" onClick={() => setStage('negotiation')} disabled={idx >= 2}>
              进入谈判
            </Button>
            <Button variant="primary" onClick={() => setStage('won')} disabled={stage === 'won'}>
              赢单
            </Button>
            <Button variant="danger" onClick={() => setStage('lost')} disabled={stage === 'lost'}>
              丢单
            </Button>
          </div>
        }
      />

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle>机会信息</CardTitle>
          </CardHeader>
          <CardBody>
            <div className="grid grid-cols-1 gap-3 text-sm md:grid-cols-2">
              <div>
                <div className="text-xs text-[var(--color-text-tertiary)]">机会ID</div>
                <div className="mt-1 text-[var(--color-text-primary)]">{opp?.id ?? '-'}</div>
              </div>
              <div>
                <div className="text-xs text-[var(--color-text-tertiary)]">客户</div>
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
                <div className="text-xs text-[var(--color-text-tertiary)]">金额</div>
                <div className="mt-1 text-[var(--color-text-primary)]">
                  {opp ? `¥${opp.amount.toLocaleString()}` : '-'}
                </div>
              </div>
              <div>
                <div className="text-xs text-[var(--color-text-tertiary)]">预计成交</div>
                <div className="mt-1 text-[var(--color-text-primary)]">{opp?.closeDate ?? '-'}</div>
              </div>
              <div>
                <div className="text-xs text-[var(--color-text-tertiary)]">负责人</div>
                <div className="mt-1 text-[var(--color-text-primary)]">{opp?.owner ?? '-'}</div>
              </div>
              <div>
                <div className="text-xs text-[var(--color-text-tertiary)]">阶段</div>
                <div className="mt-1">
                  <Badge tone={stage === 'won' ? 'success' : stage === 'lost' ? 'error' : stage === 'negotiation' ? 'warning' : stage === 'proposal' ? 'info' : 'neutral'}>
                    {stage}
                  </Badge>
                </div>
              </div>
            </div>
          </CardBody>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>阶段进度</CardTitle>
          </CardHeader>
          <CardBody>
            <div className="space-y-2 text-sm">
              {stages.map((s, i) => (
                <div
                  key={s}
                  className="flex items-center justify-between gap-3 rounded-[10px] border border-[var(--color-border-subtle)] bg-[var(--color-bg-surface)] p-3"
                >
                  <div className="text-[var(--color-text-primary)]">{s}</div>
                  {i < idx ? (
                    <Badge tone="success">已完成</Badge>
                  ) : i === idx ? (
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

      <div className="mt-4 grid grid-cols-1 gap-4 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>报价（关联）</CardTitle>
          </CardHeader>
          <CardBody>
            <div className="space-y-2">
              {relatedQuotes.map((q) => (
                <Link
                  key={q.id}
                  to={`/business/crm/quotes/${encodeURIComponent(q.id)}`}
                  className="block rounded-[10px] border border-[var(--color-border-subtle)] bg-[var(--color-bg-surface)] p-3 hover:bg-black/5 dark:hover:bg-white/5"
                >
                  <div className="text-sm font-medium text-[var(--color-text-primary)]">{q.title}</div>
                  <div className="mt-1 text-xs text-[var(--color-text-tertiary)]">
                    {q.status} · {q.currency} {q.totalAmount.toLocaleString()} · 有效期 {q.validUntil}
                  </div>
                </Link>
              ))}
              {relatedQuotes.length === 0 ? (
                <div className="text-sm text-[var(--color-text-tertiary)]">暂无关联报价</div>
              ) : null}
            </div>
          </CardBody>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>跟进记录</CardTitle>
          </CardHeader>
          <CardBody>
            <div className="space-y-2">
              {relatedActivities.map((a) => {
                const contactName = a.contactId ? contacts.find((c) => c.id === a.contactId)?.name ?? a.contactId : null
                return (
                  <div
                    key={a.id}
                    className="rounded-[10px] border border-[var(--color-border-subtle)] bg-[var(--color-bg-surface)] p-3"
                  >
                    <div className="flex flex-wrap items-center justify-between gap-2">
                      <div className="text-sm font-medium text-[var(--color-text-primary)]">{a.subject}</div>
                      <Badge tone={a.status === 'done' ? 'success' : a.status === 'canceled' ? 'error' : 'info'}>
                        {a.status}
                      </Badge>
                    </div>
                    <div className="mt-1 text-xs text-[var(--color-text-tertiary)]">
                      {a.type}
                      {contactName ? ` · ${contactName}` : ''} · {a.owner} · 计划 {a.dueAt}
                    </div>
                  </div>
                )
              })}
              {relatedActivities.length === 0 ? (
                <div className="text-sm text-[var(--color-text-tertiary)]">暂无跟进记录</div>
              ) : null}
            </div>
          </CardBody>
        </Card>
      </div>
    </div>
  )
}
