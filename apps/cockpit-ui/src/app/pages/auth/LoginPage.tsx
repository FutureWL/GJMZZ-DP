import { useMemo, useState } from 'react'
import { Navigate, useLocation } from 'react-router-dom'
import { useAuth } from '../../state/auth/useAuth'
import { Surface } from '../../ui/Surface'

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
    <div className="flex min-h-screen items-center justify-center bg-[var(--color-bg-page)] p-10">
      <Surface className="w-full max-w-[720px] p-10">
        <div className="text-3xl font-semibold tracking-tight text-[var(--color-text-primary)]">驾驶舱登录</div>
        <div className="mt-3 text-[var(--color-text-secondary)]">
          此环境使用 Keycloak SSO 登录（本地 sso-dev）。默认用户 demo / demo。
        </div>

        {error ? (
          <div className="mt-6 rounded-2xl border border-[var(--color-border-subtle)] bg-[var(--color-bg-surface-strong)] px-5 py-4 text-[var(--color-status-fault)]">
            {error}
          </div>
        ) : null}

        <div className="mt-8">
          <button
            className="inline-flex items-center rounded-xl bg-[var(--color-primary)] px-6 py-3 text-base font-semibold text-white hover:bg-[var(--color-primary-hover)] disabled:opacity-60"
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
            type="button"
          >
            SSO 登录
          </button>
        </div>
      </Surface>
    </div>
  )
}
