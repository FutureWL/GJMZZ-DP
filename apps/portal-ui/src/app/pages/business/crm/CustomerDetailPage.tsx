import { useMemo, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import type { Customer } from '../../../mock/models'
import { contacts, crmActivities, opportunities, quotes } from '../../../mock/data'
import { useCrmData } from '../../../state/crm/CrmDataContext'
import { Badge } from '../../../ui/Badge'
import { Button } from '../../../ui/Button'
import { Card, CardBody, CardHeader, CardTitle } from '../../../ui/Card'
import { Input } from '../../../ui/Input'
import { PageHeader } from '../../../ui/PageHeader'
import { Select } from '../../../ui/Select'

const CUSTOMER_STATUS_LABEL: Record<Customer['status'], string> = {
  active: '启用',
  inactive: '停用',
}

function statusLabel(status?: Customer['status']) {
  if (!status) return '-'
  return CUSTOMER_STATUS_LABEL[status] ?? status
}

function toDateTimeLocal(value?: string) {
  if (!value) return ''
  return value.replace(' ', 'T')
}

function fromDateTimeLocal(value: string) {
  const v = value.trim()
  if (!v) return undefined
  return v.replace('T', ' ')
}

function tagsToString(tags?: string[]) {
  return (tags ?? []).join(', ')
}

function parseTags(value: string) {
  const v = value.trim()
  if (!v) return undefined
  const tags = v
    .split(',')
    .map((x) => x.trim())
    .filter(Boolean)
  return tags.length ? tags : undefined
}

export function CustomerDetailPage() {
  const { id } = useParams()
  const { customers, updateCustomer } = useCrmData()
  const customer = customers.find((c) => c.id === id)
  const related = opportunities.filter((o) => o.customerId === id)
  const relatedContacts = contacts.filter((c) => c.customerId === id)
  const relatedQuotes = quotes.filter((q) => q.customerId === id)
  const relatedActivities = [...crmActivities]
    .filter((a) => a.customerId === id)
    .sort((a, b) => b.createdAt.localeCompare(a.createdAt))

  const [isEditing, setIsEditing] = useState(false)
  const [draft, setDraft] = useState<{
    name: string
    industry: string
    level: Customer['level']
    status: Customer['status']
    owner: string
    tags: string
    risk: '' | NonNullable<Customer['risk']>
    credit: string
    nextFollowUpAt: string
    nextFollowUpNote: string
  } | null>(null)

  const canEdit = Boolean(customer)

  const startEdit = () => {
    if (!customer) return
    setDraft({
      name: customer.name ?? '',
      industry: customer.industry ?? '',
      level: customer.level ?? 'C',
      status: customer.status ?? 'active',
      owner: customer.owner ?? '',
      tags: tagsToString(customer.tags),
      risk: customer.risk ?? '',
      credit: typeof customer.credit === 'number' ? String(customer.credit) : '',
      nextFollowUpAt: toDateTimeLocal(customer.nextFollowUpAt),
      nextFollowUpNote: customer.nextFollowUpNote ?? '',
    })
    setIsEditing(true)
  }

  const cancelEdit = () => {
    setIsEditing(false)
    setDraft(null)
  }

  const saveEdit = () => {
    if (!customer || !draft) return
    const credit = draft.credit.trim() ? Number(draft.credit) : undefined
    const updated: Customer = {
      ...customer,
      name: draft.name.trim() || customer.name,
      industry: draft.industry.trim(),
      level: draft.level,
      status: draft.status,
      owner: draft.owner.trim(),
      tags: parseTags(draft.tags),
      risk: draft.risk || undefined,
      credit: Number.isFinite(credit) ? credit : undefined,
      nextFollowUpAt: fromDateTimeLocal(draft.nextFollowUpAt),
      nextFollowUpNote: draft.nextFollowUpNote.trim() ? draft.nextFollowUpNote.trim() : undefined,
    }
    updateCustomer(updated)
    setIsEditing(false)
    setDraft(null)
  }

  const baseTitle = useMemo(() => {
    if (!customer) return '客户详情'
    return `客户详情：${customer.name}`
  }, [customer])

  return (
    <div>
      <PageHeader title={baseTitle} description="基础信息 / 联系人 / 报价 / 近期互动（界面示例）" />

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle>基础信息</CardTitle>
            <div className="flex flex-wrap items-center gap-2">
              {isEditing ? (
                <>
                  <Button variant="primary" size="sm" onClick={saveEdit} disabled={!canEdit}>
                    保存
                  </Button>
                  <Button variant="secondary" size="sm" onClick={cancelEdit}>
                    取消
                  </Button>
                </>
              ) : (
                <Button variant="secondary" size="sm" onClick={startEdit} disabled={!canEdit}>
                  编辑
                </Button>
              )}
            </div>
          </CardHeader>
          <CardBody>
            {isEditing && draft ? (
              <div className="grid grid-cols-1 gap-3 text-sm md:grid-cols-2">
                <div className="md:col-span-2">
                  <div className="text-xs text-[var(--color-text-tertiary)]">客户名称</div>
                  <div className="mt-1">
                    <Input value={draft.name} onChange={(e) => setDraft({ ...draft, name: e.target.value })} />
                  </div>
                </div>
                <div>
                  <div className="text-xs text-[var(--color-text-tertiary)]">行业</div>
                  <div className="mt-1">
                    <Input
                      value={draft.industry}
                      onChange={(e) => setDraft({ ...draft, industry: e.target.value })}
                    />
                  </div>
                </div>
                <div>
                  <div className="text-xs text-[var(--color-text-tertiary)]">负责人</div>
                  <div className="mt-1">
                    <Input value={draft.owner} onChange={(e) => setDraft({ ...draft, owner: e.target.value })} />
                  </div>
                </div>
                <div>
                  <div className="text-xs text-[var(--color-text-tertiary)]">等级</div>
                  <div className="mt-1">
                    <Select
                      value={draft.level}
                      onChange={(e) => setDraft({ ...draft, level: e.target.value as Customer['level'] })}
                    >
                      <option value="A">A</option>
                      <option value="B">B</option>
                      <option value="C">C</option>
                    </Select>
                  </div>
                </div>
                <div>
                  <div className="text-xs text-[var(--color-text-tertiary)]">状态</div>
                  <div className="mt-1">
                    <Select
                      value={draft.status}
                      onChange={(e) => setDraft({ ...draft, status: e.target.value as Customer['status'] })}
                    >
                      <option value="active">启用</option>
                      <option value="inactive">停用</option>
                    </Select>
                  </div>
                </div>
                <div className="md:col-span-2">
                  <div className="text-xs text-[var(--color-text-tertiary)]">标签（逗号分隔）</div>
                  <div className="mt-1">
                    <Input value={draft.tags} onChange={(e) => setDraft({ ...draft, tags: e.target.value })} />
                  </div>
                </div>
                <div>
                  <div className="text-xs text-[var(--color-text-tertiary)]">风险</div>
                  <div className="mt-1">
                    <Select
                      value={draft.risk}
                      onChange={(e) => setDraft({ ...draft, risk: e.target.value as typeof draft.risk })}
                    >
                      <option value="">-</option>
                      <option value="low">low</option>
                      <option value="medium">medium</option>
                      <option value="high">high</option>
                      <option value="critical">critical</option>
                    </Select>
                  </div>
                </div>
                <div>
                  <div className="text-xs text-[var(--color-text-tertiary)]">信用额度</div>
                  <div className="mt-1">
                    <Input
                      type="number"
                      value={draft.credit}
                      onChange={(e) => setDraft({ ...draft, credit: e.target.value })}
                    />
                  </div>
                </div>
                <div>
                  <div className="text-xs text-[var(--color-text-tertiary)]">下次跟进时间</div>
                  <div className="mt-1">
                    <Input
                      type="datetime-local"
                      value={draft.nextFollowUpAt}
                      onChange={(e) => setDraft({ ...draft, nextFollowUpAt: e.target.value })}
                    />
                  </div>
                </div>
                <div>
                  <div className="text-xs text-[var(--color-text-tertiary)]">下次跟进备注</div>
                  <div className="mt-1">
                    <Input
                      value={draft.nextFollowUpNote}
                      onChange={(e) => setDraft({ ...draft, nextFollowUpNote: e.target.value })}
                    />
                  </div>
                </div>
              </div>
            ) : (
              <div className="grid grid-cols-1 gap-3 text-sm md:grid-cols-2">
                <div className="md:col-span-2">
                  <div className="text-xs text-[var(--color-text-tertiary)]">客户名称</div>
                  <div className="mt-1 text-[var(--color-text-primary)]">{customer?.name ?? '-'}</div>
                </div>
                <div>
                  <div className="text-xs text-[var(--color-text-tertiary)]">客户ID</div>
                  <div className="mt-1 text-[var(--color-text-primary)]">{customer?.id ?? '-'}</div>
                </div>
                <div>
                  <div className="text-xs text-[var(--color-text-tertiary)]">行业</div>
                  <div className="mt-1 text-[var(--color-text-primary)]">{customer?.industry ?? '-'}</div>
                </div>
                <div>
                  <div className="text-xs text-[var(--color-text-tertiary)]">等级</div>
                  <div className="mt-1">
                    <Badge tone="neutral">{customer?.level ?? '-'}</Badge>
                  </div>
                </div>
                <div>
                  <div className="text-xs text-[var(--color-text-tertiary)]">状态</div>
                  <div className="mt-1">
                    <Badge tone="neutral">{statusLabel(customer?.status)}</Badge>
                  </div>
                </div>
                <div>
                  <div className="text-xs text-[var(--color-text-tertiary)]">负责人</div>
                  <div className="mt-1 text-[var(--color-text-primary)]">{customer?.owner ?? '-'}</div>
                </div>
                <div>
                  <div className="text-xs text-[var(--color-text-tertiary)]">标签</div>
                  <div className="mt-1 text-[var(--color-text-primary)]">
                    {customer?.tags?.length ? customer.tags.join('，') : '-'}
                  </div>
                </div>
                <div>
                  <div className="text-xs text-[var(--color-text-tertiary)]">风险</div>
                  <div className="mt-1 text-[var(--color-text-primary)]">{customer?.risk ?? '-'}</div>
                </div>
                <div>
                  <div className="text-xs text-[var(--color-text-tertiary)]">信用额度</div>
                  <div className="mt-1 text-[var(--color-text-primary)]">
                    {typeof customer?.credit === 'number' ? customer.credit.toLocaleString() : '-'}
                  </div>
                </div>
                <div className="md:col-span-2">
                  <div className="text-xs text-[var(--color-text-tertiary)]">最近联系时间</div>
                  <div className="mt-1 text-[var(--color-text-primary)]">{customer?.lastContactAt ?? '-'}</div>
                </div>
                <div>
                  <div className="text-xs text-[var(--color-text-tertiary)]">下次跟进时间</div>
                  <div className="mt-1 text-[var(--color-text-primary)]">{customer?.nextFollowUpAt ?? '-'}</div>
                </div>
                <div>
                  <div className="text-xs text-[var(--color-text-tertiary)]">下次跟进备注</div>
                  <div className="mt-1 text-[var(--color-text-primary)]">{customer?.nextFollowUpNote ?? '-'}</div>
                </div>
              </div>
            )}
          </CardBody>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>联系人</CardTitle>
          </CardHeader>
          <CardBody>
            <div className="space-y-2">
              {relatedContacts.map((c) => (
                <Link
                  key={c.id}
                  to={`/business/crm/contacts/${encodeURIComponent(c.id)}`}
                  className="block rounded-[10px] border border-[var(--color-border-subtle)] bg-[var(--color-bg-surface)] p-3 hover:bg-black/5 dark:hover:bg-white/5"
                >
                  <div className="text-sm font-medium text-[var(--color-text-primary)]">{c.name}</div>
                  <div className="mt-1 text-xs text-[var(--color-text-tertiary)]">
                    {c.title} · {c.phone} · {c.email}
                  </div>
                </Link>
              ))}
              {relatedContacts.length === 0 ? (
                <div className="text-sm text-[var(--color-text-tertiary)]">暂无联系人</div>
              ) : null}
            </div>
          </CardBody>
        </Card>
      </div>

      <div className="mt-4 grid grid-cols-1 gap-4 lg:grid-cols-3">
        <Card>
          <CardHeader>
            <CardTitle>机会（关联）</CardTitle>
          </CardHeader>
          <CardBody>
            <div className="space-y-2">
              {related.map((o) => (
                <Link
                  key={o.id}
                  to={`/business/crm/opportunities/${encodeURIComponent(o.id)}`}
                  className="block rounded-[10px] border border-[var(--color-border-subtle)] bg-[var(--color-bg-surface)] p-3 hover:bg-black/5 dark:hover:bg-white/5"
                >
                  <div className="text-sm font-medium text-[var(--color-text-primary)]">{o.name}</div>
                  <div className="mt-1 text-xs text-[var(--color-text-tertiary)]">
                    {o.stage} · ¥{o.amount.toLocaleString()} · 预计 {o.closeDate}
                  </div>
                </Link>
              ))}
              {related.length === 0 ? (
                <div className="text-sm text-[var(--color-text-tertiary)]">暂无关联机会</div>
              ) : null}
            </div>
          </CardBody>
        </Card>
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
                <div className="text-sm text-[var(--color-text-tertiary)]">暂无报价</div>
              ) : null}
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
                    <Badge tone={a.status === 'done' ? 'success' : a.status === 'canceled' ? 'error' : 'info'}>
                      {a.status}
                    </Badge>
                  </div>
                  <div className="mt-1 text-xs text-[var(--color-text-tertiary)]">
                    {a.type} · {a.owner} · 计划 {a.dueAt}
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
