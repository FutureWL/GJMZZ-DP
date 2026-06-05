import { Link, useParams } from 'react-router-dom'
import type { Incident } from '../../../mock/models'
import { useIncidentData } from '../../../state/production/IncidentDataContext'
import { Badge, type Tone } from '../../../ui/Badge'
import { Button } from '../../../ui/Button'
import { Card, CardBody, CardHeader, CardTitle } from '../../../ui/Card'
import { PageHeader } from '../../../ui/PageHeader'

function severityTone(sev: Incident['severity']): Tone {
  if (sev === 'critical') return 'error'
  if (sev === 'high') return 'warning'
  if (sev === 'medium') return 'info'
  return 'neutral'
}

const typeLabel: Record<Incident['type'], string> = {
  quality: '质量',
  equipment: '设备',
  material_shortage: '欠料',
  plan: '计划偏差',
  safety: '安全',
  other: '其他',
}

export function IncidentDetailPage() {
  const { id } = useParams()
  const { incidents, archiveIncident } = useIncidentData()
  const incident = incidents.find((x) => x.id === id)

  return (
    <div>
      <PageHeader
        title={`异常详情：${id ?? '-'}`}
        description="仅记录可追溯（不强制派工闭环）"
        right={
          incident ? (
            <div className="flex items-center gap-2">
              <Link to={`/production/incidents/${encodeURIComponent(incident.id)}/edit`}>
                <Button variant="secondary">编辑</Button>
              </Link>
              <Button
                variant="secondary"
                onClick={() => archiveIncident(incident.id)}
                disabled={incident.status === 'archived'}
              >
                归档
              </Button>
              <Badge tone={severityTone(incident.severity)}>{incident.severity}</Badge>
            </div>
          ) : null
        }
      />

      {!incident ? (
        <Card>
          <CardBody>
            <div className="text-sm text-[var(--color-text-tertiary)]">未找到该异常。</div>
            <div className="mt-3">
              <Link className="text-sm text-[var(--color-primary)] hover:underline" to="/production/incidents">
                返回异常中心
              </Link>
            </div>
          </CardBody>
        </Card>
      ) : (
        <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
          <Card className="lg:col-span-2">
            <CardHeader>
              <CardTitle>基本信息</CardTitle>
            </CardHeader>
            <CardBody>
              <div className="grid grid-cols-1 gap-3 text-sm md:grid-cols-2">
                <div>
                  <div className="text-xs text-[var(--color-text-tertiary)]">类型</div>
                  <div className="mt-1 text-[var(--color-text-primary)]">{typeLabel[incident.type]}</div>
                </div>
                <div>
                  <div className="text-xs text-[var(--color-text-tertiary)]">状态</div>
                  <div className="mt-1">
                    <Badge tone={incident.status === 'archived' ? 'neutral' : 'info'}>
                      {incident.status === 'archived' ? '已归档' : '记录中'}
                    </Badge>
                  </div>
                </div>
                <div>
                  <div className="text-xs text-[var(--color-text-tertiary)]">发生时间</div>
                  <div className="mt-1 text-[var(--color-text-primary)]">{incident.occurredAt}</div>
                </div>
                <div>
                  <div className="text-xs text-[var(--color-text-tertiary)]">发现人</div>
                  <div className="mt-1 text-[var(--color-text-primary)]">{incident.reportedBy}</div>
                </div>
                <div>
                  <div className="text-xs text-[var(--color-text-tertiary)]">工厂</div>
                  <div className="mt-1 text-[var(--color-text-primary)]">{incident.factoryName}</div>
                </div>
                <div>
                  <div className="text-xs text-[var(--color-text-tertiary)]">产线</div>
                  <div className="mt-1 text-[var(--color-text-primary)]">{incident.line ?? '-'}</div>
                </div>
                <div>
                  <div className="text-xs text-[var(--color-text-tertiary)]">工单</div>
                  <div className="mt-1 text-[var(--color-text-primary)]">{incident.workOrderId ?? '-'}</div>
                </div>
                <div>
                  <div className="text-xs text-[var(--color-text-tertiary)]">订单号</div>
                  <div className="mt-1 text-[var(--color-text-primary)]">{incident.orderId ?? '-'}</div>
                </div>
                <div>
                  <div className="text-xs text-[var(--color-text-tertiary)]">设备</div>
                  <div className="mt-1 text-[var(--color-text-primary)]">{incident.equipment || '-'}</div>
                </div>
                <div>
                  <div className="text-xs text-[var(--color-text-tertiary)]">物料</div>
                  <div className="mt-1 text-[var(--color-text-primary)]">{incident.material || '-'}</div>
                </div>
                <div className="md:col-span-2">
                  <div className="text-xs text-[var(--color-text-tertiary)]">描述</div>
                  <div className="mt-1 text-[var(--color-text-primary)]">{incident.description}</div>
                </div>
              </div>
            </CardBody>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>附件与记录</CardTitle>
            </CardHeader>
            <CardBody>
              <div className="space-y-3 text-sm">
                <div>
                  <div className="text-xs text-[var(--color-text-tertiary)]">附件</div>
                  <div className="mt-2 space-y-2">
                    {incident.attachments.length ? (
                      incident.attachments.map((a) => (
                        <div
                          key={a}
                          className="rounded-[10px] border border-[var(--color-border-subtle)] bg-[var(--color-bg-surface)] p-3 text-[var(--color-text-secondary)]"
                        >
                          {a}
                        </div>
                      ))
                    ) : (
                      <div className="text-[var(--color-text-tertiary)]">无</div>
                    )}
                  </div>
                </div>
                <div>
                  <div className="text-xs text-[var(--color-text-tertiary)]">创建时间</div>
                  <div className="mt-1 text-[var(--color-text-primary)]">{incident.createdAt}</div>
                </div>
                <div>
                  <div className="text-xs text-[var(--color-text-tertiary)]">更新时间</div>
                  <div className="mt-1 text-[var(--color-text-primary)]">{incident.updatedAt}</div>
                </div>
                <div>
                  <Link className="text-[var(--color-primary)] hover:underline" to="/production/incidents">
                    返回异常中心
                  </Link>
                </div>
              </div>
            </CardBody>
          </Card>
        </div>
      )}
    </div>
  )
}

