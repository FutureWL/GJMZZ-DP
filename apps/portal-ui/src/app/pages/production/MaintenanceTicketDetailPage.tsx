import { Link, useParams } from 'react-router-dom'
import { Badge } from '../../ui/Badge'
import { Button } from '../../ui/Button'
import { Card, CardBody, CardHeader, CardTitle } from '../../ui/Card'
import { Input } from '../../ui/Input'
import { PageHeader } from '../../ui/PageHeader'
import { Select } from '../../ui/Select'
import { useMemo, useState } from 'react'
import { useMaintenanceFlow } from '../../state/maintenance/MaintenanceFlowContext'

function statusLabel(status: string) {
  if (status === 'reported') return '报修'
  if (status === 'dispatched') return '已派工'
  if (status === 'accepted') return '已接单'
  if (status === 'on_site') return '已到场'
  if (status === 'repairing') return '维修中'
  if (status === 'done') return '已完工'
  if (status === 'verified') return '已验收'
  if (status === 'closed') return '已关闭'
  if (status === 'canceled') return '已取消'
  return status
}

export function MaintenanceTicketDetailPage() {
  const { id } = useParams()
  const flow = useMaintenanceFlow()
  const ticket = id ? flow.getTicket(id) : undefined
  const [note, setNote] = useState('')
  const [assignee, setAssignee] = useState('维修-王')
  const [cause, setCause] = useState('')
  const [solution, setSolution] = useState('')
  const [sparePartId, setSparePartId] = useState(flow.spareParts[0]?.id ?? '')
  const [spareQty, setSpareQty] = useState(1)

  const part = useMemo(() => flow.spareParts.find((p) => p.id === sparePartId), [flow.spareParts, sparePartId])

  return (
    <div>
      <PageHeader
        title={`维修工单详情：${id ?? '-'}`}
        description={ticket ? `${ticket.title}｜当前：${statusLabel(ticket.status)}｜负责人：${ticket.assignee ?? '未派工'}` : '派工/进度/用料/完工记录（mock）'}
        right={
          <div className="flex flex-wrap items-center gap-2">
            <Link to="/production/maintenance">
              <Button variant="secondary">返回列表</Button>
            </Link>
            {ticket?.status === 'reported' ? (
              <Button
                variant="primary"
                onClick={() => {
                  flow.dispatch(ticket.id, assignee, note || undefined)
                  setNote('')
                }}
              >
                派工
              </Button>
            ) : null}
            {ticket?.status === 'dispatched' ? (
              <Button
                variant="primary"
                onClick={() => {
                  flow.accept(ticket.id, note || undefined)
                  setNote('')
                }}
              >
                接单
              </Button>
            ) : null}
            {ticket?.status === 'accepted' ? (
              <Button
                variant="primary"
                onClick={() => {
                  flow.arrive(ticket.id, note || undefined)
                  setNote('')
                }}
              >
                到场
              </Button>
            ) : null}
            {ticket?.status === 'on_site' ? (
              <Button
                variant="primary"
                onClick={() => {
                  flow.startRepair(ticket.id, note || undefined)
                  setNote('')
                }}
              >
                开始维修
              </Button>
            ) : null}
            {ticket?.status === 'repairing' ? (
              <>
                <Button
                  variant="secondary"
                  onClick={() => {
                    if (!part) return
                    flow.addSpareUsage(ticket.id, {
                      id: `MSP-${Date.now()}`,
                      partId: part.id,
                      partName: part.name,
                      qty: spareQty,
                      uom: part.uom,
                    })
                  }}
                >
                  领用备件
                </Button>
                <Button
                  variant="primary"
                  onClick={() => {
                    flow.complete(ticket.id, cause || '原因未填写', solution || '措施未填写', note || undefined)
                    setCause('')
                    setSolution('')
                    setNote('')
                  }}
                >
                  完工
                </Button>
              </>
            ) : null}
            {ticket?.status === 'done' ? (
              <Button
                variant="primary"
                onClick={() => {
                  flow.verify(ticket.id, note || undefined)
                  setNote('')
                }}
              >
                验收通过
              </Button>
            ) : null}
            {ticket?.status === 'verified' ? (
              <Button
                variant="primary"
                onClick={() => {
                  flow.close(ticket.id, note || undefined)
                  setNote('')
                }}
              >
                关闭工单
              </Button>
            ) : null}
            {ticket && ticket.status !== 'closed' && ticket.status !== 'canceled' ? (
              <Button
                variant="danger"
                onClick={() => {
                  flow.cancel(ticket.id, note || undefined)
                  setNote('')
                }}
              >
                取消
              </Button>
            ) : null}
          </div>
        }
      />

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle>工单信息</CardTitle>
          </CardHeader>
          <CardBody>
            <div className="grid grid-cols-1 gap-3 text-sm md:grid-cols-2">
              <div>
                <div className="text-xs text-[var(--color-text-tertiary)]">设备</div>
                <div className="mt-1 text-[var(--color-text-primary)]">{ticket?.equipmentName ?? '-'}</div>
                <div className="mt-1 text-xs text-[var(--color-text-tertiary)]">
                  {ticket ? `${ticket.factory} · ${ticket.line} · ${ticket.location}` : '-'}
                </div>
              </div>
              <div>
                <div className="text-xs text-[var(--color-text-tertiary)]">SLA</div>
                <div className="mt-1">
                  {ticket ? (
                    flow.isOverdue(ticket) ? (
                      <Badge tone="warning">超时</Badge>
                    ) : (
                      <Badge tone="neutral">正常</Badge>
                    )
                  ) : (
                    <Badge tone="neutral">-</Badge>
                  )}
                </div>
              </div>
              <div className="md:col-span-2">
                <div className="text-xs text-[var(--color-text-tertiary)]">现象描述</div>
                <div className="mt-1 text-[var(--color-text-primary)]">{ticket?.symptom ?? '-'}</div>
              </div>
            </div>

            <div className="mt-4 grid grid-cols-1 gap-3 md:grid-cols-2">
              <div>
                <div className="mb-1 text-xs font-semibold text-[var(--color-text-tertiary)]">派工给</div>
                <Select value={assignee} onChange={(e) => setAssignee(e.target.value)}>
                  {['维修-王', '维修-李', '维修-周', '外协-服务商'].map((x) => (
                    <option key={x} value={x}>
                      {x}
                    </option>
                  ))}
                </Select>
              </div>
              <div>
                <div className="mb-1 text-xs font-semibold text-[var(--color-text-tertiary)]">处理意见（可选）</div>
                <Input value={note} onChange={(e) => setNote(e.target.value)} placeholder="派工/接单/完工/验收备注（mock）" />
              </div>
            </div>

            {ticket?.status === 'repairing' ? (
              <div className="mt-4 grid grid-cols-1 gap-3 md:grid-cols-2">
                <div>
                  <div className="mb-1 text-xs font-semibold text-[var(--color-text-tertiary)]">领用备件</div>
                  <Select value={sparePartId} onChange={(e) => setSparePartId(e.target.value)}>
                    {flow.spareParts.map((p) => (
                      <option key={p.id} value={p.id}>
                        {p.name} · 库存 {p.stockQty}
                      </option>
                    ))}
                  </Select>
                </div>
                <div>
                  <div className="mb-1 text-xs font-semibold text-[var(--color-text-tertiary)]">数量</div>
                  <Input
                    value={String(spareQty)}
                    onChange={(e) => {
                      const num = Number(e.target.value)
                      setSpareQty(Number.isFinite(num) ? num : 1)
                    }}
                  />
                </div>
                <div className="md:col-span-2">
                  <div className="mb-1 text-xs font-semibold text-[var(--color-text-tertiary)]">原因（完工必填）</div>
                  <Input value={cause} onChange={(e) => setCause(e.target.value)} placeholder="例如：管路老化、轴承磨损..." />
                </div>
                <div className="md:col-span-2">
                  <div className="mb-1 text-xs font-semibold text-[var(--color-text-tertiary)]">措施/结果（完工必填）</div>
                  <Input value={solution} onChange={(e) => setSolution(e.target.value)} placeholder="例如：更换备件、复测通过..." />
                </div>
              </div>
            ) : null}
          </CardBody>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>状态推进</CardTitle>
          </CardHeader>
          <CardBody>
            <div className="space-y-2 text-sm text-[var(--color-text-secondary)]">
              {ticket?.nodes?.map((n) => (
                <div
                  key={n.key}
                  className="flex items-center justify-between gap-3 rounded-[10px] border border-[var(--color-border-subtle)] bg-[var(--color-bg-surface)] p-3"
                >
                  <div>{n.label}</div>
                  <Badge tone={n.status === 'done' ? 'success' : 'neutral'}>{n.status === 'done' ? '已完成' : '未开始'}</Badge>
                </div>
              )) ?? null}
            </div>
          </CardBody>
        </Card>
      </div>

      <div className="mt-4 grid grid-cols-1 gap-4 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>用料与附件</CardTitle>
          </CardHeader>
          <CardBody>
            <div className="space-y-3 text-sm text-[var(--color-text-secondary)]">
              <div className="rounded-[10px] border border-[var(--color-border-subtle)] bg-[var(--color-bg-surface)] p-3">
                <div className="text-xs font-semibold text-[var(--color-text-tertiary)]">备件领用</div>
                <div className="mt-2 space-y-1">
                  {ticket?.spareParts?.length ? (
                    ticket.spareParts.map((s) => (
                      <div key={s.id} className="flex items-center justify-between gap-3">
                        <div className="text-[var(--color-text-primary)]">{s.partName}</div>
                        <div className="text-xs text-[var(--color-text-tertiary)]">
                          × {s.qty}
                          {s.uom}
                        </div>
                      </div>
                    ))
                  ) : (
                    <div className="text-xs text-[var(--color-text-tertiary)]">暂无领用</div>
                  )}
                </div>
              </div>
              <div className="rounded-[10px] border border-[var(--color-border-subtle)] bg-[var(--color-bg-surface)] p-3">
                <div className="text-xs font-semibold text-[var(--color-text-tertiary)]">附件</div>
                <div className="mt-2 flex flex-wrap gap-2">
                  {ticket?.attachments?.length ? (
                    ticket.attachments.map((a) => (
                      <span
                        key={a}
                        className="inline-flex items-center rounded-[6px] border border-[var(--color-border-subtle)] bg-[var(--color-bg-surface)] px-2 py-1 text-xs"
                      >
                        {a}
                      </span>
                    ))
                  ) : (
                    <span className="text-xs text-[var(--color-text-tertiary)]">暂无附件</span>
                  )}
                </div>
                <div className="mt-3">
                  <input
                    type="file"
                    multiple
                    className="block w-full text-sm text-[var(--color-text-tertiary)] file:mr-3 file:rounded-[6px] file:border-0 file:bg-[var(--color-bg-surface)] file:px-3 file:py-2 file:text-sm file:font-medium file:text-[var(--color-text-primary)]"
                  />
                </div>
              </div>
            </div>
          </CardBody>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>流转记录</CardTitle>
          </CardHeader>
          <CardBody>
            <div className="space-y-2 text-sm text-[var(--color-text-secondary)]">
              {ticket?.timeline?.map((t, idx) => (
                <div
                  key={`${t.at}-${idx}`}
                  className="rounded-[10px] border border-[var(--color-border-subtle)] bg-[var(--color-bg-surface)] p-3"
                >
                  <div className="flex items-center justify-between gap-3">
                    <div className="font-medium text-[var(--color-text-primary)]">{t.actor}</div>
                    <div className="text-xs text-[var(--color-text-tertiary)]">{t.at}</div>
                  </div>
                  <div className="mt-1 text-xs text-[var(--color-text-tertiary)]">{t.action}</div>
                  {t.note ? <div className="mt-2">{t.note}</div> : null}
                </div>
              )) ?? null}
            </div>
          </CardBody>
        </Card>
      </div>
    </div>
  )
}
