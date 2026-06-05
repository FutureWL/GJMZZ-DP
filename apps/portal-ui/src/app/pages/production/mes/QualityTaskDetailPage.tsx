import { useMemo, useState } from 'react'
import { useParams } from 'react-router-dom'
import { qualityTasks } from '../../../mock/data'
import type { QualityTask } from '../../../mock/models'
import { Badge } from '../../../ui/Badge'
import { Button } from '../../../ui/Button'
import { Card, CardBody, CardHeader, CardTitle } from '../../../ui/Card'
import { PageHeader } from '../../../ui/PageHeader'

export function QualityTaskDetailPage() {
  const { id } = useParams()
  const initial = qualityTasks.find((t) => t.id === id)
  const [result, setResult] = useState<QualityTask['result']>(initial?.result ?? null)
  const [status, setStatus] = useState<QualityTask['status']>(initial?.status ?? 'todo')

  const statusTone = useMemo(() => {
    if (status === 'done') return 'success'
    if (status === 'doing') return 'info'
    return 'neutral'
  }, [status])

  const resultTone = useMemo(() => {
    if (result === 'ok') return 'success'
    if (result === 'ng') return 'error'
    if (result === 'hold') return 'warning'
    return 'neutral'
  }, [result])

  return (
    <div>
      <PageHeader
        title={`检验任务详情：${id ?? '-'}`}
        description="检验记录模板（仅界面演示，状态/结果在本地变化）"
        right={
          <div className="flex flex-wrap items-center gap-2">
            <Button variant="secondary" onClick={() => setStatus('doing')} disabled={status !== 'todo'}>
              开始检验
            </Button>
            <Button
              variant="secondary"
              onClick={() => {
                setStatus('done')
                setResult('ok')
              }}
              disabled={status === 'done'}
            >
              判定 OK
            </Button>
            <Button
              variant="secondary"
              onClick={() => {
                setStatus('done')
                setResult('hold')
              }}
              disabled={status === 'done'}
            >
              判定 HOLD
            </Button>
            <Button
              variant="danger"
              onClick={() => {
                setStatus('done')
                setResult('ng')
              }}
              disabled={status === 'done'}
            >
              判定 NG
            </Button>
          </div>
        }
      />

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle>任务信息</CardTitle>
          </CardHeader>
          <CardBody>
            <div className="grid grid-cols-1 gap-3 text-sm md:grid-cols-2">
              <div>
                <div className="text-xs text-[var(--color-text-tertiary)]">工单</div>
                <div className="mt-1 text-[var(--color-text-primary)]">{initial?.workOrderId ?? '-'}</div>
              </div>
              <div>
                <div className="text-xs text-[var(--color-text-tertiary)]">类型</div>
                <div className="mt-1 text-[var(--color-text-primary)]">{initial?.type ?? '-'}</div>
              </div>
              <div>
                <div className="text-xs text-[var(--color-text-tertiary)]">检验员</div>
                <div className="mt-1 text-[var(--color-text-primary)]">{initial?.inspector ?? '-'}</div>
              </div>
              <div>
                <div className="text-xs text-[var(--color-text-tertiary)]">创建时间</div>
                <div className="mt-1 text-[var(--color-text-primary)]">{initial?.createdAt ?? '-'}</div>
              </div>
              <div>
                <div className="text-xs text-[var(--color-text-tertiary)]">状态</div>
                <div className="mt-1">
                  <Badge tone={statusTone}>{status}</Badge>
                </div>
              </div>
              <div>
                <div className="text-xs text-[var(--color-text-tertiary)]">结果</div>
                <div className="mt-1">
                  <Badge tone={resultTone}>{result ?? '-'}</Badge>
                </div>
              </div>
            </div>

            <div className="mt-4 rounded-[10px] border border-[var(--color-border-subtle)] bg-[var(--color-bg-surface)] p-3">
              <div className="text-xs font-semibold text-[var(--color-text-tertiary)]">检验记录（占位）</div>
              <div className="mt-2 grid grid-cols-1 gap-2 md:grid-cols-2">
                {['尺寸A', '尺寸B', '粗糙度', '外观'].map((k) => (
                  <div
                    key={k}
                    className="flex items-center justify-between gap-3 rounded-[10px] border border-[var(--color-border-subtle)] bg-[var(--color-bg-page)] px-3 py-2 text-sm"
                  >
                    <div className="text-[var(--color-text-secondary)]">{k}</div>
                    <div className="text-[var(--color-text-primary)]">占位</div>
                  </div>
                ))}
              </div>
            </div>
          </CardBody>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>附件与留痕（占位）</CardTitle>
          </CardHeader>
          <CardBody>
            <div className="space-y-2 text-sm text-[var(--color-text-secondary)]">
              <div className="rounded-[10px] border border-[var(--color-border-subtle)] bg-[var(--color-bg-surface)] p-3">
                图片/附件位
              </div>
              <div className="rounded-[10px] border border-[var(--color-border-subtle)] bg-[var(--color-bg-surface)] p-3">
                备注与签名位
              </div>
            </div>
          </CardBody>
        </Card>
      </div>
    </div>
  )
}

