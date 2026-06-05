import { approvalWorkItems, contractReviewFlows, expenseClaims, procurementRequestFlows } from '@factory/mock-data'
import { ScaleFit } from '../layout/ScaleFit'
import { ScreenHeader } from '../layout/ScreenHeader'
import { useNow } from '../shared/useNow'
import { KpiCard } from '../ui/KpiCard'
import { Section } from '../ui/Section'

function sum(nums: number[]) {
  return nums.reduce((acc, v) => acc + v, 0)
}

export function ManagementScreen() {
  const now = useNow(1000)

  const todoApprovals = approvalWorkItems.filter((w) => w.status === 'todo')
  const expenseInReview = expenseClaims.filter((e) => e.status === 'in_review')
  const contractInReview = contractReviewFlows.filter((c) => c.status === 'in_review')
  const prInReview = procurementRequestFlows.filter((p) => p.status === 'in_review')

  const expenseAmount = sum(expenseInReview.map((e) => e.amountTotal))
  const contractAmount = sum(contractInReview.map((c) => c.amountTotal))
  const prAmount = sum(prInReview.map((p) => p.amountTotal))

  return (
    <ScaleFit designWidth={1920} designHeight={1080}>
      <div className="h-full w-full p-8">
        <ScreenHeader
          title="经营概览"
          subtitle="审批待办 / 费用 / 合同 / 采购流程"
          metaRight={`更新时间：${now.toLocaleString('zh-CN', { hour12: false })}`}
        />

        <div className="mt-6 grid grid-cols-6 gap-4">
          <KpiCard
            label="审批待办"
            value={todoApprovals.length}
            helper={`其中逾期 ${todoApprovals.filter((w) => w.overdue).length}`}
            status={todoApprovals.some((w) => w.overdue) ? 'bad' : 'warn'}
          />
          <KpiCard
            label="费用报销在审"
            value={expenseInReview.length}
            helper={`金额合计 ¥${expenseAmount.toLocaleString('zh-CN')}`}
            status="warn"
          />
          <KpiCard
            label="合同评审在审"
            value={contractInReview.length}
            helper={`金额合计 ¥${contractAmount.toLocaleString('zh-CN')}`}
            status="warn"
          />
          <KpiCard
            label="采购申请在审"
            value={prInReview.length}
            helper={`金额合计 ¥${prAmount.toLocaleString('zh-CN')}`}
            status="warn"
          />
          <KpiCard label="费用已归档/付款" value={expenseClaims.filter((e) => e.status === 'paid').length} status="good" />
          <KpiCard label="流程草稿" value={expenseClaims.filter((e) => e.status === 'draft').length} status="good" />
        </div>

        <div className="mt-6 grid grid-cols-12 gap-4">
          <Section title="审批待办" subtitle="当前需要处理的事项" className="col-span-7">
            <div className="grid grid-cols-5 gap-2 rounded-xl border border-[var(--color-border-subtle)] bg-[var(--color-bg-surface-strong)] px-3 py-2 text-xs text-[var(--color-text-tertiary)]">
              <div>标题</div>
              <div>域</div>
              <div>类型</div>
              <div>指派</div>
              <div>创建时间</div>
            </div>
            <div className="mt-2 space-y-2">
              {todoApprovals.map((w) => (
                <div
                  key={w.id}
                  className="grid grid-cols-5 items-center gap-2 rounded-lg border border-[var(--color-border-subtle)] bg-white/0 px-3 py-2"
                >
                  <div className="truncate text-sm font-medium text-[var(--color-text-primary)]">{w.title}</div>
                  <div className="text-sm text-[var(--color-text-secondary)]">{w.domain}</div>
                  <div className="text-sm text-[var(--color-text-secondary)]">{w.businessType}</div>
                  <div className="text-sm text-[var(--color-text-secondary)]">{w.assignee ?? '-'}</div>
                  <div className="text-sm text-[var(--color-text-secondary)]">{w.createdAt}</div>
                </div>
              ))}
            </div>
          </Section>

          <div className="col-span-5 grid grid-rows-2 gap-4">
            <Section title="费用报销" subtitle="最近单据" className="p-5">
              <div className="grid grid-cols-4 gap-2 rounded-xl border border-[var(--color-border-subtle)] bg-[var(--color-bg-surface-strong)] px-3 py-2 text-xs text-[var(--color-text-tertiary)]">
                <div>单据</div>
                <div>申请人</div>
                <div>状态</div>
                <div className="text-right">金额</div>
              </div>
              <div className="mt-2 space-y-2">
                {expenseClaims.slice(0, 3).map((e) => (
                  <div
                    key={e.id}
                    className="grid grid-cols-4 items-center gap-2 rounded-lg border border-[var(--color-border-subtle)] bg-white/0 px-3 py-2"
                  >
                    <div className="text-sm font-medium text-[var(--color-text-primary)]">{e.id}</div>
                    <div className="text-sm text-[var(--color-text-secondary)]">{e.applicant}</div>
                    <div className="text-sm text-[var(--color-text-secondary)]">{e.status}</div>
                    <div className="text-right text-sm text-[var(--color-text-secondary)]">
                      ¥{e.amountTotal.toLocaleString('zh-CN')}
                    </div>
                  </div>
                ))}
              </div>
            </Section>

            <Section title="合同 / 采购流程" subtitle="在审列表">
              <div className="space-y-2">
                {contractInReview.map((c) => (
                  <div
                    key={c.id}
                    className="rounded-xl border border-[var(--color-border-subtle)] bg-white/0 px-3 py-2"
                  >
                    <div className="flex items-center justify-between gap-3">
                      <div className="truncate text-sm font-medium text-[var(--color-text-primary)]">{c.title}</div>
                      <div className="text-sm text-[var(--color-text-secondary)]">¥{c.amountTotal.toLocaleString('zh-CN')}</div>
                    </div>
                    <div className="mt-1 text-xs text-[var(--color-text-tertiary)]">
                      {c.departmentName} · {c.currentNodeKey ?? '-'} · {c.currentAssignee ?? '-'}
                    </div>
                  </div>
                ))}
                {prInReview.map((p) => (
                  <div
                    key={p.id}
                    className="rounded-xl border border-[var(--color-border-subtle)] bg-white/0 px-3 py-2"
                  >
                    <div className="flex items-center justify-between gap-3">
                      <div className="truncate text-sm font-medium text-[var(--color-text-primary)]">{p.title}</div>
                      <div className="text-sm text-[var(--color-text-secondary)]">¥{p.amountTotal.toLocaleString('zh-CN')}</div>
                    </div>
                    <div className="mt-1 text-xs text-[var(--color-text-tertiary)]">
                      {p.departmentName} · {p.currentNodeKey ?? '-'} · {p.currentAssignee ?? '-'}
                    </div>
                  </div>
                ))}
              </div>
            </Section>
          </div>
        </div>
      </div>
    </ScaleFit>
  )
}
