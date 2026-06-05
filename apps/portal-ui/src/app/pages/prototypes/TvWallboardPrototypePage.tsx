import { Area, AreaChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts'
import { Badge } from '../../ui/Badge'
import { PageHeader } from '../../ui/PageHeader'

const hours = Array.from({ length: 12 }).map((_, i) => {
  const h = i + 8
  return {
    hour: `${String(h).padStart(2, '0')}:00`,
    output: Math.round(80 + Math.sin(i / 2) * 18 + i * 1.6),
    oee: Math.round(72 + Math.cos(i / 3) * 6),
  }
})

const alarms = [
  { title: 'CNC-12 主轴温度过高', meta: '10:12 · 2号产线', tone: 'error' as const },
  { title: '外协交期风险：订单 SO-240531', meta: '09:48 · 供应链', tone: 'warning' as const },
  { title: '检验超时：批次 LOT-0605-03', meta: '09:20 · 质量', tone: 'warning' as const },
  { title: '能耗异常：空压机 #3', meta: '08:56 · 动力', tone: 'info' as const },
]

export function TvWallboardPrototypePage() {
  return (
    <div>
      <PageHeader
        title="TV 大屏看板（原型）"
        description="示例：经营与生产关键指标 + 异常预警（只展示/轮播）"
        right={<Badge tone="warning">TV</Badge>}
      />

      <div className="relative left-1/2 right-1/2 -ml-[50vw] -mr-[50vw] w-screen">
        <div className="min-h-[680px] bg-[#0B1020] px-6 py-5 text-white">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <div className="text-2xl font-semibold tracking-wide">精密制造战情看板</div>
              <div className="mt-1 text-sm text-white/70">今日 06-05 · 上海工厂 · 数据示例</div>
            </div>
            <div className="flex items-center gap-2">
              <span className="rounded-full bg-white/10 px-3 py-1 text-sm">轮播：经营/产线/质量</span>
              <span className="rounded-full bg-white/10 px-3 py-1 text-sm">刷新：30s</span>
            </div>
          </div>

          <div className="mt-5 grid grid-cols-1 gap-4 lg:grid-cols-4">
            <div className="rounded-[14px] border border-white/10 bg-white/5 p-4">
              <div className="text-sm text-white/70">当日产量</div>
              <div className="mt-2 text-4xl font-semibold">1,284</div>
              <div className="mt-2 text-sm text-white/70">计划达成 96% · 异常停机 12min</div>
            </div>
            <div className="rounded-[14px] border border-white/10 bg-white/5 p-4">
              <div className="text-sm text-white/70">OEE</div>
              <div className="mt-2 text-4xl font-semibold">78%</div>
              <div className="mt-2 text-sm text-white/70">趋势 +3% · 瓶颈：2号产线</div>
            </div>
            <div className="rounded-[14px] border border-white/10 bg-white/5 p-4">
              <div className="text-sm text-white/70">交付准时率</div>
              <div className="mt-2 text-4xl font-semibold">92%</div>
              <div className="mt-2 text-sm text-white/70">风险订单 2 · 外协 1</div>
            </div>
            <div className="rounded-[14px] border border-white/10 bg-white/5 p-4">
              <div className="text-sm text-white/70">质量不良率</div>
              <div className="mt-2 text-4xl font-semibold">0.8%</div>
              <div className="mt-2 text-sm text-white/70">今日检验 36 单 · 返工 3</div>
            </div>
          </div>

          <div className="mt-4 grid grid-cols-1 gap-4 lg:grid-cols-3">
            <div className="rounded-[14px] border border-white/10 bg-white/5 p-4 lg:col-span-2">
              <div className="flex items-center justify-between gap-3">
                <div className="text-sm font-semibold text-white/90">小时产出 & OEE（示例）</div>
                <div className="text-xs text-white/60">数据延迟 2min</div>
              </div>
              <div className="mt-3 h-[320px]">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={hours} margin={{ top: 10, right: 20, left: -10, bottom: 0 }}>
                    <defs>
                      <linearGradient id="tvOut" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#5EEAD4" stopOpacity={0.45} />
                        <stop offset="95%" stopColor="#5EEAD4" stopOpacity={0.02} />
                      </linearGradient>
                    </defs>
                    <CartesianGrid stroke="rgba(255,255,255,0.12)" strokeDasharray="3 3" />
                    <XAxis dataKey="hour" stroke="rgba(255,255,255,0.6)" fontSize={12} />
                    <YAxis stroke="rgba(255,255,255,0.6)" fontSize={12} />
                    <Tooltip
                      contentStyle={{
                        background: 'rgba(15,23,42,0.95)',
                        border: '1px solid rgba(255,255,255,0.12)',
                        borderRadius: 12,
                        color: 'white',
                      }}
                      labelStyle={{ color: 'rgba(255,255,255,0.7)' }}
                    />
                    <Area type="monotone" dataKey="output" stroke="#5EEAD4" fill="url(#tvOut)" strokeWidth={2} />
                    <Area type="monotone" dataKey="oee" stroke="#60A5FA" fill="transparent" strokeWidth={2} />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </div>

            <div className="rounded-[14px] border border-white/10 bg-white/5 p-4">
              <div className="flex items-center justify-between gap-3">
                <div className="text-sm font-semibold text-white/90">异常与预警</div>
                <div className="text-xs text-white/60">滚动播报</div>
              </div>
              <div className="mt-3 flex flex-col gap-3">
                {alarms.map((a) => (
                  <div key={a.title} className="rounded-[12px] border border-white/10 bg-white/5 p-3">
                    <div className="flex items-start justify-between gap-3">
                      <div className="min-w-0">
                        <div className="truncate text-sm text-white/90">{a.title}</div>
                        <div className="mt-1 truncate text-xs text-white/60">{a.meta}</div>
                      </div>
                      <span
                        className="shrink-0 rounded-full px-2 py-1 text-xs"
                        style={{
                          background:
                            a.tone === 'error'
                              ? 'rgba(248,113,113,0.18)'
                              : a.tone === 'warning'
                                ? 'rgba(251,191,36,0.18)'
                                : 'rgba(96,165,250,0.18)',
                          border:
                            a.tone === 'error'
                              ? '1px solid rgba(248,113,113,0.28)'
                              : a.tone === 'warning'
                                ? '1px solid rgba(251,191,36,0.28)'
                                : '1px solid rgba(96,165,250,0.28)',
                        }}
                      >
                        {a.tone === 'error' ? '高' : a.tone === 'warning' ? '中' : '低'}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
              <div className="mt-4 text-xs text-white/60">
                大屏建议只保留“展示 + 扫码跳转”，处理动作放到手机/Pad。
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

