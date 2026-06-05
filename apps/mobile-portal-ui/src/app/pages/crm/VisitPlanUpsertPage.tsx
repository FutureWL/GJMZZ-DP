import { contacts, customers } from '@factory/mock-data'
import { useEffect, useMemo, useState } from 'react'
import { useNavigate, useParams, useSearchParams } from 'react-router-dom'
import { Badge } from '../../ui/Badge'
import { BottomNav } from '../../ui/BottomNav'
import { Button } from '../../ui/Button'
import { Card, CardBody, CardHeader, CardTitle } from '../../ui/Card'
import { Input } from '../../ui/Input'
import { PageHeader } from '../../ui/PageHeader'
import { Select } from '../../ui/Select'
import { Textarea } from '../../ui/Textarea'
import { useMobileCrm } from '../../state/crm/MobileCrmContext'

function pickDefaultCustomerId() {
  return customers[0]?.id ?? ''
}

export function VisitPlanUpsertPage() {
  const { id } = useParams()
  const crm = useMobileCrm()
  const [params] = useSearchParams()
  const navigate = useNavigate()

  const editing = Boolean(id)
  const existing = useMemo(() => (id ? crm.visitPlans.find((v) => v.id === id) : undefined), [crm.visitPlans, id])

  const initialCustomerId = params.get('customerId') ?? existing?.customerId ?? pickDefaultCustomerId()

  const [customerId, setCustomerId] = useState(initialCustomerId)
  const [contactId, setContactId] = useState<string>('')
  const [planStart, setPlanStart] = useState(existing?.planStart ?? '2026-06-05 09:30')
  const [planEnd, setPlanEnd] = useState(existing?.planEnd ?? '2026-06-05 10:30')
  const [address, setAddress] = useState(existing?.address ?? '')
  const [purpose, setPurpose] = useState(existing?.purpose ?? '')
  const [plannedLat, setPlannedLat] = useState(existing?.plannedLat?.toString() ?? '')
  const [plannedLng, setPlannedLng] = useState(existing?.plannedLng?.toString() ?? '')

  useEffect(() => {
    if (!editing) return
    if (!existing) return
    setCustomerId(existing.customerId)
    setContactId(existing.contactId ?? '')
    setPlanStart(existing.planStart)
    setPlanEnd(existing.planEnd)
    setAddress(existing.address)
    setPurpose(existing.purpose)
    setPlannedLat(existing.plannedLat?.toString() ?? '')
    setPlannedLng(existing.plannedLng?.toString() ?? '')
  }, [editing, existing])

  const customerContacts = useMemo(() => contacts.filter((c) => c.customerId === customerId), [customerId])

  useEffect(() => {
    const ok = customerContacts.some((c) => c.id === contactId)
    if (!ok) {
      setContactId(customerContacts[0]?.id ?? '')
    }
  }, [customerContacts, contactId])

  const canSubmit = useMemo(() => {
    return Boolean(customerId && planStart.trim() && planEnd.trim() && address.trim() && purpose.trim().length >= 2)
  }, [customerId, planStart, planEnd, address, purpose])

  return (
    <div className="p-4">
      <PageHeader title={editing ? '编辑拜访计划' : '新建拜访计划'} description="计划 → 签到 → 跟进 → 任务" right={<Badge tone="info">CRM</Badge>} />

      <div className="mx-auto max-w-[520px]">
        <Card className="shadow-none">
          <CardHeader>
            <CardTitle>基本信息</CardTitle>
            <Button variant="ghost" size="sm" onClick={() => navigate(-1)}>
              返回
            </Button>
          </CardHeader>
          <CardBody>
            <div className="text-sm text-[var(--color-text-tertiary)]">客户</div>
            <div className="mt-2">
              <Select value={customerId} onChange={(e) => setCustomerId(e.target.value)}>
                {customers.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.name}
                  </option>
                ))}
              </Select>
            </div>

            <div className="mt-4 text-sm text-[var(--color-text-tertiary)]">联系人（可选）</div>
            <div className="mt-2">
              <Select value={contactId} onChange={(e) => setContactId(e.target.value)}>
                <option value="">未指定</option>
                {customerContacts.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.name}
                  </option>
                ))}
              </Select>
            </div>

            <div className="mt-4 grid grid-cols-2 gap-3">
              <div>
                <div className="text-sm text-[var(--color-text-tertiary)]">开始</div>
                <div className="mt-2">
                  <Input value={planStart} onChange={(e) => setPlanStart(e.target.value)} placeholder="YYYY-MM-DD HH:mm" />
                </div>
              </div>
              <div>
                <div className="text-sm text-[var(--color-text-tertiary)]">结束</div>
                <div className="mt-2">
                  <Input value={planEnd} onChange={(e) => setPlanEnd(e.target.value)} placeholder="YYYY-MM-DD HH:mm" />
                </div>
              </div>
            </div>

            <div className="mt-4 text-sm text-[var(--color-text-tertiary)]">地址</div>
            <div className="mt-2">
              <Input value={address} onChange={(e) => setAddress(e.target.value)} placeholder="例如：浦东新区张江路 88 号" />
            </div>

            <div className="mt-4 text-sm text-[var(--color-text-tertiary)]">拜访目的</div>
            <div className="mt-2">
              <Textarea value={purpose} onChange={(e) => setPurpose(e.target.value)} placeholder="例如：确认交期、报价版本、付款条款…" />
            </div>

            <div className="mt-4 grid grid-cols-2 gap-3">
              <div>
                <div className="text-sm text-[var(--color-text-tertiary)]">计划纬度（可选）</div>
                <div className="mt-2">
                  <Input value={plannedLat} onChange={(e) => setPlannedLat(e.target.value)} placeholder="例如：31.2066" />
                </div>
              </div>
              <div>
                <div className="text-sm text-[var(--color-text-tertiary)]">计划经度（可选）</div>
                <div className="mt-2">
                  <Input value={plannedLng} onChange={(e) => setPlannedLng(e.target.value)} placeholder="例如：121.6039" />
                </div>
              </div>
            </div>

            <div className="mt-5 flex items-center gap-2">
              <Button
                variant="primary"
                disabled={!canSubmit}
                onClick={() => {
                  const lat = plannedLat.trim() ? Number(plannedLat.trim()) : null
                  const lng = plannedLng.trim() ? Number(plannedLng.trim()) : null
                  if (editing && existing) {
                    crm.updateVisit(existing.id, {
                      customerId,
                      contactId: contactId || null,
                      planStart,
                      planEnd,
                      address,
                      purpose,
                      plannedLat: Number.isFinite(lat) ? lat : null,
                      plannedLng: Number.isFinite(lng) ? lng : null,
                    })
                    navigate(`/crm/visits/${existing.id}`)
                    return
                  }
                  const createdId = crm.createVisit({
                    customerId,
                    contactId: contactId || null,
                    planStart,
                    planEnd,
                    address,
                    purpose,
                    plannedLat: Number.isFinite(lat) ? lat : null,
                    plannedLng: Number.isFinite(lng) ? lng : null,
                  })
                  navigate(`/crm/visits/${createdId}`)
                }}
              >
                保存
              </Button>
              <Button variant="secondary" onClick={() => navigate('/crm')}>
                取消
              </Button>
              {editing && existing ? (
                <Button
                  variant="danger"
                  onClick={() => {
                    crm.cancelVisit(existing.id)
                    navigate(`/crm/visits/${existing.id}`)
                  }}
                >
                  取消拜访
                </Button>
              ) : null}
            </div>
          </CardBody>
        </Card>
      </div>

      <BottomNav />
    </div>
  )
}

