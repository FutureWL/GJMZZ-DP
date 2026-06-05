import { Link } from 'react-router-dom'
import { inventories } from '../../../mock/data'
import { Card, CardBody, CardHeader, CardTitle } from '../../../ui/Card'
import { PageHeader } from '../../../ui/PageHeader'

export function InventoryListPage() {
  return (
    <div>
      <PageHeader title="库存台账" description="ERP：物料/库存台账（界面示例）" />
      <Card>
        <CardHeader>
          <CardTitle>库存</CardTitle>
        </CardHeader>
        <CardBody>
          <div className="overflow-auto">
            <table className="w-full table-auto border-separate border-spacing-0 text-left text-sm">
              <thead>
                <tr className="text-xs text-[var(--color-text-tertiary)]">
                  <th className="border-b border-[var(--color-border-subtle)] px-3 py-2 font-semibold">物料</th>
                  <th className="border-b border-[var(--color-border-subtle)] px-3 py-2 font-semibold">仓库</th>
                  <th className="border-b border-[var(--color-border-subtle)] px-3 py-2 font-semibold">可用库存</th>
                  <th className="border-b border-[var(--color-border-subtle)] px-3 py-2 font-semibold">预留</th>
                  <th className="border-b border-[var(--color-border-subtle)] px-3 py-2 font-semibold">总量</th>
                </tr>
              </thead>
              <tbody>
                {inventories.map((it) => (
                  <tr key={`${it.materialId}-${it.warehouse}`} className="hover:bg-black/5 dark:hover:bg-white/5">
                    <td className="border-b border-[var(--color-border-subtle)] px-3 py-2">
                      <Link
                        className="font-medium text-[var(--color-primary)] hover:underline"
                        to={`/management/erp/inventory/${encodeURIComponent(it.materialId)}`}
                      >
                        {it.materialName}
                      </Link>
                      <div className="mt-1 text-xs text-[var(--color-text-tertiary)]">{it.materialId}</div>
                    </td>
                    <td className="border-b border-[var(--color-border-subtle)] px-3 py-2">{it.warehouse}</td>
                    <td className="border-b border-[var(--color-border-subtle)] px-3 py-2">{it.qty - it.reservedQty}</td>
                    <td className="border-b border-[var(--color-border-subtle)] px-3 py-2">{it.reservedQty}</td>
                    <td className="border-b border-[var(--color-border-subtle)] px-3 py-2">{it.qty}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardBody>
      </Card>
    </div>
  )
}

