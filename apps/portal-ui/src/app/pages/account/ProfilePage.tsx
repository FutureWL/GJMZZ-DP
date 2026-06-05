import { useMemo, useState } from 'react'
import { useAuth } from '../../state/auth/useAuth'
import type { User } from '../../state/auth/types'
import { Avatar } from '../../ui/Avatar'
import { Button } from '../../ui/Button'
import { Card, CardBody, CardHeader, CardTitle } from '../../ui/Card'
import { Input } from '../../ui/Input'
import { PageHeader } from '../../ui/PageHeader'

function cloneUser(u: User): User {
  return JSON.parse(JSON.stringify(u)) as User
}

export function ProfilePage() {
  const auth = useAuth()
  const user = auth.user!
  const [editing, setEditing] = useState(false)
  const [draft, setDraft] = useState<User>(() => cloneUser(user))

  const changed = useMemo(() => JSON.stringify(draft) !== JSON.stringify(user), [draft, user])

  return (
    <div>
      <PageHeader
        title="个人信息"
        description="基础信息展示与编辑（保存到 LocalStorage）"
        right={
          editing ? (
            <div className="flex items-center gap-2">
              <Button
                variant="secondary"
                onClick={() => {
                  setDraft(cloneUser(user))
                  setEditing(false)
                }}
              >
                取消
              </Button>
              <Button
                variant="primary"
                disabled={!changed}
                onClick={() => {
                  auth.updateUser(draft)
                  setEditing(false)
                }}
              >
                保存
              </Button>
            </div>
          ) : (
            <Button
              variant="primary"
              onClick={() => {
                setDraft(cloneUser(user))
                setEditing(true)
              }}
            >
              编辑
            </Button>
          )
        }
      />

      <Card>
        <CardHeader>
          <CardTitle>用户资料</CardTitle>
        </CardHeader>
        <CardBody>
          <div className="flex flex-col gap-4 md:flex-row md:items-start">
            <div className="flex items-center gap-3">
              <Avatar text={draft.avatarText || draft.name.slice(0, 1)} size={44} className="text-base" />
              <div>
                <div className="text-sm font-semibold text-[var(--color-text-primary)]">{user.name}</div>
                <div className="mt-1 text-xs text-[var(--color-text-tertiary)]">
                  工号 {user.employeeId} · {user.department}
                </div>
              </div>
            </div>

            <div className="grid flex-1 grid-cols-1 gap-3 md:grid-cols-2">
              <div>
                <div className="mb-1 text-xs font-semibold text-[var(--color-text-tertiary)]">姓名</div>
                {editing ? (
                  <Input value={draft.name} onChange={(e) => setDraft((d) => ({ ...d, name: e.target.value }))} />
                ) : (
                  <div className="h-9 rounded-[6px] border border-[var(--color-border-subtle)] bg-[var(--color-bg-surface)] px-3 py-2 text-sm text-[var(--color-text-primary)]">
                    {user.name}
                  </div>
                )}
              </div>
              <div>
                <div className="mb-1 text-xs font-semibold text-[var(--color-text-tertiary)]">工号</div>
                {editing ? (
                  <Input
                    value={draft.employeeId}
                    onChange={(e) => setDraft((d) => ({ ...d, employeeId: e.target.value }))}
                  />
                ) : (
                  <div className="h-9 rounded-[6px] border border-[var(--color-border-subtle)] bg-[var(--color-bg-surface)] px-3 py-2 text-sm text-[var(--color-text-primary)]">
                    {user.employeeId}
                  </div>
                )}
              </div>
              <div>
                <div className="mb-1 text-xs font-semibold text-[var(--color-text-tertiary)]">部门</div>
                {editing ? (
                  <Input
                    value={draft.department}
                    onChange={(e) => setDraft((d) => ({ ...d, department: e.target.value }))}
                  />
                ) : (
                  <div className="h-9 rounded-[6px] border border-[var(--color-border-subtle)] bg-[var(--color-bg-surface)] px-3 py-2 text-sm text-[var(--color-text-primary)]">
                    {user.department}
                  </div>
                )}
              </div>
              <div>
                <div className="mb-1 text-xs font-semibold text-[var(--color-text-tertiary)]">岗位</div>
                {editing ? (
                  <Input
                    value={draft.position}
                    onChange={(e) => setDraft((d) => ({ ...d, position: e.target.value }))}
                  />
                ) : (
                  <div className="h-9 rounded-[6px] border border-[var(--color-border-subtle)] bg-[var(--color-bg-surface)] px-3 py-2 text-sm text-[var(--color-text-primary)]">
                    {user.position}
                  </div>
                )}
              </div>
              <div>
                <div className="mb-1 text-xs font-semibold text-[var(--color-text-tertiary)]">手机号</div>
                {editing ? (
                  <Input
                    value={draft.phone}
                    onChange={(e) => setDraft((d) => ({ ...d, phone: e.target.value }))}
                  />
                ) : (
                  <div className="h-9 rounded-[6px] border border-[var(--color-border-subtle)] bg-[var(--color-bg-surface)] px-3 py-2 text-sm text-[var(--color-text-primary)]">
                    {user.phone}
                  </div>
                )}
              </div>
              <div>
                <div className="mb-1 text-xs font-semibold text-[var(--color-text-tertiary)]">邮箱</div>
                {editing ? (
                  <Input
                    value={draft.email}
                    onChange={(e) => setDraft((d) => ({ ...d, email: e.target.value }))}
                  />
                ) : (
                  <div className="h-9 rounded-[6px] border border-[var(--color-border-subtle)] bg-[var(--color-bg-surface)] px-3 py-2 text-sm text-[var(--color-text-primary)]">
                    {user.email}
                  </div>
                )}
              </div>
            </div>
          </div>
        </CardBody>
      </Card>
    </div>
  )
}

