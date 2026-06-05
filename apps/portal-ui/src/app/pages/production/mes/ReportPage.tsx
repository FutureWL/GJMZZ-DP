import { useMemo, useState } from 'react'
import { workOrders } from '../../../mock/data'
import { Badge } from '../../../ui/Badge'
import { Button } from '../../../ui/Button'
import { Card, CardBody, CardHeader, CardTitle } from '../../../ui/Card'
import { Input } from '../../../ui/Input'
import { PageHeader } from '../../../ui/PageHeader'
import { Select } from '../../../ui/Select'

export function ReportPage() {
  const [workOrderId, setWorkOrderId] = useState(workOrders[0]?.id ?? '')
  const [qty, setQty] = useState('10')
  const [scrap, setScrap] = useState('0')
  const [msg, setMsg] = useState<string | null>(null)

  const wo = useMemo(() => workOrders.find((w) => w.id === workOrderId), [workOrderId])

  return (
    <div>
      <PageHeader title="报工" description="MES：产量/不良上报（仅UI占位）" />

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle>报工表单</CardTitle>
          </CardHeader>
          <CardBody>
            <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
              <div className="md:col-span-2">
                <div className="mb-1 text-xs font-semibold text-[var(--color-text-tertiary)]">工单</div>
                <Select value={workOrderId} onChange={(e) => setWorkOrderId(e.target.value)}>
                  {workOrders.map((w) => (
                    <option key={w.id} value={w.id}>
                      {w.id} · {w.product}
                    </option>
                  ))}
                </Select>
              </div>
              <div>
                <div className="mb-1 text-xs font-semibold text-[var(--color-text-tertiary)]">本次合格数</div>
                <Input value={qty} onChange={(e) => setQty(e.target.value)} />
              </div>
              <div>
                <div className="mb-1 text-xs font-semibold text-[var(--color-text-tertiary)]">本次不良数</div>
                <Input value={scrap} onChange={(e) => setScrap(e.target.value)} />
              </div>
              <div className="md:col-span-2">
                <div className="mb-1 text-xs font-semibold text-[var(--color-text-tertiary)]">备注（占位）</div>
                <Input placeholder="例如：换刀/首件确认/异常说明" />
              </div>
            </div>
            {msg ? (
              <div className="mt-3 rounded-[10px] border border-[var(--color-border-subtle)] bg-[var(--color-bg-surface)] px-3 py-2 text-sm text-[var(--color-text-secondary)]">
                {msg}
              </div>
            ) : null}
            <div className="mt-3 flex items-center gap-2">
              <Button
                variant="primary"
                onClick={() => {
                  if (!workOrderId) return
                  setMsg(`已提交报工（占位）：工单 ${workOrderId}，合格 ${qty}，不良 ${scrap}`)
                }}
              >
                提交
              </Button>
              <Button
                variant="secondary"
                onClick={() => {
                  setMsg(null)
                  setQty('10')
                  setScrap('0')
                }}
              >
                重置
              </Button>
            </div>
          </CardBody>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>工单摘要</CardTitle>
          </CardHeader>
          <CardBody>
            <div className="space-y-2 text-sm text-[var(--color-text-secondary)]">
              <div className="flex items-center justify-between gap-3 rounded-[10px] border border-[var(--color-border-subtle)] bg-[var(--color-bg-surface)] p-3">
                <div>产品</div>
                <div className="text-[var(--color-text-primary)]">{wo?.product ?? '-'}</div>
              </div>
              <div className="flex items-center justify-between gap-3 rounded-[10px] border border-[var(--color-border-subtle)] bg-[var(--color-bg-surface)] p-3">
                <div>产线</div>
                <div className="text-[var(--color-text-primary)]">{wo?.line ?? '-'}</div>
              </div>
              <div className="flex items-center justify-between gap-3 rounded-[10px] border border-[var(--color-border-subtle)] bg-[var(--color-bg-surface)] p-3">
                <div>状态</div>
                <Badge tone={wo?.status === 'running' ? 'success' : wo?.status === 'blocked' ? 'warning' : 'neutral'}>
                  {wo?.status ?? '-'}
                </Badge>
              </div>
            </div>
          </CardBody>
        </Card>
      </div>
    </div>
  )
}

