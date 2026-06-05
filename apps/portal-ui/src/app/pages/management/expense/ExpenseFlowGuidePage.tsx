import { Link } from 'react-router-dom'
import { Badge } from '../../../ui/Badge'
import { Button } from '../../../ui/Button'
import { Card, CardBody, CardHeader, CardTitle } from '../../../ui/Card'
import { PageHeader } from '../../../ui/PageHeader'

export function ExpenseFlowGuidePage() {
  return (
    <div>
      <PageHeader
        title="费用报销流程"
        description="流程说明 + 发起入口（mock）"
        right={
          <div className="flex flex-wrap items-center gap-2">
            <Link to="/management/expense/claims/new">
              <Button variant="primary">发起报销</Button>
            </Link>
            <Link to="/management/expense/dashboard">
              <Button variant="secondary">流程看板</Button>
            </Link>
            <Link to="/management/approval?from=expense-flow">
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
                <div className="text-sm font-medium text-[var(--color-text-primary)]">状态机（建议统一口径）</div>
                <div className="mt-2 flex flex-wrap items-center gap-2 text-sm text-[var(--color-text-secondary)]">
                  <Badge tone="neutral">草稿</Badge>
                  <span>→</span>
                  <Badge tone="info">审批中</Badge>
                  <span>→</span>
                  <Badge tone="success">通过</Badge>
                  <span>→</span>
                  <Badge tone="success">付款</Badge>
                  <span>→</span>
                  <Badge tone="neutral">归档</Badge>
                  <span className="text-xs text-[var(--color-text-tertiary)]">（驳回/退回/作废为终态或回到发起人）</span>
                </div>
              </div>

              <div className="rounded-[10px] border border-[var(--color-border-subtle)] bg-[var(--color-bg-surface)] p-3">
                <div className="text-sm font-medium text-[var(--color-text-primary)]">默认审批链（启用项目负责人）</div>
                <div className="mt-2 flex flex-wrap items-center gap-2 text-sm text-[var(--color-text-secondary)]">
                  <Badge tone="domain-management">项目负责人</Badge>
                  <span>→</span>
                  <Badge tone="domain-management">成本中心负责人</Badge>
                  <span>→</span>
                  <Badge tone="domain-management">部门负责人</Badge>
                  <span>→</span>
                  <Badge tone="domain-management">财务审核</Badge>
                  <span>→</span>
                  <Badge tone="domain-management">出纳付款</Badge>
                  <span>→</span>
                  <Badge tone="neutral">归档</Badge>
                </div>
              </div>

              <div className="rounded-[10px] border border-[var(--color-border-subtle)] bg-[var(--color-bg-surface)] p-3">
                <div className="text-sm font-medium text-[var(--color-text-primary)]">加签规则（示例）</div>
                <div className="mt-2 space-y-1 text-sm text-[var(--color-text-secondary)]">
                  <div>金额三档：T1 ≤ 5,000；T2 5,000~20,000；T3 &gt; 20,000</div>
                  <div>T2：部门负责人后加签 <span className="font-medium text-[var(--color-text-primary)]">分管领导</span></div>
                  <div>T3：部门负责人后加签 <span className="font-medium text-[var(--color-text-primary)]">财务负责人 → 分管领导 → 总经办</span></div>
                  <div>超预算/超标准：必须加签（与金额规则叠加去重）</div>
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
                <div className="text-sm font-medium text-[var(--color-text-primary)]">必填字段</div>
                <div className="mt-2 space-y-1 text-xs text-[var(--color-text-tertiary)]">
                  <div>项目、成本中心、费用类型、收款方（对公）、明细行、金额</div>
                </div>
              </div>
              <div className="rounded-[10px] border border-[var(--color-border-subtle)] bg-[var(--color-bg-surface)] p-3">
                <div className="text-sm font-medium text-[var(--color-text-primary)]">附件清单（示例）</div>
                <div className="mt-2 space-y-1 text-xs text-[var(--color-text-tertiary)]">
                  <div>差旅：发票/行程单/住宿凭证</div>
                  <div>招待：招待清单/参与人员/事由</div>
                  <div>对公：合同/订单/验收（按制度）</div>
                </div>
              </div>
              <div className="rounded-[10px] border border-[var(--color-border-subtle)] bg-[var(--color-bg-surface)] p-3">
                <div className="text-sm font-medium text-[var(--color-text-primary)]">常见退回原因</div>
                <div className="mt-2 space-y-1 text-xs text-[var(--color-text-tertiary)]">
                  <div>发票信息不完整/重复</div>
                  <div>明细行科目与用途不清晰</div>
                  <div>缺附件或附件不匹配</div>
                  <div>超预算/超标准未说明原因</div>
                </div>
              </div>
            </div>
          </CardBody>
        </Card>
      </div>
    </div>
  )
}

