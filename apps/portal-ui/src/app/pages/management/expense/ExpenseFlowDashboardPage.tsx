import { Area, AreaChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts'
import { Link } from 'react-router-dom'
import { Badge } from '../../../ui/Badge'
import { Button } from '../../../ui/Button'
import { Card, CardBody, CardHeader, CardTitle } from '../../../ui/Card'
import { PageHeader } from '../../../ui/PageHeader'
import { useExpenseFlow } from '../../../state/expense/ExpenseFlowContext'

function dayOf(ts: string) {
  const m = ts.match(/(\d{4})-(\d{2})-(\d{2})/)
  if (!m) return ts
  return `${m[2]}-${m[3]}`
}

export function ExpenseFlowDashboardPage() {
  const flow = useExpenseFlow()

  const total = flow.claims.reduce((acc, c) => acc + c.amountTotal, 0)
  const inReview = flow.claims.filter((c) => c.status === 'in_review').length
  const returned = flow.claims.filter((c) => c.status === 'returned').length
  const rejected = flow.claims.filter((c) => c.status === 'rejected').length

  const trend = Array.from(
    flow.claims.reduce((map, c) => {
      const k = dayOf(c.createdAt)
      const prev = map.get(k) ?? { day: k, amount: 0, count: 0 }
      map.set(k, { day: k, amount: prev.amount + c.amountTotal, count: prev.count + 1 })
      return map
    }, new Map<string, { day: string; amount: number; count: number }>()),
  )
    .map(([, v]) => v)
    .sort((a, b) => (a.day < b.day ? -1 : 1))

  return (
    <div>
      <PageHeader
        title="费用流程看板"
        description="流程健康度与趋势（mock）"
        right={
          <div className="flex flex-wrap items-center gap-2">
            <Badge tone="domain-management">管理</Badge>
            <Link to="/management/expense/claims/new">
              <Button variant="primary">发起报销</Button>
            </Link>
            <Link to="/management/approval?from=expense-dashboard">
              <Button variant="secondary">审批中心</Button>
            </Link>
          </div>
        }
      />

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-4">
        <Card className="lg:col-span-1">
          <CardHeader>
            <CardTitle>总金额</CardTitle>
          </CardHeader>
          <CardBody>
            <div className="text-3xl font-semibold text-[var(--color-text-primary)]">¥{total.toLocaleString()}</div>
            <div className="mt-2 text-sm text-[var(--color-text-tertiary)]">统计范围：当前 mock 单据</div>
          </CardBody>
        </Card>
        <Card className="lg:col-span-1">
          <CardHeader>
            <CardTitle>审批中</CardTitle>
          </CardHeader>
          <CardBody>
            <div className="text-3xl font-semibold text-[var(--color-text-primary)]">{inReview}</div>
            <div className="mt-2 text-sm text-[var(--color-text-tertiary)]">待办积压（示例）</div>
          </CardBody>
        </Card>
        <Card className="lg:col-span-1">
          <CardHeader>
            <CardTitle>退回修改</CardTitle>
          </CardHeader>
          <CardBody>
            <div className="text-3xl font-semibold text-[var(--color-text-primary)]">{returned}</div>
            <div className="mt-2 text-sm text-[var(--color-text-tertiary)]">一次通过率的反向指标</div>
          </CardBody>
        </Card>
        <Card className="lg:col-span-1">
          <CardHeader>
            <CardTitle>驳回</CardTitle>
          </CardHeader>
          <CardBody>
            <div className="text-3xl font-semibold text-[var(--color-text-primary)]">{rejected}</div>
            <div className="mt-2 text-sm text-[var(--color-text-tertiary)]">合规/必要性风险提示</div>
          </CardBody>
        </Card>
      </div>

      <div className="mt-4 grid grid-cols-1 gap-4 lg:grid-cols-3">
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle>申请趋势（金额）</CardTitle>
          </CardHeader>
          <CardBody>
            <div className="h-[280px]">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={trend} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                  <defs>
                    <linearGradient id="exp" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="var(--color-domain-management)" stopOpacity={0.35} />
                      <stop offset="95%" stopColor="var(--color-domain-management)" stopOpacity={0.02} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid stroke="var(--color-border-subtle)" strokeDasharray="3 3" />
                  <XAxis dataKey="day" stroke="var(--color-text-tertiary)" fontSize={12} />
                  <YAxis stroke="var(--color-text-tertiary)" fontSize={12} />
                  <Tooltip
                    formatter={(v) => [
                      typeof v === 'number' ? `¥${v.toLocaleString()}` : typeof v === 'string' ? v : '-',
                      '金额',
                    ]}
                    contentStyle={{
                      background: 'var(--color-bg-surface)',
                      border: '1px solid var(--color-border-subtle)',
                      borderRadius: 10,
                    }}
                  />
                  <Area type="monotone" dataKey="amount" stroke="var(--color-domain-management)" fill="url(#exp)" strokeWidth={2} />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </CardBody>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>规则命中（占位）</CardTitle>
          </CardHeader>
          <CardBody>
            <div className="flex flex-col gap-2 text-sm text-[var(--color-text-secondary)]">
              <div className="flex items-center justify-between gap-3">
                <div>超预算</div>
                <Badge tone="warning">0</Badge>
              </div>
              <div className="flex items-center justify-between gap-3">
                <div>超标准</div>
                <Badge tone="warning">0</Badge>
              </div>
              <div className="flex items-center justify-between gap-3">
                <div>发票重复疑似</div>
                <Badge tone="warning">0</Badge>
              </div>
              <div className="flex items-center justify-between gap-3">
                <div>节点超时</div>
                <Badge tone="error">0</Badge>
              </div>
            </div>
          </CardBody>
        </Card>
      </div>

      <Card className="mt-4">
        <CardHeader>
          <CardTitle>最新单据</CardTitle>
        </CardHeader>
        <CardBody>
          <div className="space-y-2">
            {flow.claims.slice(0, 6).map((c) => (
              <div
                key={c.id}
                className="flex flex-wrap items-center justify-between gap-3 rounded-[10px] border border-[var(--color-border-subtle)] bg-[var(--color-bg-surface)] p-3"
              >
                <div className="min-w-0">
                  <div className="truncate text-sm font-medium text-[var(--color-text-primary)]">{c.title}</div>
                  <div className="mt-1 flex flex-wrap items-center gap-2 text-xs text-[var(--color-text-tertiary)]">
                    <span>{c.id}</span>
                    <Badge tone={c.status === 'in_review' ? 'info' : c.status === 'paid' ? 'success' : c.status === 'draft' ? 'neutral' : 'warning'}>
                      {c.status}
                    </Badge>
                    <span>{c.applicant}</span>
                    <span>¥{c.amountTotal.toLocaleString()}</span>
                  </div>
                </div>
                <Link
                  to={`/management/expense/claims/${encodeURIComponent(c.id)}`}
                  className="text-sm text-[var(--color-primary)] hover:underline"
                >
                  查看
                </Link>
              </div>
            ))}
          </div>
        </CardBody>
      </Card>
    </div>
  )
}
