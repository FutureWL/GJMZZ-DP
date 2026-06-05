import { Camera, MapPin, Phone, Plus, QrCode, Search, Timer } from 'lucide-react'
import { Badge } from '../../ui/Badge'
import { Card, CardBody, CardHeader, CardTitle } from '../../ui/Card'
import { Input } from '../../ui/Input'
import { PageHeader } from '../../ui/PageHeader'

const visits = [
  {
    customer: '客户A（汽车零部件）',
    person: '张经理',
    address: '浦东新区张江路 88 号',
    time: '09:30-10:30',
    status: '待拜访',
    tone: 'warning' as const,
  },
  {
    customer: '客户B（医疗器械）',
    person: '李总',
    address: '闵行区虹梅路 168 号',
    time: '13:30-14:30',
    status: '已签到',
    tone: 'success' as const,
  },
  {
    customer: '客户C（新能源）',
    person: '王工',
    address: '嘉定区安亭镇工业园',
    time: '16:00-16:40',
    status: '待确认',
    tone: 'info' as const,
  },
]

export function MobileCrmPrototypePage() {
  return (
    <div>
      <PageHeader
        title="移动 CRM 外勤（原型）"
        description="示例：拜访计划 → 签到 → 跟进记录（静态原型）"
        right={<Badge tone="info">Mobile</Badge>}
      />

      <div className="mx-auto max-w-[520px]">
        <div className="rounded-[28px] border border-[var(--color-border-subtle)] bg-[var(--color-bg-surface)] shadow-[var(--shadow-2)]">
          <div className="px-4 pt-4">
            <div className="flex items-center justify-between gap-3">
              <div>
                <div className="text-sm font-semibold text-[var(--color-text-primary)]">今日拜访</div>
                <div className="mt-1 text-xs text-[var(--color-text-tertiary)]">3 条计划 · 1 条已完成</div>
              </div>
              <div className="flex items-center gap-2">
                <div className="inline-flex h-9 items-center gap-2 rounded-[10px] border border-[var(--color-border-subtle)] px-3 text-sm text-[var(--color-text-primary)]">
                  <Plus className="h-4 w-4" />
                  新建
                </div>
              </div>
            </div>
          </div>

          <div className="px-4 pt-4">
            <div className="relative">
              <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[var(--color-text-tertiary)]" />
              <Input placeholder="搜索客户/联系人/机会…" className="pl-9" />
            </div>
          </div>

          <div className="px-4 pt-4">
            <Card className="shadow-none">
              <CardHeader className="pb-2">
                <CardTitle>拜访列表</CardTitle>
                <Badge tone="neutral">今天</Badge>
              </CardHeader>
              <CardBody className="pt-0">
                <div className="flex flex-col gap-3">
                  {visits.map((v) => (
                    <div
                      key={v.customer}
                      className="rounded-[12px] border border-[var(--color-border-subtle)] p-3"
                    >
                      <div className="flex items-start justify-between gap-3">
                        <div className="min-w-0">
                          <div className="truncate text-sm font-semibold text-[var(--color-text-primary)]">
                            {v.customer}
                          </div>
                          <div className="mt-1 truncate text-xs text-[var(--color-text-tertiary)]">
                            {v.person} · {v.time}
                          </div>
                        </div>
                        <Badge tone={v.tone}>{v.status}</Badge>
                      </div>
                      <div className="mt-3 flex flex-wrap items-center gap-2 text-xs text-[var(--color-text-tertiary)]">
                        <span className="inline-flex items-center gap-1 rounded-[8px] bg-black/5 px-2 py-1 dark:bg-white/5">
                          <MapPin className="h-3.5 w-3.5" />
                          {v.address}
                        </span>
                        <span className="inline-flex items-center gap-1 rounded-[8px] bg-black/5 px-2 py-1 dark:bg-white/5">
                          <Timer className="h-3.5 w-3.5" />
                          预计 40-60 分钟
                        </span>
                      </div>
                      <div className="mt-3 grid grid-cols-4 gap-2 text-xs">
                        <div className="inline-flex h-9 items-center justify-center gap-1 rounded-[10px] border border-[var(--color-border-subtle)] text-[var(--color-text-primary)]">
                          <QrCode className="h-4 w-4" />
                          签到
                        </div>
                        <div className="inline-flex h-9 items-center justify-center gap-1 rounded-[10px] border border-[var(--color-border-subtle)] text-[var(--color-text-primary)]">
                          <Phone className="h-4 w-4" />
                          拨号
                        </div>
                        <div className="inline-flex h-9 items-center justify-center gap-1 rounded-[10px] border border-[var(--color-border-subtle)] text-[var(--color-text-primary)]">
                          <Camera className="h-4 w-4" />
                          拍照
                        </div>
                        <div className="inline-flex h-9 items-center justify-center gap-1 rounded-[10px] border border-[var(--color-border-subtle)] text-[var(--color-text-primary)]">
                          <Plus className="h-4 w-4" />
                          记录
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardBody>
            </Card>
          </div>

          <div className="mt-4 border-t border-[var(--color-border-subtle)] px-4 py-3">
            <div className="grid grid-cols-4 gap-2 text-center text-xs text-[var(--color-text-tertiary)]">
              <div className="rounded-[10px] py-2">客户</div>
              <div className="rounded-[10px] bg-black/5 py-2 text-[var(--color-text-primary)] dark:bg-white/5">
                拜访
              </div>
              <div className="rounded-[10px] py-2">机会</div>
              <div className="rounded-[10px] py-2">我的</div>
            </div>
          </div>
        </div>

        <div className="mt-3 text-center text-xs text-[var(--color-text-tertiary)]">
          建议移动端把“行动按钮”做成高频入口：签到、记录、附件、提醒。
        </div>
      </div>
    </div>
  )
}

