import { Link, useSearchParams } from 'react-router-dom'
import { Badge } from '../../ui/Badge'
import { Card, CardBody, CardHeader, CardTitle } from '../../ui/Card'
import { PageHeader } from '../../ui/PageHeader'
import { useExpenseFlow } from '../../state/expense/ExpenseFlowContext'
import { useProcurementFlow } from '../../state/procurement/ProcurementFlowContext'
import { useContractFlow } from '../../state/contract/ContractFlowContext'

const seedItems = [
  { id: 'APR-001', title: 'PR-20260605-001 采购申请审批', domain: 'management', status: 'in_review', overdue: false },
  { id: 'APR-002', title: '供应商准入 SUP-002 证照到期复核', domain: 'management', status: 'in_review', overdue: true },
  { id: 'APR-003', title: '招聘需求（质量部）编制审批', domain: 'support', status: 'in_review', overdue: false },
]

export function ApprovalCenterPage() {
  const [params] = useSearchParams()
  const from = params.get('from')
  const expense = useExpenseFlow()
  const procurement = useProcurementFlow()
  const contract = useContractFlow()

  const workItems = [...expense.workItems, ...procurement.workItems, ...contract.workItems]

  const items = [...workItems, ...seedItems].map((it) => {
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

  const todo = items.filter((x) => x.status === 'in_review')
  const done = items.filter((x) => x.status !== 'in_review')

  return (
    <div>
      <PageHeader
        title="审批中心"
        description={from ? `从 ${from} 跳转（示例）` : '跨域统一入口：待办 / 已办 / 抄送（界面示例）'}
      />

      <Card>
        <CardHeader>
          <CardTitle>待办</CardTitle>
        </CardHeader>
        <CardBody>
          <div className="space-y-2">
            {todo.map((it) => (
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
            ))}
          </div>
        </CardBody>
      </Card>

      <Card className="mt-4">
        <CardHeader>
          <CardTitle>已办</CardTitle>
        </CardHeader>
        <CardBody>
          <div className="space-y-2">
            {done.length ? (
              done.map((it) => (
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
