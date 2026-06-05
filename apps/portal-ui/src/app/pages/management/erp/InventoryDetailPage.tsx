import { useParams } from 'react-router-dom'
import { inventories, materials } from '../../../mock/data'
import { Badge } from '../../../ui/Badge'
import { Card, CardBody, CardHeader, CardTitle } from '../../../ui/Card'
import { PageHeader } from '../../../ui/PageHeader'

export function InventoryDetailPage() {
  const { id } = useParams()
  const material = materials.find((m) => m.id === id)
  const rows = inventories.filter((i) => i.materialId === id)

  const total = rows.reduce((s, r) => s + r.qty, 0)
  const reserved = rows.reduce((s, r) => s + r.reservedQty, 0)

  return (
    <div>
      <PageHeader title={material ? `物料详情：${material.name}` : '物料详情'} description="库存分布 / 出入库记录（占位）" />

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle>物料信息</CardTitle>
          </CardHeader>
          <CardBody>
            <div className="grid grid-cols-1 gap-3 text-sm md:grid-cols-2">
              <div>
                <div className="text-xs text-[var(--color-text-tertiary)]">物料编码</div>
                <div className="mt-1 text-[var(--color-text-primary)]">{material?.id ?? id ?? '-'}</div>
              </div>
              <div>
                <div className="text-xs text-[var(--color-text-tertiary)]">类别</div>
                <div className="mt-1 text-[var(--color-text-primary)]">{material?.category ?? '-'}</div>
              </div>
              <div>
                <div className="text-xs text-[var(--color-text-tertiary)]">规格</div>
                <div className="mt-1 text-[var(--color-text-primary)]">{material?.spec ?? '-'}</div>
              </div>
              <div>
                <div className="text-xs text-[var(--color-text-tertiary)]">单位</div>
                <div className="mt-1 text-[var(--color-text-primary)]">{material?.uom ?? '-'}</div>
              </div>
              <div>
                <div className="text-xs text-[var(--color-text-tertiary)]">总库存</div>
                <div className="mt-1 text-[var(--color-text-primary)]">{total}</div>
              </div>
              <div>
                <div className="text-xs text-[var(--color-text-tertiary)]">预留</div>
                <div className="mt-1 text-[var(--color-text-primary)]">{reserved}</div>
              </div>
            </div>
          </CardBody>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>状态（占位）</CardTitle>
          </CardHeader>
          <CardBody>
            <div className="space-y-2 text-sm text-[var(--color-text-secondary)]">
              <div className="flex items-center justify-between gap-3 rounded-[10px] border border-[var(--color-border-subtle)] bg-[var(--color-bg-surface)] p-3">
                <div>安全库存</div>
                <Badge tone={total - reserved > 20 ? 'success' : 'warning'}>{total - reserved > 20 ? '正常' : '偏低'}</Badge>
              </div>
              <div className="flex items-center justify-between gap-3 rounded-[10px] border border-[var(--color-border-subtle)] bg-[var(--color-bg-surface)] p-3">
                <div>冻结库存</div>
                <Badge tone="neutral">0</Badge>
              </div>
            </div>
          </CardBody>
        </Card>
      </div>

      <div className="mt-4 grid grid-cols-1 gap-4 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>库存分布</CardTitle>
          </CardHeader>
          <CardBody>
            <div className="overflow-auto">
              <table className="w-full table-auto border-separate border-spacing-0 text-left text-sm">
                <thead>
                  <tr className="text-xs text-[var(--color-text-tertiary)]">
                    <th className="border-b border-[var(--color-border-subtle)] px-3 py-2 font-semibold">仓库</th>
                    <th className="border-b border-[var(--color-border-subtle)] px-3 py-2 font-semibold">库存</th>
                    <th className="border-b border-[var(--color-border-subtle)] px-3 py-2 font-semibold">预留</th>
                    <th className="border-b border-[var(--color-border-subtle)] px-3 py-2 font-semibold">可用</th>
                  </tr>
                </thead>
                <tbody>
                  {rows.map((r) => (
                    <tr key={r.warehouse} className="hover:bg-black/5 dark:hover:bg-white/5">
                      <td className="border-b border-[var(--color-border-subtle)] px-3 py-2">{r.warehouse}</td>
                      <td className="border-b border-[var(--color-border-subtle)] px-3 py-2">{r.qty}</td>
                      <td className="border-b border-[var(--color-border-subtle)] px-3 py-2">{r.reservedQty}</td>
                      <td className="border-b border-[var(--color-border-subtle)] px-3 py-2">{r.qty - r.reservedQty}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </CardBody>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>出入库记录（占位）</CardTitle>
          </CardHeader>
          <CardBody>
            <div className="space-y-2 text-sm text-[var(--color-text-secondary)]">
              <div className="rounded-[10px] border border-[var(--color-border-subtle)] bg-[var(--color-bg-surface)] p-3">
                2026-06-05 · 出库 · -10（占位）
              </div>
              <div className="rounded-[10px] border border-[var(--color-border-subtle)] bg-[var(--color-bg-surface)] p-3">
                2026-06-04 · 入库 · +50（占位）
              </div>
            </div>
          </CardBody>
        </Card>
      </div>
    </div>
  )
}

