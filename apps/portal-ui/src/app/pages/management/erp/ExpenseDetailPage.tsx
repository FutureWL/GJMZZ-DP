import { Link, useParams } from 'react-router-dom'
import { expenses } from '../../../mock/data'
import { Badge } from '../../../ui/Badge'
import { Button } from '../../../ui/Button'
import { Card, CardBody, CardHeader, CardTitle } from '../../../ui/Card'
import { PageHeader } from '../../../ui/PageHeader'

export function ExpenseDetailPage() {
  const { id } = useParams()
  const exp = expenses.find((e) => e.id === id)

  return (
    <div>
      <PageHeader
        title={exp ? `报销详情：${exp.title}` : '报销详情'}
        description="单据详情 + 审批轨迹（占位）"
        right={
          <div className="flex items-center gap-2">
            <Link to="/management/approval?from=expense">
              <Button variant="secondary">去审批中心</Button>
            </Link>
            <Button variant="primary">发起审批（占位）</Button>
          </div>
        }
      />

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle>单据信息</CardTitle>
          </CardHeader>
          <CardBody>
            <div className="grid grid-cols-1 gap-3 text-sm md:grid-cols-2">
              <div>
                <div className="text-xs text-[var(--color-text-tertiary)]">单据ID</div>
                <div className="mt-1 text-[var(--color-text-primary)]">{exp?.id ?? '-'}</div>
              </div>
              <div>
                <div className="text-xs text-[var(--color-text-tertiary)]">状态</div>
                <div className="mt-1">
                  <Badge tone={exp?.status === 'approved' ? 'success' : exp?.status === 'rejected' ? 'error' : exp?.status === 'in_review' ? 'info' : 'neutral'}>
                    {exp?.status ?? '-'}
                  </Badge>
                </div>
              </div>
              <div>
                <div className="text-xs text-[var(--color-text-tertiary)]">申请人</div>
                <div className="mt-1 text-[var(--color-text-primary)]">{exp?.applicant ?? '-'}</div>
              </div>
              <div>
                <div className="text-xs text-[var(--color-text-tertiary)]">金额</div>
                <div className="mt-1 text-[var(--color-text-primary)]">
                  {exp ? `¥${exp.amount.toLocaleString()}` : '-'}
                </div>
              </div>
              <div className="md:col-span-2">
                <div className="text-xs text-[var(--color-text-tertiary)]">创建时间</div>
                <div className="mt-1 text-[var(--color-text-primary)]">{exp?.createdAt ?? '-'}</div>
              </div>
            </div>

            <div className="mt-4 rounded-[10px] border border-[var(--color-border-subtle)] bg-[var(--color-bg-surface)] p-3">
              <div className="text-xs font-semibold text-[var(--color-text-tertiary)]">明细（占位）</div>
              <div className="mt-2 text-sm text-[var(--color-text-secondary)]">费用类型、票据、行程、科目：占位</div>
            </div>
          </CardBody>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>审批轨迹（占位）</CardTitle>
          </CardHeader>
          <CardBody>
            <div className="space-y-3 text-sm text-[var(--color-text-secondary)]">
              <div className="rounded-[10px] border border-[var(--color-border-subtle)] bg-[var(--color-bg-surface)] p-3">
                <div className="flex items-center justify-between gap-3">
                  <div className="font-medium text-[var(--color-text-primary)]">提交</div>
                  <Badge tone="success">已完成</Badge>
                </div>
                <div className="mt-1 text-xs text-[var(--color-text-tertiary)]">{exp?.createdAt ?? '-'}</div>
              </div>
              <div className="rounded-[10px] border border-[var(--color-border-subtle)] bg-[var(--color-bg-surface)] p-3">
                <div className="flex items-center justify-between gap-3">
                  <div className="font-medium text-[var(--color-text-primary)]">财务审核</div>
                  <Badge tone={exp?.status === 'approved' ? 'success' : exp?.status === 'rejected' ? 'error' : 'info'}>
                    {exp?.status === 'approved' ? '通过' : exp?.status === 'rejected' ? '驳回' : '进行中'}
                  </Badge>
                </div>
                <div className="mt-1 text-xs text-[var(--color-text-tertiary)]">意见/附件位</div>
              </div>
            </div>
          </CardBody>
        </Card>
      </div>
    </div>
  )
}

