import { useMemo } from 'react'
import { Link, useParams } from 'react-router-dom'
import { customers } from '../../../mock/data'
import { Badge, type Tone } from '../../../ui/Badge'
import { Button } from '../../../ui/Button'
import { Card, CardBody, CardHeader, CardTitle } from '../../../ui/Card'
import { PageHeader } from '../../../ui/PageHeader'
import { findOrder360, type MilestoneStatus, type OrderStatus, type QualityDocStatus } from './mockOrders'

function statusTone(status: OrderStatus): Tone {
  if (status === 'in_production') return 'info'
  if (status === 'quality_hold') return 'warning'
  if (status === 'shipped') return 'success'
  if (status === 'closed') return 'neutral'
  if (status === 'released') return 'info'
  return 'neutral'
}

function statusLabel(status: OrderStatus) {
  if (status === 'new') return '新建'
  if (status === 'released') return '已下达'
  if (status === 'in_production') return '生产中'
  if (status === 'quality_hold') return '质量冻结'
  if (status === 'shipped') return '已发货'
  return '已关闭'
}

function milestoneTone(status: MilestoneStatus): Tone {
  if (status === 'done') return 'success'
  if (status === 'doing') return 'info'
  return 'neutral'
}

function milestoneLabel(status: MilestoneStatus) {
  if (status === 'done') return '已完成'
  if (status === 'doing') return '进行中'
  return '未开始'
}

function docTone(status: QualityDocStatus): Tone {
  if (status === 'complete') return 'success'
  if (status === 'collecting') return 'info'
  return 'warning'
}

function docLabel(status: QualityDocStatus) {
  if (status === 'complete') return '已齐套'
  if (status === 'collecting') return '收集中'
  return '缺失'
}

