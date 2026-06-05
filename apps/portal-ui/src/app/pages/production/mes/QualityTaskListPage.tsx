import { Link } from 'react-router-dom'
import { qualityTasks } from '../../../mock/data'
import { Badge, type Tone } from '../../../ui/Badge'
import { Card, CardBody, CardHeader, CardTitle } from '../../../ui/Card'
import { PageHeader } from '../../../ui/PageHeader'

function statusTone(status: string): Tone {
  if (status === 'done') return 'success'
  if (status === 'doing') return 'info'
  return 'neutral'
}

function resultTone(result: string | null): Tone {
  if (result === 'ok') return 'success'
  if (result === 'ng') return 'error'
  if (result === 'hold') return 'warning'
  return 'neutral'
}

export function QualityTaskListPage() {
  return (
    <div>
      <PageHeader title="检验任务" description="MES：检验任务列表（界面示例）" />
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
                  <th className="border-b border-[var(--color-border-subtle)] px-3 py-2 font-semibold">类型</th>
                  <th className="border-b border-[var(--color-border-subtle)] px-3 py-2 font-semibold">检验员</th>
                  <th className="border-b border-[var(--color-border-subtle)] px-3 py-2 font-semibold">创建时间</th>
                  <th className="border-b border-[var(--color-border-subtle)] px-3 py-2 font-semibold">状态</th>
                  <th className="border-b border-[var(--color-border-subtle)] px-3 py-2 font-semibold">结果</th>
                </tr>
              </thead>
              <tbody>
                {qualityTasks.map((t) => (
                  <tr key={t.id} className="hover:bg-black/5 dark:hover:bg-white/5">
                    <td className="border-b border-[var(--color-border-subtle)] px-3 py-2">
                      <Link
                        className="font-medium text-[var(--color-primary)] hover:underline"
                        to={`/production/mes/quality/${encodeURIComponent(t.id)}`}
                      >
                        {t.id}
                      </Link>
                    </td>
                    <td className="border-b border-[var(--color-border-subtle)] px-3 py-2">{t.workOrderId}</td>
                    <td className="border-b border-[var(--color-border-subtle)] px-3 py-2">{t.type}</td>
                    <td className="border-b border-[var(--color-border-subtle)] px-3 py-2">{t.inspector}</td>
                    <td className="border-b border-[var(--color-border-subtle)] px-3 py-2">{t.createdAt}</td>
                    <td className="border-b border-[var(--color-border-subtle)] px-3 py-2">
                      <Badge tone={statusTone(t.status)}>{t.status}</Badge>
                    </td>
                    <td className="border-b border-[var(--color-border-subtle)] px-3 py-2">
                      <Badge tone={resultTone(t.result)}>{t.result ?? '-'}</Badge>
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

