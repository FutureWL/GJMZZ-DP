import { Link } from 'react-router-dom'
import { Badge } from '../../../ui/Badge'
import { Button } from '../../../ui/Button'
import { Card, CardBody, CardHeader, CardTitle } from '../../../ui/Card'
import { PageHeader } from '../../../ui/PageHeader'

export function MaintenanceGuidePage() {
  return (
    <div>
      <PageHeader
        title="维修工单流程"
        description="闭环说明 + 报修入口（mock）"
        right={
          <div className="flex flex-wrap items-center gap-2">
            <Link to="/production/maintenance/new">
              <Button variant="primary">发起报修</Button>
            </Link>
            <Link to="/production/maintenance/dashboard">
              <Button variant="secondary">维修看板</Button>
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
                  <Badge tone="info">报修</Badge>
                  <span>→</span>
                  <Badge tone="domain-production">派工</Badge>
                  <span>→</span>
                  <Badge tone="domain-production">接单/到场</Badge>
                  <span>→</span>
                  <Badge tone="domain-production">维修中</Badge>
                  <span>→</span>
                  <Badge tone="success">完工</Badge>
                  <span>→</span>
                  <Badge tone="neutral">验收/关闭</Badge>
                </div>
              </div>

              <div className="rounded-[10px] border border-[var(--color-border-subtle)] bg-[var(--color-bg-surface)] p-3">
                <div className="text-sm font-medium text-[var(--color-text-primary)]">角色与职责（示例）</div>
                <div className="mt-2 space-y-1 text-sm text-[var(--color-text-secondary)]">
                  <div>报修人：描述现象、上传附件、配合验收</div>
                  <div>设备主管/班长：派工、催办、异常升级</div>
                  <div>维修工程师：接单、到场、维修回填（原因/措施/用料）</div>
                  <div>验收人：复测确认、关闭工单</div>
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
                  <div>设备、优先级、现象描述、影响范围</div>
                </div>
              </div>
              <div className="rounded-[10px] border border-[var(--color-border-subtle)] bg-[var(--color-bg-surface)] p-3">
                <div className="text-sm font-medium text-[var(--color-text-primary)]">建议附件</div>
                <div className="mt-2 space-y-1 text-xs text-[var(--color-text-tertiary)]">
                  <div>现场照片/视频、告警截图、设备编号位置照片</div>
                </div>
              </div>
              <div className="rounded-[10px] border border-[var(--color-border-subtle)] bg-[var(--color-bg-surface)] p-3">
                <div className="text-sm font-medium text-[var(--color-text-primary)]">闭环标准</div>
                <div className="mt-2 space-y-1 text-xs text-[var(--color-text-tertiary)]">
                  <div>完工必须回填：原因、措施、用料、复测结果</div>
                  <div>验收通过后进入关闭，形成可追溯记录</div>
                </div>
              </div>
            </div>
          </CardBody>
        </Card>
      </div>
    </div>
  )
}

