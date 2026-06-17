import { useCallback, useEffect, useState } from 'react'
import { Link, useSearchParams } from 'react-router-dom'

import { getMyWorkflowTasks, type WorkflowTaskListItem } from '../../api/workflow'
import { useAuth } from '../../state/auth/useAuth'
import { useExpenseFlow } from '../../state/expense/ExpenseFlowContext'
import { useProcurementFlow } from '../../state/procurement/ProcurementFlowContext'
import { useContractFlow } from '../../state/contract/ContractFlowContext'
import { Badge } from '../../ui/Badge'
import { Button } from '../../ui/Button'
import { Card, CardBody, CardHeader, CardTitle } from '../../ui/Card'
import { PageHeader } from '../../ui/PageHeader'

// 与原 mock 待办 seedItems 保持一致,作为"演示/占位"区
const seedItems = [
  { id: 'APR-001', title: 'PR-20260605-001 采购申请审批', domain: 'management', status: 'in_review', overdue: false },
  { id: 'APR-002', title: '供应商准入 SUP-002 证照到期复核', domain: 'management', status: 'in_review', overdue: true },
  { id: 'APR-003', title: '招聘需求（质量部）编制审批', domain: 'support', status: 'in_review', overdue: false },
] as const

function formatTaskTime(v: string) {
  // Flowable 返回的时间形如 2026-06-16T10:11:12.000+08:00
  if (!v) return ''
  const t = v.indexOf('T') >= 0 ? v.replace('T', ' ').slice(0, 16) : v.slice(0, 16)
  return t
}

