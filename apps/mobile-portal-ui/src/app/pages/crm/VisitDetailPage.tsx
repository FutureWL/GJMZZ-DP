import { MapPin, Pencil, Phone, QrCode, Plus, UserRound } from 'lucide-react'
import { Link, useParams } from 'react-router-dom'
import { Badge } from '../../ui/Badge'
import { BottomNav } from '../../ui/BottomNav'
import { Button } from '../../ui/Button'
import { Card, CardBody, CardHeader, CardTitle } from '../../ui/Card'
import { PageHeader } from '../../ui/PageHeader'
import { useMobileCrm } from '../../state/crm/MobileCrmContext'

function badgeFor(status: string) {
  if (status === 'planned') return { text: '待拜访', tone: 'warning' as const }
  if (status === 'checked_in') return { text: '已签到', tone: 'success' as const }
  if (status === 'done') return { text: '已完成', tone: 'neutral' as const }
  return { text: '取消', tone: 'neutral' as const }
}

export function VisitDetailPage() {
  const { id } = useParams()
  const crm = useMobileCrm()
  const model = crm.getVisit(id)

  if (!model) {
    return (
      <div className="p-4">
        <PageHeader title="拜访详情" description="记录不存在" right={<Badge tone="error">404</Badge>} />
        <BottomNav />
      </div>
    )
  }

  const status = badgeFor(model.state.status)

  return (
    <div className="p-4">
      <PageHeader title="拜访详情" description={model.customer.name} right={<Badge tone={status.tone}>{status.text}</Badge>} />

      <div className="mx-auto max-w-[520px]">
        <div className="mb-3 flex items-center justify-between gap-2">
          <Link to={`/crm/customers/${model.customer.id}`} className="inline-flex items-center gap-2 text-sm text-[var(--color-primary)]">
            <UserRound className="h-4 w-4" />
            客户全景
          </Link>
          <Link
            to={`/crm/plans/${encodeURIComponent(model.visit.id)}/edit`}
            className="inline-flex items-center gap-2 rounded-[10px] border border-[var(--color-border-subtle)] px-3 py-2 text-sm text-[var(--color-text-primary)] hover:bg-black/5 dark:hover:bg-white/5"
          >
            <Pencil className="h-4 w-4" />
            编辑
          </Link>
        </div>
        <Card className="shadow-none">
          <CardHeader>
            <CardTitle>计划信息</CardTitle>
            <Badge tone="neutral">{model.visit.planStart.slice(11) + '-' + model.visit.planEnd.slice(11)}</Badge>
          </CardHeader>
          <CardBody>
            <div className="text-sm text-[var(--color-text-secondary)]">{model.visit.purpose}</div>
            <div className="mt-3 flex flex-wrap items-center gap-2 text-xs text-[var(--color-text-tertiary)]">
              <span className="inline-flex items-center gap-1 rounded-[8px] bg-black/5 px-2 py-1 dark:bg-white/5">
                <MapPin className="h-3.5 w-3.5" />
                {model.visit.address}
              </span>
              {model.contact ? (
                <span className="inline-flex items-center gap-1 rounded-[8px] bg-black/5 px-2 py-1 dark:bg-white/5">
                  <Phone className="h-3.5 w-3.5" />
                  {model.contact.name + ' ' + model.contact.phone}
                </span>
              ) : null}
            </div>

            <div className="mt-4 grid grid-cols-3 gap-2">
              <Link to={`/crm/visits/${encodeURIComponent(model.visit.id)}/check-in`} className="contents">
                <Button variant="primary" disabled={model.state.status !== 'planned'}>
                  <QrCode className="h-4 w-4" />
                  签到
                </Button>
              </Link>
              <Button variant="secondary" onClick={() => crm.markDone(model.visit.id)}>
                完成
              </Button>
              <Link to={`/crm/follow-ups/new?visitId=${encodeURIComponent(model.visit.id)}`} className="contents">
                <Button variant="secondary">
                  <Plus className="h-4 w-4" />
                  记录
                </Button>
              </Link>
            </div>

            {model.state.checkInAt ? (
              <div className="mt-4 rounded-[12px] border border-[var(--color-border-subtle)] p-3">
                <div className="text-xs text-[var(--color-text-tertiary)]">签到凭证</div>
                <div className="mt-1 text-sm text-[var(--color-text-primary)]">时间：{model.state.checkInAt}</div>
                <div className="mt-1 text-xs text-[var(--color-text-tertiary)]">
                  {model.state.checkInLat == null || model.state.checkInLng == null
                    ? '定位：未记录'
                    : `定位：${model.state.checkInLat.toFixed(5)}, ${model.state.checkInLng.toFixed(5)}`}
                </div>
                {model.state.checkInPhotoDataUrl ? (
                  <div className="mt-3 overflow-hidden rounded-[12px] border border-[var(--color-border-subtle)]">
                    <img src={model.state.checkInPhotoDataUrl} alt="check-in" className="block h-[180px] w-full object-cover" />
                  </div>
                ) : null}
              </div>
            ) : null}
          </CardBody>
        </Card>

        <div className="mt-4">
          <Card className="shadow-none">
            <CardHeader className="pb-2">
              <CardTitle>跟进记录</CardTitle>
              <Badge tone="neutral">{model.followUps.length}</Badge>
            </CardHeader>
            <CardBody className="pt-0">
              {model.followUps.length ? (
                <div className="divide-y divide-[var(--color-border-subtle)]">
                  {model.followUps.map((r) => (
                    <div key={r.id} className="py-3">
                      <div className="text-sm text-[var(--color-text-primary)]">{r.note}</div>
                      <div className="mt-1 text-xs text-[var(--color-text-tertiary)]">
                        {r.createdAt}
                        {r.nextAt ? ' · 下次：' + r.nextAt : ''}
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="py-6 text-center text-sm text-[var(--color-text-tertiary)]">暂无记录</div>
              )}
            </CardBody>
          </Card>
        </div>
      </div>

      <BottomNav />
    </div>
  )
}
