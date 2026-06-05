import { useMemo, useState } from 'react'
import { Link, Navigate, useNavigate, useParams } from 'react-router-dom'
import { factories } from '../../../mock/data'
import type { Incident } from '../../../mock/models'
import { useIncidentData } from '../../../state/production/IncidentDataContext'
import { Badge } from '../../../ui/Badge'
import { Button } from '../../../ui/Button'
import { Card, CardBody, CardHeader, CardTitle } from '../../../ui/Card'
import { Input } from '../../../ui/Input'
import { PageHeader } from '../../../ui/PageHeader'
import { Select } from '../../../ui/Select'

function formatAt(now = new Date()) {
  const pad = (n: number) => String(n).padStart(2, '0')
  return `${now.getFullYear()}-${pad(now.getMonth() + 1)}-${pad(now.getDate())} ${pad(now.getHours())}:${pad(
    now.getMinutes(),
  )}`
}

export function IncidentUpsertPage({ mode }: { mode: 'create' | 'edit' }) {
  const { id } = useParams()
  const navigate = useNavigate()
  const { incidents, createIncident, updateIncident } = useIncidentData()

  const editing = useMemo(() => (mode === 'edit' ? incidents.find((x) => x.id === id) : null), [id, incidents, mode])

  const [occurredAt, setOccurredAt] = useState<string>(() => editing?.occurredAt ?? formatAt())
  const [reportedBy, setReportedBy] = useState<string>(() => editing?.reportedBy ?? '')
  const [type, setType] = useState<Incident['type']>(() => editing?.type ?? 'other')
  const [severity, setSeverity] = useState<Incident['severity']>(() => editing?.severity ?? 'medium')
  const [factoryId, setFactoryId] = useState<string>(() => editing?.factoryId ?? factories[0]?.id ?? 'F01')
  const [line, setLine] = useState<string>(() => editing?.line ?? '')
  const [workOrderId, setWorkOrderId] = useState<string>(() => editing?.workOrderId ?? '')
  const [orderId, setOrderId] = useState<string>(() => editing?.orderId ?? '')
  const [equipment, setEquipment] = useState<string>(() => editing?.equipment ?? '')
  const [material, setMaterial] = useState<string>(() => editing?.material ?? '')
  const [description, setDescription] = useState<string>(() => editing?.description ?? '')
  const [attachments, setAttachments] = useState<string>(() => (editing?.attachments ?? []).join(', '))

  const factoryName = factories.find((f) => f.id === factoryId)?.name ?? factoryId

  if (mode === 'edit' && !editing) {
    return <Navigate to="/production/incidents" replace />
  }

  return (
    <div>
      <PageHeader
        title={mode === 'create' ? '新增异常' : `编辑异常：${editing?.id ?? '-'}`}
        description="仅记录字段，不强制派工闭环"
        right={
          <div className="flex items-center gap-2">
            <Link to="/production/incidents">
              <Button variant="secondary">返回列表</Button>
            </Link>
            <Badge tone="domain-production">生产</Badge>
          </div>
        }
      />

      <Card>
        <CardHeader>
          <CardTitle>异常信息</CardTitle>
        </CardHeader>
        <CardBody>
          <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
            <div>
              <div className="mb-1 text-xs text-[var(--color-text-tertiary)]">发生时间</div>
              <Input value={occurredAt} onChange={(e) => setOccurredAt(e.target.value)} placeholder="YYYY-MM-DD HH:mm" />
            </div>
            <div>
              <div className="mb-1 text-xs text-[var(--color-text-tertiary)]">发现人</div>
              <Input value={reportedBy} onChange={(e) => setReportedBy(e.target.value)} placeholder="姓名/岗位" />
            </div>

            <div>
              <div className="mb-1 text-xs text-[var(--color-text-tertiary)]">类型</div>
              <Select value={type} onChange={(e) => setType(e.target.value as Incident['type'])}>
                <option value="quality">质量</option>
                <option value="equipment">设备</option>
                <option value="material_shortage">欠料</option>
                <option value="plan">计划偏差</option>
                <option value="safety">安全</option>
                <option value="other">其他</option>
              </Select>
            </div>

            <div>
              <div className="mb-1 text-xs text-[var(--color-text-tertiary)]">严重度</div>
              <Select value={severity} onChange={(e) => setSeverity(e.target.value as Incident['severity'])}>
                <option value="critical">critical</option>
                <option value="high">high</option>
                <option value="medium">medium</option>
                <option value="low">low</option>
              </Select>
            </div>

            <div>
              <div className="mb-1 text-xs text-[var(--color-text-tertiary)]">工厂</div>
              <Select value={factoryId} onChange={(e) => setFactoryId(e.target.value)}>
                {factories.map((f) => (
                  <option key={f.id} value={f.id}>
                    {f.name}
                  </option>
                ))}
              </Select>
            </div>

            <div>
              <div className="mb-1 text-xs text-[var(--color-text-tertiary)]">产线</div>
              <Input value={line} onChange={(e) => setLine(e.target.value)} placeholder="如：产线A" />
            </div>

            <div>
              <div className="mb-1 text-xs text-[var(--color-text-tertiary)]">工单号</div>
              <Input value={workOrderId} onChange={(e) => setWorkOrderId(e.target.value)} placeholder="可选" />
            </div>

            <div>
              <div className="mb-1 text-xs text-[var(--color-text-tertiary)]">订单号</div>
              <Input value={orderId} onChange={(e) => setOrderId(e.target.value)} placeholder="中台获取（可先手填）" />
            </div>

            <div>
              <div className="mb-1 text-xs text-[var(--color-text-tertiary)]">设备</div>
              <Input value={equipment} onChange={(e) => setEquipment(e.target.value)} placeholder="可选" />
            </div>

            <div>
              <div className="mb-1 text-xs text-[var(--color-text-tertiary)]">物料</div>
              <Input value={material} onChange={(e) => setMaterial(e.target.value)} placeholder="可选" />
            </div>

            <div className="md:col-span-2">
              <div className="mb-1 text-xs text-[var(--color-text-tertiary)]">描述</div>
              <Input value={description} onChange={(e) => setDescription(e.target.value)} placeholder="必填" />
            </div>

            <div className="md:col-span-2">
              <div className="mb-1 text-xs text-[var(--color-text-tertiary)]">附件（逗号分隔文件名）</div>
              <Input value={attachments} onChange={(e) => setAttachments(e.target.value)} placeholder="如：photo.png, report.pdf" />
            </div>
          </div>

          <div className="mt-4 flex items-center justify-end gap-2">
            <Button
              variant="secondary"
              onClick={() => {
                setReportedBy('')
                setLine('')
                setWorkOrderId('')
                setOrderId('')
                setEquipment('')
                setMaterial('')
                setDescription('')
                setAttachments('')
              }}
            >
              清空
            </Button>
            <Button
              variant="primary"
              disabled={!description.trim()}
              onClick={() => {
                if (mode === 'create') {
                  const created = createIncident({
                    occurredAt,
                    reportedBy: reportedBy.trim() || '未填',
                    type,
                    severity,
                    status: 'recording',
                    factoryId,
                    factoryName,
                    line: line.trim() || undefined,
                    workOrderId: workOrderId.trim() || undefined,
                    orderId: orderId.trim() || undefined,
                    equipment: equipment.trim() || undefined,
                    material: material.trim() || undefined,
                    description: description.trim(),
                    attachments: attachments
                      .split(',')
                      .map((x) => x.trim())
                      .filter(Boolean),
                  })
                  navigate(`/production/incidents/${encodeURIComponent(created.id)}`)
                } else if (editing) {
                  updateIncident({
                    ...editing,
                    occurredAt,
                    reportedBy: reportedBy.trim() || '未填',
                    type,
                    severity,
                    factoryId,
                    factoryName,
                    line: line.trim() || undefined,
                    workOrderId: workOrderId.trim() || undefined,
                    orderId: orderId.trim() || undefined,
                    equipment: equipment.trim() || undefined,
                    material: material.trim() || undefined,
                    description: description.trim(),
                    attachments: attachments
                      .split(',')
                      .map((x) => x.trim())
                      .filter(Boolean),
                    updatedAt: formatAt(),
                  })
                  navigate(`/production/incidents/${encodeURIComponent(editing.id)}`)
                }
              }}
            >
              保存
            </Button>
          </div>
        </CardBody>
      </Card>
    </div>
  )
}

