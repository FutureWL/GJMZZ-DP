import { useMemo } from 'react'
import { useAuth } from '../../state/auth/useAuth'
import { Badge } from '../../ui/Badge'
import { Card, CardBody, CardHeader, CardTitle } from '../../ui/Card'
import { PageHeader } from '../../ui/PageHeader'

export function SessionsPage() {
  const auth = useAuth()
  const user = auth.user!

  const rows = useMemo(
    () => [
      { at: user.lastLoginAt, ip: user.lastLoginIp, device: 'Windows · Chrome', status: '当前' },
      { at: '2026-06-03 10:12', ip: '10.0.0.12', device: 'Windows · Edge', status: '历史' },
      { at: '2026-05-28 08:46', ip: '10.0.0.8', device: 'Android · App', status: '历史' },
    ],
    [user.lastLoginAt, user.lastLoginIp],
  )

  return (
    <div>
      <PageHeader title="最近登录" description="登录时间、IP、终端（占位）" />

      <Card>
        <CardHeader>
          <CardTitle>登录记录</CardTitle>
        </CardHeader>
        <CardBody>
          <div className="overflow-auto">
            <table className="w-full table-auto border-separate border-spacing-0 text-left text-sm">
              <thead>
                <tr className="text-xs text-[var(--color-text-tertiary)]">
                  <th className="border-b border-[var(--color-border-subtle)] px-3 py-2 font-semibold">时间</th>
                  <th className="border-b border-[var(--color-border-subtle)] px-3 py-2 font-semibold">IP</th>
                  <th className="border-b border-[var(--color-border-subtle)] px-3 py-2 font-semibold">终端</th>
                  <th className="border-b border-[var(--color-border-subtle)] px-3 py-2 font-semibold">状态</th>
                </tr>
              </thead>
              <tbody>
                {rows.map((r) => (
                  <tr key={`${r.at}-${r.ip}`} className="hover:bg-black/5 dark:hover:bg-white/5">
                    <td className="border-b border-[var(--color-border-subtle)] px-3 py-2 text-[var(--color-text-primary)]">
                      {r.at}
                    </td>
                    <td className="border-b border-[var(--color-border-subtle)] px-3 py-2">{r.ip}</td>
                    <td className="border-b border-[var(--color-border-subtle)] px-3 py-2">{r.device}</td>
                    <td className="border-b border-[var(--color-border-subtle)] px-3 py-2">
                      <Badge tone={r.status === '当前' ? 'success' : 'neutral'}>{r.status}</Badge>
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

