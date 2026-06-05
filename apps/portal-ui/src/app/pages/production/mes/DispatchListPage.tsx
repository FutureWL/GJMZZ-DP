import { mesDispatches, workOrders } from '../../../mock/data'
import { Badge, type Tone } from '../../../ui/Badge'
import { Card, CardBody, CardHeader, CardTitle } from '../../../ui/Card'
import { PageHeader } from '../../../ui/PageHeader'

function statusTone(status: string): Tone {
  if (status === 'done') return 'success'
  if (status === 'doing') return 'info'
  return 'neutral'
}

export function DispatchListPage() {
  const woName = (id: string) => workOrders.find((w) => w.id === id)?.product ?? id

  return (
    <div>
      <PageHeader title="派工任务" description="MES：派工/任务列表（界面示例）" />
      <Card>
        <CardHeader>
          <CardTitle>任务</CardTitle>
        </CardHeader>
        <CardBody>
          <div className="overflow-auto">
            <table className="w-full table-auto border-separate border-spacing-0 text-left text-sm">
              <thead>
                <tr className="text-xs text-[var(--color-text-tertiary)]">
                  <th className="border-b border-[var(--color-border-subtle)] px-3 py-2 font-semibold">任务</th>
                  <th className="border-b border-[var(--color-border-subtle)] px-3 py-2 font-semibold">工单</th>
                  <th className="border-b border-[var(--color-border-subtle)] px-3 py-2 font-semibold">产线</th>
                  <th className="border-b border-[var(--color-border-subtle)] px-3 py-2 font-semibold">工位</th>
                  <th className="border-b border-[var(--color-border-subtle)] px-3 py-2 font-semibold">执行人</th>
                  <th className="border-b border-[var(--color-border-subtle)] px-3 py-2 font-semibold">进度</th>
                  <th className="border-b border-[var(--color-border-subtle)] px-3 py-2 font-semibold">状态</th>
                </tr>
              </thead>
              <tbody>
                {mesDispatches.map((d) => (
                  <tr key={d.id} className="hover:bg-black/5 dark:hover:bg-white/5">
                    <td className="border-b border-[var(--color-border-subtle)] px-3 py-2">
                      <div className="font-medium text-[var(--color-text-primary)]">{d.id}</div>
                      <div className="mt-1 text-xs text-[var(--color-text-tertiary)]">{woName(d.workOrderId)}</div>
                    </td>
                    <td className="border-b border-[var(--color-border-subtle)] px-3 py-2">{d.workOrderId}</td>
                    <td className="border-b border-[var(--color-border-subtle)] px-3 py-2">{d.line}</td>
                    <td className="border-b border-[var(--color-border-subtle)] px-3 py-2">{d.station}</td>
                    <td className="border-b border-[var(--color-border-subtle)] px-3 py-2">{d.assignee}</td>
                    <td className="border-b border-[var(--color-border-subtle)] px-3 py-2">
                      <div className="flex items-center gap-2">
                        <div className="h-2 w-[120px] overflow-hidden rounded-full bg-black/10 dark:bg-white/10">
                          <div
                            className="h-2 rounded-full bg-[var(--color-domain-production)]"
                            style={{
                              width: `${Math.round((d.doneQty / Math.max(1, d.planQty)) * 100)}%`,
                            }}
                          />
                        </div>
                        <div className="text-xs text-[var(--color-text-tertiary)]">
                          {d.doneQty}/{d.planQty}
                        </div>
                      </div>
                    </td>
                    <td className="border-b border-[var(--color-border-subtle)] px-3 py-2">
                      <Badge tone={statusTone(d.status)}>{d.status}</Badge>
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

