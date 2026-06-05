import { Link } from 'react-router-dom'
import { Badge } from '../../../ui/Badge'
import { Button } from '../../../ui/Button'
import { Card, CardBody, CardHeader, CardTitle } from '../../../ui/Card'
import { PageHeader } from '../../../ui/PageHeader'

export function ProcurementGuidePage() {
  return (
    <div>
      <PageHeader
        title="采购流程"
        description="流程说明 + 发起入口（mock）"
        right={
          <div className="flex flex-wrap items-center gap-2">
            <Link to="/management/procurement/pr/new">
              <Button variant="primary">发起 PR</Button>
            </Link>
            <Link to="/management/approval?from=procurement">
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
                <div className="text-sm font-medium text-[var(--color-text-primary)]">闭环路径</div>
                <div className="mt-2 flex flex-wrap items-center gap-2 text-sm text-[var(--color-text-secondary)]">
                  <Badge tone="info">PR 采购申请</Badge>
                  <span>→</span>
                  <Badge tone="domain-management">审批</Badge>
                  <span>→</span>
                  <Badge tone="domain-management">RFQ/比价</Badge>
                  <span>→</span>
                  <Badge tone="domain-management">定标</Badge>
                  <span>→</span>
                  <Badge tone="success">PO/下单</Badge>
                  <span>→</span>
                  <Badge tone="neutral">验收/付款</Badge>
                </div>
              </div>

              <div className="rounded-[10px] border border-[var(--color-border-subtle)] bg-[var(--color-bg-surface)] p-3">
                <div className="text-sm font-medium text-[var(--color-text-primary)]">审批链（示例）</div>
                <div className="mt-2 flex flex-wrap items-center gap-2 text-sm text-[var(--color-text-secondary)]">
                  <Badge tone="domain-management">项目负责人</Badge>
                  <span>→</span>
                  <Badge tone="domain-management">成本中心负责人</Badge>
                  <span>→</span>
                  <Badge tone="domain-management">部门负责人</Badge>
                  <span>→</span>
                  <Badge tone="domain-management">采购评审</Badge>
                  <span>→</span>
                  <Badge tone="domain-management">财务审核</Badge>
                  <span>→</span>
                  <Badge tone="neutral">归档</Badge>
                </div>
              </div>
            </div>
          </CardBody>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>提交前自检</CardTitle>
          </CardHeader>
          <CardBody>
            <div className="space-y-3 text-sm text-[var(--color-text-secondary)]">
              <div className="rounded-[10px] border border-[var(--color-border-subtle)] bg-[var(--color-bg-surface)] p-3">
                <div className="text-sm font-medium text-[var(--color-text-primary)]">必填项</div>
                <div className="mt-2 space-y-1 text-xs text-[var(--color-text-tertiary)]">
                  <div>项目、成本中心、需求日期、明细行（物料/数量/预算价）</div>
                </div>
              </div>
              <div className="rounded-[10px] border border-[var(--color-border-subtle)] bg-[var(--color-bg-surface)] p-3">
                <div className="text-sm font-medium text-[var(--color-text-primary)]">附件（示例）</div>
                <div className="mt-2 space-y-1 text-xs text-[var(--color-text-tertiary)]">
                  <div>技术规格/图纸、历史用量依据、比价记录（按制度）</div>
                </div>
              </div>
            </div>
          </CardBody>
        </Card>
      </div>
    </div>
  )
}

