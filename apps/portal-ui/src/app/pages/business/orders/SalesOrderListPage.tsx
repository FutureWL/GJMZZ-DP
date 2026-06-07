import { useMemo, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import clsx from 'clsx'
import { Badge, type Tone } from '../../../ui/Badge'
import { Button } from '../../../ui/Button'
import { Card, CardBody, CardHeader, CardTitle } from '../../../ui/Card'
import { Input } from '../../../ui/Input'
import { PageHeader } from '../../../ui/PageHeader'
import { Select } from '../../../ui/Select'

type SalesOrderStatus = 'draft' | 'engineering_pending' | 'in_production' | 'shipped' | 'closed'

type SalesOrderSummary = {
  id: string
  orderNo: string
  customerName: string
  amount: number
  hasNpi: boolean
  status: SalesOrderStatus
  promisedDate: string
}

function money(n: number) {
  if (!Number.isFinite(n)) return '—'
  return n.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })
}

function statusTone(status: SalesOrderStatus): Tone {
  if (status === 'draft') return 'neutral'
  if (status === 'engineering_pending') return 'warning'
  if (status === 'in_production') return 'info'
  if (status === 'shipped') return 'success'
  return 'neutral'
}

function statusLabel(status: SalesOrderStatus) {
  if (status === 'draft') return '草稿'
  if (status === 'engineering_pending') return '待工程解析'
  if (status === 'in_production') return '生产中'
  if (status === 'shipped') return '已发货'
  return '已完结'
}

