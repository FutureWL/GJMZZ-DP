import { Link, useSearchParams } from 'react-router-dom'
import { Badge } from '../../ui/Badge'
import { Card, CardBody, CardHeader, CardTitle } from '../../ui/Card'
import { PageHeader } from '../../ui/PageHeader'

const items = [
  { id: 'APR-001', title: 'PR-20260605-001 采购申请审批', domain: 'management', status: 'in_review', overdue: false },
  { id: 'APR-002', title: '供应商准入 SUP-002 证照到期复核', domain: 'management', status: 'in_review', overdue: true },
  { id: 'APR-003', title: '招聘需求（质量部）编制审批', domain: 'support', status: 'in_review', overdue: false },
]

export function ApprovalCenterPage() {
  const [params] = useSearchParams()
  const from = params.get('from')

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
            {items.map((it) => (
              <div
                key={it.id}
                className="flex flex-wrap items-center justify-between gap-3 rounded-[10px] border border-[var(--color-border-subtle)] bg-[var(--color-bg-surface)] p-3"
              >
                <div className="min-w-0">
                  <div className="truncate text-sm font-medium text-[var(--color-text-primary)]">
                    {it.title}
                  </div>
                  <div className="mt-1 flex items-center gap-2 text-xs text-[var(--color-text-tertiary)]">
                    <span>{it.id}</span>
                    {it.overdue ? <Badge tone="warning">超时</Badge> : <Badge tone="neutral">正常</Badge>}
                    {it.domain === 'support' ? (
                      <Badge tone="domain-support">支持</Badge>
                    ) : (
                      <Badge tone="domain-management">管理</Badge>
                    )}
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Link to="/management/approval/detail/APR-001" className="text-sm text-[var(--color-primary)] hover:underline">
                    查看详情
                  </Link>
                </div>
              </div>
            ))}
          </div>
        </CardBody>
      </Card>
    </div>
  )
}

