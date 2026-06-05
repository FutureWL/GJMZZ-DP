import { Link } from 'react-router-dom'
import { Badge } from '../../../ui/Badge'
import { Card, CardBody, CardHeader, CardTitle } from '../../../ui/Card'
import { PageHeader } from '../../../ui/PageHeader'

export function MasterDataPage() {
  return (
    <div>
      <PageHeader title="主数据" description="ERP：供应商/客户/物料主数据入口（占位）" />
      <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
        <Card>
          <CardHeader>
            <CardTitle>供应商</CardTitle>
          </CardHeader>
          <CardBody>
            <div className="space-y-2 text-sm">
              <div className="text-[var(--color-text-secondary)]">主数据维护入口（占位）</div>
              <Link className="text-[var(--color-primary)] hover:underline" to="/management/srm/suppliers">
                进入供应商台账
              </Link>
            </div>
          </CardBody>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>客户</CardTitle>
          </CardHeader>
          <CardBody>
            <div className="space-y-2 text-sm">
              <div className="text-[var(--color-text-secondary)]">主数据维护入口（占位）</div>
              <Link className="text-[var(--color-primary)] hover:underline" to="/business/crm/customers">
                进入客户台账
              </Link>
            </div>
          </CardBody>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>物料</CardTitle>
          </CardHeader>
          <CardBody>
            <div className="space-y-2 text-sm">
              <div className="text-[var(--color-text-secondary)]">物料编码、规格、单位、分类：占位</div>
              <Link className="text-[var(--color-primary)] hover:underline" to="/management/erp/inventory">
                进入库存台账
              </Link>
              <div className="pt-2">
                <Badge tone="neutral">本页仅做入口与信息结构</Badge>
              </div>
            </div>
          </CardBody>
        </Card>
      </div>
    </div>
  )
}

