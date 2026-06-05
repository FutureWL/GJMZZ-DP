import { Link, useParams } from 'react-router-dom'
import { Badge } from '../../ui/Badge'
import { Button } from '../../ui/Button'
import { Card, CardBody, CardHeader, CardTitle } from '../../ui/Card'
import { PageHeader } from '../../ui/PageHeader'
import { Input } from '../../ui/Input'
import { useState } from 'react'
import { useExpenseFlow } from '../../state/expense/ExpenseFlowContext'
import { useProcurementFlow } from '../../state/procurement/ProcurementFlowContext'
import { useContractFlow } from '../../state/contract/ContractFlowContext'

export function ApprovalDetailPage() {
  const { id } = useParams()
  const expense = useExpenseFlow()
  const procurement = useProcurementFlow()
  const contract = useContractFlow()

  const work = id
    ? [...expense.workItems, ...procurement.workItems, ...contract.workItems].find((w) => w.id === id)
    : undefined

  const claim = work?.businessType === 'expense_claim' ? expense.getClaim(work.businessId) : undefined
  const pr = work?.businessType === 'procurement_pr' ? procurement.getRequest(work.businessId) : undefined
  const ctr = work?.businessType === 'contract_review' ? contract.getReview(work.businessId) : undefined

  const [note, setNote] = useState('')

  return (
    <div>
      <PageHeader
        title={`审批详情：${id ?? '-'}`}
        description={
          claim
            ? `${claim.id}｜${claim.title}`
            : pr
              ? `${pr.id}｜${pr.title}`
              : ctr
                ? `${ctr.id}｜${ctr.title}`
                : '统一模板：节点/意见/附件位（仅界面）'
        }
        right={
          <div className="flex items-center gap-2">
            {claim && claim.status === 'in_review' ? (
              <>
                <Button
                  variant="primary"
                  onClick={() => {
                    expense.approve(claim.id, note || undefined)
                    setNote('')
                  }}
                >
                  同意
                </Button>
                <Button
                  variant="secondary"
                  onClick={() => {
                    expense.returnToApplicant(claim.id, note || undefined)
                    setNote('')
                  }}
                >
                  退回修改
                </Button>
                <Button
                  variant="danger"
                  onClick={() => {
                    expense.reject(claim.id, note || undefined)
                    setNote('')
                  }}
                >
                  驳回
                </Button>
              </>
            ) : pr && pr.status === 'in_review' ? (
              <>
                <Button
                  variant="primary"
                  onClick={() => {
                    procurement.approve(pr.id, note || undefined)
                    setNote('')
                  }}
                >
                  同意
                </Button>
                <Button
                  variant="secondary"
                  onClick={() => {
                    procurement.returnToApplicant(pr.id, note || undefined)
                    setNote('')
                  }}
                >
                  退回修改
                </Button>
                <Button
                  variant="danger"
                  onClick={() => {
                    procurement.reject(pr.id, note || undefined)
                    setNote('')
                  }}
                >
                  驳回
                </Button>
              </>
            ) : ctr && ctr.status === 'in_review' ? (
              <>
                <Button
                  variant="primary"
                  onClick={() => {
                    contract.approve(ctr.id, note || undefined)
                    setNote('')
                  }}
                >
                  同意
                </Button>
                <Button
                  variant="secondary"
                  onClick={() => {
                    contract.returnToApplicant(ctr.id, note || undefined)
                    setNote('')
                  }}
                >
                  退回修改
                </Button>
                <Button
                  variant="danger"
                  onClick={() => {
                    contract.reject(ctr.id, note || undefined)
                    setNote('')
                  }}
                >
                  驳回
                </Button>
              </>
            ) : (
              <>
                <Button variant="primary">同意（占位）</Button>
                <Button variant="secondary">驳回（占位）</Button>
              </>
            )}
          </div>
        }
      />

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle>流程节点</CardTitle>
          </CardHeader>
          <CardBody>
            <div className="space-y-3">
              {claim ? (
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
                    {n.completedAt ? <div className="mt-1 text-xs text-[var(--color-text-tertiary)]">{n.completedAt}</div> : null}
                  </div>
                ))
              ) : pr ? (
                pr.nodes.map((n) => (
                  <div
                    key={n.key}
                    className="rounded-[10px] border border-[var(--color-border-subtle)] bg-[var(--color-bg-surface)] p-3"
                  >
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
                ))
              ) : ctr ? (
                ctr.nodes.map((n) => (
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
                ))
              ) : (
                <>
                  <div className="rounded-[10px] border border-[var(--color-border-subtle)] bg-[var(--color-bg-surface)] p-3">
                    <div className="flex items-center justify-between gap-3">
                      <div className="font-medium text-[var(--color-text-primary)]">提交</div>
                      <Badge tone="success">已完成</Badge>
                    </div>
                    <div className="mt-1 text-xs text-[var(--color-text-tertiary)]">2026-06-05 09:20</div>
                  </div>
                  <div className="rounded-[10px] border border-[var(--color-border-subtle)] bg-[var(--color-bg-surface)] p-3">
                    <div className="flex items-center justify-between gap-3">
                      <div className="font-medium text-[var(--color-text-primary)]">当前节点：审批</div>
                      <Badge tone="info">处理中</Badge>
                    </div>
                    <div className="mt-1 text-xs text-[var(--color-text-tertiary)]">超时标签/加签/转交：占位</div>
                  </div>
                  <div className="rounded-[10px] border border-[var(--color-border-subtle)] bg-[var(--color-bg-surface)] p-3">
                    <div className="flex items-center justify-between gap-3">
                      <div className="font-medium text-[var(--color-text-primary)]">结束</div>
                      <Badge tone="neutral">未开始</Badge>
                    </div>
                    <div className="mt-1 text-xs text-[var(--color-text-tertiary)]">占位</div>
                  </div>
                </>
              )}
            </div>
          </CardBody>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>意见与附件</CardTitle>
          </CardHeader>
          <CardBody>
            <div className="space-y-2 text-sm text-[var(--color-text-secondary)]">
              {claim ? (
                <>
                  <div>
                    <div className="mb-1 text-xs font-semibold text-[var(--color-text-tertiary)]">处理意见（可选）</div>
                    <Input value={note} onChange={(e) => setNote(e.target.value)} placeholder="同意/退回/驳回原因（mock）" />
                  </div>
                  <div className="rounded-[10px] border border-[var(--color-border-subtle)] bg-[var(--color-bg-surface)] p-3">
                    <div className="flex items-center justify-between gap-3">
                      <div className="font-medium text-[var(--color-text-primary)]">关联单据</div>
                      <Link
                        to={`/management/expense/claims/${encodeURIComponent(claim.id)}`}
                        className="text-sm text-[var(--color-primary)] hover:underline"
                      >
                        打开
                      </Link>
                    </div>
                    <div className="mt-2 text-xs text-[var(--color-text-tertiary)]">{claim.title}</div>
                    <div className="mt-2 text-xs text-[var(--color-text-tertiary)]">
                      附件：{claim.attachments.length ? claim.attachments.join('、') : '无'}
                    </div>
                  </div>
                  <div className="space-y-2">
                    {claim.timeline.slice().reverse().slice(0, 5).map((t, idx) => (
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
                    ))}
                  </div>
                </>
              ) : pr ? (
                <>
                  <div>
                    <div className="mb-1 text-xs font-semibold text-[var(--color-text-tertiary)]">处理意见（可选）</div>
                    <Input value={note} onChange={(e) => setNote(e.target.value)} placeholder="同意/退回/驳回原因（mock）" />
                  </div>
                  <div className="rounded-[10px] border border-[var(--color-border-subtle)] bg-[var(--color-bg-surface)] p-3">
                    <div className="flex items-center justify-between gap-3">
                      <div className="font-medium text-[var(--color-text-primary)]">关联单据</div>
                      <Link
                        to={`/management/procurement/pr/${encodeURIComponent(pr.id)}`}
                        className="text-sm text-[var(--color-primary)] hover:underline"
                      >
                        打开
                      </Link>
                    </div>
                    <div className="mt-2 text-xs text-[var(--color-text-tertiary)]">{pr.title}</div>
                    <div className="mt-2 text-xs text-[var(--color-text-tertiary)]">
                      附件：{pr.attachments.length ? pr.attachments.join('、') : '无'}
                    </div>
                  </div>
                  <div className="space-y-2">
                    {pr.timeline.slice().reverse().slice(0, 5).map((t, idx) => (
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
                    ))}
                  </div>
                </>
              ) : ctr ? (
                <>
                  <div>
                    <div className="mb-1 text-xs font-semibold text-[var(--color-text-tertiary)]">处理意见（可选）</div>
                    <Input value={note} onChange={(e) => setNote(e.target.value)} placeholder="同意/退回/驳回原因（mock）" />
                  </div>
                  <div className="rounded-[10px] border border-[var(--color-border-subtle)] bg-[var(--color-bg-surface)] p-3">
                    <div className="flex items-center justify-between gap-3">
                      <div className="font-medium text-[var(--color-text-primary)]">关联单据</div>
                      <Link
                        to={`/management/contract/reviews/${encodeURIComponent(ctr.id)}`}
                        className="text-sm text-[var(--color-primary)] hover:underline"
                      >
                        打开
                      </Link>
                    </div>
                    <div className="mt-2 text-xs text-[var(--color-text-tertiary)]">{ctr.title}</div>
                    <div className="mt-2 text-xs text-[var(--color-text-tertiary)]">
                      附件：{ctr.attachments.length ? ctr.attachments.join('、') : '无'}
                    </div>
                  </div>
                  <div className="space-y-2">
                    {ctr.timeline.slice().reverse().slice(0, 5).map((t, idx) => (
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
                    ))}
                  </div>
                </>
              ) : (
                <>
                  <div className="rounded-[10px] border border-[var(--color-border-subtle)] bg-[var(--color-bg-surface)] p-3">
                    <div className="font-medium text-[var(--color-text-primary)]">张工</div>
                    <div className="mt-1 text-xs text-[var(--color-text-tertiary)]">2026-06-05 09:20</div>
                    <div className="mt-2">提交申请（占位）</div>
                  </div>
                  <div className="rounded-[10px] border border-[var(--color-border-subtle)] bg-[var(--color-bg-surface)] p-3">
                    <div className="font-medium text-[var(--color-text-primary)]">部门负责人</div>
                    <div className="mt-1 text-xs text-[var(--color-text-tertiary)]">待处理</div>
                    <div className="mt-2">附件占位</div>
                  </div>
                </>
              )}
            </div>
          </CardBody>
        </Card>
      </div>
    </div>
  )
}
