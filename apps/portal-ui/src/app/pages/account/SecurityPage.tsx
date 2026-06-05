import { useState } from 'react'
import { Button } from '../../ui/Button'
import { Card, CardBody, CardHeader, CardTitle } from '../../ui/Card'
import { Input } from '../../ui/Input'
import { PageHeader } from '../../ui/PageHeader'

export function SecurityPage() {
  const [oldPwd, setOldPwd] = useState('')
  const [newPwd, setNewPwd] = useState('')
  const [newPwd2, setNewPwd2] = useState('')
  const [msg, setMsg] = useState<string | null>(null)

  return (
    <div>
      <PageHeader title="安全设置" description="修改密码 / 2FA（仅UI占位）" />

      <div className="grid grid-cols-1 gap-4">
        <Card>
          <CardHeader>
            <CardTitle>修改密码（占位）</CardTitle>
          </CardHeader>
          <CardBody>
            <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
              <div>
                <div className="mb-1 text-xs font-semibold text-[var(--color-text-tertiary)]">旧密码</div>
                <Input type="password" value={oldPwd} onChange={(e) => setOldPwd(e.target.value)} />
              </div>
              <div />
              <div>
                <div className="mb-1 text-xs font-semibold text-[var(--color-text-tertiary)]">新密码</div>
                <Input type="password" value={newPwd} onChange={(e) => setNewPwd(e.target.value)} />
              </div>
              <div>
                <div className="mb-1 text-xs font-semibold text-[var(--color-text-tertiary)]">确认新密码</div>
                <Input type="password" value={newPwd2} onChange={(e) => setNewPwd2(e.target.value)} />
              </div>
            </div>
            {msg ? (
              <div className="mt-3 rounded-[10px] border border-[var(--color-border-subtle)] bg-[var(--color-bg-surface)] px-3 py-2 text-sm text-[var(--color-text-secondary)]">
                {msg}
              </div>
            ) : null}
            <div className="mt-3 flex items-center gap-2">
              <Button
                variant="primary"
                onClick={() => {
                  if (!oldPwd || !newPwd || !newPwd2) {
                    setMsg('请输入完整信息（占位校验）')
                    return
                  }
                  if (newPwd !== newPwd2) {
                    setMsg('两次新密码不一致')
                    return
                  }
                  setMsg('密码已更新（仅界面占位，未接入后端）')
                  setOldPwd('')
                  setNewPwd('')
                  setNewPwd2('')
                }}
              >
                保存
              </Button>
              <Button
                variant="secondary"
                onClick={() => {
                  setMsg(null)
                  setOldPwd('')
                  setNewPwd('')
                  setNewPwd2('')
                }}
              >
                重置
              </Button>
            </div>
          </CardBody>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>双因素认证（2FA，占位）</CardTitle>
          </CardHeader>
          <CardBody>
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div className="text-sm text-[var(--color-text-secondary)]">启用 2FA 可提升账号安全性（此处仅展示 UI）。</div>
              <Button variant="secondary">启用（占位）</Button>
            </div>
          </CardBody>
        </Card>
      </div>
    </div>
  )
}

