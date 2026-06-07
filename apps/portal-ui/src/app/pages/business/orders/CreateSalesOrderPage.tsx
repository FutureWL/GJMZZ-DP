import { useEffect, useMemo, useRef, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import clsx from 'clsx'
import { z } from 'zod'
import { zodResolver } from '@hookform/resolvers/zod'
import { useForm } from 'react-hook-form'
import { Badge } from '../../../ui/Badge'
import { Button } from '../../../ui/Button'
import { Card, CardBody, CardHeader, CardTitle } from '../../../ui/Card'
import { Input } from '../../../ui/Input'
import { PageHeader } from '../../../ui/PageHeader'
import { Select } from '../../../ui/Select'
import { useAuth } from '../../../state/auth/useAuth'

type Product = {
  id: string
  name: string
  partNo: string
  drawingVersions: Array<{ id: string; label: string }>
}

type OrderLine = {
  id: string
  productId: string
  drawingVersionId: string
  isNpi: boolean
  qty: number
  unitPrice: number
  atpDate: string
  atpLoading: boolean
}

const headerSchema = z.object({
  customerId: z.string().min(1, '请选择客户'),
  soNo: z.string().min(1),
  salesOwner: z.string().min(1),
  customerPo: z.string().optional(),
  expectedDeliveryDate: z.string().min(1, '请选择期望交货日期'),
})

type HeaderForm = z.infer<typeof headerSchema>

function pad2(n: number) {
  return String(n).padStart(2, '0')
}

function toYmd(d: Date) {
  return `${d.getFullYear()}-${pad2(d.getMonth() + 1)}-${pad2(d.getDate())}`
}

function addDays(base: Date, days: number) {
  const d = new Date(base)
  d.setDate(d.getDate() + days)
  return d
}

function buildSoNoMock(today = new Date()) {
  return `SO-${today.getFullYear()}${pad2(today.getMonth() + 1)}${pad2(today.getDate())}-001`
}

function newLineId() {
  return `sol-${Math.random().toString(16).slice(2)}`
}

function money(n: number) {
  if (!Number.isFinite(n)) return '—'
  return n.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })
}

function Toggle({
  checked,
  onChange,
  disabled,
}: {
  checked: boolean
  onChange: (next: boolean) => void
  disabled?: boolean
}) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      disabled={disabled}
      onClick={() => onChange(!checked)}
      className={clsx(
        'relative inline-flex h-6 w-11 items-center rounded-full border transition',
        checked
          ? 'border-transparent bg-[var(--color-primary)]'
          : 'border-[var(--color-border-subtle)] bg-[var(--color-bg-surface)]',
        disabled && 'cursor-not-allowed opacity-60',
        !disabled && 'focus-visible:ring-2 focus-visible:ring-[var(--color-focus)]',
      )}
    >
      <span
        className={clsx(
          'inline-block h-5 w-5 translate-x-0 rounded-full bg-white shadow transition',
          checked && 'translate-x-5',
        )}
      />
    </button>
  )
}

