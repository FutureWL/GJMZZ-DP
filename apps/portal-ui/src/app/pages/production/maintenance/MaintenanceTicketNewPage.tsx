import { useMemo, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useMaintenanceFlow } from '../../../state/maintenance/MaintenanceFlowContext'
import { Button } from '../../../ui/Button'
import { Card, CardBody, CardHeader, CardTitle } from '../../../ui/Card'
import { Input } from '../../../ui/Input'
import { PageHeader } from '../../../ui/PageHeader'
import { Select } from '../../../ui/Select'

export function MaintenanceTicketNewPage() {
  const flow = useMaintenanceFlow()
  const nav = useNavigate()

  const [equipmentId, setEquipmentId] = useState(flow.equipment[0]?.id ?? '')
  const [priority, setPriority] = useState<'low' | 'medium' | 'high' | 'critical'>('high')
  const [title, setTitle] = useState('')
  const [symptom, setSymptom] = useState('')
  const [attachments, setAttachments] = useState<string[]>([])

  const equipment = useMemo(() => flow.equipment.find((e) => e.id === equipmentId), [equipmentId, flow.equipment])

  return (
    <div>
      <PageHeader
        title="发起报修"
        description="报修创建（mock）"
        right={
          <div className="flex flex-wrap items-center gap-2">
            <Link to="/production/maintenance/guide">
              <Button variant="secondary">流程说明</Button>
            </Link>
            <Link to="/production/maintenance">
              <Button variant="secondary">工单列表</Button>
            </Link>
          </div>
        }
      />

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle>报修信息</CardTitle>
          </CardHeader>
          <CardBody>
            <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
              <div>
                <div className="mb-1 text-xs font-semibold text-[var(--color-text-tertiary)]">设备</div>
                <Select value={equipmentId} onChange={(e) => setEquipmentId(e.target.value)}>
                  {flow.equipment.map((e) => (
                    <option key={e.id} value={e.id}>
                      {e.name} · {e.location}
                    </option>
                  ))}
                </Select>
              </div>
              <div>
                <div className="mb-1 text-xs font-semibold text-[var(--color-text-tertiary)]">优先级</div>
                <Select value={priority} onChange={(e) => setPriority(e.target.value as any)}>
                  <option value="low">低</option>
                  <option value="medium">中</option>
                  <option value="high">高</option>
                  <option value="critical">紧急</option>
                </Select>
              </div>
              <div className="md:col-span-2">
                <div className="mb-1 text-xs font-semibold text-[var(--color-text-tertiary)]">标题</div>
                <Input value={title} onChange={(e) => setTitle(e.target.value)} placeholder="例如：CNC-07 冷却液泄漏" />
              </div>
              <div className="md:col-span-2">
                <div className="mb-1 text-xs font-semibold text-[var(--color-text-tertiary)]">现象描述</div>
                <Input value={symptom} onChange={(e) => setSymptom(e.target.value)} placeholder="请描述现象、影响、是否停机等" />
              </div>
              <div className="md:col-span-2">
                <div className="mb-1 text-xs font-semibold text-[var(--color-text-tertiary)]">附件（mock）</div>
                <input
                  type="file"
                  multiple
                  className="block w-full text-sm text-[var(--color-text-tertiary)] file:mr-3 file:rounded-[6px] file:border-0 file:bg-[var(--color-bg-surface)] file:px-3 file:py-2 file:text-sm file:font-medium file:text-[var(--color-text-primary)]"
                  onChange={(e) => {
                    const files = Array.from(e.target.files ?? [])
                    setAttachments(files.map((f) => f.name))
                  }}
                />
              </div>
            </div>
          </CardBody>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>提交</CardTitle>
          </CardHeader>
          <CardBody>
            <div className="space-y-3 text-sm text-[var(--color-text-secondary)]">
              <div className="rounded-[10px] border border-[var(--color-border-subtle)] bg-[var(--color-bg-surface)] p-3">
                <div className="text-xs font-semibold text-[var(--color-text-tertiary)]">设备信息</div>
                <div className="mt-2 text-sm text-[var(--color-text-primary)]">{equipment?.name ?? '-'}</div>
                <div className="mt-1 text-xs text-[var(--color-text-tertiary)]">
                  {equipment ? `${equipment.factory} · ${equipment.line} · ${equipment.location}` : '-'}
                </div>
              </div>
              <Button
                variant="primary"
                className="w-full"
                onClick={() => {
                  const created = flow.createTicket({
                    equipmentId,
                    title: title || `${equipment?.name ?? '设备'} 维修报修`,
                    symptom: symptom || '现象描述（未填写）',
                    priority,
                    attachments,
                  })
                  nav(`/production/maintenance/${encodeURIComponent(created.id)}`)
                }}
              >
                提交报修
              </Button>
              <div className="text-xs text-[var(--color-text-tertiary)]">提交后进入“报修”，等待派工。</div>
            </div>
          </CardBody>
        </Card>
      </div>
    </div>
  )
}

