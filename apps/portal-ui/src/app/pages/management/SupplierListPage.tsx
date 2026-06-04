import { Link } from 'react-router-dom'
import { suppliers } from '../../mock/data'
import { Badge, type Tone } from '../../ui/Badge'
import { Card, CardBody, CardHeader, CardTitle } from '../../ui/Card'
import { PageHeader } from '../../ui/PageHeader'

function riskTone(risk: string): Tone {
  if (risk === 'low') return 'success'
  if (risk === 'medium') return 'warning'
  if (risk === 'high') return 'error'
  if (risk === 'critical') return 'error'
  return 'neutral'
}

function complianceTone(compliance: string): Tone {
  if (compliance === 'ok') return 'success'
  if (compliance === 'expiring') return 'warning'
  if (compliance === 'blacklist') return 'error'
  return 'neutral'
}

export function SupplierListPage() {
  return (
    <div>
      <PageHeader title="供应商（SRM）" description="P0流程：准入申请 → 审批中心 → 供应商详情（证照/风险/绩效）" />

      <Card>
        <CardHeader>
          <CardTitle>供应商台账</CardTitle>
        </CardHeader>
        <CardBody>
          <div className="overflow-auto">
            <table className="w-full table-auto border-separate border-spacing-0 text-left text-sm">
              <thead>
                <tr className="text-xs text-[var(--color-text-tertiary)]">
                  <th className="border-b border-[var(--color-border-subtle)] px-3 py-2 font-semibold">供应商</th>
                  <th className="border-b border-[var(--color-border-subtle)] px-3 py-2 font-semibold">风险</th>
                  <th className="border-b border-[var(--color-border-subtle)] px-3 py-2 font-semibold">合规</th>
                  <th className="border-b border-[var(--color-border-subtle)] px-3 py-2 font-semibold">OTD</th>
                  <th className="border-b border-[var(--color-border-subtle)] px-3 py-2 font-semibold">PPM</th>
                </tr>
              </thead>
              <tbody>
                {suppliers.map((s) => (
                  <tr key={s.id} className="hover:bg-black/5 dark:hover:bg-white/5">
                    <td className="border-b border-[var(--color-border-subtle)] px-3 py-2">
                      <Link
                        to={`/management/srm/suppliers/${encodeURIComponent(s.id)}`}
                        className="font-medium text-[var(--color-primary)] hover:underline"
                      >
                        {s.name}
                      </Link>
                      <div className="mt-1 text-xs text-[var(--color-text-tertiary)]">{s.id}</div>
                    </td>
                    <td className="border-b border-[var(--color-border-subtle)] px-3 py-2">
                      <Badge tone={riskTone(s.risk)}>{s.risk}</Badge>
                    </td>
                    <td className="border-b border-[var(--color-border-subtle)] px-3 py-2">
                      <Badge tone={complianceTone(s.compliance)}>{s.compliance}</Badge>
                    </td>
                    <td className="border-b border-[var(--color-border-subtle)] px-3 py-2">{s.otd}%</td>
                    <td className="border-b border-[var(--color-border-subtle)] px-3 py-2">{s.ppm}</td>
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
