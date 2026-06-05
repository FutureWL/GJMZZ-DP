import { useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { factories } from '../../../mock/data'
import type { Incident } from '../../../mock/models'
import { useIncidentData } from '../../../state/production/IncidentDataContext'
import { Badge, type Tone } from '../../../ui/Badge'
import { Button } from '../../../ui/Button'
import { Card, CardBody, CardHeader, CardTitle } from '../../../ui/Card'
import { Input } from '../../../ui/Input'
import { PageHeader } from '../../../ui/PageHeader'
import { Select } from '../../../ui/Select'

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

function downloadCsv(filename: string, rows: string[][]) {
  const csv = rows.map((r) => r.map((cell) => `"${String(cell).replaceAll('"', '""')}"`).join(',')).join('\n')
  const blob = new Blob([`\uFEFF${csv}`], { type: 'text/csv;charset=utf-8' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = filename
  a.click()
  URL.revokeObjectURL(url)
}

export function IncidentListPage() {
  const { incidents } = useIncidentData()

  const [factoryId, setFactoryId] = useState<string>('all')
  const [type, setType] = useState<string>('all')
  const [severity, setSeverity] = useState<string>('all')
  const [keyword, setKeyword] = useState<string>('')

  const filtered = useMemo(() => {
    const kw = keyword.trim().toLowerCase()
    return incidents.filter((x) => {
      if (factoryId !== 'all' && x.factoryId !== factoryId) return false
      if (type !== 'all' && x.type !== type) return false
      if (severity !== 'all' && x.severity !== severity) return false
      if (!kw) return true
      const hay = [
        x.id,
        x.factoryName,
        x.line ?? '',
        x.workOrderId ?? '',
        x.orderId ?? '',
        x.equipment ?? '',
        x.material ?? '',
        x.reportedBy,
        x.description,
      ]
        .join(' ')
        .toLowerCase()
      return hay.includes(kw)
    })
  }, [factoryId, incidents, keyword, severity, type])

  const recordingCount = useMemo(() => filtered.filter((x) => x.status === 'recording').length, [filtered])
  const archivedCount = useMemo(() => filtered.filter((x) => x.status === 'archived').length, [filtered])

  return (
    <div>
      <PageHeader
        title="异常中心（仅记录）"
        description="支持查询、统计、导出；不强制派工闭环"
        right={
          <div className="flex items-center gap-2">
            <Link to="/production/incidents/new">
              <Button variant="primary">新增异常</Button>
            </Link>
            <Button
              variant="secondary"
              onClick={() =>
                downloadCsv(
                  `incidents-${new Date().toISOString().slice(0, 10)}.csv`,
                  [
                    ['异常编号', '发生时间', '类型', '严重度', '状态', '工厂', '产线', '工单', '订单', '设备', '物料', '发现人', '描述'],
                    ...filtered.map((x) => [
                      x.id,
                      x.occurredAt,
                      typeLabel[x.type],
                      x.severity,
                      x.status,
                      x.factoryName,
                      x.line ?? '',
                      x.workOrderId ?? '',
                      x.orderId ?? '',
                      x.equipment ?? '',
                      x.material ?? '',
                      x.reportedBy,
                      x.description,
                    ]),
                  ],
                )
              }
            >
              导出
            </Button>
          </div>
        }
      />

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-4">
        <Card>
          <CardHeader>
            <CardTitle>筛选结果</CardTitle>
          </CardHeader>
          <CardBody>
            <div className="text-3xl font-semibold text-[var(--color-text-primary)]">{filtered.length}</div>
            <div className="mt-2 text-sm text-[var(--color-text-tertiary)]">当前筛选下的异常数量</div>
          </CardBody>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>记录中</CardTitle>
          </CardHeader>
          <CardBody>
            <div className="text-3xl font-semibold text-[var(--color-text-primary)]">{recordingCount}</div>
            <div className="mt-2 text-sm text-[var(--color-text-tertiary)]">未归档</div>
          </CardBody>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>已归档</CardTitle>
          </CardHeader>
          <CardBody>
            <div className="text-3xl font-semibold text-[var(--color-text-primary)]">{archivedCount}</div>
            <div className="mt-2 text-sm text-[var(--color-text-tertiary)]">用于统计与追溯</div>
          </CardBody>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>快捷入口</CardTitle>
          </CardHeader>
          <CardBody>
            <div className="flex flex-col gap-2 text-sm">
              <Link className="text-[var(--color-primary)] hover:underline" to="/production/meeting">
                晨会总览
              </Link>
              <Link className="text-[var(--color-primary)] hover:underline" to="/production/overview">
                工厂总览
              </Link>
              <Link className="text-[var(--color-primary)] hover:underline" to="/production/alarms">
                告警中心
              </Link>
            </div>
          </CardBody>
        </Card>
      </div>

      <Card className="mt-4">
        <CardHeader>
          <CardTitle>筛选</CardTitle>
        </CardHeader>
        <CardBody>
          <div className="grid grid-cols-1 gap-3 md:grid-cols-4">
            <div>
              <div className="mb-1 text-xs text-[var(--color-text-tertiary)]">工厂</div>
              <Select value={factoryId} onChange={(e) => setFactoryId(e.target.value)}>
                <option value="all">全部</option>
                {factories.map((f) => (
                  <option key={f.id} value={f.id}>
                    {f.name}
                  </option>
                ))}
              </Select>
            </div>
            <div>
              <div className="mb-1 text-xs text-[var(--color-text-tertiary)]">类型</div>
              <Select value={type} onChange={(e) => setType(e.target.value)}>
                <option value="all">全部</option>
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
              <Select value={severity} onChange={(e) => setSeverity(e.target.value)}>
                <option value="all">全部</option>
                <option value="critical">critical</option>
                <option value="high">high</option>
                <option value="medium">medium</option>
                <option value="low">low</option>
              </Select>
            </div>
            <div>
              <div className="mb-1 text-xs text-[var(--color-text-tertiary)]">关键字</div>
              <Input
                placeholder="编号/工单/订单/设备/描述…"
                value={keyword}
                onChange={(e) => setKeyword(e.target.value)}
              />
            </div>
          </div>
        </CardBody>
      </Card>

      <Card className="mt-4">
        <CardHeader>
          <CardTitle>异常列表</CardTitle>
        </CardHeader>
        <CardBody>
          <div className="overflow-auto">
            <table className="w-full table-auto border-separate border-spacing-0 text-left text-sm">
              <thead>
                <tr className="text-xs text-[var(--color-text-tertiary)]">
                  <th className="border-b border-[var(--color-border-subtle)] px-3 py-2 font-semibold">异常编号</th>
                  <th className="border-b border-[var(--color-border-subtle)] px-3 py-2 font-semibold">发生时间</th>
                  <th className="border-b border-[var(--color-border-subtle)] px-3 py-2 font-semibold">类型</th>
                  <th className="border-b border-[var(--color-border-subtle)] px-3 py-2 font-semibold">严重度</th>
                  <th className="border-b border-[var(--color-border-subtle)] px-3 py-2 font-semibold">工厂/产线</th>
                  <th className="border-b border-[var(--color-border-subtle)] px-3 py-2 font-semibold">工单/订单</th>
                  <th className="border-b border-[var(--color-border-subtle)] px-3 py-2 font-semibold">状态</th>
                  <th className="border-b border-[var(--color-border-subtle)] px-3 py-2 font-semibold">更新时间</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((x) => (
                  <tr key={x.id} className="hover:bg-black/5 dark:hover:bg-white/5">
                    <td className="border-b border-[var(--color-border-subtle)] px-3 py-2">
                      <Link
                        className="font-medium text-[var(--color-primary)] hover:underline"
                        to={`/production/incidents/${encodeURIComponent(x.id)}`}
                      >
                        {x.id}
                      </Link>
                    </td>
                    <td className="border-b border-[var(--color-border-subtle)] px-3 py-2 text-xs text-[var(--color-text-tertiary)]">
                      {x.occurredAt}
                    </td>
                    <td className="border-b border-[var(--color-border-subtle)] px-3 py-2">{typeLabel[x.type]}</td>
                    <td className="border-b border-[var(--color-border-subtle)] px-3 py-2">
                      <Badge tone={severityTone(x.severity)}>{x.severity}</Badge>
                    </td>
                    <td className="border-b border-[var(--color-border-subtle)] px-3 py-2">
                      <div className="text-[var(--color-text-primary)]">{x.factoryName}</div>
                      <div className="text-xs text-[var(--color-text-tertiary)]">{x.line ?? '-'}</div>
                    </td>
                    <td className="border-b border-[var(--color-border-subtle)] px-3 py-2">
                      <div className="text-[var(--color-text-primary)]">{x.workOrderId ?? '-'}</div>
                      <div className="text-xs text-[var(--color-text-tertiary)]">{x.orderId ?? '-'}</div>
                    </td>
                    <td className="border-b border-[var(--color-border-subtle)] px-3 py-2">
                      <Badge tone={x.status === 'archived' ? 'neutral' : 'info'}>
                        {x.status === 'archived' ? '已归档' : '记录中'}
                      </Badge>
                    </td>
                    <td className="border-b border-[var(--color-border-subtle)] px-3 py-2 text-xs text-[var(--color-text-tertiary)]">
                      {x.updatedAt}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          {filtered.length === 0 ? (
            <div className="mt-3 text-sm text-[var(--color-text-tertiary)]">无匹配数据。</div>
          ) : null}
        </CardBody>
      </Card>
    </div>
  )
}

