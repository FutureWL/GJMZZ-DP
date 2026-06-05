import { useMemo, useState } from 'react'
import { Link, useNavigate, useSearchParams } from 'react-router-dom'
import { Badge } from '../../ui/Badge'
import { BottomNav } from '../../ui/BottomNav'
import { Button } from '../../ui/Button'
import { Card, CardBody, CardHeader, CardTitle } from '../../ui/Card'
import { Input } from '../../ui/Input'
import { PageHeader } from '../../ui/PageHeader'
import { useMobileCrm } from '../../state/crm/MobileCrmContext'

export function NewFollowUpPage() {
  const crm = useMobileCrm()
  const [params] = useSearchParams()
  const visitId = params.get('visitId') ?? ''
  const visit = crm.getVisit(visitId)
  const navigate = useNavigate()

  const [note, setNote] = useState('')
  const [nextAt, setNextAt] = useState('')

  const canSubmit = useMemo(() => Boolean(visitId && note.trim().length >= 2), [visitId, note])

  return (
    <div className="p-4">
      <PageHeader title="新增跟进记录" description={visit?.customer.name ?? '未选择拜访'} right={<Badge tone="info">CRM</Badge>} />

      <div className="mx-auto max-w-[520px]">
        <Card className="shadow-none">
          <CardHeader>
            <CardTitle>记录内容</CardTitle>
            {visit ? (
              <Link to={`/crm/visits/${visitId}`} className="text-sm text-[var(--color-primary)]">
                返回详情
              </Link>
            ) : null}
          </CardHeader>
          <CardBody>
            <div className="text-sm text-[var(--color-text-tertiary)]">跟进摘要（至少 2 个字）</div>
            <div className="mt-2">
              <Input value={note} onChange={(e) => setNote(e.target.value)} placeholder="例如：已确认交期，客户要求下周出V2报价" />
            </div>

            <div className="mt-4 text-sm text-[var(--color-text-tertiary)]">下次跟进时间（可选）</div>
            <div className="mt-2">
              <Input value={nextAt} onChange={(e) => setNextAt(e.target.value)} placeholder="例如：2026-06-07 10:00" />
            </div>

            <div className="mt-4 flex items-center gap-2">
              <Button
                variant="primary"
                disabled={!canSubmit}
                onClick={() => {
                  crm.addFollowUp({ visitId, note: note.trim(), nextAt: nextAt.trim() ? nextAt.trim() : null })
                  navigate(`/crm/visits/${visitId}`)
                }}
              >
                保存
              </Button>
              <Button variant="secondary" onClick={() => navigate(visit ? `/crm/visits/${visitId}` : '/crm')}>
                取消
              </Button>
            </div>
          </CardBody>
        </Card>
      </div>

      <BottomNav />
    </div>
  )
}