export function CreateSalesOrderPage() {
  const nav = useNavigate()
  const auth = useAuth()
  const timeoutsRef = useRef<number[]>([])

  const products = useMemo<Product[]>(
    () => [
      {
        id: 'P-1001',
        partNo: 'P-1001',
        name: '精密壳体 / Gear Housing',
        // 高精密制造“图纸强绑定”：同一产品可能存在多个图纸版本（Rev/Ver），将影响工艺路线与检验基准
        drawingVersions: [
          { id: 'rev-a', label: 'Rev A' },
          { id: 'rev-b', label: 'Rev B' },
          { id: 'v1-2', label: 'V1.2' },
        ],
      },
      {
        id: 'P-2007',
        partNo: 'P-2007',
        name: '高精密轴套 / Precision Sleeve',
        drawingVersions: [
          { id: 'rev-01', label: 'Rev 01' },
          { id: 'rev-02', label: 'Rev 02' },
        ],
      },
    ],
    [],
  )

  const customers = useMemo(
    () => [
      { id: 'CUST-001', name: '星环微纳（上海）有限公司' },
      { id: 'CUST-002', name: '曜石精密（苏州）科技有限公司' },
      { id: 'CUST-003', name: '北冕航空结构件事业部' },
    ],
    [],
  )

  const soNo = useMemo(() => buildSoNoMock(new Date()), [])
  const today = useMemo(() => toYmd(new Date()), [])

  const form = useForm<HeaderForm>({
    resolver: zodResolver(headerSchema),
    defaultValues: {
      customerId: '',
      soNo,
      salesOwner: auth.user?.name ?? '当前用户',
      customerPo: '',
      expectedDeliveryDate: today,
    },
    mode: 'onBlur',
  })

  useEffect(() => {
    if (!auth.user?.name) return
    form.setValue('salesOwner', auth.user.name, { shouldValidate: true })
  }, [auth.user?.name, form])

  const [lines, setLines] = useState<OrderLine[]>(() => [
    {
      id: newLineId(),
      productId: '',
      drawingVersionId: '',
      isNpi: false,
      qty: 10,
      unitPrice: 0,
      atpDate: '',
      atpLoading: false,
    },
  ])

  const [submitError, setSubmitError] = useState<string | null>(null)

  useEffect(() => {
    return () => {
      timeoutsRef.current.forEach((t) => window.clearTimeout(t))
      timeoutsRef.current = []
    }
  }, [])

  const productById = useMemo(() => new Map(products.map((p) => [p.id, p])), [products])

  function updateLine(id: string, patch: Partial<OrderLine>) {
    setLines((prev) => prev.map((l) => (l.id === id ? { ...l, ...patch } : l)))
  }

  function addLine() {
    setLines((prev) => [
      ...prev,
      {
        id: newLineId(),
        productId: '',
        drawingVersionId: '',
        isNpi: false,
        qty: 1,
        unitPrice: 0,
        atpDate: '',
        atpLoading: false,
      },
    ])
  }

  function removeLine(id: string) {
    setLines((prev) => prev.filter((l) => l.id !== id))
  }

  function calcAtpDate(line: OrderLine) {
    // ATP（Available To Promise）在制造业通常需要考虑：产能/排程/工艺节拍/检验节拍等。
    // 这里用 qty 与 NPI（首件打样）做一个可视化的 mock 计算，便于演示交互闭环。
    const base = 5
    const qtyFactor = Math.min(14, Math.ceil(line.qty / 50) * 3)
    const npiFactor = line.isNpi ? 7 : 0
    return toYmd(addDays(new Date(), base + qtyFactor + npiFactor))
  }

  function runAtp(lineId: string) {
    const line = lines.find((x) => x.id === lineId)
    if (!line) return

    updateLine(lineId, { atpLoading: true })
    setSubmitError(null)

    const t = window.setTimeout(() => {
      updateLine(lineId, { atpLoading: false, atpDate: calcAtpDate(line) })
    }, 1000)
    timeoutsRef.current.push(t)
  }

  const orderAmount = useMemo(() => lines.reduce((sum, l) => sum + l.qty * l.unitPrice, 0), [lines])

  async function onSaveDraft() {
    setSubmitError(null)
    const ok = await form.trigger()
    if (!ok) return
    window.alert('已保存为草稿（mock）。可在后续接入后端 API：保存订单头 + 明细行 + 图纸版本绑定。')
  }

  async function onSubmit() {
    setSubmitError(null)
    const ok = await form.trigger()
    if (!ok) return

    const missingDrawing = lines.some((l) => l.productId && !l.drawingVersionId)
    if (missingDrawing) {
      // 业务约束：没有明确的图纸版本，就无法保证工艺/检验/追溯口径一致，因此禁止提交
      setSubmitError('存在未选择“图纸版本”的明细行。高精密制造必须做到“图纸强绑定”，提交前请补全。')
      return
    }

    window.alert('订单已提交（mock）。下一步可触发：评审/产能锁定/首件打样(NPI)流程。')
  }

  return (
    <div className="pb-20">
      <PageHeader
        title="新建销售订单"
        description="L2C（Lead to Cash）关键节点：图纸强绑定 + 首件打样（NPI）标记 + 系统承诺交期（ATP）核算（mock）"
        right={
          <div className="flex items-center gap-2">
            <Badge tone="domain-business">销售</Badge>
            <Badge tone="info">L2C</Badge>
          </div>
        }
      />

      <Card>
        <CardHeader>
          <CardTitle>订单基础信息</CardTitle>
        </CardHeader>
        <CardBody>
          <div className="grid grid-cols-1 gap-3 md:grid-cols-5">
            <div className="md:col-span-2">
              <div className="mb-1 text-xs font-semibold text-[var(--color-text-tertiary)]">客户名称</div>
              <Select
                value={form.watch('customerId')}
                onChange={(e) => form.setValue('customerId', e.target.value, { shouldValidate: true })}
              >
                <option value="">请选择客户</option>
                {customers.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.name}
                  </option>
                ))}
              </Select>
              {form.formState.errors.customerId ? (
                <div className="mt-1 text-xs text-[var(--color-status-fault)]">
                  {form.formState.errors.customerId.message}
                </div>
              ) : null}
            </div>

            <div>
              <div className="mb-1 text-xs font-semibold text-[var(--color-text-tertiary)]">订单编号</div>
              <Input value={form.watch('soNo')} readOnly />
            </div>

            <div>
              <div className="mb-1 text-xs font-semibold text-[var(--color-text-tertiary)]">销售负责人</div>
              <Input value={form.watch('salesOwner')} readOnly />
            </div>

            <div>
              <div className="mb-1 text-xs font-semibold text-[var(--color-text-tertiary)]">期望交货日期</div>
              <Input
                type="date"
                value={form.watch('expectedDeliveryDate')}
                onChange={(e) => form.setValue('expectedDeliveryDate', e.target.value, { shouldValidate: true })}
              />
              {form.formState.errors.expectedDeliveryDate ? (
                <div className="mt-1 text-xs text-[var(--color-status-fault)]">
                  {form.formState.errors.expectedDeliveryDate.message}
                </div>
              ) : null}
            </div>

            <div className="md:col-span-5">
              <div className="mb-1 text-xs font-semibold text-[var(--color-text-tertiary)]">客户 PO 单号</div>
              <Input
                placeholder="例如：PO-2026-0607-88"
                value={form.watch('customerPo') ?? ''}
                onChange={(e) => form.setValue('customerPo', e.target.value)}
              />
            </div>
          </div>
        </CardBody>
      </Card>

      <Card className="mt-4">
        <CardHeader>
          <CardTitle>订单明细行（图纸强绑定 / NPI / ATP）</CardTitle>
          <Button variant="secondary" size="sm" onClick={addLine}>
            + 增加行
          </Button>
        </CardHeader>
        <CardBody>
          {submitError ? (
            <div className="mb-3 rounded-[10px] border border-[color-mix(in_srgb,var(--color-status-fault)_40%,transparent)] bg-[color-mix(in_srgb,var(--color-status-fault)_12%,transparent)] p-3 text-sm text-[var(--color-text-primary)]">
              <div className="font-medium">提交校验未通过</div>
              <div className="mt-1 text-xs text-[var(--color-text-tertiary)]">{submitError}</div>
            </div>
          ) : null}

          <div className="overflow-auto">
            <table className="w-full min-w-[1080px] table-auto border-separate border-spacing-0 text-left text-sm">
              <thead>
                <tr className="text-xs text-[var(--color-text-tertiary)]">
                  <th className="border-b border-[var(--color-border-subtle)] px-3 py-2 font-semibold">产品名称/编号</th>
                  <th className="border-b border-[var(--color-border-subtle)] px-3 py-2 font-semibold">
                    图纸版本（必填）
                  </th>
                  <th className="border-b border-[var(--color-border-subtle)] px-3 py-2 font-semibold">NPI</th>
                  <th className="border-b border-[var(--color-border-subtle)] px-3 py-2 font-semibold">数量</th>
                  <th className="border-b border-[var(--color-border-subtle)] px-3 py-2 font-semibold">单价</th>
                  <th className="border-b border-[var(--color-border-subtle)] px-3 py-2 font-semibold">总价</th>
                  <th className="border-b border-[var(--color-border-subtle)] px-3 py-2 font-semibold">系统承诺交期（ATP）</th>
                  <th className="border-b border-[var(--color-border-subtle)] px-3 py-2 font-semibold">操作</th>
                </tr>
              </thead>
              <tbody>
                {lines.map((l) => {
                  const product = l.productId ? productById.get(l.productId) : undefined
                  // 选择了产品但未选择图纸版本：需要在行内红色提示，确保业务人员意识到“版本缺失不可生产”
                  const drawingInvalid = !!l.productId && !l.drawingVersionId
                  const total = l.qty * l.unitPrice
                  return (
                    <tr
                      key={l.id}
                      className={clsx(
                        'hover:bg-black/5 dark:hover:bg-white/5',
                        l.isNpi &&
                          'bg-[color-mix(in_srgb,var(--color-primary)_8%,transparent)] hover:bg-[color-mix(in_srgb,var(--color-primary)_10%,transparent)]',
                      )}
                    >
                      <td className="border-b border-[var(--color-border-subtle)] px-3 py-2 align-top">
                        <Input
                          list={`product-${l.id}`}
                          value={l.productId}
                          onChange={(e) => {
                            const next = e.target.value
                            const ok = next === '' || productById.has(next)
                            updateLine(l.id, {
                              productId: ok ? next : '',
                              drawingVersionId: '',
                              atpDate: '',
                            })
                          }}
                          placeholder="输入/选择：P-1001"
                        />
                        <datalist id={`product-${l.id}`}>
                          {products.map((p) => (
                            <option key={p.id} value={p.id}>
                              {p.name}（{p.partNo}）
                            </option>
                          ))}
                        </datalist>
                        {product ? (
                          <div className="mt-1 text-xs text-[var(--color-text-tertiary)]">{product.name}</div>
                        ) : (
                          <div className="mt-1 text-xs text-[var(--color-text-tertiary)]">—</div>
                        )}
                      </td>

                      <td className="border-b border-[var(--color-border-subtle)] px-3 py-2 align-top">
                        <Select
                          value={l.drawingVersionId}
                          disabled={!product}
                          onChange={(e) => updateLine(l.id, { drawingVersionId: e.target.value })}
                          className={clsx(
                            drawingInvalid &&
                              'border-[var(--color-status-fault)] focus:ring-[color-mix(in_srgb,var(--color-status-fault)_40%,transparent)]',
                          )}
                        >
                          <option value="">{product ? '请选择版本' : '请先选择产品'}</option>
                          {(product?.drawingVersions ?? []).map((dv) => (
                            <option key={dv.id} value={dv.id}>
                              {dv.label}
                            </option>
                          ))}
                        </Select>
                        {drawingInvalid ? (
                          <div className="mt-1 text-xs text-[var(--color-status-fault)]">图纸版本未选：该行将无法提交</div>
                        ) : (
                          <div className="mt-1 text-xs text-[var(--color-text-tertiary)]">图纸版本 = 工艺/检验/追溯基准</div>
                        )}
                      </td>

                      <td className="border-b border-[var(--color-border-subtle)] px-3 py-2 align-top">
                        <div className="flex items-center gap-2">
                          <Toggle checked={l.isNpi} onChange={(next) => updateLine(l.id, { isNpi: next })} />
                          {l.isNpi ? <Badge tone="warning">NPI</Badge> : <Badge tone="neutral">量产</Badge>}
                        </div>
                        <div className="mt-1 text-xs text-[var(--color-text-tertiary)]">NPI=首件打样/严检</div>
                      </td>

                      <td className="border-b border-[var(--color-border-subtle)] px-3 py-2 align-top">
                        <Input
                          type="number"
                          min={0}
                          value={Number.isFinite(l.qty) ? l.qty : 0}
                          onChange={(e) => updateLine(l.id, { qty: Number(e.target.value) || 0, atpDate: '' })}
                        />
                      </td>

                      <td className="border-b border-[var(--color-border-subtle)] px-3 py-2 align-top">
                        <Input
                          type="number"
                          min={0}
                          step="0.01"
                          value={Number.isFinite(l.unitPrice) ? l.unitPrice : 0}
                          onChange={(e) => updateLine(l.id, { unitPrice: Number(e.target.value) || 0 })}
                        />
                      </td>

                      <td className="border-b border-[var(--color-border-subtle)] px-3 py-2 align-top">
                        <div className="pt-1 font-medium text-[var(--color-text-primary)]">{money(total)}</div>
                        <div className="mt-1 text-xs text-[var(--color-text-tertiary)]">自动计算</div>
                      </td>

                      <td className="border-b border-[var(--color-border-subtle)] px-3 py-2 align-top">
                        <div className="flex items-center gap-2">
                          <div className="min-w-[120px] pt-1 text-[var(--color-text-primary)]">
                            {l.atpDate ? l.atpDate : <span className="text-[var(--color-text-tertiary)]">—</span>}
                          </div>
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => runAtp(l.id)}
                            disabled={!l.productId || l.atpLoading}
                          >
                            {l.atpLoading ? '核算中…' : '核算交期'}
                          </Button>
                        </div>
                        <div className="mt-1 text-xs text-[var(--color-text-tertiary)]">
                          ATP=基于产能/检验节拍/排程的建议交期（mock）
                        </div>
                      </td>

                      <td className="border-b border-[var(--color-border-subtle)] px-3 py-2 align-top">
                        <Button variant="danger" size="sm" onClick={() => removeLine(l.id)} disabled={lines.length <= 1}>
                          删除
                        </Button>
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>

          <div className="mt-3 flex flex-wrap items-center justify-between gap-2">
            <div className="text-xs text-[var(--color-text-tertiary)]">
              提示：若某行标记为 NPI，后续流程通常会强制触发首件检验、工艺评审与质量放行节点（示例）。
            </div>
            <div className="text-sm font-semibold text-[var(--color-text-primary)]">订单总金额：{money(orderAmount)}</div>
          </div>
        </CardBody>
      </Card>

      <div className="sticky bottom-0 z-20 mt-4 border-t border-[var(--color-border-subtle)] bg-[var(--color-bg-page)] py-3">
        <div className="flex flex-wrap items-center justify-end gap-2">
          <Button variant="ghost" onClick={() => nav('/sales/order')}>
            取消
          </Button>
          <Button variant="secondary" onClick={onSaveDraft}>
            保存为草稿
          </Button>
          <Button variant="primary" onClick={onSubmit}>
            提交订单
          </Button>
        </div>
      </div>
    </div>
  )
}
