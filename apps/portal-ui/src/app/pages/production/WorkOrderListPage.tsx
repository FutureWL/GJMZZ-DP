import { Link } from 'react-router-dom'
import { workOrders } from '../../mock/data'
import { Badge, type Tone } from '../../ui/Badge'
import { Card, CardBody, CardHeader, CardTitle } from '../../ui/Card'
import { PageHeader } from '../../ui/PageHeader'

function statusTone(status: string): Tone {
  if (status === 'running') return 'success'
  if (status === 'blocked') return 'warning'
  if (status === 'done') return 'neutral'
  return 'info'
}

export function WorkOrderListPage() {
  return (
    <div>
      <PageHeader title="工单列表" description="列表 → 详情（P0演示）" />
      <Card>
        <CardHeader>
          <CardTitle>工单</CardTitle>
        </CardHeader>
        <CardBody>
          <div className="overflow-auto">
            <table className="w-full table-auto border-separate border-spacing-0 text-left text-sm">
              <thead>
                <tr className="text-xs text-[var(--color-text-tertiary)]">
                  <th className="border-b border-[var(--color-border-subtle)] px-3 py-2 font-semibold">工单号</th>
                  <th className="border-b border-[var(--color-border-subtle)] px-3 py-2 font-semibold">产品</th>
                  <th className="border-b border-[var(--color-border-subtle)] px-3 py-2 font-semibold">产线</th>
                  <th className="border-b border-[var(--color-border-subtle)] px-3 py-2 font-semibold">进度</th>
                  <th className="border-b border-[var(--color-border-subtle)] px-3 py-2 font-semibold">状态</th>
                  <th className="border-b border-[var(--color-border-subtle)] px-3 py-2 font-semibold">计划</th>
                </tr>
              </thead>
              <tbody>
                {workOrders.map((w) => (
                  <tr key={w.id} className="hover:bg-black/5 dark:hover:bg-white/5">
                    <td className="border-b border-[var(--color-border-subtle)] px-3 py-2">
                      <Link
                        className="font-medium text-[var(--color-primary)] hover:underline"
                        to={`/production/workorders/${encodeURIComponent(w.id)}`}
                      >
                        {w.id}
                      </Link>
                    </td>
                    <td className="border-b border-[var(--color-border-subtle)] px-3 py-2 text-[var(--color-text-primary)]">
                      {w.product}
                    </td>
                    <td className="border-b border-[var(--color-border-subtle)] px-3 py-2">{w.line}</td>
                    <td className="border-b border-[var(--color-border-subtle)] px-3 py-2">{w.progress}%</td>
                    <td className="border-b border-[var(--color-border-subtle)] px-3 py-2">
                      <Badge tone={statusTone(w.status)}>{w.status}</Badge>
                    </td>
                    <td className="border-b border-[var(--color-border-subtle)] px-3 py-2 text-xs text-[var(--color-text-tertiary)]">
                      {w.planStart} ~ {w.planEnd}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardBody>
      </Card>
    </div>
  )
}
