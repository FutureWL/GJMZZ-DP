import { useMemo, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { Badge, type Tone } from '../../../ui/Badge'
import { Button } from '../../../ui/Button'
import { Card, CardBody, CardHeader, CardTitle } from '../../../ui/Card'
import { Input } from '../../../ui/Input'
import { PageHeader } from '../../../ui/PageHeader'
import { WorkflowInstanceCard } from '../../../ui/WorkflowInstanceCard'
import { useBusinessWorkflowStatus, type DerivedStatus } from '../../../state/workflow/useBusinessWorkflowStatus'
import { useExpenseFlow } from '../../../state/expense/ExpenseFlowContext'

function mockStatusTone(status: string): Tone {
  if (status === 'draft') return 'neutral'
  if (status === 'in_review') return 'info'
  if (status === 'approved' || status === 'paid') return 'success'
  if (status === 'returned') return 'warning'
  if (status === 'rejected' || status === 'canceled') return 'error'
  return 'neutral'
}

function derivedStatusLabel(s: DerivedStatus): string {
  if (s === 'not_started') return '未启动'
  if (s === 'in_review') return '审批中'
  if (s === 'approved') return '已通过'
  if (s === 'rejected') return '已驳回'
  if (s === 'suspended') return '已挂起'
  return '未知'
}
function derivedStatusTone(s: DerivedStatus): Tone {
  if (s === 'in_review' || s === 'not_started') return 'info'
  if (s === 'approved') return 'success'
  if (s === 'rejected' || s === 'suspended') return 'warning'
  return 'neutral'
}

export function ExpenseClaimDetailPage() {
  const { id } = useParams()
  const flow = useExpenseFlow()
  const claim = id ? flow.getClaim(id) : undefined
  const [note, setNote] = useState('')
  const [actionError, setActionError] = useState<string | null>(null)
  const [isActing, setIsActing] = useState(false)

  // L4:真实流程状态(单一状态源)
  const wf = useBusinessWorkflowStatus(claim?.id ?? '')

  const total = useMemo(() => claim?.lines.reduce((acc, x) => acc + x.amount, 0) ?? 0, [claim?.lines])

  // 优先用 Flowable 派生状态;Flowable 不可用时回退到 mock
  const statusTone = wf.hasProcess ? derivedStatusTone(wf.derivedStatus) : mockStatusTone(claim?.status ?? '-')
  const statusLabel = wf.hasProcess ? derivedStatusLabel(wf.derivedStatus) : (claim?.status ?? '-')

  const showActionButtons = wf.hasProcess && wf.derivedStatus === 'in_review' && wf.canAct

  const onApprove = async () => {
    if (!claim) return
    setIsActing(true)
    setActionError(null)
    try {
      await wf.approve(note || undefined)
      setNote('')
    } catch (e) {
      setActionError(e instanceof Error ? e.message : '操作失败')
    } finally {
      setIsActing(false)
    }
  }

  const onBack = async () => {
    if (!claim) return
    setIsActing(true)
    setActionError(null)
    try {
      await wf.back(note || undefined)
      setNote('')
    } catch (e) {
      setActionError(e instanceof Error ? e.message : '操作失败')
    } finally {
      setIsActing(false)
    }
  }

  return (
    <div>
      <PageHeader
        title={claim ? `报销详情：${claim.title}` : '报销详情'}
        description={
          claim
            ? `单据 ${claim.id}${wf.activeTask ? `｜当前节点：${wf.activeTask.name ?? wf.activeTask.taskDefinitionKey ?? '-'}` : '｜未启动流程'}`
            : '未找到单据'
        }
        right={
          <div className="flex flex-wrap items-center gap-2">
            <Link to="/management/expense/guide">
              <Button variant="secondary">流程说明</Button>
            </Link>
            <Link to="/management/approval?from=expense-claim">
              <Button variant="secondary">审批中心</Button>
            </Link>
            {showActionButtons ? (
              <>
                <Button variant="primary" onClick={onApprove} disabled={isActing}>
                  同意
                </Button>
                <Button variant="danger" onClick={onBack} disabled={isActing}>
                  退回发起人
                </Button>
              </>
            ) : null}
          </div>
        }
      />

      {actionError ? (
        <div className="mb-3 rounded-[10px] border border-red-200 bg-red-50 p-3 text-sm text-red-700 dark:border-red-900 dark:bg-red-950 dark:text-red-300">
          操作失败:{actionError}
        </div>
      ) : null}

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle>单据信息</CardTitle>
          </CardHeader>
          <CardBody>
            <div className="grid grid-cols-1 gap-3 text-sm md:grid-cols-2">
              <div>
                <div className="text-xs text-[var(--color-text-tertiary)]">单据ID</div>
                <div className="mt-1 text-[var(--color-text-primary)]">{claim?.id ?? '-'}</div>
              </div>
              <div>
                <div className="text-xs text-[var(--color-text-tertiary)]">状态</div>
                <div className="mt-1 flex items-center gap-2">
                  <Badge tone={statusTone}>{statusLabel}</Badge>
                  {wf.hasProcess ? (
                    <span className="text-xs text-[var(--color-text-tertiary)]">（来自 Flowable）</span>
                  ) : null}
                </div>
              </div>
              <div>
                <div className="text-xs text-[var(--color-text-tertiary)]">申请人</div>
                <div className="mt-1 text-[var(--color-text-primary)]">{claim?.applicant ?? '-'}</div>
              </div>
              <div>
                <div className="text-xs text-[var(--color-text-tertiary)]">部门</div>
                <div className="mt-1 text-[var(--color-text-primary)]">{claim?.departmentName ?? '-'}</div>
              </div>
              <div>
                <div className="text-xs text-[var(--color-text-tertiary)]">项目</div>
                <div className="mt-1 text-[var(--color-text-primary)]">{claim?.projectName ?? '-'}</div>
              </div>
              <div>
                <div className="text-xs text-[var(--color-text-tertiary)]">成本中心</div>
                <div className="mt-1 text-[var(--color-text-primary)]">{claim?.costCenterName ?? '-'}</div>
              </div>
              <div>
                <div className="text-xs text-[var(--color-text-tertiary)]">费用类型</div>
                <div className="mt-1 text-[var(--color-text-primary)]">{claim?.claimType ?? '-'}</div>
              </div>
              <div>
                <div className="text-xs text-[var(--color-text-tertiary)]">付款类型</div>
                <div className="mt-1 text-[var(--color-text-primary)]">
                  {claim?.payeeType === 'corporate' ? '对公' : claim?.payeeType === 'personal' ? '对私' : '-'}
                </div>
              </div>
              <div>
                <div className="text-xs text-[var(--color-text-tertiary)]">收款方</div>
                <div className="mt-1 text-[var(--color-text-primary)]">{claim?.payeeName ?? '-'}</div>
              </div>
              <div>
                <div className="text-xs text-[var(--color-text-tertiary)]">金额</div>
                <div className="mt-1 text-[var(--color-text-primary)]">¥{total.toLocaleString()}</div>
              </div>
              <div className="md:col-span-2">
                <div className="text-xs text-[var(--color-text-tertiary)]">创建/更新</div>
                <div className="mt-1 text-[var(--color-text-primary)]">
                  {claim ? `${claim.createdAt} / ${claim.updatedAt}` : '-'}
                </div>
              </div>
            </div>

            {showActionButtons ? (
              <div className="mt-4">
                <div className="mb-2 text-xs font-semibold text-[var(--color-text-tertiary)]">处理意见（可选）</div>
                <Input value={note} onChange={(e) => setNote(e.target.value)} placeholder="同意/退回原因" />
              </div>
            ) : null}

            <div className="mt-4 rounded-[10px] border border-[var(--color-border-subtle)] bg-[var(--color-bg-surface)] p-3">
              <div className="text-xs font-semibold text-[var(--color-text-tertiary)]">附件</div>
              <div className="mt-2 flex flex-wrap gap-2 text-sm text-[var(--color-text-secondary)]">
                {claim?.attachments?.length ? (
                  claim.attachments.map((a) => (
                    <span
                      key={a}
                      className="inline-flex items-center rounded-[6px] border border-[var(--color-border-subtle)] bg-[var(--color-bg-surface)] px-2 py-1 text-xs"
                    >
                      {a}
                    </span>
                  ))
                ) : (
                  <span className="text-xs text-[var(--color-text-tertiary)]">暂无附件</span>
                )}
              </div>
            </div>
          </CardBody>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>流程节点</CardTitle>
          </CardHeader>
          <CardBody>
            <div className="space-y-3">
              {wf.hasProcess && wf.processInstance ? (
                <div className="rounded-[10px] border border-[var(--color-border-subtle)] bg-[var(--color-bg-surface)] p-3">
                  <div className="flex items-center justify-between gap-3">
                    <div className="min-w-0">
                      <div className="truncate font-medium text-[var(--color-text-primary)]">
                        {wf.activeTask ? wf.activeTask.name ?? wf.activeTask.taskDefinitionKey : '已结束'}
                      </div>
                      <div className="mt-1 text-xs text-[var(--color-text-tertiary)]">
                        {wf.activeTask
                          ? `assignee: ${wf.activeTask.assignee ?? '-'} · groups: ${(wf.activeTask.candidateGroups ?? []).join(',') || '-'}`
                          : 'process completed'}
                      </div>
                    </div>
                    <Badge tone={wf.derivedStatus === 'in_review' ? 'info' : derivedStatusTone(wf.derivedStatus)}>
                      {derivedStatusLabel(wf.derivedStatus)}
                    </Badge>
                  </div>
                </div>
              ) : claim?.nodes?.length ? (
                claim.nodes.map((n) => (
                  <div
                    key={n.key}
                    className="rounded-[10px] border border-[var(--color-border-subtle)] bg-[var(--color-bg-surface)] p-3"
                  >
                    <div className="flex items-center justify-between gap-3">
                      <div className="min-w-0">
                        <div className="truncate font-medium text-[var(--color-text-primary)]">{n.label}</div>
                        <div className="mt-1 text-xs text-[var(--color-text-tertiary)]">{n.assignee}</div>
                      </div>
                      <Badge tone={n.status === 'done' ? 'success' : n.key === claim.currentNodeKey ? 'info' : 'neutral'}>
                        {n.status === 'done' ? '已完成' : n.key === claim.currentNodeKey ? '处理中' : '未开始'}
                      </Badge>
                    </div>
                    <div className="mt-1 text-xs text-[var(--color-text-tertiary)]">{n.completedAt ?? ''}</div>
                  </div>
                ))
              ) : (
                <div className="text-sm text-[var(--color-text-tertiary)]">未启动流程,无节点</div>
              )}
            </div>
          </CardBody>
        </Card>
      </div>

      <Card className="mt-4">
        <CardHeader>
          <CardTitle>费用明细</CardTitle>
        </CardHeader>
        <CardBody>
          <div className="overflow-auto">
            <table className="w-full table-auto border-separate border-spacing-0 text-left text-sm">
              <thead>
                <tr className="text-xs text-[var(--color-text-tertiary)]">
                  <th className="border-b border-[var(--color-border-subtle)] px-3 py-2 font-semibold">日期</th>
                  <th className="border-b border-[var(--color-border-subtle)] px-3 py-2 font-semibold">科目</th>
                  <th className="border-b border-[var(--color-border-subtle)] px-3 py-2 font-semibold">事项</th>
                  <th className="border-b border-[var(--color-border-subtle)] px-3 py-2 font-semibold">金额</th>
                  <th className="border-b border-[var(--color-border-subtle)] px-3 py-2 font-semibold">发票号</th>
                </tr>
              </thead>
              <tbody>
                {claim?.lines?.map((l) => (
                  <tr key={l.id} className="hover:bg-black/5 dark:hover:bg-white/5">
                    <td className="border-b border-[var(--color-border-subtle)] px-3 py-2">{l.occurredAt}</td>
                    <td className="border-b border-[var(--color-border-subtle)] px-3 py-2">{l.category}</td>
                    <td className="border-b border-[var(--color-border-subtle)] px-3 py-2">{l.subject}</td>
                    <td className="border-b border-[var(--color-border-subtle)] px-3 py-2">¥{l.amount.toLocaleString()}</td>
                    <td className="border-b border-[var(--color-border-subtle)] px-3 py-2">{l.invoiceNo ?? '-'}</td>
                  </tr>
                )) ?? null}
              </tbody>
            </table>
          </div>
        </CardBody>
      </Card>

      {claim ? <div className="mt-4"><WorkflowInstanceCard businessKey={claim.id} businessType="expense_claim" /></div> : null}
    </div>
  )
}