export function Order360DetailPage() {
  const { id } = useParams()
  const order = useMemo(() => findOrder360(id), [id])
  const customerName = customers.find((c) => c.id === order?.customerId)?.name

  return (
    <div>
      <PageHeader
        title={order ? `订单360：${order.orderNo}` : '订单360'}
        description="ERP订单 / MES工单 / QMS检验资料的一屏聚合（先用Mock数据，功能后续接入）"
        right={
          <div className="flex items-center gap-2">
            <Button variant="secondary">导出资料包（占位）</Button>
            <Button variant="secondary">创建协同记录（占位）</Button>
            <Button variant="primary">标记异常（占位）</Button>
          </div>
        }
      />

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle>概览</CardTitle>
          </CardHeader>
          <CardBody>
            <div className="grid grid-cols-1 gap-3 text-sm md:grid-cols-2">
              <div>
                <div className="text-xs text-[var(--color-text-tertiary)]">客户</div>
                <div className="mt-1 text-[var(--color-text-primary)]">{customerName ?? order?.customerId ?? '-'}</div>
              </div>
              <div>
                <div className="text-xs text-[var(--color-text-tertiary)]">状态</div>
                <div className="mt-1">
                  <Badge tone={order ? statusTone(order.status) : 'neutral'}>{order ? statusLabel(order.status) : '-'}</Badge>
                </div>
              </div>
              <div>
                <div className="text-xs text-[var(--color-text-tertiary)]">零件号</div>
                <div className="mt-1 text-[var(--color-text-primary)]">{order?.partNo ?? '-'}</div>
              </div>
              <div>
                <div className="text-xs text-[var(--color-text-tertiary)]">零件名称</div>
                <div className="mt-1 text-[var(--color-text-primary)]">{order?.partName ?? '-'}</div>
              </div>
              <div>
                <div className="text-xs text-[var(--color-text-tertiary)]">数量</div>
                <div className="mt-1 text-[var(--color-text-primary)]">{order?.qty ?? '-'}</div>
              </div>
              <div>
                <div className="text-xs text-[var(--color-text-tertiary)]">交期</div>
                <div className="mt-1 text-[var(--color-text-primary)]">{order?.dueDate ?? '-'}</div>
              </div>
              <div className="md:col-span-2">
                <div className="text-xs text-[var(--color-text-tertiary)]">图纸版本</div>
                <div className="mt-1 text-[var(--color-text-primary)]">{order?.drawingVersion ?? '-'}</div>
              </div>
              <div>
                <div className="text-xs text-[var(--color-text-tertiary)]">材料</div>
                <div className="mt-1 text-[var(--color-text-primary)]">{order?.material ?? '-'}</div>
              </div>
              <div>
                <div className="text-xs text-[var(--color-text-tertiary)]">表面/热处理</div>
                <div className="mt-1 text-[var(--color-text-primary)]">{order?.surfaceTreatment ?? '-'}</div>
              </div>
            </div>
          </CardBody>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>关联对象</CardTitle>
          </CardHeader>
          <CardBody>
            <div className="space-y-2 text-sm text-[var(--color-text-secondary)]">
              <div className="flex items-center justify-between gap-3 rounded-[10px] border border-[var(--color-border-subtle)] bg-[var(--color-bg-surface)] p-3">
                <div>ERP订单</div>
                <Badge tone="neutral">{order?.erpOrderNo ?? '-'}</Badge>
              </div>
              <div className="flex items-center justify-between gap-3 rounded-[10px] border border-[var(--color-border-subtle)] bg-[var(--color-bg-surface)] p-3">
                <div>MES工单</div>
                <Badge tone="neutral">{order?.mesWorkOrderIds.length ?? 0}</Badge>
              </div>
              <div className="flex items-center justify-between gap-3 rounded-[10px] border border-[var(--color-border-subtle)] bg-[var(--color-bg-surface)] p-3">
                <div>QMS批次/序列</div>
                <Badge tone="neutral">{order?.qmsBatchIds.length ?? 0}</Badge>
              </div>
            </div>
          </CardBody>
        </Card>
      </div>

      <div className="mt-4 grid grid-cols-1 gap-4 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>生产进度</CardTitle>
          </CardHeader>
          <CardBody>
            <div className="space-y-2 text-sm">
              {(order?.milestones ?? []).map((m) => (
                <div
                  key={m.key}
                  className="flex items-start justify-between gap-3 rounded-[10px] border border-[var(--color-border-subtle)] bg-[var(--color-bg-surface)] p-3"
                >
                  <div>
                    <div className="font-medium text-[var(--color-text-primary)]">{m.label}</div>
                    <div className="mt-1 text-xs text-[var(--color-text-tertiary)]">
                      {(m.at ? m.at : '—') + (m.note ? ` · ${m.note}` : '')}
                    </div>
                  </div>
                  <Badge tone={milestoneTone(m.status)}>{milestoneLabel(m.status)}</Badge>
                </div>
              ))}
              {!order?.milestones.length ? (
                <div className="text-sm text-[var(--color-text-tertiary)]">暂无进度数据</div>
              ) : null}
            </div>
          </CardBody>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>质量资料包</CardTitle>
          </CardHeader>
          <CardBody>
            <div className="space-y-2 text-sm">
              {(order?.qualityDocs ?? []).map((d) => (
                <div
                  key={d.key}
                  className="flex items-center justify-between gap-3 rounded-[10px] border border-[var(--color-border-subtle)] bg-[var(--color-bg-surface)] p-3"
                >
                  <div>
                    <div className="font-medium text-[var(--color-text-primary)]">{d.label}</div>
                    <div className="mt-1 text-xs text-[var(--color-text-tertiary)]">{d.updatedAt ?? '—'}</div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge tone={docTone(d.status)}>{docLabel(d.status)}</Badge>
                    <Button variant="ghost" size="sm">
                      下载（占位）
                    </Button>
                  </div>
                </div>
              ))}
              {!order?.qualityDocs.length ? (
                <div className="text-sm text-[var(--color-text-tertiary)]">暂无资料数据</div>
              ) : null}
            </div>
          </CardBody>
        </Card>
      </div>

      <div className="mt-4 grid grid-cols-1 gap-4 lg:grid-cols-3">
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle>协同记录</CardTitle>
          </CardHeader>
          <CardBody>
            <div className="space-y-2 text-sm">
              {(order?.timeline ?? []).map((t) => (
                <div
                  key={`${t.at}-${t.actor}-${t.action}`}
                  className="rounded-[10px] border border-[var(--color-border-subtle)] bg-[var(--color-bg-surface)] p-3"
                >
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <div className="font-medium text-[var(--color-text-primary)]">{t.action}</div>
                    <div className="text-xs text-[var(--color-text-tertiary)]">{t.at}</div>
                  </div>
                  <div className="mt-1 text-xs text-[var(--color-text-tertiary)]">{t.actor}</div>
                  {t.note ? <div className="mt-2 text-sm text-[var(--color-text-secondary)]">{t.note}</div> : null}
                </div>
              ))}
              {!order?.timeline.length ? (
                <div className="text-sm text-[var(--color-text-tertiary)]">暂无协同记录</div>
              ) : null}
            </div>
          </CardBody>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>快速跳转</CardTitle>
          </CardHeader>
          <CardBody>
            <div className="space-y-2 text-sm">
              <Link
                className="block rounded-[10px] border border-[var(--color-border-subtle)] bg-[var(--color-bg-surface)] p-3 font-medium text-[var(--color-primary)] hover:underline"
                to="/business/orders"
              >
                返回订单列表
              </Link>
              {(order?.mesWorkOrderIds ?? []).map((wo) => (
                <Link
                  key={wo}
                  className="block rounded-[10px] border border-[var(--color-border-subtle)] bg-[var(--color-bg-surface)] p-3 font-medium text-[var(--color-primary)] hover:underline"
                  to={`/production/workorders/${encodeURIComponent(wo)}`}
                >
                  查看工单：{wo}
                </Link>
              ))}
            </div>
          </CardBody>
        </Card>
      </div>
    </div>
  )
}

