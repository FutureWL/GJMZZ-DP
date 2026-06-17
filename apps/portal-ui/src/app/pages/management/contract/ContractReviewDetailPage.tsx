import { useMemo, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { Badge, type Tone } from '../../../ui/Badge'
import { Button } from '../../../ui/Button'
import { Card, CardBody, CardHeader, CardTitle } from '../../../ui/Card'
import { Input } from '../../../ui/Input'
import { PageHeader } from '../../../ui/PageHeader'
import { WorkflowInstanceCard } from '../../../ui/WorkflowInstanceCard'
import { useContractFlow } from '../../../state/contract/ContractFlowContext'
import { useBusinessWorkflowStatus, type DerivedStatus } from '../../../state/workflow/useBusinessWorkflowStatus'

function mockStatusTone(status: string): Tone {
  if (status === 'draft') return 'neutral'
  if (status === 'in_review') return 'info'
  if (status === 'approved' || status === 'signed' || status === 'archived') return 'success'
  if (status === 'returned') return 'warning'
  if (status === 'rejected' || status === 'canceled') return 'error'
  return 'neutral'
}

function derivedLabel(s: DerivedStatus): string {
  if (s === 'not_started') return '未启动'
  if (s === 'in_review') return '审批中'
  if (s === 'approved') return '已通过'
  if (s === 'rejected') return '已驳回'
  if (s === 'suspended') return '已挂起'
  return '未知'
}
function derivedTone(s: DerivedStatus): Tone {
  if (s === 'in_review' || s === 'not_started') return 'info'
  if (s === 'approved') return 'success'
  if (s === 'rejected' || s === 'suspended') return 'warning'
  return 'neutral'
}

export function ContractReviewDetailPage() {
  const { id } = useParams()
  const flow = useContractFlow()
  const ctr = id ? flow.getReview(id) : undefined
  const [note, setNote] = useState('')
  const [actionError, setActionError] = useState<string | null>(null)
  const [isActing, setIsActing] = useState(false)

  const wf = useBusinessWorkflowStatus(ctr?.id ?? '')

  const showActionButtons = wf.hasProcess && wf.derivedStatus === 'in_review' && wf.canAct
  const statusTone = wf.hasProcess ? derivedTone(wf.derivedStatus) : mockStatusTone(ctr?.status ?? '-')
  const statusLabel = wf.hasProcess ? derivedLabel(wf.derivedStatus) : (ctr?.status ?? '-')

  const onApprove = async () => {
    if (!ctr) return
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
    if (!ctr) return
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

  // 抑制未使用变量警告
  void actionError

  const riskTone = useMemo<Tone>(() => {
    if (!ctr) return 'neutral'
    if (ctr.riskLevel === 'high') return 'error'
    if (ctr.riskLevel === 'medium') return 'warning'
    return 'success'
  }, [ctr])

  return (
    <div>
      <PageHeader
        title={ctr ? `合同评审：${ctr.id}` : '合同评审'}
        description={ctr ? `${ctr.title}｜当前节点：${ctr.currentAssignee ?? '-'}` : '合同评审详情（mock）'}
        right={
          <div className="flex flex-wrap items-center gap-2">
            <Link to="/management/contract/guide">
              <Button variant="secondary">流程说明</Button>
            </Link>
            <Link to="/management/approval?from=contract-review">
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

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle>合同信息</CardTitle>
          </CardHeader>
          <CardBody>
            <div className="grid grid-cols-1 gap-3 text-sm md:grid-cols-2">
              <div>
                <div className="text-xs text-[var(--color-text-tertiary)]">标题</div>
                <div className="mt-1 text-[var(--color-text-primary)]">{ctr?.title ?? '-'}</div>
              </div>
              <div>
                <div className="text-xs text-[var(--color-text-tertiary)]">状态</div>
                <div className="mt-1 flex items-center gap-2">
                  <Badge tone={statusTone}>{statusLabel}</Badge>
                  {wf.hasProcess ? <span className="text-xs text-[var(--color-text-tertiary)]">（来自 Flowable）</span> : null}
                </div>
              </div>
              <div>
                <div className="text-xs text-[var(--color-text-tertiary)]">合同类型</div>
                <div className="mt-1 text-[var(--color-text-primary)]">{ctr?.contractType ?? '-'}</div>
              </div>
              <div>
                <div className="text-xs text-[var(--color-text-tertiary)]">相对方</div>
                <div className="mt-1 text-[var(--color-text-primary)]">{ctr?.counterparty ?? '-'}</div>
              </div>
              <div>
                <div className="text-xs text-[var(--color-text-tertiary)]">合同金额</div>
                <div className="mt-1 text-[var(--color-text-primary)]">
                  {ctr ? `¥${ctr.amountTotal.toLocaleString()}` : '-'}
                </div>
              </div>
              <div>
                <div className="text-xs text-[var(--color-text-tertiary)]">风险等级</div>
                <div className="mt-1">
                  <Badge tone={riskTone}>{ctr?.riskLevel ?? '-'}</Badge>
                </div>
              </div>
              <div>
                <div className="text-xs text-[var(--color-text-tertiary)]">项目</div>
                <div className="mt-1 text-[var(--color-text-primary)]">{ctr?.projectName ?? '-'}</div>
              </div>
              <div>
                <div className="text-xs text-[var(--color-text-tertiary)]">成本中心</div>
                <div className="mt-1 text-[var(--color-text-primary)]">{ctr?.costCenterName ?? '-'}</div>
              </div>
              <div className="md:col-span-2">
                <div className="text-xs text-[var(--color-text-tertiary)]">付款条款</div>
                <div className="mt-1 text-[var(--color-text-primary)]">{ctr?.paymentTerms ?? '-'}</div>
              </div>
              <div className="md:col-span-2">
                <div className="text-xs text-[var(--color-text-tertiary)]">创建/更新</div>
                <div className="mt-1 text-[var(--color-text-primary)]">
                  {ctr ? `${ctr.createdAt} / ${ctr.updatedAt}` : '-'}
                </div>
              </div>
            </div>

            <div className="mt-4">
              <div className="mb-1 text-xs font-semibold text-[var(--color-text-tertiary)]">处理意见（可选）</div>
              <Input value={note} onChange={(e) => setNote(e.target.value)} placeholder="同意/退回原因" />
            </div>

            <div className="mt-4 rounded-[10px] border border-[var(--color-border-subtle)] bg-[var(--color-bg-surface)] p-3">
              <div className="text-xs font-semibold text-[var(--color-text-tertiary)]">附件（mock）</div>
              <div className="mt-2 flex flex-wrap gap-2 text-sm text-[var(--color-text-secondary)]">
                {ctr?.attachments?.length ? (
                  ctr.attachments.map((a) => (
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
              <div className="mt-3">
                <input
                  type="file"
                  multiple
                  className="block w-full text-sm text-[var(--color-text-tertiary)] file:mr-3 file:rounded-[6px] file:border-0 file:bg-[var(--color-bg-surface)] file:px-3 file:py-2 file:text-sm file:font-medium file:text-[var(--color-text-primary)]"
                />
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
              {ctr?.nodes?.map((n) => (
                <div
                  key={n.key}
                  className="rounded-[10px] border border-[var(--color-border-subtle)] bg-[var(--color-bg-surface)] p-3"
                >
                  <div className="flex items-center justify-between gap-3">
                    <div className="min-w-0">
                      <div className="truncate font-medium text-[var(--color-text-primary)]">{n.label}</div>
                      <div className="mt-1 text-xs text-[var(--color-text-tertiary)]">{n.assignee}</div>
                    </div>
                    <Badge tone={n.status === 'done' ? 'success' : n.key === ctr.currentNodeKey ? 'info' : 'neutral'}>
                      {n.status === 'done' ? '已完成' : n.key === ctr.currentNodeKey ? '处理中' : '未开始'}
                    </Badge>
                  </div>
                  {n.completedAt ? <div className="mt-1 text-xs text-[var(--color-text-tertiary)]">{n.completedAt}</div> : null}
                </div>
              )) ?? null}
            </div>
          </CardBody>
        </Card>
      </div>

      <Card className="mt-4">
        <CardHeader>
          <CardTitle>流转记录</CardTitle>
        </CardHeader>
        <CardBody>
          <div className="space-y-2 text-sm text-[var(--color-text-secondary)]">
            {ctr?.timeline?.map((t, idx) => (
              <div
                key={`${t.at}-${idx}`}
                className="rounded-[10px] border border-[var(--color-border-subtle)] bg-[var(--color-bg-surface)] p-3"
              >
                <div className="flex items-center justify-between gap-3">
                  <div className="font-medium text-[var(--color-text-primary)]">{t.actor}</div>
                  <div className="text-xs text-[var(--color-text-tertiary)]">{t.at}</div>
                </div>
                <div className="mt-1 text-xs text-[var(--color-text-tertiary)]">{t.action}</div>
                {t.note ? <div className="mt-2">{t.note}</div> : null}
              </div>
            )) ?? null}
          </div>
        </CardBody>
      </Card>

      {ctr ? <div className="mt-4"><WorkflowInstanceCard businessKey={ctr.id} businessType="contract_review" /></div> : null}
    </div>
  )
}

