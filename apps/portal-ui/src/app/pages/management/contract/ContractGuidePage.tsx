import { Link } from 'react-router-dom'
import { Badge } from '../../../ui/Badge'
import { Button } from '../../../ui/Button'
import { Card, CardBody, CardHeader, CardTitle } from '../../../ui/Card'
import { PageHeader } from '../../../ui/PageHeader'

export function ContractGuidePage() {
  return (
    <div>
      <PageHeader
        title="合同评审流程"
        description="流程说明 + 发起入口（mock）"
        right={
          <div className="flex flex-wrap items-center gap-2">
            <Link to="/management/contract/reviews/new">
              <Button variant="primary">发起评审</Button>
            </Link>
            <Link to="/management/approval?from=contract">
              <Button variant="secondary">审批中心</Button>
            </Link>
          </div>
        }
      />

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle>流程概览</CardTitle>
          </CardHeader>
          <CardBody>
            <div className="space-y-3">
              <div className="rounded-[10px] border border-[var(--color-border-subtle)] bg-[var(--color-bg-surface)] p-3">
                <div className="text-sm font-medium text-[var(--color-text-primary)]">状态机</div>
                <div className="mt-2 flex flex-wrap items-center gap-2 text-sm text-[var(--color-text-secondary)]">
                  <Badge tone="neutral">草稿</Badge>
                  <span>→</span>
                  <Badge tone="info">评审中</Badge>
                  <span>→</span>
                  <Badge tone="success">已通过</Badge>
                  <span>→</span>
                  <Badge tone="domain-management">盖章</Badge>
                  <span>→</span>
                  <Badge tone="neutral">归档</Badge>
                </div>
              </div>

              <div className="rounded-[10px] border border-[var(--color-border-subtle)] bg-[var(--color-bg-surface)] p-3">
                <div className="text-sm font-medium text-[var(--color-text-primary)]">默认审批链</div>
                <div className="mt-2 flex flex-wrap items-center gap-2 text-sm text-[var(--color-text-secondary)]">
                  <Badge tone="domain-management">项目负责人</Badge>
                  <span>→</span>
                  <Badge tone="domain-management">成本中心负责人</Badge>
                  <span>→</span>
                  <Badge tone="domain-management">部门负责人</Badge>
                  <span>→</span>
                  <Badge tone="domain-management">法务评审</Badge>
                  <span>→</span>
                  <Badge tone="domain-management">财务审核</Badge>
                  <span>→</span>
                  <Badge tone="domain-management">盖章</Badge>
                  <span>→</span>
                  <Badge tone="neutral">归档</Badge>
                </div>
              </div>
            </div>
          </CardBody>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>材料清单</CardTitle>
          </CardHeader>
          <CardBody>
            <div className="space-y-3 text-sm text-[var(--color-text-secondary)]">
              <div className="rounded-[10px] border border-[var(--color-border-subtle)] bg-[var(--color-bg-surface)] p-3">
                <div className="text-sm font-medium text-[var(--color-text-primary)]">必备附件（示例）</div>
                <div className="mt-2 space-y-1 text-xs text-[var(--color-text-tertiary)]">
                  <div>合同正文、资质文件、报价/比价依据</div>
                  <div>付款条款与验收条款说明</div>
                </div>
              </div>
              <div className="rounded-[10px] border border-[var(--color-border-subtle)] bg-[var(--color-bg-surface)] p-3">
                <div className="text-sm font-medium text-[var(--color-text-primary)]">常见退回原因</div>
                <div className="mt-2 space-y-1 text-xs text-[var(--color-text-tertiary)]">
                  <div>条款不清晰/风险点未说明</div>
                  <div>附件缺失或版本不一致</div>
                  <div>付款节点与验收不匹配</div>
                </div>
              </div>
            </div>
          </CardBody>
        </Card>
      </div>
    </div>
  )
}

