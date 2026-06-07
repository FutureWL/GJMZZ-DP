import { Eye, ExternalLink } from 'lucide-react'
import { useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { workOrders } from '../../mock/data'
import { zodResolver } from '@hookform/resolvers/zod'
import { useForm } from 'react-hook-form'
import { z } from 'zod'
import { DataTable, type DataTableColumn } from '../../ui/DataTable'
import { Drawer } from '../../ui/Drawer'
import { Modal } from '../../ui/Modal'
import { StatusBadge } from '../../ui/StatusBadge'
import { Button } from '../../ui/Button'
import { Card, CardBody, CardHeader, CardTitle } from '../../ui/Card'
import { Input } from '../../ui/Input'
import { PageHeader } from '../../ui/PageHeader'
import { Select } from '../../ui/Select'

function statusVariant(status: string) {
  if (status === 'running') return 'success'
  if (status === 'blocked') return 'warning'
  if (status === 'done') return 'default'
  return 'info'
}

const workOrderSchema = z
  .object({
    productId: z.string().min(1, { message: '请选择产品' }),
    lineId: z.string().min(1, { message: '请指定产线' }),
    plannedQty: z.preprocess((v) => (typeof v === 'string' ? Number(v) : v), z.number().gt(0, { message: '计划数量必须大于0' })),
    startDate: z.string().min(1, { message: '请选择开始时间' }),
    endDate: z.string().min(1, { message: '请选择结束时间' }),
  })
  .refine(
    (v) => {
      const start = new Date(v.startDate).getTime()
      const end = new Date(v.endDate).getTime()
      if (Number.isNaN(start) || Number.isNaN(end)) return false
      return end >= start
    },
    { message: '结束时间不能早于开始时间', path: ['endDate'] },
  )

type WorkOrderFormInput = z.input<typeof workOrderSchema>
type WorkOrderFormValues = z.output<typeof workOrderSchema>

export function WorkOrderListPage() {
  const [page, setPage] = useState(1)
  const [drawerId, setDrawerId] = useState<string | null>(null)
  const [createOpen, setCreateOpen] = useState(false)

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<WorkOrderFormInput, unknown, WorkOrderFormValues>({
    resolver: zodResolver(workOrderSchema),
    defaultValues: {
      productId: '',
      lineId: '',
      plannedQty: 100,
      startDate: '',
      endDate: '',
    },
  })

  const pageSize = 10
  const total = 45

  const pageRows = useMemo(() => {
    const startIndex = (page - 1) * pageSize
    return workOrders.slice(startIndex, startIndex + pageSize)
  }, [page])

  const selected = useMemo(() => {
    if (!drawerId) return null
    return workOrders.find((x) => x.id === drawerId) ?? null
  }, [drawerId])

  const workOrderColumns = useMemo<DataTableColumn<(typeof pageRows)[number]>[]>(() => {
    return [
      {
        header: '工单号',
        accessorKey: 'id',
        cell: (w) => (
          <button
            type="button"
            className="font-medium text-[var(--color-primary)] hover:underline"
            onClick={() => setDrawerId(w.id)}
          >
            {w.id}
          </button>
        ),
      },
      { header: '产品', accessorKey: 'product' },
      { header: '产线', accessorKey: 'line' },
      { header: '进度', accessorKey: 'progress', cell: (w) => `${w.progress}%` },
      {
        header: '状态',
        accessorKey: 'status',
        cell: (w) => <StatusBadge variant={statusVariant(w.status)}>{w.status}</StatusBadge>,
      },
      {
        header: '计划',
        cell: (w) => (
          <div className="text-xs text-[var(--color-text-tertiary)]">
            {w.planStart} ~ {w.planEnd}
          </div>
        ),
      },
      {
        header: '操作',
        sticky: 'right',
        widthClassName: 'w-[96px]',
        cell: (w) => (
          <div className="flex items-center justify-end gap-1">
            <button
              type="button"
              className="inline-flex h-8 w-8 items-center justify-center rounded-[6px] text-[var(--color-text-secondary)] hover:bg-black/5 dark:hover:bg-white/5"
              onClick={(e) => {
                e.stopPropagation()
                setDrawerId(w.id)
              }}
            >
              <Eye className="h-4 w-4" />
            </button>
            <Link
              to={`/production/execution/workorders/${encodeURIComponent(w.id)}`}
              className="inline-flex h-8 w-8 items-center justify-center rounded-[6px] text-[var(--color-text-secondary)] hover:bg-black/5 dark:hover:bg-white/5"
              onClick={(e) => e.stopPropagation()}
            >
              <ExternalLink className="h-4 w-4" />
            </Link>
          </div>
        ),
      },
    ]
  }, [pageRows])

  return (
    <div>
      <PageHeader title="工单列表" description="计划与生产：计划与执行（列表 + 抽屉详情）" />
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between gap-3">
            <CardTitle>工单</CardTitle>
            <Button
              variant="primary"
              onClick={() => {
                reset({
                  productId: '',
                  lineId: '',
                  plannedQty: 100,
                  startDate: '',
                  endDate: '',
                })
                setCreateOpen(true)
              }}
            >
              + 下达工单
            </Button>
          </div>
        </CardHeader>
        <CardBody>
          <DataTable
            columns={workOrderColumns}
            data={pageRows}
            selectable
            onRowClick={(w) => setDrawerId(w.id)}
            pagination={{ total, page, pageSize, onPageChange: setPage }}
          />
        </CardBody>
      </Card>

      <Modal
        open={createOpen}
        title="下达生产工单"
        onClose={() => setCreateOpen(false)}
        confirmText="提交"
        confirmLoadingText="提交中..."
        confirmLoading={isSubmitting}
        confirmButtonType="submit"
        confirmFormId="workorder-create"
      >
        <form
          id="workorder-create"
          onSubmit={handleSubmit(async (data) => {
            await new Promise((resolve) => setTimeout(resolve, 1000))
            console.log('工单提交成功:', data)
            setCreateOpen(false)
            reset()
          })}
          className="grid grid-cols-1 gap-3 md:grid-cols-2"
        >
          <div>
            <div className="text-xs text-[var(--color-text-tertiary)]">选择产品</div>
            <div className="mt-1">
              <Select {...register('productId')}>
                <option value="">请选择</option>
                {Array.from(new Set(workOrders.map((x) => x.product))).map((p) => (
                  <option key={p} value={p}>
                    {p}
                  </option>
                ))}
              </Select>
            </div>
            {errors.productId?.message ? (
              <div className="mt-1 text-xs text-[var(--color-status-fault)]">{errors.productId.message}</div>
            ) : null}
          </div>
          <div>
            <div className="text-xs text-[var(--color-text-tertiary)]">指定产线</div>
            <div className="mt-1">
              <Select {...register('lineId')}>
                <option value="">请选择</option>
                {Array.from(new Set(workOrders.map((x) => x.line))).map((l) => (
                  <option key={l} value={l}>
                    {l}
                  </option>
                ))}
              </Select>
            </div>
            {errors.lineId?.message ? (
              <div className="mt-1 text-xs text-[var(--color-status-fault)]">{errors.lineId.message}</div>
            ) : null}
          </div>
          <div>
            <div className="text-xs text-[var(--color-text-tertiary)]">计划生产数量</div>
            <div className="mt-1">
              <Input type="number" inputMode="numeric" {...register('plannedQty')} placeholder="如：100" />
            </div>
            {errors.plannedQty?.message ? (
              <div className="mt-1 text-xs text-[var(--color-status-fault)]">{errors.plannedQty.message}</div>
            ) : null}
          </div>
          <div className="md:col-span-2 grid grid-cols-1 gap-3 md:grid-cols-2">
            <div>
              <div className="text-xs text-[var(--color-text-tertiary)]">计划开始时间</div>
              <div className="mt-1">
                <Input type="datetime-local" {...register('startDate')} />
              </div>
              {errors.startDate?.message ? (
                <div className="mt-1 text-xs text-[var(--color-status-fault)]">{errors.startDate.message}</div>
              ) : null}
            </div>
            <div>
              <div className="text-xs text-[var(--color-text-tertiary)]">计划结束时间</div>
              <div className="mt-1">
                <Input type="datetime-local" {...register('endDate')} />
              </div>
              {errors.endDate?.message ? (
                <div className="mt-1 text-xs text-[var(--color-status-fault)]">{errors.endDate.message}</div>
              ) : null}
            </div>
          </div>
        </form>
      </Modal>

      <Drawer
        open={!!selected}
        title={
          selected ? (
            <div className="flex items-center gap-2">
              <span className="truncate">{selected.id}</span>
              <StatusBadge variant={statusVariant(selected.status)}>{selected.status}</StatusBadge>
            </div>
          ) : (
            ''
          )
        }
        onClose={() => setDrawerId(null)}
      >
        {selected ? (
          <div className="space-y-4">
            <div className="flex items-center justify-between gap-3">
              <div className="min-w-0">
                <div className="truncate text-sm font-semibold text-[var(--color-text-primary)]">{selected.product}</div>
                <div className="mt-1 text-xs text-[var(--color-text-tertiary)]">{selected.line}</div>
              </div>
              <Link
                to={`/production/execution/workorders/${encodeURIComponent(selected.id)}`}
                className="h-9 rounded-[6px] border border-[var(--color-border-subtle)] bg-[var(--color-bg-surface)] px-3 text-sm font-medium text-[var(--color-text-primary)] hover:bg-black/5 dark:hover:bg-white/5"
              >
                打开详情页
              </Link>
            </div>

            <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
              <Card className="lg:col-span-2">
                <CardHeader>
                  <CardTitle>概览</CardTitle>
                </CardHeader>
                <CardBody>
                  <div className="grid grid-cols-1 gap-3 text-sm md:grid-cols-2">
                    <div>
                      <div className="text-xs text-[var(--color-text-tertiary)]">产品</div>
                      <div className="mt-1 text-[var(--color-text-primary)]">{selected.product}</div>
                    </div>
                    <div>
                      <div className="text-xs text-[var(--color-text-tertiary)]">产线</div>
                      <div className="mt-1 text-[var(--color-text-primary)]">{selected.line}</div>
                    </div>
                    <div>
                      <div className="text-xs text-[var(--color-text-tertiary)]">进度</div>
                      <div className="mt-1 text-[var(--color-text-primary)]">{selected.progress}%</div>
                    </div>
                    <div>
                      <div className="text-xs text-[var(--color-text-tertiary)]">状态</div>
                      <div className="mt-1">
                        <StatusBadge variant={statusVariant(selected.status)}>{selected.status}</StatusBadge>
                      </div>
                    </div>
                    <div className="md:col-span-2">
                      <div className="text-xs text-[var(--color-text-tertiary)]">计划</div>
                      <div className="mt-1 text-[var(--color-text-primary)]">
                        {selected.planStart} ~ {selected.planEnd}
                      </div>
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
                      <div>关联设备</div>
                      <StatusBadge variant="default">3</StatusBadge>
                    </div>
                    <div className="flex items-center justify-between gap-3 rounded-[10px] border border-[var(--color-border-subtle)] bg-[var(--color-bg-surface)] p-3">
                      <div>关联检验</div>
                      <StatusBadge variant="default">2</StatusBadge>
                    </div>
                    <div className="flex items-center justify-between gap-3 rounded-[10px] border border-[var(--color-border-subtle)] bg-[var(--color-bg-surface)] p-3">
                      <div>关联告警</div>
                      <StatusBadge variant="warning">1</StatusBadge>
                    </div>
                  </div>
                </CardBody>
              </Card>
            </div>
          </div>
        ) : null}
      </Drawer>
    </div>
  )
}