export function SalesOrderListPage() {
  const nav = useNavigate()
  const [q, setQ] = useState('')
  const [status, setStatus] = useState<SalesOrderStatus | ''>('')
  const [npi, setNpi] = useState<'all' | 'yes' | 'no'>('all')
  const [pageIndex, setPageIndex] = useState(0)
  const [pageSize, setPageSize] = useState(10)

  const rows = useMemo<SalesOrderSummary[]>(
    () => [
      {
        id: 'so-001',
        orderNo: 'SO-20260607-001',
        customerName: '曜石精密（苏州）科技有限公司',
        amount: 186_500,
        hasNpi: true,
        status: 'engineering_pending',
        promisedDate: '2026-06-20',
      },
      {
        id: 'so-002',
        orderNo: 'SO-20260607-002',
        customerName: '星环微纳（上海）有限公司',
        amount: 92_800,
        hasNpi: false,
        status: 'in_production',
        promisedDate: '2026-06-18',
      },
      {
        id: 'so-003',
        orderNo: 'SO-20260606-019',
        customerName: '北冕航空结构件事业部',
        amount: 412_300,
        hasNpi: true,
        status: 'shipped',
        promisedDate: '2026-06-12',
      },
      {
        id: 'so-004',
        orderNo: 'SO-20260605-088',
        customerName: '某某精密仪器（深圳）有限公司',
        amount: 35_600,
        hasNpi: false,
        status: 'draft',
        promisedDate: '2026-06-30',
      },
      {
        id: 'so-005',
        orderNo: 'SO-20260529-114',
        customerName: '恒辉医疗器械精密加工中心',
        amount: 128_000,
        hasNpi: false,
        status: 'closed',
        promisedDate: '2026-06-05',
      },
    ],
    [],
  )

  const filtered = useMemo(() => {
    const query = q.trim().toLowerCase()
    return rows.filter((r) => {
      if (status && r.status !== status) return false
      if (npi !== 'all') {
        const want = npi === 'yes'
        if (r.hasNpi !== want) return false
      }
      if (!query) return true
      return r.orderNo.toLowerCase().includes(query) || r.customerName.toLowerCase().includes(query)
    })
  }, [npi, q, rows, status])

  const total = filtered.length
  const pageCount = Math.max(1, Math.ceil(total / pageSize))
  const safePageIndex = Math.min(pageIndex, pageCount - 1)
  const start = safePageIndex * pageSize
  const pageRows = filtered.slice(start, start + pageSize)

  const pageNumbers = useMemo(() => {
    const max = 5
    if (pageCount <= max) return Array.from({ length: pageCount }, (_, i) => i)
    const start = Math.max(0, Math.min(pageCount - max, safePageIndex - Math.floor(max / 2)))
    return Array.from({ length: max }, (_, i) => start + i)
  }, [pageCount, safePageIndex])

  const statusOptions = useMemo(
    () => [
      { label: '全部状态', value: '' },
      { label: '草稿', value: 'draft' },
      { label: '待工程解析', value: 'engineering_pending' },
      { label: '生产中', value: 'in_production' },
      { label: '已发货', value: 'shipped' },
      { label: '已完结', value: 'closed' },
    ],
    [],
  )

  return (
    <div>
      <PageHeader
        title="销售订单"
        description="L2C 核心中枢：订单创建/筛选/流转（mock）"
        right={
          <Button variant="primary" onClick={() => nav('/sales/order/create')}>
            + 新建订单
          </Button>
        }
      />

      <Card>
        <CardHeader>
          <CardTitle>搜索与过滤</CardTitle>
        </CardHeader>
        <CardBody>
          <div className="grid grid-cols-1 gap-3 md:grid-cols-6">
            <div className="md:col-span-3">
              <Input
                placeholder="搜索订单号 / 客户名"
                value={q}
                onChange={(e) => {
                  setQ(e.target.value)
                  setPageIndex(0)
                }}
              />
            </div>
            <div className="md:col-span-2">
              <Select
                value={status}
                onChange={(e) => {
                  setStatus(e.target.value as SalesOrderStatus | '')
                  setPageIndex(0)
                }}
              >
                {statusOptions.map((x) => (
                  <option key={x.value} value={x.value}>
                    {x.label}
                  </option>
                ))}
              </Select>
            </div>
            <div>
              <Select
                value={npi}
                onChange={(e) => {
                  setNpi(e.target.value as 'all' | 'yes' | 'no')
                  setPageIndex(0)
                }}
              >
                <option value="all">NPI：全部</option>
                <option value="yes">NPI：是</option>
                <option value="no">NPI：否</option>
              </Select>
            </div>
          </div>
        </CardBody>
      </Card>

      <Card className="mt-4">
        <CardHeader>
          <CardTitle>订单列表</CardTitle>
        </CardHeader>
        <CardBody>
          <div className="overflow-auto">
            <table className="w-full min-w-[980px] table-auto border-separate border-spacing-0 text-left text-sm">
              <thead>
                <tr className="text-xs text-[var(--color-text-tertiary)]">
                  <th className="border-b border-[var(--color-border-subtle)] px-3 py-2 font-semibold">订单编号</th>
                  <th className="border-b border-[var(--color-border-subtle)] px-3 py-2 font-semibold">客户名称</th>
                  <th className="border-b border-[var(--color-border-subtle)] px-3 py-2 font-semibold">订单金额</th>
                  <th className="border-b border-[var(--color-border-subtle)] px-3 py-2 font-semibold">包含 NPI</th>
                  <th className="border-b border-[var(--color-border-subtle)] px-3 py-2 font-semibold">当前状态</th>
                  <th className="border-b border-[var(--color-border-subtle)] px-3 py-2 font-semibold">承诺交期</th>
                  <th className="border-b border-[var(--color-border-subtle)] px-3 py-2 font-semibold">操作</th>
                </tr>
              </thead>
              <tbody>
                {pageRows.length ? (
                  pageRows.map((r) => (
                    <tr key={r.id} className="hover:bg-black/5 dark:hover:bg-white/5">
                      <td className="border-b border-[var(--color-border-subtle)] px-3 py-2">
                        <Link
                          className="font-medium text-[var(--color-primary)] hover:underline"
                          to={`/sales/business/order360/${encodeURIComponent(r.id)}`}
                        >
                          {r.orderNo}
                        </Link>
                      </td>
                      <td className="border-b border-[var(--color-border-subtle)] px-3 py-2">{r.customerName}</td>
                      <td className="border-b border-[var(--color-border-subtle)] px-3 py-2 font-medium text-[var(--color-text-primary)]">
                        {money(r.amount)}
                      </td>
                      <td className="border-b border-[var(--color-border-subtle)] px-3 py-2">
                        {r.hasNpi ? <Badge tone="warning">NPI</Badge> : <Badge tone="neutral">—</Badge>}
                      </td>
                      <td className="border-b border-[var(--color-border-subtle)] px-3 py-2">
                        <Badge tone={statusTone(r.status)}>{statusLabel(r.status)}</Badge>
                      </td>
                      <td className="border-b border-[var(--color-border-subtle)] px-3 py-2">{r.promisedDate}</td>
                      <td className="border-b border-[var(--color-border-subtle)] px-3 py-2">
                        <div className="flex items-center gap-2">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => nav(`/sales/order/create?id=${encodeURIComponent(r.id)}`)}
                          >
                            编辑
                          </Button>
                          <Button
                            variant="secondary"
                            size="sm"
                            onClick={() => window.alert(`已撤回（mock）：${r.orderNo}`)}
                            className={clsx(r.status === 'closed' && 'opacity-60')}
                            disabled={r.status === 'closed'}
                          >
                            撤回
                          </Button>
                        </div>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td
                      colSpan={7}
                      className="border-b border-[var(--color-border-subtle)] px-3 py-10 text-center text-sm text-[var(--color-text-tertiary)]"
                    >
                      暂无数据
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          <div className="mt-3 flex flex-wrap items-center justify-between gap-3 text-sm">
            <div className="text-[var(--color-text-tertiary)]">共 {total} 条</div>
            <div className="flex flex-wrap items-center gap-2">
              <div className="text-xs text-[var(--color-text-tertiary)]">每页</div>
              <Select
                className="w-[110px]"
                value={String(pageSize)}
                onChange={(e) => {
                  setPageSize(Number(e.target.value))
                  setPageIndex(0)
                }}
              >
                {[5, 10, 20].map((s) => (
                  <option key={s} value={String(s)}>
                    {s} 条
                  </option>
                ))}
              </Select>

              <Button
                size="sm"
                variant="secondary"
                onClick={() => setPageIndex((p) => Math.max(0, p - 1))}
                disabled={safePageIndex <= 0}
              >
                上一页
              </Button>
              <div className="flex items-center gap-1">
                {pageNumbers.map((p) => (
                  <Button
                    key={p}
                    size="sm"
                    variant={p === safePageIndex ? 'primary' : 'ghost'}
                    onClick={() => setPageIndex(p)}
                  >
                    {p + 1}
                  </Button>
                ))}
                <div className="ml-1 text-xs text-[var(--color-text-tertiary)]">/ {pageCount}</div>
              </div>
              <Button
                size="sm"
                variant="secondary"
                onClick={() => setPageIndex((p) => Math.min(pageCount - 1, p + 1))}
                disabled={safePageIndex >= pageCount - 1}
              >
                下一页
              </Button>
            </div>
          </div>
        </CardBody>
      </Card>
    </div>
  )
}
