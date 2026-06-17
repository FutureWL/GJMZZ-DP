import { alarms, incidentSeed, morningMeetingGroupKpis, morningMeetingRisks, workOrders } from '@factory/mock-data'
import { Area, AreaChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts'
import { ScaleFit } from '../layout/ScaleFit'
import { ScreenHeader } from '../layout/ScreenHeader'
import { useNow } from '../shared/useNow'
import { KpiCard } from '../ui/KpiCard'
import { Section } from '../ui/Section'

const oeeTrend = [
  { t: '08:00', v: 78.2 },
  { t: '09:00', v: 80.1 },
  { t: '10:00', v: 79.4 },
  { t: '11:00', v: 81.5 },
  { t: '12:00', v: 80.6 },
  { t: '13:00', v: 82.0 },
  { t: '14:00', v: 81.2 },
  { t: '15:00', v: 82.7 },
  { t: '16:00', v: 83.1 },
]

function severityColor(s: string) {
  if (s === 'critical') return 'text-rose-200 bg-rose-500/15'
  if (s === 'high') return 'text-rose-200 bg-rose-500/15'
  if (s === 'medium') return 'text-amber-200 bg-amber-500/15'
  return 'text-slate-200 bg-slate-500/15'
}

export function ProductionScreen() {
  const now = useNow(1000)

  return (
    <ScaleFit designWidth={1920} designHeight={1080}>
      <div className="h-full w-full p-8">
        <ScreenHeader
          title="生产概览"
          subtitle="OTD / OEE / 异常与告警 / 在制工单"
          metaRight={`更新时间：${now.toLocaleString('zh-CN', { hour12: false })}`}
        />

        <div className="mt-6 grid grid-cols-6 gap-4">
          {morningMeetingGroupKpis.slice(0, 6).map((k) => (
            <KpiCard key={k.key} label={k.label} value={k.value} helper={k.helper} status={k.status} />
          ))}
        </div>

        <div className="mt-6 grid grid-cols-12 gap-4">
          <div className="col-span-8 grid grid-rows-2 gap-4">
            <Section title="OEE 趋势" subtitle="近 9 小时（示例）">
              <div className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={oeeTrend} margin={{ top: 10, right: 20, left: 0, bottom: 0 }}>
                    <defs>
                      <linearGradient id="oeeFill" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#34d399" stopOpacity={0.32} />
                        <stop offset="95%" stopColor="#34d399" stopOpacity={0.0} />
                      </linearGradient>
                    </defs>
                    <CartesianGrid stroke="rgba(255,255,255,0.07)" vertical={false} />
                    <XAxis dataKey="t" stroke="rgba(210,220,240,0.55)" tickLine={false} axisLine={false} />
                    <YAxis
                      domain={[70, 90]}
                      stroke="rgba(210,220,240,0.55)"
                      tickLine={false}
                      axisLine={false}
                      width={30}
                    />
                    <Tooltip
                      contentStyle={{
                        background: 'rgba(17,27,46,0.92)',
                        border: '1px solid rgba(255,255,255,0.14)',
                        borderRadius: 10,
                      }}
                      labelStyle={{ color: 'rgba(246,248,252,0.9)' }}
                      itemStyle={{ color: 'rgba(246,248,252,0.9)' }}
                      formatter={(v) => [`${v as number}%`, 'OEE']}
                    />
                    <Area type="monotone" dataKey="v" stroke="#34d399" strokeWidth={2} fill="url(#oeeFill)" />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </Section>

            <Section title="在制工单" subtitle="生产执行 / 进度">
              <div className="grid grid-cols-5 gap-2 rounded-xl border border-[var(--color-border-subtle)] bg-[var(--color-bg-surface-strong)] px-3 py-2 text-xs text-[var(--color-text-tertiary)]">
                <div>工单</div>
                <div>产品</div>
                <div>产线</div>
                <div>状态</div>
                <div className="text-right">进度</div>
              </div>
              <div className="mt-2 space-y-2">
                {workOrders.map((w) => (
                  <div
                    key={w.id}
                    className="grid grid-cols-5 items-center gap-2 rounded-lg border border-[var(--color-border-subtle)] bg-white/0 px-3 py-2"
                  >
                    <div className="text-sm font-medium text-[var(--color-text-primary)]">{w.id}</div>
                    <div className="text-sm text-[var(--color-text-secondary)]">{w.product}</div>
                    <div className="text-sm text-[var(--color-text-secondary)]">{w.line}</div>
                    <div className="text-sm text-[var(--color-text-secondary)]">{w.status}</div>
                    <div className="text-right text-sm text-[var(--color-text-secondary)]">{w.progress}%</div>
                  </div>
                ))}
              </div>
            </Section>
          </div>

          <div className="col-span-4 grid grid-rows-2 gap-4">
            <Section title="告警" subtitle="按等级与时间">
              <div className="space-y-2">
                {alarms.map((a) => (
                  <div
                    key={a.id}
                    className="rounded-xl border border-[var(--color-border-subtle)] bg-white/0 px-3 py-2"
                  >
                    <div className="flex items-center justify-between gap-3">
                      <div className="text-sm font-medium text-[var(--color-text-primary)]">{a.title}</div>
                      <span className={`rounded-full px-2 py-0.5 text-xs font-medium ${severityColor(a.severity)}`}>
                        {a.severity}
                      </span>
                    </div>
                    <div className="mt-1 text-xs text-[var(--color-text-tertiary)]">
                      {a.line} · {a.equipment} · {a.startAt}
                    </div>
                  </div>
                ))}
              </div>
            </Section>

            <Section title="重点风险 / 异常" subtitle="近 24h · 摘要">
              <div className="space-y-2">
                {morningMeetingRisks.slice(0, 3).map((r) => (
                  <div
                    key={r.id}
                    className="rounded-xl border border-[var(--color-border-subtle)] bg-white/0 px-3 py-2"
                  >
                    <div className="flex items-center justify-between gap-3">
                      <div className="text-sm font-medium text-[var(--color-text-primary)]">{r.title}</div>
                      <span className={`rounded-full px-2 py-0.5 text-xs font-medium ${severityColor(r.severity)}`}>
                        {r.severity}
                      </span>
                    </div>
                    <div className="mt-1 text-xs text-[var(--color-text-tertiary)]">
                      {r.factoryName}
                      {r.line ? ` · ${r.line}` : ''} · {r.updatedAt}
                    </div>
                    <div className="mt-2 text-sm text-[var(--color-text-secondary)]">{r.summary}</div>
                  </div>
                ))}
              </div>
            </Section>
          </div>
        </div>

        <div className="mt-6">
          <Section title="异常记录" subtitle="最近记录 · 便于追溯">
            <div className="grid grid-cols-6 gap-2 rounded-xl border border-[var(--color-border-subtle)] bg-[var(--color-bg-surface-strong)] px-3 py-2 text-xs text-[var(--color-text-tertiary)]">
              <div>时间</div>
              <div>类型</div>
              <div>工厂</div>
              <div>产线</div>
              <div>工单</div>
              <div>摘要</div>
            </div>
            <div className="mt-2 space-y-2">
              {incidentSeed.map((i) => (
                <div
                  key={i.id}
                  className="grid grid-cols-6 items-center gap-2 rounded-lg border border-[var(--color-border-subtle)] bg-white/0 px-3 py-2"
                >
                  <div className="text-sm text-[var(--color-text-secondary)]">{i.occurredAt}</div>
                  <div className="text-sm text-[var(--color-text-secondary)]">{i.type}</div>
                  <div className="text-sm text-[var(--color-text-secondary)]">{i.factoryName}</div>
                  <div className="text-sm text-[var(--color-text-secondary)]">{i.line ?? '-'}</div>
                  <div className="text-sm text-[var(--color-text-secondary)]">{i.workOrderId ?? '-'}</div>
                  <div className="truncate text-sm text-[var(--color-text-secondary)]">{i.description}</div>
                </div>
              ))}
            </div>
          </Section>
        </div>
      </div>
    </ScaleFit>
  )
}
