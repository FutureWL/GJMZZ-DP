import { useCallback, useEffect, useMemo, useState } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'

import { completeWorkflowTask, getWorkflowProcessHistory, getWorkflowTaskDetail, type WorkflowTaskDetail } from '../../api/workflow'
import { useAuth } from '../../state/auth/useAuth'
import { Button } from '../../ui/Button'
import { Card, CardBody, CardHeader, CardTitle } from '../../ui/Card'
import { PageHeader } from '../../ui/PageHeader'
import { Textarea } from '../../ui/Textarea'

type HistoryState = { tasks: Record<string, unknown>[]; activities: Record<string, unknown>[] }

export function WorkflowTaskPage() {
  const { id } = useParams()
  const nav = useNavigate()
  const auth = useAuth()

  const [detail, setDetail] = useState<WorkflowTaskDetail | null>(null)
  const [history, setHistory] = useState<HistoryState | null>(null)
  const [comment, setComment] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const processInstanceId = useMemo(() => {
    if (!detail?.processInstance) return null
    const v = detail.processInstance.id
    return typeof v === 'string' ? v : null
  }, [detail?.processInstance])

  const load = useCallback(async () => {
    if (!auth.token || !id) return
    setIsLoading(true)
    setError(null)
    try {
      const d = await getWorkflowTaskDetail(auth.token, id)
      setDetail(d)
      if (d.processInstance && typeof d.processInstance.id === 'string') {
        const h = await getWorkflowProcessHistory(auth.token, d.processInstance.id)
        setHistory(h)
      } else {
        setHistory(null)
      }
    } catch (e) {
      setError(e instanceof Error ? e.message : '加载失败')
      setDetail(null)
      setHistory(null)
    } finally {
      setIsLoading(false)
    }
  }, [auth.token, id])

  useEffect(() => {
    void load()
  }, [load])

  const onComplete = useCallback(
    async (action: 'APPROVE' | 'BACK') => {
      if (!auth.token || !id) return
      setIsLoading(true)
      setError(null)
      try {
        await completeWorkflowTask(auth.token, id, { action, comment: comment.trim() || undefined })
        nav('/workbench')
      } catch (e) {
        setError(e instanceof Error ? e.message : '提交失败')
      } finally {
        setIsLoading(false)
      }
    },
    [auth.token, comment, id, nav],
  )

  return (
    <div>
      <PageHeader
        title={`办理任务：${id ?? '-'}`}
        description="质量异常流程（Flowable）"
        right={
          <Link to="/workbench" className="text-sm text-[var(--color-primary)] hover:underline">
            返回工作台
          </Link>
        }
      />

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle>任务信息</CardTitle>
            <Button size="sm" onClick={load} disabled={!auth.token || isLoading}>
              刷新
            </Button>
          </CardHeader>
          <CardBody>
            {error ? <div className="text-sm text-[var(--color-text-tertiary)]">{error}</div> : null}
            {isLoading && !detail ? <div className="text-sm text-[var(--color-text-tertiary)]">加载中…</div> : null}
            {detail ? (
              <div className="space-y-3 text-sm">
                <div className="rounded-[10px] border border-[var(--color-border-subtle)] bg-[var(--color-bg-surface)] p-3">
                  <div className="text-xs text-[var(--color-text-tertiary)]">任务名称</div>
                  <div className="mt-1 text-[var(--color-text-primary)]">{String(detail.task.name ?? '')}</div>
                </div>
                <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
                  <div className="rounded-[10px] border border-[var(--color-border-subtle)] bg-[var(--color-bg-surface)] p-3">
                    <div className="text-xs text-[var(--color-text-tertiary)]">流程实例</div>
                    <div className="mt-1 break-all text-[var(--color-text-primary)]">{processInstanceId ?? '-'}</div>
                  </div>
                  <div className="rounded-[10px] border border-[var(--color-border-subtle)] bg-[var(--color-bg-surface)] p-3">
                    <div className="text-xs text-[var(--color-text-tertiary)]">业务单号</div>
                    <div className="mt-1 break-all text-[var(--color-text-primary)]">{detail.businessKey ?? '-'}</div>
                  </div>
                </div>

                <div>
                  <div className="text-xs text-[var(--color-text-tertiary)]">审批意见</div>
                  <div className="mt-2">
                    <Textarea value={comment} onChange={(e) => setComment(e.target.value)} placeholder="可选：填写审批意见" rows={4} />
                  </div>
                </div>

                <div className="flex flex-wrap gap-2">
                  <Button variant="primary" onClick={() => onComplete('APPROVE')} disabled={isLoading}>
                    同意
                  </Button>
                  <Button variant="secondary" onClick={() => onComplete('BACK')} disabled={isLoading}>
                    退回发起人
                  </Button>
                </div>
              </div>
            ) : null}
          </CardBody>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>流程轨迹</CardTitle>
          </CardHeader>
          <CardBody>
            {!processInstanceId ? (
              <div className="text-sm text-[var(--color-text-tertiary)]">暂无流程实例</div>
            ) : !history ? (
              <div className="text-sm text-[var(--color-text-tertiary)]">暂无轨迹</div>
            ) : (
              <div className="space-y-2 text-sm">
                {history.tasks.slice(0, 20).map((t, idx) => (
                  <div
                    key={`${idx}-${String(t.id ?? '')}`}
                    className="rounded-[10px] border border-[var(--color-border-subtle)] bg-[var(--color-bg-surface)] p-3"
                  >
                    <div className="text-[var(--color-text-primary)]">{String(t.name ?? t.taskDefinitionKey ?? '-')}</div>
                    <div className="mt-1 text-xs text-[var(--color-text-tertiary)]">{String(t.endTime ?? t.startTime ?? '')}</div>
                  </div>
                ))}
              </div>
            )}
          </CardBody>
        </Card>
      </div>
    </div>
  )
}

