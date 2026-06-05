import { useEffect, useMemo, useState } from 'react'
import { Navigate, useLocation } from 'react-router-dom'
import { formatDocumentTitle } from '../../appMeta'
import { useAuth } from '../../state/auth/useAuth'
import { Button } from '../../ui/Button'
import { Card, CardBody, CardHeader, CardTitle } from '../../ui/Card'
import { Footer } from '../../ui/Footer'
import { Input } from '../../ui/Input'

export function LoginPage() {
  const auth = useAuth()
  const loc = useLocation()
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    document.title = formatDocumentTitle('登录')
  }, [])

  const next = useMemo(() => {
    const params = new URLSearchParams(loc.search)
    return params.get('next') || '/production/overview'
  }, [loc.search])

  if (auth.isAuthenticated) {
    return <Navigate to="/production/overview" replace />
  }

  return (
    <div className="min-h-screen bg-[var(--color-bg-page)]">
      <div className="mx-auto flex min-h-screen max-w-[1200px] items-stretch px-4">
        <div className="hidden w-1/2 flex-col justify-between py-14 pr-10 lg:flex">
          <div>
            <div className="text-2xl font-semibold text-[var(--color-text-primary)]">高精密制造信息化平台</div>
            <div className="mt-2 text-sm text-[var(--color-text-tertiary)]">
              五域门户 · 三层组织格局 · 浅/深主题（界面原型）
            </div>
          </div>
          <div className="rounded-[14px] border border-[var(--color-border-subtle)] bg-[var(--color-bg-surface)] p-5 shadow-[var(--shadow-2)]">
            <div className="text-sm font-semibold text-[var(--color-text-primary)]">提示</div>
            <div className="mt-2 text-sm text-[var(--color-text-secondary)]">
              此环境使用 Keycloak SSO 登录（本地 sso-dev）。默认用户 demo / demo。
            </div>
          </div>
        </div>

        <div className="flex w-full items-center justify-center py-14 lg:w-1/2">
          <Card className="w-full max-w-[420px]">
            <CardHeader>
              <CardTitle>登录</CardTitle>
            </CardHeader>
            <CardBody>
              <div className="space-y-3">
                <div>
                  <div className="mb-1 text-xs font-semibold text-[var(--color-text-tertiary)]">账号</div>
                  <Input value={username} onChange={(e) => setUsername(e.target.value)} placeholder="请输入账号" />
                </div>
                <div>
                  <div className="mb-1 text-xs font-semibold text-[var(--color-text-tertiary)]">密码</div>
                  <Input
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="请输入密码"
                  />
                </div>

                <div className="flex items-center justify-between text-sm text-[var(--color-text-tertiary)]">
                  <label className="flex items-center gap-2">
                    <input type="checkbox" />
                    <span>记住我（占位）</span>
                  </label>
                  <button className="text-[var(--color-primary)] hover:underline" type="button">
                    忘记密码（占位）
                  </button>
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
                    } catch (e) {
                      setError(e instanceof Error ? e.message : '登录失败')
                    } finally {
                      setLoading(false)
                    }
                  }}
                >
                  账号登录
                </Button>

                <div className="flex items-center gap-3 py-1">
                  <div className="h-px flex-1 bg-[var(--color-border-subtle)]" />
                  <div className="text-xs text-[var(--color-text-tertiary)]">或</div>
                  <div className="h-px flex-1 bg-[var(--color-border-subtle)]" />
                </div>

                <Button
                  variant="secondary"
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
      </div>
      <div className="mx-auto max-w-[1200px] px-4">
        <Footer />
      </div>
    </div>
  )
}
