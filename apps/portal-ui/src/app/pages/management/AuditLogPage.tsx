import { auditLogs } from '../../mock/data'
import { Badge } from '../../ui/Badge'
import { Card, CardBody, CardHeader, CardTitle } from '../../ui/Card'
import { PageHeader } from '../../ui/PageHeader'

export function AuditLogPage() {
  return (
    <div>
      <PageHeader title="审计日志" description="关键动作留痕（mock）" right={<Badge tone="domain-management">管理</Badge>} />

      <Card>
        <CardHeader>
          <CardTitle>日志列表</CardTitle>
        </CardHeader>
        <CardBody>
          <div className="overflow-auto">
            <table className="w-full table-auto border-separate border-spacing-0 text-left text-sm">
              <thead>
                <tr className="text-xs text-[var(--color-text-tertiary)]">
                  <th className="border-b border-[var(--color-border-subtle)] px-3 py-2 font-semibold">时间</th>
                  <th className="border-b border-[var(--color-border-subtle)] px-3 py-2 font-semibold">操作者</th>
                  <th className="border-b border-[var(--color-border-subtle)] px-3 py-2 font-semibold">动作</th>
                  <th className="border-b border-[var(--color-border-subtle)] px-3 py-2 font-semibold">对象</th>
                  <th className="border-b border-[var(--color-border-subtle)] px-3 py-2 font-semibold">详情</th>
                  <th className="border-b border-[var(--color-border-subtle)] px-3 py-2 font-semibold">IP</th>
                </tr>
              </thead>
              <tbody>
                {auditLogs.map((a) => (
                  <tr key={a.id} className="hover:bg-black/5 dark:hover:bg-white/5">
                    <td className="border-b border-[var(--color-border-subtle)] px-3 py-2">{a.at}</td>
                    <td className="border-b border-[var(--color-border-subtle)] px-3 py-2">{a.actor}</td>
                    <td className="border-b border-[var(--color-border-subtle)] px-3 py-2">
                      <Badge tone="neutral">{a.action}</Badge>
                    </td>
                    <td className="border-b border-[var(--color-border-subtle)] px-3 py-2">
                      <div className="text-[var(--color-text-primary)]">{a.resourceType}</div>
                      <div className="mt-1 text-xs text-[var(--color-text-tertiary)]">{a.resourceId}</div>
                    </td>
                    <td className="border-b border-[var(--color-border-subtle)] px-3 py-2">{a.detail}</td>
                    <td className="border-b border-[var(--color-border-subtle)] px-3 py-2">{a.ip}</td>
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