export function ApprovalCenterPage() {
  const [params] = useSearchParams()
  const from = params.get('from')
  const auth = useAuth()
  const expense = useExpenseFlow()
  const procurement = useProcurementFlow()
  const contract = useContractFlow()

  // ---- 真实待办(L1)----
  const [flowTasks, setFlowTasks] = useState<WorkflowTaskListItem[]>([])
  const [flowLoading, setFlowLoading] = useState(false)
  const [flowError, setFlowError] = useState<string | null>(null)

  const reloadFlow = useCallback(async () => {
    if (!auth.token) return
    setFlowLoading(true)
    setFlowError(null)
    try {
      const data = await getMyWorkflowTasks(auth.token)
      setFlowTasks(data ?? [])
    } catch (e) {
      setFlowError(e instanceof Error ? e.message : '加载真实待办失败')
      setFlowTasks([])
    } finally {
      setFlowLoading(false)
    }
  }, [auth.token])

  useEffect(() => {
    void reloadFlow()
  }, [reloadFlow])

  // ---- mock 待办(L1 之外保留)----
  const mockWorkItems = [...expense.workItems, ...procurement.workItems, ...contract.workItems]

  const mockItems = [...mockWorkItems, ...seedItems].map((it) => {
    const isFlowItem = typeof it === 'object' && 'businessType' in it && 'businessId' in it
    return {
      id: it.id,
      title: it.title,
      domain: it.domain,
      overdue: it.overdue,
      status: it.status === 'todo' || it.status === 'in_review' ? 'in_review' : 'done',
      link: `/management/approval/detail/${encodeURIComponent(it.id)}`,
      meta: isFlowItem ? `${it.businessId}` : it.id,
      tag:
        isFlowItem && it.businessType === 'expense_claim'
          ? '费用'
          : isFlowItem && it.businessType === 'procurement_pr'
            ? '采购'
            : isFlowItem && it.businessType === 'contract_review'
              ? '合同'
              : null,
    }
  })

  const mockTodo = mockItems.filter((x) => x.status === 'in_review')
  const mockDone = mockItems.filter((x) => x.status !== 'in_review')

  const positionMissing = !auth.user?.position

  return (
    <div>
      <PageHeader
        title="审批中心"
        description={from ? `从 ${from} 跳转（示例）` : '跨域统一入口：待办 / 已办 / 抄送'}
        right={
          <div className="flex items-center gap-2">
            <Button size="sm" onClick={reloadFlow} disabled={!auth.token || flowLoading}>
              刷新真实待办
            </Button>
          </div>
        }
      />

      {/* ====== L1:真实待办(Flowable)====== */}
      <Card>
        <CardHeader>
          <CardTitle>待办 · 真实流程（Flowable）</CardTitle>
          <div className="text-xs text-[var(--color-text-tertiary)]">
            数据来源:{positionMissing ? '未设置 Profile.position,按组聚合待办未启用' : '按当前用户岗位(Profile.position)聚合候选组任务'}
          </div>
        </CardHeader>
        <CardBody>
          {flowError ? (
            <div className="text-sm text-[var(--color-text-tertiary)]">{flowError}</div>
          ) : flowLoading ? (
            <div className="text-sm text-[var(--color-text-tertiary)]">加载中…</div>
          ) : !flowTasks.length ? (
            <div className="text-sm text-[var(--color-text-tertiary)]">
              暂无真实待办(可通过 Flowable IDM / Task 给当前用户所在组分配任务,或调用
              <code className="mx-1 rounded bg-[var(--color-bg-surface)] px-1">POST /api/workflow/instances</code>
              启动 simple_approval_v1 流程)
            </div>
          ) : (
            <div className="space-y-2">
              {flowTasks.map((t) => (
                <div
                  key={t.id}
                  className="flex flex-wrap items-center justify-between gap-3 rounded-[10px] border border-[var(--color-border-subtle)] bg-[var(--color-bg-surface)] p-3"
                >
                  <div className="min-w-0">
                    <div className="truncate text-sm font-medium text-[var(--color-text-primary)]">
                      {t.name || t.id}
                    </div>
                    <div className="mt-1 flex flex-wrap items-center gap-2 text-xs text-[var(--color-text-tertiary)]">
                      <span>任务 {t.id}</span>
                      <span>·</span>
                      <span>流程 {t.processInstanceId}</span>
                      <span>·</span>
                      <span>{formatTaskTime(t.created)}</span>
                      {t.assignee ? <Badge tone="info">已分配:{t.assignee}</Badge> : <Badge tone="neutral">候选组</Badge>}
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Link
                      to={`/workflow/tasks/${encodeURIComponent(t.id)}`}
                      className="text-sm text-[var(--color-primary)] hover:underline"
                    >
                      办理
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardBody>
      </Card>

      {/* ====== mock 待办(保留作为演示,直到 L3 业务接入)====== */}
      <Card className="mt-4">
        <CardHeader>
          <CardTitle>待办 · 演示(mock,待业务接入 Flowable)</CardTitle>
        </CardHeader>
        <CardBody>
          <div className="space-y-2">
            {mockTodo.length ? (
              mockTodo.map((it) => (
                <div
                  key={it.id}
                  className="flex flex-wrap items-center justify-between gap-3 rounded-[10px] border border-[var(--color-border-subtle)] bg-[var(--color-bg-surface)] p-3"
                >
                  <div className="min-w-0">
                    <div className="truncate text-sm font-medium text-[var(--color-text-primary)]">
                      {it.title}
                    </div>
                    <div className="mt-1 flex items-center gap-2 text-xs text-[var(--color-text-tertiary)]">
                      <span>{it.meta}</span>
                      {it.tag ? <Badge tone="neutral">{it.tag}</Badge> : null}
                      {it.overdue ? <Badge tone="warning">超时</Badge> : <Badge tone="neutral">正常</Badge>}
                      {it.domain === 'support' ? (
                        <Badge tone="domain-support">支持</Badge>
                      ) : (
                        <Badge tone="domain-management">管理</Badge>
                      )}
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Link to={it.link} className="text-sm text-[var(--color-primary)] hover:underline">
                      查看详情
                    </Link>
                  </div>
                </div>
              ))
            ) : (
              <div className="text-sm text-[var(--color-text-tertiary)]">暂无演示待办</div>
            )}
          </div>
        </CardBody>
      </Card>

      <Card className="mt-4">
        <CardHeader>
          <CardTitle>已办(演示)</CardTitle>
        </CardHeader>
        <CardBody>
          <div className="space-y-2">
            {mockDone.length ? (
              mockDone.map((it) => (
                <div
                  key={it.id}
                  className="flex flex-wrap items-center justify-between gap-3 rounded-[10px] border border-[var(--color-border-subtle)] bg-[var(--color-bg-surface)] p-3"
                >
                  <div className="min-w-0">
                    <div className="truncate text-sm font-medium text-[var(--color-text-primary)]">{it.title}</div>
                    <div className="mt-1 flex items-center gap-2 text-xs text-[var(--color-text-tertiary)]">
                      <span>{it.meta}</span>
                      {it.tag ? <Badge tone="neutral">{it.tag}</Badge> : null}
                      <Badge tone="success">已完成</Badge>
                      {it.domain === 'support' ? <Badge tone="domain-support">支持</Badge> : <Badge tone="domain-management">管理</Badge>}
                    </div>
                  </div>
                  <Link to={it.link} className="text-sm text-[var(--color-primary)] hover:underline">
                    查看
                  </Link>
                </div>
              ))
            ) : (
              <div className="text-sm text-[var(--color-text-tertiary)]">暂无已办</div>
            )}
          </div>
        </CardBody>
      </Card>
    </div>
  )
}
