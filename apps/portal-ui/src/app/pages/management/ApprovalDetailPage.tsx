import { useParams } from 'react-router-dom'
import { Badge } from '../../ui/Badge'
import { Button } from '../../ui/Button'
import { Card, CardBody, CardHeader, CardTitle } from '../../ui/Card'
import { PageHeader } from '../../ui/PageHeader'

export function ApprovalDetailPage() {
  const { id } = useParams()

  return (
    <div>
      <PageHeader
        title={`审批详情：${id ?? '-'}`}
        description="统一模板：节点/意见/附件位（仅界面）"
        right={
          <div className="flex items-center gap-2">
            <Button variant="primary">同意（占位）</Button>
            <Button variant="secondary">驳回（占位）</Button>
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
            </div>
          </CardBody>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>意见与附件</CardTitle>
          </CardHeader>
          <CardBody>
            <div className="space-y-2 text-sm text-[var(--color-text-secondary)]">
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
            </div>
          </CardBody>
        </Card>
      </div>
    </div>
  )
}

