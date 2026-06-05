import { useMemo, useState } from 'react'
import { Navigate, useLocation } from 'react-router-dom'
import { useAuth } from '../../state/auth/useAuth'
import { Button } from '../../ui/Button'
import { Card, CardBody, CardHeader, CardTitle } from '../../ui/Card'

export function LoginPage() {
  const auth = useAuth()
  const loc = useLocation()
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)

  const next = useMemo(() => {
    const params = new URLSearchParams(loc.search)
    return params.get('next') || '/'
  }, [loc.search])

  if (auth.isAuthenticated) {
    return <Navigate to={next} replace />
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-[var(--color-bg-page)] p-4">
      <Card className="w-full max-w-[420px]">
        <CardHeader>
          <CardTitle>登录</CardTitle>
        </CardHeader>
        <CardBody>
          <div className="space-y-3">
            <div className="text-sm text-[var(--color-text-tertiary)]">
              此环境使用 Keycloak SSO 登录（本地 sso-dev）。默认用户 demo / demo。
            </div>
            {error ? (
              <div className="rounded-[10px] border border-[var(--color-border-subtle)] bg-[var(--color-bg-surface)] px-3 py-2 text-sm text-[var(--color-status-fault)]">
                {error}
              </div>
            ) : null}
            <Button
              variant="primary"
              className="w-full"
              disabled={loading}
              onClick={async () => {
                setError(null)
                setLoading(true)
                try {
                  await auth.signInWithSSO(next)
                } catch {
                  setError('SSO 登录失败')
                } finally {
                  setLoading(false)
                }
              }}
            >
              SSO 登录
            </Button>
          </div>
        </CardBody>
      </Card>
    </div>
  )
}
