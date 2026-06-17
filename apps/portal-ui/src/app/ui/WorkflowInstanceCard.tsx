import { useCallback, useEffect, useState } from 'react'
import { Link } from 'react-router-dom'

import { getWorkflowInstanceByBusinessKey, getWorkflowProcessHistory } from '../api/workflow'
import { useAuth } from '../state/auth/useAuth'
import { Badge } from './Badge'
import { Button } from './Button'
import { Card, CardBody, CardHeader, CardTitle } from './Card'

type ProcessInstance = {
  id?: string
  businessKey?: string
  processDefinitionName?: string
  processDefinitionKey?: string
  processDefinitionId?: string
  startTime?: string
  endTime?: string | null
  completed?: boolean
  ended?: boolean
  suspended?: boolean
  variables?: { name: string; value: unknown; type?: string }[]
}

type HistoryItem = { tasks: Record<string, unknown>[]; activities: Record<string, unknown>[] }

function formatTime(v: string | null | undefined) {
  if (!v) return '-'
  const t = v.indexOf('T') >= 0 ? v.replace('T', ' ').slice(0, 19) : v.slice(0, 19)
  return t
}

function shortVar(v: unknown) {
  if (v === null || v === undefined) return 'null'
  const s = typeof v === 'string' ? v : JSON.stringify(v)
  return s.length > 40 ? `${s.slice(0, 40)}…` : s
}

/**
 * 业务单据详情页的"流程实例"小卡片(L3 配套)
 * - 拉取 by-business-key 查 Flowable 实例
 * - 拉取 history 看节点轨迹
 * - 流程结束(endTime)后展示"已结束"
 */
export function WorkflowInstanceCard({ businessKey, businessType }: { businessKey: string; businessType?: string }) {
  const auth = useAuth()
  const [instance, setInstance] = useState<ProcessInstance | null | undefined>(undefined)
  const [history, setHistory] = useState<HistoryItem | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(false)

  const reload = useCallback(async () => {
    if (!auth.token) return
    setIsLoading(true)
    setError(null)
    try {
      const inst = await getWorkflowInstanceByBusinessKey(auth.token, businessKey)
      setInstance((inst as ProcessInstance | null) ?? null)
      if (inst && typeof (inst as ProcessInstance).id === 'string') {
        try {
          const h = await getWorkflowProcessHistory(auth.token, (inst as ProcessInstance).id as string)
          setHistory(h)
        } catch {
          setHistory(null)
        }
      } else {
        setHistory(null)
      }
    } catch (e) {
      setError(e instanceof Error ? e.message : '加载流程实例失败')
      setInstance(null)
      setHistory(null)
    } finally {
      setIsLoading(false)
    }
  }, [auth.token, businessKey])

  useEffect(() => {
    void reload()
  }, [reload])

  return (
    <Card>
      <CardHeader>
        <CardTitle>流程实例(Flowable)</CardTitle>
        <Button size="sm" onClick={reload} disabled={!auth.token || isLoading}>
          刷新
        </Button>
      </CardHeader>
      <CardBody>
        {!auth.token ? (
          <div className="text-sm text-[var(--color-text-tertiary)]">未登录,无法查询流程</div>
        ) : error ? (
          <div className="text-sm text-[var(--color-text-tertiary)]">{error}</div>
        ) : isLoading && instance === undefined ? (
          <div className="text-sm text-[var(--color-text-tertiary)]">加载中…</div>
        ) : !instance ? (
          <div className="text-sm text-[var(--color-text-tertiary)]">
            暂无流程实例(未启动 / 启动失败 / businessKey 不匹配)
            {businessType ? <span className="ml-1">· businessType={businessType}</span> : null}
          </div>
        ) : (
          <div className="space-y-3 text-sm">
            <div className="rounded-[10px] border border-[var(--color-border-subtle)] bg-[var(--color-bg-surface)] p-3">
              <div className="flex flex-wrap items-center gap-2 text-xs text-[var(--color-text-tertiary)]">
                <span>流程实例</span>
                <span className="break-all text-[var(--color-text-primary)]">{instance.id ?? '-'}</span>
                {instance.completed || instance.ended ? (
                  <Badge tone="success">已结束</Badge>
                ) : instance.suspended ? (
                  <Badge tone="warning">挂起</Badge>
                ) : (
                  <Badge tone="info">进行中</Badge>
                )}
              </div>
              <div className="mt-2 grid grid-cols-1 gap-2 text-xs md:grid-cols-2">
                <div>
                  <div className="text-[var(--color-text-tertiary)]">流程定义</div>
                  <div className="text-[var(--color-text-primary)]">
                    {instance.processDefinitionName ?? '-'} ({instance.processDefinitionKey ?? '-'})
                  </div>
                </div>
                <div>
                  <div className="text-[var(--color-text-tertiary)]">起止时间</div>
                  <div className="text-[var(--color-text-primary)]">
                    {formatTime(instance.startTime)} ~ {formatTime(instance.endTime)}
                  </div>
                </div>
                <div>
                  <div className="text-[var(--color-text-tertiary)]">业务单号</div>
                  <div className="text-[var(--color-text-primary)]">{instance.businessKey ?? businessKey}</div>
                </div>
              </div>
            </div>

            {instance.variables && instance.variables.length ? (
              <div className="rounded-[10px] border border-[var(--color-border-subtle)] bg-[var(--color-bg-surface)] p-3">
                <div className="text-xs font-semibold text-[var(--color-text-tertiary)]">流程变量</div>
                <div className="mt-2 grid grid-cols-1 gap-1 text-xs md:grid-cols-2">
                  {instance.variables.map((v) => (
                    <div key={v.name} className="flex items-center justify-between gap-2">
                      <span className="text-[var(--color-text-tertiary)]">{v.name}</span>
                      <span className="break-all text-[var(--color-text-primary)]">{shortVar(v.value)}</span>
                    </div>
                  ))}
                </div>
              </div>
            ) : null}

            {history && history.tasks.length ? (
              <div className="rounded-[10px] border border-[var(--color-border-subtle)] bg-[var(--color-bg-surface)] p-3">
                <div className="text-xs font-semibold text-[var(--color-text-tertiary)]">历史节点</div>
                <div className="mt-2 space-y-1 text-xs">
                  {history.tasks.map((t, idx) => {
                    const ended = Boolean(t.endTime)
                    return (
                      <div key={String(t.id ?? idx)} className="flex items-center justify-between gap-2">
                        <span className="text-[var(--color-text-primary)]">
                          {String(t.name ?? t.taskDefinitionKey ?? '-')}
                        </span>
                        <span className="text-[var(--color-text-tertiary)]">
                          {formatTime((t.startTime as string) ?? null)}
                          {ended ? ` → ${formatTime((t.endTime as string) ?? null)}` : ' · 进行中'}
                        </span>
                      </div>
                    )
                  })}
                </div>
              </div>
            ) : null}

            <div className="text-xs text-[var(--color-text-tertiary)]">
              <Link to="/management/approval" className="text-[var(--color-primary)] hover:underline">
                去审批中心查看我的待办 →
              </Link>
            </div>
          </div>
        )}
      </CardBody>
    </Card>
  )
}
