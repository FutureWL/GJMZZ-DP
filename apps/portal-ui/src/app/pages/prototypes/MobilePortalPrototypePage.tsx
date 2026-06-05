import { Bell, ChevronRight, Search, UserRound } from 'lucide-react'
import { Badge } from '../../ui/Badge'
import { Card, CardBody, CardHeader, CardTitle } from '../../ui/Card'
import { Input } from '../../ui/Input'
import { PageHeader } from '../../ui/PageHeader'

const quickApps = [
  { label: '我的待办', hint: '12' },
  { label: '审批中心', hint: '3' },
  { label: 'CRM', hint: '外勤' },
  { label: '告警中心', hint: '5' },
]

const todos = [
  { title: '客户A：报价确认', meta: '今天 15:00 前 · 销售部' },
  { title: '工单 #WO-240605：排产评审', meta: '明天 10:00 · 生产部' },
  { title: '供应商合规到期：S-021', meta: '本周内 · 管理部' },
]

export function MobilePortalPrototypePage() {
  return (
    <div>
      <PageHeader
        title="移动门户（原型）"
        description="示例：待办触达 + 常用入口（手机端信息架构参考）"
        right={<Badge tone="info">Mobile</Badge>}
      />

      <div className="mx-auto max-w-[520px]">
        <div className="rounded-[28px] border border-[var(--color-border-subtle)] bg-[var(--color-bg-surface)] shadow-[var(--shadow-2)]">
          <div className="flex items-center justify-between gap-3 px-4 pt-4">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-black/5 dark:bg-white/5">
                <UserRound className="h-5 w-5 text-[var(--color-text-secondary)]" />
              </div>
              <div>
                <div className="text-sm font-semibold text-[var(--color-text-primary)]">王磊</div>
                <div className="text-xs text-[var(--color-text-tertiary)]">销售一部 · 上海工厂</div>
              </div>
            </div>
            <div className="relative">
              <Bell className="h-5 w-5 text-[var(--color-text-secondary)]" />
              <span className="absolute -right-1 -top-1 h-2 w-2 rounded-full bg-[var(--color-status-fault)]" />
            </div>
          </div>

          <div className="px-4 pt-4">
            <div className="relative">
              <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[var(--color-text-tertiary)]" />
              <Input placeholder="搜索应用、客户、工单…" className="pl-9" />
            </div>
          </div>

          <div className="px-4 pt-4">
            <div className="grid grid-cols-2 gap-3">
              {quickApps.map((a) => (
                <div
                  key={a.label}
                  className="rounded-[12px] border border-[var(--color-border-subtle)] bg-[var(--color-bg-surface)] p-3 hover:bg-black/5 dark:hover:bg-white/5"
                >
                  <div className="flex items-start justify-between gap-2">
                    <div className="text-sm font-semibold text-[var(--color-text-primary)]">{a.label}</div>
                    <Badge tone="neutral">{a.hint}</Badge>
                  </div>
                  <div className="mt-2 text-xs text-[var(--color-text-tertiary)]">一键进入</div>
                </div>
              ))}
            </div>
          </div>

          <div className="px-4 pt-4">
            <Card className="shadow-none">
              <CardHeader className="pb-2">
                <CardTitle>我的待办</CardTitle>
                <Badge tone="warning">12</Badge>
              </CardHeader>
              <CardBody className="pt-0">
                <div className="divide-y divide-[var(--color-border-subtle)]">
                  {todos.map((t) => (
                    <div key={t.title} className="flex items-center justify-between gap-3 py-3">
                      <div className="min-w-0">
                        <div className="truncate text-sm text-[var(--color-text-primary)]">{t.title}</div>
                        <div className="mt-1 truncate text-xs text-[var(--color-text-tertiary)]">{t.meta}</div>
                      </div>
                      <ChevronRight className="h-4 w-4 shrink-0 text-[var(--color-text-tertiary)]" />
                    </div>
                  ))}
                </div>
              </CardBody>
            </Card>
          </div>

          <div className="mt-4 border-t border-[var(--color-border-subtle)] px-4 py-3">
            <div className="grid grid-cols-4 gap-2 text-center text-xs text-[var(--color-text-tertiary)]">
              <div className="rounded-[10px] bg-black/5 py-2 text-[var(--color-text-primary)] dark:bg-white/5">
                首页
              </div>
              <div className="rounded-[10px] py-2">待办</div>
              <div className="rounded-[10px] py-2">应用</div>
              <div className="rounded-[10px] py-2">我的</div>
            </div>
          </div>
        </div>

        <div className="mt-3 text-center text-xs text-[var(--color-text-tertiary)]">
          建议以“卡片入口 + 待办触达”为核心，其他业务通过模块化入口接入。
        </div>
      </div>
    </div>
  )
}

