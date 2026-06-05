import { useAuth } from '../../state/auth/useAuth'
import { Badge } from '../../ui/Badge'
import { Card, CardBody, CardHeader, CardTitle } from '../../ui/Card'
import { PageHeader } from '../../ui/PageHeader'

export function RolesPage() {
  const auth = useAuth()
  const user = auth.user!

  return (
    <div>
      <PageHeader title="角色与权限" description="只读展示（占位）" />

      <div className="grid grid-cols-1 gap-4">
        <Card>
          <CardHeader>
            <CardTitle>角色</CardTitle>
          </CardHeader>
          <CardBody>
            <div className="flex flex-wrap gap-2">
              {user.roles.map((r) => (
                <Badge key={r} tone="neutral">
                  {r}
                </Badge>
              ))}
            </div>
          </CardBody>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>权限</CardTitle>
          </CardHeader>
          <CardBody>
            <div className="overflow-auto">
              <table className="w-full table-auto border-separate border-spacing-0 text-left text-sm">
                <thead>
                  <tr className="text-xs text-[var(--color-text-tertiary)]">
                    <th className="border-b border-[var(--color-border-subtle)] px-3 py-2 font-semibold">权限标识</th>
                    <th className="border-b border-[var(--color-border-subtle)] px-3 py-2 font-semibold">说明</th>
                  </tr>
                </thead>
                <tbody>
                  {user.permissions.map((p) => (
                    <tr key={p} className="hover:bg-black/5 dark:hover:bg-white/5">
                      <td className="border-b border-[var(--color-border-subtle)] px-3 py-2 font-mono text-xs text-[var(--color-text-primary)]">
                        {p}
                      </td>
                      <td className="border-b border-[var(--color-border-subtle)] px-3 py-2 text-[var(--color-text-secondary)]">
                        权限描述占位
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </CardBody>
        </Card>
      </div>
    </div>
  )
}

