import { useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { customers } from '../../../mock/data'
import { Badge, type Tone } from '../../../ui/Badge'
import { Button } from '../../../ui/Button'
import { Card, CardBody, CardHeader, CardTitle } from '../../../ui/Card'
import { Input } from '../../../ui/Input'
import { PageHeader } from '../../../ui/PageHeader'
import { Select } from '../../../ui/Select'
import { orderSummaries, type OrderStatus } from './mockOrders'

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

export function OrderListPage() {
  const [q, setQ] = useState('')
  const [status, setStatus] = useState<OrderStatus | ''>('')
  const [customerId, setCustomerId] = useState('')

  const customerOptions = useMemo(
    () => [
      { label: '全部客户', value: '' },
      ...customers.map((c) => ({ label: c.name, value: c.id })),
    ],
    [],
  )

  const statusOptions = useMemo(
    () => [
      { label: '全部状态', value: '' },
      { label: '新建', value: 'new' },
      { label: '已下达', value: 'released' },
      { label: '生产中', value: 'in_production' },
      { label: '质量冻结', value: 'quality_hold' },
      { label: '已发货', value: 'shipped' },
      { label: '已关闭', value: 'closed' },
    ],
    [],
  )

  const rows = useMemo(() => {
    const query = q.trim().toLowerCase()
    return orderSummaries.filter((o) => {
      if (status && o.status !== status) return false
      if (customerId && o.customerId !== customerId) return false
      if (!query) return true
      return (
        o.orderNo.toLowerCase().includes(query) ||
        o.partNo.toLowerCase().includes(query) ||
        o.partName.toLowerCase().includes(query)
      )
    })
  }, [q, status, customerId])

  return (
    <div>
      <PageHeader
        title="订单"
        description="订单列表 → 订单360（示例数据）"
        right={
          <Link to="/sales/business/orders/new">
            <Button variant="primary">新建销售订单</Button>
          </Link>
        }
      />
      <Card>
        <CardHeader>
          <CardTitle>订单</CardTitle>
        </CardHeader>
        <CardBody>
          <div className="grid grid-cols-1 gap-3 md:grid-cols-3">
            <Input
              placeholder="搜索订单号 / 零件号 / 名称"
              value={q}
              onChange={(e) => setQ(e.target.value)}
            />
            <Select value={status} onChange={(e) => setStatus(e.target.value as OrderStatus | '')}>
              {statusOptions.map((x) => (
                <option key={x.value} value={x.value}>
                  {x.label}
                </option>
              ))}
            </Select>
            <Select value={customerId} onChange={(e) => setCustomerId(e.target.value)}>
              {customerOptions.map((x) => (
                <option key={x.value} value={x.value}>
                  {x.label}
                </option>
              ))}
            </Select>
          </div>

          <div className="mt-3 overflow-auto">
            <table className="w-full table-auto border-separate border-spacing-0 text-left text-sm">
              <thead>
                <tr className="text-xs text-[var(--color-text-tertiary)]">
                  <th className="border-b border-[var(--color-border-subtle)] px-3 py-2 font-semibold">订单号</th>
                  <th className="border-b border-[var(--color-border-subtle)] px-3 py-2 font-semibold">客户</th>
                  <th className="border-b border-[var(--color-border-subtle)] px-3 py-2 font-semibold">零件</th>
                  <th className="border-b border-[var(--color-border-subtle)] px-3 py-2 font-semibold">数量</th>
                  <th className="border-b border-[var(--color-border-subtle)] px-3 py-2 font-semibold">交期</th>
                  <th className="border-b border-[var(--color-border-subtle)] px-3 py-2 font-semibold">状态</th>
                  <th className="border-b border-[var(--color-border-subtle)] px-3 py-2 font-semibold">更新时间</th>
                </tr>
              </thead>
              <tbody>
                {rows.length ? (
                  rows.map((o) => (
                    <tr key={o.id} className="hover:bg-black/5 dark:hover:bg-white/5">
                      <td className="border-b border-[var(--color-border-subtle)] px-3 py-2">
                        <Link
                          className="font-medium text-[var(--color-primary)] hover:underline"
                          to={`/business/orders/${encodeURIComponent(o.id)}`}
                        >
                          {o.orderNo}
                        </Link>
                      </td>
                      <td className="border-b border-[var(--color-border-subtle)] px-3 py-2">
                        {customers.find((c) => c.id === o.customerId)?.name ?? o.customerId}
                      </td>
                      <td className="border-b border-[var(--color-border-subtle)] px-3 py-2">
                        <div className="text-[var(--color-text-primary)]">{o.partNo}</div>
                        <div className="text-xs text-[var(--color-text-tertiary)]">{o.partName}</div>
                      </td>
                      <td className="border-b border-[var(--color-border-subtle)] px-3 py-2">{o.qty}</td>
                      <td className="border-b border-[var(--color-border-subtle)] px-3 py-2">{o.dueDate}</td>
                      <td className="border-b border-[var(--color-border-subtle)] px-3 py-2">
                        <Badge tone={statusTone(o.status)}>{statusLabel(o.status)}</Badge>
                      </td>
                      <td className="border-b border-[var(--color-border-subtle)] px-3 py-2 text-xs text-[var(--color-text-tertiary)]">
                        {o.updatedAt}
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td
                      colSpan={7}
                      className="border-b border-[var(--color-border-subtle)] px-3 py-8 text-center text-sm text-[var(--color-text-tertiary)]"
                    >
                      暂无数据
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </CardBody>
      </Card>
    </div>
  )
}
