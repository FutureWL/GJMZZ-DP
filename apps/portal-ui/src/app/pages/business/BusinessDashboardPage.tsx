import { Area, AreaChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts'
import { Badge } from '../../ui/Badge'
import { Card, CardBody, CardHeader, CardTitle } from '../../ui/Card'
import { PageHeader } from '../../ui/PageHeader'

const trend = [
  { day: '05-30', revenue: 1.2, orders: 42 },
  { day: '05-31', revenue: 1.6, orders: 51 },
  { day: '06-01', revenue: 1.4, orders: 44 },
  { day: '06-02', revenue: 1.9, orders: 58 },
  { day: '06-03', revenue: 2.2, orders: 61 },
  { day: '06-04', revenue: 1.7, orders: 49 },
  { day: '06-05', revenue: 2.4, orders: 66 },
]

export function BusinessDashboardPage() {
  return (
    <div>
      <PageHeader
        title="经营驾驶舱"
        description="高层摘要视图：结果、趋势与风险提示（示例数据）"
        right={<Badge tone="domain-business">经营</Badge>}
      />

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-4">
        <Card className="lg:col-span-1">
          <CardHeader>
            <CardTitle>收入（亿元）</CardTitle>
          </CardHeader>
          <CardBody>
            <div className="text-3xl font-semibold text-[var(--color-text-primary)]">2.4</div>
            <div className="mt-2 text-sm text-[var(--color-text-tertiary)]">同比 +8.2% / 目标差距 -0.3</div>
          </CardBody>
        </Card>
        <Card className="lg:col-span-1">
          <CardHeader>
            <CardTitle>订单数</CardTitle>
          </CardHeader>
          <CardBody>
            <div className="text-3xl font-semibold text-[var(--color-text-primary)]">66</div>
            <div className="mt-2 text-sm text-[var(--color-text-tertiary)]">环比 +12 / 重点客户 8</div>
          </CardBody>
        </Card>
        <Card className="lg:col-span-1">
          <CardHeader>
            <CardTitle>回款（亿元）</CardTitle>
          </CardHeader>
          <CardBody>
            <div className="text-3xl font-semibold text-[var(--color-text-primary)]">1.9</div>
            <div className="mt-2 text-sm text-[var(--color-text-tertiary)]">逾期占比 3.1%（占位）</div>
          </CardBody>
        </Card>
        <Card className="lg:col-span-1">
          <CardHeader>
            <CardTitle>风险提示</CardTitle>
          </CardHeader>
          <CardBody>
            <div className="flex flex-col gap-2 text-sm">
              <div className="flex items-center justify-between gap-3">
                <div className="text-[var(--color-text-secondary)]">外协交期风险</div>
                <Badge tone="warning">2</Badge>
              </div>
              <div className="flex items-center justify-between gap-3">
                <div className="text-[var(--color-text-secondary)]">供应商合规到期</div>
                <Badge tone="warning">1</Badge>
              </div>
              <div className="flex items-center justify-between gap-3">
                <div className="text-[var(--color-text-secondary)]">流程超时</div>
                <Badge tone="error">1</Badge>
              </div>
            </div>
          </CardBody>
        </Card>
      </div>

      <div className="mt-4 grid grid-cols-1 gap-4 lg:grid-cols-3">
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle>收入趋势（示例）</CardTitle>
          </CardHeader>
          <CardBody>
            <div className="h-[280px]">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={trend} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                  <defs>
                    <linearGradient id="rev" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="var(--color-domain-business)" stopOpacity={0.35} />
                      <stop offset="95%" stopColor="var(--color-domain-business)" stopOpacity={0.02} />
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
                  <Area
                    type="monotone"
                    dataKey="revenue"
                    stroke="var(--color-domain-business)"
                    fill="url(#rev)"
                    strokeWidth={2}
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </CardBody>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>重点事项（占位）</CardTitle>
          </CardHeader>
          <CardBody>
            <div className="flex flex-col gap-2 text-sm text-[var(--color-text-secondary)]">
              <div className="flex items-start justify-between gap-3">
                <div>客户A：交付计划评审</div>
                <Badge tone="info">进行中</Badge>
              </div>
              <div className="flex items-start justify-between gap-3">
                <div>预算调整：二厂设备投入</div>
                <Badge tone="warning">待审批</Badge>
              </div>
              <div className="flex items-start justify-between gap-3">
                <div>审计整改：内控问题闭环</div>
                <Badge tone="error">超时</Badge>
              </div>
            </div>
          </CardBody>
        </Card>
      </div>
    </div>
  )
}

