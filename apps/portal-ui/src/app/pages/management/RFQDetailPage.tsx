import { Link, useParams } from 'react-router-dom'
import { Badge } from '../../ui/Badge'
import { Button } from '../../ui/Button'
import { Card, CardBody, CardHeader, CardTitle } from '../../ui/Card'
import { PageHeader } from '../../ui/PageHeader'

const quotes = [
  { supplier: '华东刀具有限公司', price: 120000, leadTime: '7天', score: 92 },
  { supplier: '精工材料科技', price: 118500, leadTime: '9天', score: 88 },
  { supplier: 'XX外协加工厂', price: 109000, leadTime: '12天', score: 74 },
]

export function RFQDetailPage() {
  const { id } = useParams()

  return (
    <div>
      <PageHeader
        title={`RFQ 详情：${id ?? '-'}`}
        description="比价对比表（界面示例）"
        right={
          <div className="flex items-center gap-2">
            <Link to="/management/procurement/po/PO-20260605-018">
              <Button variant="primary">定标并生成 PO（占位）</Button>
            </Link>
          </div>
        }
      />

      <Card>
        <CardHeader>
          <CardTitle>供应商报价对比</CardTitle>
        </CardHeader>
        <CardBody>
          <div className="overflow-auto">
            <table className="w-full table-auto border-separate border-spacing-0 text-left text-sm">
              <thead>
                <tr className="text-xs text-[var(--color-text-tertiary)]">
                  <th className="border-b border-[var(--color-border-subtle)] px-3 py-2 font-semibold">供应商</th>
                  <th className="border-b border-[var(--color-border-subtle)] px-3 py-2 font-semibold">报价</th>
                  <th className="border-b border-[var(--color-border-subtle)] px-3 py-2 font-semibold">交期</th>
                  <th className="border-b border-[var(--color-border-subtle)] px-3 py-2 font-semibold">评分</th>
                  <th className="border-b border-[var(--color-border-subtle)] px-3 py-2 font-semibold">建议</th>
                </tr>
              </thead>
              <tbody>
                {quotes.map((q) => (
                  <tr key={q.supplier} className="hover:bg-black/5 dark:hover:bg-white/5">
                    <td className="border-b border-[var(--color-border-subtle)] px-3 py-2 text-[var(--color-text-primary)]">
                      {q.supplier}
                    </td>
                    <td className="border-b border-[var(--color-border-subtle)] px-3 py-2">
                      ¥{q.price.toLocaleString()}
                    </td>
                    <td className="border-b border-[var(--color-border-subtle)] px-3 py-2">{q.leadTime}</td>
                    <td className="border-b border-[var(--color-border-subtle)] px-3 py-2">{q.score}</td>
                    <td className="border-b border-[var(--color-border-subtle)] px-3 py-2">
                      {q.score >= 90 ? <Badge tone="success">推荐</Badge> : <Badge tone="neutral">备选</Badge>}
                    </td>
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

