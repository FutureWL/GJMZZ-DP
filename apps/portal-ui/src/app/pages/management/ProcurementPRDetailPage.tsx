import { Link, useParams } from 'react-router-dom'
import { Badge, type Tone } from '../../ui/Badge'
import { Button } from '../../ui/Button'
import { Card, CardBody, CardHeader, CardTitle } from '../../ui/Card'
import { PageHeader } from '../../ui/PageHeader'
import { Input } from '../../ui/Input'
import { WorkflowInstanceCard } from '../../ui/WorkflowInstanceCard'
import { useState } from 'react'
import { useProcurementFlow } from '../../state/procurement/ProcurementFlowContext'
import { useBusinessWorkflowStatus, type DerivedStatus } from '../../state/workflow/useBusinessWorkflowStatus'

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

export function ProcurementPRDetailPage() {
  const { id } = useParams()
  const flow = useProcurementFlow()
  const pr = id ? flow.getRequest(id) : undefined
  const [note, setNote] = useState('')
  const [actionError, setActionError] = useState<string | null>(null)
  const [isActing, setIsActing] = useState(false)

  const wf = useBusinessWorkflowStatus(pr?.id ?? '')

  const showActionButtons = wf.hasProcess && wf.derivedStatus === 'in_review' && wf.canAct
  const statusTone = wf.hasProcess ? derivedTone(wf.derivedStatus) : (pr?.status === 'approved' ? 'success' : pr?.status === 'rejected' ? 'error' : pr?.status === 'in_review' ? 'info' : 'neutral')
  const statusLabel = wf.hasProcess ? derivedLabel(wf.derivedStatus) : (pr?.status ?? '-')

  const onApprove = async () => {
    if (!pr) return
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
    if (!pr) return
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

  // 抑制未使用变量警告(在没动作按钮时不用)
  void actionError

  return (
    <div>
      <PageHeader
        title={pr ? `PR 详情：${pr.id}` : 'PR 详情'}
        description={pr ? `${pr.title}｜当前节点：${pr.currentAssignee ?? '-'}` : '用于演示采购闭环：PR → 审批 → RFQ/比价 → 定标 → PO'}
        right={
          <div className="flex flex-wrap items-center gap-2">
            <Link to="/management/approval?from=procurement-pr">
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
            <CardTitle>申请信息</CardTitle>
          </CardHeader>
          <CardBody>
            <div className="grid grid-cols-1 gap-3 text-sm md:grid-cols-2">
              <div>
                <div className="text-xs text-[var(--color-text-tertiary)]">标题</div>
                <div className="mt-1 text-[var(--color-text-primary)]">{pr?.title ?? '-'}</div>
              </div>
              <div>
                <div className="text-xs text-[var(--color-text-tertiary)]">状态</div>
                <div className="mt-1 flex items-center gap-2">
                  <Badge tone={statusTone}>{statusLabel}</Badge>
                  {wf.hasProcess ? <span className="text-xs text-[var(--color-text-tertiary)]">（来自 Flowable）</span> : null}
                </div>
              </div>
              <div>
                <div className="text-xs text-[var(--color-text-tertiary)]">申请人</div>
                <div className="mt-1 text-[var(--color-text-primary)]">{pr?.requester ?? '-'}</div>
              </div>
              <div>
                <div className="text-xs text-[var(--color-text-tertiary)]">金额</div>
                <div className="mt-1 text-[var(--color-text-primary)]">
                  {pr ? `¥${pr.amountTotal.toLocaleString()}` : '-'}
                </div>
              </div>
              <div>
                <div className="text-xs text-[var(--color-text-tertiary)]">项目</div>
                <div className="mt-1 text-[var(--color-text-primary)]">{pr?.projectName ?? '-'}</div>
              </div>
              <div>
                <div className="text-xs text-[var(--color-text-tertiary)]">成本中心</div>
                <div className="mt-1 text-[var(--color-text-primary)]">{pr?.costCenterName ?? '-'}</div>
              </div>
              <div>
                <div className="text-xs text-[var(--color-text-tertiary)]">创建时间</div>
                <div className="mt-1 text-[var(--color-text-primary)]">{pr?.createdAt ?? '-'}</div>
              </div>
              <div>
                <div className="text-xs text-[var(--color-text-tertiary)]">备注</div>
                <div className="mt-1 text-[var(--color-text-primary)]">{note || '—'}</div>
              </div>
            </div>

            <div className="mt-4">
              <div className="mb-1 text-xs font-semibold text-[var(--color-text-tertiary)]">处理意见（可选）</div>
              <Input value={note} onChange={(e) => setNote(e.target.value)} placeholder="同意/退回原因" />
            </div>
          </CardBody>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>流程节点</CardTitle>
          </CardHeader>
          <CardBody>
            <div className="space-y-3 text-sm text-[var(--color-text-secondary)]">
              {pr?.nodes?.map((n) => (
                <div key={n.key} className="rounded-[10px] border border-[var(--color-border-subtle)] bg-[var(--color-bg-surface)] p-3">
                  <div className="flex items-center justify-between gap-3">
                    <div className="min-w-0">
                      <div className="truncate font-medium text-[var(--color-text-primary)]">{n.label}</div>
                      <div className="mt-1 text-xs text-[var(--color-text-tertiary)]">{n.assignee}</div>
                    </div>
                    <Badge tone={n.status === 'done' ? 'success' : n.key === pr.currentNodeKey ? 'info' : 'neutral'}>
                      {n.status === 'done' ? '已完成' : n.key === pr.currentNodeKey ? '处理中' : '未开始'}
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
          <CardTitle>明细</CardTitle>
        </CardHeader>
        <CardBody>
          <div className="overflow-auto">
            <table className="w-full table-auto border-separate border-spacing-0 text-left text-sm">
              <thead>
                <tr className="text-xs text-[var(--color-text-tertiary)]">
                  <th className="border-b border-[var(--color-border-subtle)] px-3 py-2 font-semibold">物料</th>
                  <th className="border-b border-[var(--color-border-subtle)] px-3 py-2 font-semibold">规格</th>
                  <th className="border-b border-[var(--color-border-subtle)] px-3 py-2 font-semibold">数量</th>
                  <th className="border-b border-[var(--color-border-subtle)] px-3 py-2 font-semibold">单价</th>
                  <th className="border-b border-[var(--color-border-subtle)] px-3 py-2 font-semibold">金额</th>
                  <th className="border-b border-[var(--color-border-subtle)] px-3 py-2 font-semibold">需求日期</th>
                </tr>
              </thead>
              <tbody>
                {pr?.lines?.map((l) => (
                  <tr key={l.id} className="hover:bg-black/5 dark:hover:bg-white/5">
                    <td className="border-b border-[var(--color-border-subtle)] px-3 py-2">{l.material}</td>
                    <td className="border-b border-[var(--color-border-subtle)] px-3 py-2">{l.spec}</td>
                    <td className="border-b border-[var(--color-border-subtle)] px-3 py-2">
                      {l.qty} {l.uom}
                    </td>
                    <td className="border-b border-[var(--color-border-subtle)] px-3 py-2">¥{l.unitPrice.toLocaleString()}</td>
                    <td className="border-b border-[var(--color-border-subtle)] px-3 py-2">¥{l.amount.toLocaleString()}</td>
                    <td className="border-b border-[var(--color-border-subtle)] px-3 py-2">{l.needBy}</td>
                  </tr>
                )) ?? null}
              </tbody>
            </table>
          </div>
        </CardBody>
      </Card>

      <Card className="mt-4">
        <CardHeader>
          <CardTitle>附件（mock）</CardTitle>
        </CardHeader>
        <CardBody>
          <div className="flex flex-wrap gap-2">
            {pr?.attachments?.length ? (
              pr.attachments.map((a) => (
                <span
                  key={a}
                  className="inline-flex items-center rounded-[6px] border border-[var(--color-border-subtle)] bg-[var(--color-bg-surface)] px-2 py-1 text-xs text-[var(--color-text-secondary)]"
                >
                  {a}
                </span>
              ))
            ) : (
              <span className="text-sm text-[var(--color-text-tertiary)]">暂无附件</span>
            )}
          </div>
          <div className="mt-3">
            <input
              type="file"
              multiple
              className="block w-full text-sm text-[var(--color-text-tertiary)] file:mr-3 file:rounded-[6px] file:border-0 file:bg-[var(--color-bg-surface)] file:px-3 file:py-2 file:text-sm file:font-medium file:text-[var(--color-text-primary)]"
            />
          </div>
        </CardBody>
      </Card>

      {pr ? <div className="mt-4"><WorkflowInstanceCard businessKey={pr.id} businessType="procurement_pr" /></div> : null}
    </div>
  )
}
