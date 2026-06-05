import { useMemo, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { Badge } from '../../ui/Badge'
import { BottomNav } from '../../ui/BottomNav'
import { Button } from '../../ui/Button'
import { Card, CardBody, CardHeader, CardTitle } from '../../ui/Card'
import { PageHeader } from '../../ui/PageHeader'
import { useMobileCrm } from '../../state/crm/MobileCrmContext'

function toRad(d: number) {
  return (d * Math.PI) / 180
}

function distanceMeters(a: { lat: number; lng: number }, b: { lat: number; lng: number }) {
  const R = 6371000
  const dLat = toRad(b.lat - a.lat)
  const dLng = toRad(b.lng - a.lng)
  const s1 = Math.sin(dLat / 2)
  const s2 = Math.sin(dLng / 2)
  const q = s1 * s1 + Math.cos(toRad(a.lat)) * Math.cos(toRad(b.lat)) * s2 * s2
  return 2 * R * Math.asin(Math.min(1, Math.sqrt(q)))
}

export function VisitCheckInPage() {
  const { id } = useParams()
  const crm = useMobileCrm()
  const model = crm.getVisit(id)
  const navigate = useNavigate()

  const [locLoading, setLocLoading] = useState(false)
  const [locErr, setLocErr] = useState<string | null>(null)
  const [lat, setLat] = useState<number | null>(null)
  const [lng, setLng] = useState<number | null>(null)
  const [photoDataUrl, setPhotoDataUrl] = useState<string | null>(null)

  const planned = useMemo(() => {
    if (!model) return null
    if (model.visit.plannedLat == null || model.visit.plannedLng == null) return null
    return { lat: model.visit.plannedLat, lng: model.visit.plannedLng }
  }, [model])

  const dist = useMemo(() => {
    if (!planned || lat == null || lng == null) return null
    return Math.round(distanceMeters(planned, { lat, lng }))
  }, [planned, lat, lng])

  if (!model) {
    return (
      <div className="p-4">
        <PageHeader title="签到" description="记录不存在" right={<Badge tone="error">404</Badge>} />
        <BottomNav />
      </div>
    )
  }

  const already = model.state.status !== 'planned'

  return (
    <div className="p-4">
      <PageHeader title="签到" description={model.customer.name} right={<Badge tone="info">Check-in</Badge>} />

      <div className="mx-auto max-w-[520px]">
        <Card className="shadow-none">
          <CardHeader className="pb-2">
            <CardTitle>定位与凭证</CardTitle>
            <Badge tone={already ? 'neutral' : 'warning'}>{already ? '已处理' : '待签到'}</Badge>
          </CardHeader>
          <CardBody className="pt-0">
            <div className="rounded-[12px] border border-[var(--color-border-subtle)] p-3">
              <div className="text-xs text-[var(--color-text-tertiary)]">计划地址</div>
              <div className="mt-1 text-sm text-[var(--color-text-primary)]">{model.visit.address}</div>
              <div className="mt-2 text-xs text-[var(--color-text-tertiary)]">
                {planned ? `计划坐标：${planned.lat.toFixed(4)}, ${planned.lng.toFixed(4)}` : '计划坐标：未配置（可在编辑拜访里补充）'}
              </div>
            </div>

            <div className="mt-3 rounded-[12px] border border-[var(--color-border-subtle)] p-3">
              <div className="flex items-center justify-between gap-3">
                <div>
                  <div className="text-xs text-[var(--color-text-tertiary)]">当前定位</div>
                  <div className="mt-1 text-sm text-[var(--color-text-primary)]">
                    {lat == null || lng == null ? '未获取' : `${lat.toFixed(5)}, ${lng.toFixed(5)}`}
                  </div>
                  {dist != null ? <div className="mt-1 text-xs text-[var(--color-text-tertiary)]">距离：{dist} m</div> : null}
                  {locErr ? <div className="mt-1 text-xs text-[var(--color-status-fault)]">{locErr}</div> : null}
                </div>
                <Button
                  variant="secondary"
                  size="sm"
                  disabled={locLoading}
                  onClick={() => {
                    setLocErr(null)
                    setLocLoading(true)
                    if (!navigator.geolocation) {
                      setLocErr('当前浏览器不支持定位')
                      setLocLoading(false)
                      return
                    }
                    navigator.geolocation.getCurrentPosition(
                      (pos) => {
                        setLat(pos.coords.latitude)
                        setLng(pos.coords.longitude)
                        setLocLoading(false)
                      },
                      (e) => {
                        setLocErr(e.message || '定位失败')
                        setLocLoading(false)
                      },
                      { enableHighAccuracy: true, timeout: 8000, maximumAge: 0 },
                    )
                  }}
                >
                  获取定位
                </Button>
              </div>
            </div>

            <div className="mt-3 rounded-[12px] border border-[var(--color-border-subtle)] p-3">
              <div className="text-xs text-[var(--color-text-tertiary)]">拍照凭证（可选）</div>
              <div className="mt-2">
                <input
                  type="file"
                  accept="image/*"
                  capture="environment"
                  onChange={(e) => {
                    const f = e.target.files?.[0]
                    if (!f) return
                    const reader = new FileReader()
                    reader.onload = () => {
                      const r = reader.result
                      if (typeof r === 'string') setPhotoDataUrl(r)
                    }
                    reader.readAsDataURL(f)
                  }}
                />
              </div>
              {photoDataUrl ? (
                <div className="mt-3 overflow-hidden rounded-[12px] border border-[var(--color-border-subtle)]">
                  <img src={photoDataUrl} alt="check-in" className="block h-[180px] w-full object-cover" />
                </div>
              ) : null}
            </div>

            <div className="mt-4 flex items-center gap-2">
              <Button
                variant="primary"
                disabled={already}
                onClick={() => {
                  crm.checkIn({ visitId: model.visit.id, lat, lng, photoDataUrl })
                  navigate(`/crm/visits/${model.visit.id}`)
                }}
              >
                确认签到
              </Button>
              <Button variant="secondary" onClick={() => navigate(`/crm/visits/${model.visit.id}`)}>
                返回
              </Button>
            </div>
          </CardBody>
        </Card>
      </div>

      <BottomNav />
    </div>
  )
}

