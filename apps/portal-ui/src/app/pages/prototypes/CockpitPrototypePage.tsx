import { Area, AreaChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts'
import { Badge } from '../../ui/Badge'
import { Button } from '../../ui/Button'
import { Card, CardBody, CardHeader, CardTitle } from '../../ui/Card'
import { PageHeader } from '../../ui/PageHeader'
import { Select } from '../../ui/Select'

const days = [
  { day: '05-30', revenue: 1.2, cash: 0.9 },
  { day: '05-31', revenue: 1.6, cash: 1.0 },
  { day: '06-01', revenue: 1.4, cash: 1.1 },
  { day: '06-02', revenue: 1.9, cash: 1.3 },
  { day: '06-03', revenue: 2.2, cash: 1.5 },
  { day: '06-04', revenue: 1.7, cash: 1.4 },
  { day: '06-05', revenue: 2.4, cash: 1.9 },
]

const focus = [
  { kpi: '交付准时率', value: '92%', trend: '+1.2%', risk: '中', tone: 'warning' as const },
  { kpi: '外协交期风险订单', value: '2', trend: '+1', risk: '高', tone: 'error' as const },
  { kpi: '回款逾期占比', value: '3.1%', trend: '-0.4%', risk: '低', tone: 'success' as const },
  { kpi: '质量不良率', value: '0.8%', trend: '+0.1%', risk: '中', tone: 'warning' as const },
]

export function CockpitPrototypePage() {
  return (
    <div>
      <PageHeader
        title="领导数据驾驶舱（原型）"
        description="示例：一屏总览 → 重点风险 → 指标趋势（示例数据）"
        right={<Badge tone="success">Cockpit</Badge>}
      />

      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex flex-wrap items-center gap-2">
          <div className="w-[160px]">
            <Select defaultValue="sh">
              <option value="sh">上海工厂</option>
              <option value="sz">苏州工厂</option>
              <option value="all">全部工厂</option>
            </Select>
          </div>
          <div className="w-[160px]">
            <Select defaultValue="7d">
              <option value="7d">近7天</option>
              <option value="30d">近30天</option>
              <option value="mtd">本月累计</option>
            </Select>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="secondary">导出摘要</Button>
          <Button variant="primary">生成例会包</Button>
        </div>
      </div>

      <div className="mt-4 grid grid-cols-1 gap-4 lg:grid-cols-4">
        <Card className="lg:col-span-1">
          <CardHeader>
            <CardTitle>收入（亿元）</CardTitle>
          </CardHeader>
          <CardBody>
            <div className="text-3xl font-semibold text-[var(--color-text-primary)]">2.4</div>
            <div className="mt-2 text-sm text-[var(--color-text-tertiary)]">同比 +8.2% · 目标差距 -0.3</div>
          </CardBody>
        </Card>
        <Card className="lg:col-span-1">
          <CardHeader>
            <CardTitle>回款（亿元）</CardTitle>
          </CardHeader>
          <CardBody>
            <div className="text-3xl font-semibold text-[var(--color-text-primary)]">1.9</div>
            <div className="mt-2 text-sm text-[var(--color-text-tertiary)]">逾期占比 3.1% · 风险 2 笔</div>
          </CardBody>
        </Card>
        <Card className="lg:col-span-1">
          <CardHeader>
            <CardTitle>交付准时率</CardTitle>
          </CardHeader>
          <CardBody>
            <div className="text-3xl font-semibold text-[var(--color-text-primary)]">92%</div>
            <div className="mt-2 text-sm text-[var(--color-text-tertiary)]">风险订单 2 · 外协 1</div>
          </CardBody>
        </Card>
        <Card className="lg:col-span-1">
          <CardHeader>
            <CardTitle>质量不良率</CardTitle>
          </CardHeader>
          <CardBody>
            <div className="text-3xl font-semibold text-[var(--color-text-primary)]">0.8%</div>
            <div className="mt-2 text-sm text-[var(--color-text-tertiary)]">返工 3 · 客诉 0</div>
          </CardBody>
        </Card>
      </div>

      <div className="mt-4 grid grid-cols-1 gap-4 lg:grid-cols-3">
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle>收入/回款趋势（示例）</CardTitle>
            <Badge tone="neutral">可钻取</Badge>
          </CardHeader>
          <CardBody>
            <div className="h-[320px]">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={days} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                  <defs>
                    <linearGradient id="cpRev" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="var(--color-primary)" stopOpacity={0.35} />
                      <stop offset="95%" stopColor="var(--color-primary)" stopOpacity={0.02} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid stroke="var(--color-border-subtle)" strokeDasharray="3 3" />
                  <XAxis dataKey="day" stroke="var(--color-text-tertiary)" fontSize={12} />
                  <YAxis stroke="var(--color-text-tertiary)" fontSize={12} />
                  <Tooltip
                    contentStyle={{
                      background: 'var(--color-bg-surface)',
                      border: '1px solid var(--color-border-subtle)',
                      borderRadius: 10,
                    }}
                  />
                  <Area type="monotone" dataKey="revenue" stroke="var(--color-primary)" fill="url(#cpRev)" strokeWidth={2} />
                  <Area type="monotone" dataKey="cash" stroke="var(--color-domain-business)" fill="transparent" strokeWidth={2} />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </CardBody>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>重点关注</CardTitle>
            <Badge tone="warning">4</Badge>
          </CardHeader>
          <CardBody>
            <div className="divide-y divide-[var(--color-border-subtle)]">
              {focus.map((f) => (
                <div key={f.kpi} className="py-3">
                  <div className="flex items-center justify-between gap-3">
                    <div className="text-sm font-medium text-[var(--color-text-primary)]">{f.kpi}</div>
                    <Badge tone={f.tone}>{f.risk}</Badge>
                  </div>
                  <div className="mt-1 flex items-baseline justify-between gap-3">
                    <div className="text-2xl font-semibold text-[var(--color-text-primary)]">{f.value}</div>
                    <div className="text-sm text-[var(--color-text-tertiary)]">{f.trend}</div>
                  </div>
                </div>
              ))}
            </div>
            <div className="mt-3 text-xs text-[var(--color-text-tertiary)]">
              驾驶舱建议保留“钻取链路”：KPI → 责任部门 → 明细系统链接。
            </div>
          </CardBody>
        </Card>
      </div>
    </div>
  )
}

