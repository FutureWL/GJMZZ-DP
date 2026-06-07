import { useCallback, useEffect, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { getWorkflowInstanceByBusinessKey, getWorkflowProcessHistory, startWorkflowInstanceByBusinessKey, withdrawWorkflowProcessInstance } from '../../../api/workflow'
import type { Incident } from '../../../mock/models'
import { useAuth } from '../../../state/auth/useAuth'
import { useIncidentData } from '../../../state/production/IncidentDataContext'
import { Badge, type Tone } from '../../../ui/Badge'
import { Button } from '../../../ui/Button'
import { Card, CardBody, CardHeader, CardTitle } from '../../../ui/Card'
import { PageHeader } from '../../../ui/PageHeader'

function severityTone(sev: Incident['severity']): Tone {
  if (sev === 'critical') return 'error'
  if (sev === 'high') return 'warning'
  if (sev === 'medium') return 'info'
  return 'neutral'
}

const typeLabel: Record<Incident['type'], string> = {
  quality: '质量',
  equipment: '设备',
  material_shortage: '欠料',
  plan: '计划偏差',
  safety: '安全',
  other: '其他',
}

export function IncidentDetailPage() {
  const { id } = useParams()
  const auth = useAuth()
  const { incidents, isLoading, archiveIncident } = useIncidentData()
  const incident = incidents.find((x) => x.id === id)
  const [processInstance, setProcessInstance] = useState<Record<string, unknown> | null>(null)
  const [processHistory, setProcessHistory] = useState<{ tasks: Record<string, unknown>[]; activities: Record<string, unknown>[] } | null>(
    null,
  )
  const [workflowLoading, setWorkflowLoading] = useState(false)
  const [workflowError, setWorkflowError] = useState<string | null>(null)

  const loadWorkflow = useCallback(async () => {
    if (!auth.token || !incident || incident.type !== 'quality') return
    setWorkflowLoading(true)
    setWorkflowError(null)
    try {
      const inst = await getWorkflowInstanceByBusinessKey(auth.token, incident.id)
      setProcessInstance(inst)
      if (inst && typeof inst.id === 'string') {
        const h = await getWorkflowProcessHistory(auth.token, inst.id)
        setProcessHistory(h)
      } else {
        setProcessHistory(null)
      }
    } catch (e) {
      setWorkflowError(e instanceof Error ? e.message : '流程加载失败')
      setProcessInstance(null)
      setProcessHistory(null)
    } finally {
      setWorkflowLoading(false)
    }
  }, [auth.token, incident])

  useEffect(() => {
    void loadWorkflow()
  }, [loadWorkflow])

  return (
    <div>
      <PageHeader
        title={`异常详情：${id ?? '-'}`}
        description="仅记录可追溯（不强制派工闭环）"
        right={
          incident ? (
            <div className="flex items-center gap-2">
              <Link to={`/production/incidents/${encodeURIComponent(incident.id)}/edit`}>
                <Button variant="secondary">编辑</Button>
              </Link>
              <Button
                variant="secondary"
                onClick={() => archiveIncident(incident.id)}
                disabled={incident.status === 'archived'}
              >
                归档
              </Button>
              <Badge tone={severityTone(incident.severity)}>{incident.severity}</Badge>
            </div>
          ) : null
        }
      />

      {!incident ? (
        <Card>
          <CardBody>
            <div className="text-sm text-[var(--color-text-tertiary)]">{isLoading ? '加载中…' : '未找到该异常。'}</div>
            <div className="mt-3">
              <Link className="text-sm text-[var(--color-primary)] hover:underline" to="/production/incidents">
                返回异常中心
              </Link>
            </div>
          </CardBody>
        </Card>
      ) : (
        <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
          <Card className="lg:col-span-2">
            <CardHeader>
              <CardTitle>基本信息</CardTitle>
            </CardHeader>
            <CardBody>
              <div className="grid grid-cols-1 gap-3 text-sm md:grid-cols-2">
                <div>
                  <div className="text-xs text-[var(--color-text-tertiary)]">类型</div>
                  <div className="mt-1 text-[var(--color-text-primary)]">{typeLabel[incident.type]}</div>
                </div>
                <div>
                  <div className="text-xs text-[var(--color-text-tertiary)]">状态</div>
                  <div className="mt-1">
                    <Badge tone={incident.status === 'archived' ? 'neutral' : 'info'}>
                      {incident.status === 'archived' ? '已归档' : '记录中'}
                    </Badge>
                  </div>
                </div>
                <div>
                  <div className="text-xs text-[var(--color-text-tertiary)]">发生时间</div>
                  <div className="mt-1 text-[var(--color-text-primary)]">{incident.occurredAt}</div>
                </div>
                <div>
                  <div className="text-xs text-[var(--color-text-tertiary)]">发现人</div>
                  <div className="mt-1 text-[var(--color-text-primary)]">{incident.reportedBy}</div>
                </div>
                <div>
                  <div className="text-xs text-[var(--color-text-tertiary)]">工厂</div>
                  <div className="mt-1 text-[var(--color-text-primary)]">{incident.factoryName}</div>
                </div>
                <div>
                  <div className="text-xs text-[var(--color-text-tertiary)]">产线</div>
                  <div className="mt-1 text-[var(--color-text-primary)]">{incident.line ?? '-'}</div>
                </div>
                <div>
                  <div className="text-xs text-[var(--color-text-tertiary)]">工单</div>
                  <div className="mt-1 text-[var(--color-text-primary)]">{incident.workOrderId ?? '-'}</div>
                </div>
                <div>
                  <div className="text-xs text-[var(--color-text-tertiary)]">订单号</div>
                  <div className="mt-1 text-[var(--color-text-primary)]">{incident.orderId ?? '-'}</div>
                </div>
                <div>
                  <div className="text-xs text-[var(--color-text-tertiary)]">设备</div>
                  <div className="mt-1 text-[var(--color-text-primary)]">{incident.equipment || '-'}</div>
                </div>
                <div>
                  <div className="text-xs text-[var(--color-text-tertiary)]">物料</div>
                  <div className="mt-1 text-[var(--color-text-primary)]">{incident.material || '-'}</div>
                </div>
                <div className="md:col-span-2">
                  <div className="text-xs text-[var(--color-text-tertiary)]">描述</div>
                  <div className="mt-1 text-[var(--color-text-primary)]">{incident.description}</div>
                </div>
              </div>
            </CardBody>
          </Card>

          <div className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>附件与记录</CardTitle>
              </CardHeader>
              <CardBody>
                <div className="space-y-3 text-sm">
                  <div>
                    <div className="text-xs text-[var(--color-text-tertiary)]">附件</div>
                    <div className="mt-2 space-y-2">
                      {incident.attachments.length ? (
                        incident.attachments.map((a) => (
                          <div
                            key={a}
                            className="rounded-[10px] border border-[var(--color-border-subtle)] bg-[var(--color-bg-surface)] p-3 text-[var(--color-text-secondary)]"
                          >
                            {a}
                          </div>
                        ))
                      ) : (
                        <div className="text-[var(--color-text-tertiary)]">无</div>
                      )}
                    </div>
                  </div>
                  <div>
                    <div className="text-xs text-[var(--color-text-tertiary)]">创建时间</div>
                    <div className="mt-1 text-[var(--color-text-primary)]">{incident.createdAt}</div>
                  </div>
                  <div>
                    <div className="text-xs text-[var(--color-text-tertiary)]">更新时间</div>
                    <div className="mt-1 text-[var(--color-text-primary)]">{incident.updatedAt}</div>
                  </div>
                  <div>
                    <Link className="text-[var(--color-primary)] hover:underline" to="/production/incidents">
                      返回异常中心
                    </Link>
                  </div>
                </div>
              </CardBody>
            </Card>

            {incident.type === 'quality' ? (
              <Card>
                <CardHeader>
                  <CardTitle>流程（Flowable）</CardTitle>
                  <Button size="sm" onClick={loadWorkflow} disabled={!auth.token || workflowLoading}>
                    刷新
                  </Button>
                </CardHeader>
                <CardBody>
                  {!auth.token ? (
                    <div className="text-sm text-[var(--color-text-tertiary)]">未登录</div>
                  ) : workflowError ? (
                    <div className="text-sm text-[var(--color-text-tertiary)]">{workflowError}</div>
                  ) : workflowLoading ? (
                    <div className="text-sm text-[var(--color-text-tertiary)]">加载中…</div>
                  ) : !processInstance ? (
                    <div className="space-y-3 text-sm">
                      <div className="text-[var(--color-text-tertiary)]">未发起流程</div>
                      <Button
                        variant="primary"
                        onClick={async () => {
                          if (!auth.token) return
                          setWorkflowLoading(true)
                          setWorkflowError(null)
                          try {
                            await startWorkflowInstanceByBusinessKey(auth.token, incident.id)
                            await loadWorkflow()
                          } catch (e) {
                            setWorkflowError(e instanceof Error ? e.message : '发起失败')
                          } finally {
                            setWorkflowLoading(false)
                          }
                        }}
                      >
                        发起质量异常流程
                      </Button>
                    </div>
                  ) : (
                    <div className="space-y-3 text-sm">
                      <div className="rounded-[10px] border border-[var(--color-border-subtle)] bg-[var(--color-bg-surface)] p-3">
                        <div className="text-xs text-[var(--color-text-tertiary)]">流程实例</div>
                        <div className="mt-1 break-all text-[var(--color-text-primary)]">{String(processInstance.id ?? '')}</div>
                      </div>
                      <div className="flex flex-wrap gap-2">
                        <Link to="/workbench">
                          <Button variant="secondary">去待办办理</Button>
                        </Link>
                        <Button
                          variant="secondary"
                          onClick={async () => {
                            if (!auth.token || typeof processInstance.id !== 'string') return
                            setWorkflowLoading(true)
                            setWorkflowError(null)
                            try {
                              await withdrawWorkflowProcessInstance(auth.token, processInstance.id)
                              await loadWorkflow()
                            } catch (e) {
                              setWorkflowError(e instanceof Error ? e.message : '撤回失败')
                            } finally {
                              setWorkflowLoading(false)
                            }
                          }}
                        >
                          撤回
                        </Button>
                      </div>
                      {processHistory ? (
                        <div>
                          <div className="text-xs text-[var(--color-text-tertiary)]">轨迹（最近）</div>
                          <div className="mt-2 space-y-2">
                            {processHistory.tasks.slice(0, 8).map((t, idx) => (
                              <div
                                key={`${idx}-${String(t.id ?? '')}`}
                                className="rounded-[10px] border border-[var(--color-border-subtle)] bg-[var(--color-bg-surface)] p-3"
                              >
                                <div className="text-[var(--color-text-secondary)]">{String(t.name ?? t.taskDefinitionKey ?? '-')}</div>
                                <div className="mt-1 text-xs text-[var(--color-text-tertiary)]">{String(t.endTime ?? t.startTime ?? '')}</div>
                              </div>
                            ))}
                          </div>
                        </div>
                      ) : null}
                    </div>
                  )}
                </CardBody>
              </Card>
            ) : null}
          </div>
        </div>
      )}
    </div>
  )
}
