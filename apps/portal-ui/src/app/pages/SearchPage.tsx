import { Link, useSearchParams } from 'react-router-dom'
import { alarms, itTickets, purchaseRequests, suppliers, traces, workOrders } from '../mock/data'
import { Badge } from '../ui/Badge'
import { Card, CardBody, CardHeader, CardTitle } from '../ui/Card'
import { PageHeader } from '../ui/PageHeader'

type ResultItem = {
  label: string
  meta?: string
  to: string
  portal: 'business' | 'management' | 'production' | 'support' | 'additional'
}

export function SearchPage() {
  const [params] = useSearchParams()
  const q = (params.get('q') ?? '').trim().toLowerCase()

  const items: ResultItem[] = [
    ...alarms.map((a) => ({
      label: `${a.title}（${a.id}）`,
      meta: `${a.equipment} · ${a.line}`,
      to: '/production/alarms',
      portal: 'production' as const,
    })),
    ...workOrders.map((w) => ({
      label: `${w.id} · ${w.product}`,
      meta: `${w.line} · ${w.progress}%`,
      to: `/production/workorders/${encodeURIComponent(w.id)}`,
      portal: 'production' as const,
    })),
    ...traces.map((t) => ({
      label: `${t.id} · ${t.product}`,
      meta: `${t.workOrderId} · ${t.lastStation}`,
      to: '/production/trace',
      portal: 'production' as const,
    })),
    ...purchaseRequests.map((p) => ({
      label: `${p.id} · ${p.title}`,
      meta: `¥${p.amount.toLocaleString()} · ${p.requester}`,
      to: `/management/procurement/pr/${encodeURIComponent(p.id)}`,
      portal: 'management' as const,
    })),
    ...suppliers.map((s) => ({
      label: `${s.name}（${s.id}）`,
      meta: `OTD ${s.otd}% · PPM ${s.ppm}`,
      to: `/management/srm/suppliers/${encodeURIComponent(s.id)}`,
      portal: 'management' as const,
    })),
    ...itTickets.map((t) => ({
      label: `${t.id} · ${t.title}`,
      meta: `${t.requester} · ${t.status}`,
      to: `/support/it/tickets/${encodeURIComponent(t.id)}`,
      portal: 'support' as const,
    })),
  ]

  const filtered = q ? items.filter((i) => `${i.label} ${i.meta ?? ''}`.toLowerCase().includes(q)) : items
  const groups = {
    business: filtered.filter((x) => x.portal === 'business'),
    management: filtered.filter((x) => x.portal === 'management'),
    production: filtered.filter((x) => x.portal === 'production'),
    support: filtered.filter((x) => x.portal === 'support'),
    additional: filtered.filter((x) => x.portal === 'additional'),
  }

  return (
    <div>
      <PageHeader title="全局搜索" description={q ? `关键词：${q}` : '输入关键词后回车（示例）'} />
      <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
        {(
          [
            { key: 'business', label: '经营', tone: 'domain-business' },
            { key: 'management', label: '管理', tone: 'domain-management' },
            { key: 'production', label: '生产', tone: 'domain-production' },
            { key: 'support', label: '支持', tone: 'domain-support' },
            { key: 'additional', label: '附加', tone: 'domain-additional' },
          ] as const
        ).map((g) => (
          <Card key={g.key}>
            <CardHeader>
              <CardTitle>
                <span className="inline-flex items-center gap-2">
                  <Badge tone={g.tone}>{g.label}</Badge>
                  <span className="text-xs text-[var(--color-text-tertiary)]">{groups[g.key].length} 条</span>
                </span>
              </CardTitle>
            </CardHeader>
            <CardBody>
              <div className="space-y-2">
                {groups[g.key].slice(0, 8).map((it) => (
                  <Link
                    key={it.to + it.label}
                    to={it.to}
                    className="block rounded-[10px] border border-[var(--color-border-subtle)] bg-[var(--color-bg-surface)] p-3 hover:bg-black/5 dark:hover:bg-white/5"
                  >
                    <div className="text-sm font-medium text-[var(--color-text-primary)]">{it.label}</div>
                    {it.meta ? <div className="mt-1 text-xs text-[var(--color-text-tertiary)]">{it.meta}</div> : null}
                  </Link>
                ))}
                {groups[g.key].length === 0 ? (
                  <div className="text-sm text-[var(--color-text-tertiary)]">无匹配结果</div>
                ) : null}
              </div>
            </CardBody>
          </Card>
        ))}
      </div>
    </div>
  )
}

