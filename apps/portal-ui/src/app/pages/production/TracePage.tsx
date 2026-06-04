import { useMemo, useState } from 'react'
import { traces } from '../../mock/data'
import type { TraceRecord } from '../../mock/models'
import { Badge, type Tone } from '../../ui/Badge'
import { Card, CardBody, CardHeader, CardTitle } from '../../ui/Card'
import { Input } from '../../ui/Input'
import { PageHeader } from '../../ui/PageHeader'

function qualityTone(q: string): Tone {
  if (q === 'ok') return 'success'
  if (q === 'hold') return 'warning'
  if (q === 'ng') return 'error'
  return 'neutral'
}

export function TracePage() {
  const [query, setQuery] = useState('')
  const [selected, setSelected] = useState<TraceRecord | null>(null)

  const results = useMemo(() => {
    if (!query.trim()) return traces
    const q = query.trim().toLowerCase()
    return traces.filter((t) => t.id.toLowerCase().includes(q) || t.workOrderId.toLowerCase().includes(q))
  }, [query])

  return (
    <div>
      <PageHeader title="追溯查询" description="输入批次号/序列号/工单号（示例）" />

      <div className="mb-4">
        <Input value={query} onChange={(e) => setQuery(e.target.value)} placeholder="例如：SN- / BATCH- / WO-" />
      </div>

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
        <Card className="lg:col-span-1">
          <CardHeader>
            <CardTitle>结果</CardTitle>
          </CardHeader>
          <CardBody>
            <div className="space-y-2">
              {results.map((r) => (
                <button
                  key={r.id}
                  className="w-full rounded-[10px] border border-[var(--color-border-subtle)] bg-[var(--color-bg-surface)] p-3 text-left hover:bg-black/5 dark:hover:bg-white/5"
                  onClick={() => setSelected(r)}
                >
                  <div className="flex items-center justify-between gap-3">
                    <div className="min-w-0">
                      <div className="truncate text-sm font-medium text-[var(--color-text-primary)]">{r.id}</div>
                      <div className="mt-1 text-xs text-[var(--color-text-tertiary)]">
                        {r.product} · {r.workOrderId}
                      </div>
                    </div>
                    <Badge tone={qualityTone(r.quality)}>{r.quality}</Badge>
                  </div>
                </button>
              ))}
            </div>
          </CardBody>
        </Card>

        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle>追溯链路详情</CardTitle>
          </CardHeader>
          <CardBody>
            {selected ? (
              <div className="space-y-4 text-sm">
                <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
                  <div>
                    <div className="text-xs text-[var(--color-text-tertiary)]">对象</div>
                    <div className="mt-1 text-[var(--color-text-primary)]">{selected.id}</div>
                  </div>
                  <div>
                    <div className="text-xs text-[var(--color-text-tertiary)]">质量</div>
                    <div className="mt-1">
                      <Badge tone={qualityTone(selected.quality)}>{selected.quality}</Badge>
                    </div>
                  </div>
                  <div>
                    <div className="text-xs text-[var(--color-text-tertiary)]">工单</div>
                    <div className="mt-1 text-[var(--color-text-primary)]">{selected.workOrderId}</div>
                  </div>
                  <div>
                    <div className="text-xs text-[var(--color-text-tertiary)]">最近工序</div>
                    <div className="mt-1 text-[var(--color-text-primary)]">{selected.lastStation}</div>
                  </div>
                </div>

                <div className="rounded-[10px] border border-[var(--color-border-subtle)] bg-[var(--color-bg-surface)] p-3">
                  <div className="text-xs font-semibold text-[var(--color-text-tertiary)]">链路节点（占位）</div>
                  <div className="mt-2 grid grid-cols-1 gap-2 md:grid-cols-3">
                    {['来料检验', '加工', selected.lastStation].map((n) => (
                      <div
                        key={n}
                        className="rounded-[10px] border border-[var(--color-border-subtle)] bg-[var(--color-bg-page)] p-3"
                      >
                        <div className="text-sm font-medium text-[var(--color-text-primary)]">{n}</div>
                        <div className="mt-1 text-xs text-[var(--color-text-tertiary)]">关键参数/检验结果摘要位</div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            ) : (
              <div className="text-sm text-[var(--color-text-tertiary)]">从左侧选择一条记录查看详情。</div>
            )}
          </CardBody>
        </Card>
      </div>
    </div>
  )
}
