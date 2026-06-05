import { useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { factories } from '../../../mock/data'
import type { DeliveryRisk } from '../../../mock/models'
import { useRiskData } from '../../../state/production/RiskDataContext'
import { Badge, type Tone } from '../../../ui/Badge'
import { Button } from '../../../ui/Button'
import { Card, CardBody, CardHeader, CardTitle } from '../../../ui/Card'
import { Input } from '../../../ui/Input'
import { PageHeader } from '../../../ui/PageHeader'
import { Select } from '../../../ui/Select'

function severityTone(sev: DeliveryRisk['severity']): Tone {
  if (sev === 'critical') return 'error'
  if (sev === 'high') return 'warning'
  if (sev === 'medium') return 'info'
  return 'neutral'
}

function statusTone(status: DeliveryRisk['status']): Tone {
  if (status === 'archived') return 'neutral'
  if (status === 'watching') return 'info'
  return 'warning'
}

const typeLabel: Record<DeliveryRisk['type'], string> = {
  material_shortage: '欠料',
  bottleneck: '瓶颈',
  quality: '质量',
}

const statusLabel: Record<DeliveryRisk['status'], string> = {
  open: '打开',
  watching: '关注',
  archived: '已归档',
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

export function RiskListPage() {
  const { risks } = useRiskData()

  const [factoryId, setFactoryId] = useState('all')
  const [type, setType] = useState('all')
  const [severity, setSeverity] = useState('all')
  const [status, setStatus] = useState('all')
  const [keyword, setKeyword] = useState('')

  const filtered = useMemo(() => {
    const kw = keyword.trim().toLowerCase()
    return risks.filter((r) => {
      if (factoryId !== 'all' && r.factoryId !== factoryId) return false
      if (type !== 'all' && r.type !== type) return false
      if (severity !== 'all' && r.severity !== severity) return false
      if (status !== 'all' && r.status !== status) return false
      if (!kw) return true
      const hay = [
        r.riskId,
        r.title,
        r.summary,
        r.factoryName,
        r.line ?? '',
        r.product ?? '',
        (r.orderIds ?? []).join(' '),
        (r.workOrderIds ?? []).join(' '),
        r.evidence.map((e) => `${e.label}${e.value}`).join(' '),
      ]
        .join(' ')
        .toLowerCase()
      return hay.includes(kw)
    })
  }, [factoryId, keyword, risks, severity, status, type])

  const openCount = useMemo(() => filtered.filter((x) => x.status === 'open').length, [filtered])
  const watchingCount = useMemo(() => filtered.filter((x) => x.status === 'watching').length, [filtered])
  const archivedCount = useMemo(() => filtered.filter((x) => x.status === 'archived').length, [filtered])

  return (
    <div>
      <PageHeader
        title="交付风险池"
        description="风险对象以 riskId 为主键，支持筛选、导出、归档"
        right={
          <div className="flex items-center gap-2">
            <Link to="/production/delivery/overview">
              <Button variant="secondary">交付风险总览</Button>
            </Link>
            <Button
              variant="secondary"
              onClick={() =>
                downloadCsv(
                  `delivery-risks-${new Date().toISOString().slice(0, 10)}.csv`,
                  [
                    ['风险编号', '类型', '严重度', '状态', '工厂', '产线', '产品', '订单', '工单', '交期', 'ETA', '延误(分钟)', '更新时间', '摘要'],
                    ...filtered.map((r) => [
                      r.riskId,
                      typeLabel[r.type],
                      r.severity,
                      statusLabel[r.status],
                      r.factoryName,
                      r.line ?? '',
                      r.product ?? '',
                      (r.orderIds ?? []).join(' '),
                      (r.workOrderIds ?? []).join(' '),
                      r.dueAt ?? '',
                      r.etaAt ?? '',
                      r.delayMinutes != null ? String(r.delayMinutes) : '',
                      r.updatedAt,
                      r.summary,
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
            <div className="mt-2 text-sm text-[var(--color-text-tertiary)]">当前筛选下风险数量</div>
          </CardBody>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>打开</CardTitle>
          </CardHeader>
          <CardBody>
            <div className="text-3xl font-semibold text-[var(--color-text-primary)]">{openCount}</div>
            <div className="mt-2 text-sm text-[var(--color-text-tertiary)]">需要关注与下钻</div>
          </CardBody>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>关注</CardTitle>
          </CardHeader>
          <CardBody>
            <div className="text-3xl font-semibold text-[var(--color-text-primary)]">{watchingCount}</div>
            <div className="mt-2 text-sm text-[var(--color-text-tertiary)]">持续观察</div>
          </CardBody>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>已归档</CardTitle>
          </CardHeader>
          <CardBody>
            <div className="text-3xl font-semibold text-[var(--color-text-primary)]">{archivedCount}</div>
            <div className="mt-2 text-sm text-[var(--color-text-tertiary)]">不再进入日常清单</div>
          </CardBody>
        </Card>
      </div>

      <Card className="mt-4">
        <CardHeader>
          <CardTitle>筛选</CardTitle>
        </CardHeader>
        <CardBody>
          <div className="grid grid-cols-1 gap-3 md:grid-cols-5">
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
                <option value="material_shortage">欠料</option>
                <option value="bottleneck">瓶颈</option>
                <option value="quality">质量</option>
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
              <div className="mb-1 text-xs text-[var(--color-text-tertiary)]">状态</div>
              <Select value={status} onChange={(e) => setStatus(e.target.value)}>
                <option value="all">全部</option>
                <option value="open">打开</option>
                <option value="watching">关注</option>
                <option value="archived">已归档</option>
              </Select>
            </div>
            <div>
              <div className="mb-1 text-xs text-[var(--color-text-tertiary)]">关键字</div>
              <Input value={keyword} onChange={(e) => setKeyword(e.target.value)} placeholder="编号/订单/工单/描述…" />
            </div>
          </div>
        </CardBody>
      </Card>

      <Card className="mt-4">
        <CardHeader>
          <CardTitle>风险列表</CardTitle>
        </CardHeader>
        <CardBody>
          <div className="overflow-auto">
            <table className="w-full table-auto border-separate border-spacing-0 text-left text-sm">
              <thead>
                <tr className="text-xs text-[var(--color-text-tertiary)]">
                  <th className="border-b border-[var(--color-border-subtle)] px-3 py-2 font-semibold">风险编号</th>
                  <th className="border-b border-[var(--color-border-subtle)] px-3 py-2 font-semibold">类型</th>
                  <th className="border-b border-[var(--color-border-subtle)] px-3 py-2 font-semibold">严重度</th>
                  <th className="border-b border-[var(--color-border-subtle)] px-3 py-2 font-semibold">状态</th>
                  <th className="border-b border-[var(--color-border-subtle)] px-3 py-2 font-semibold">工厂/产线</th>
                  <th className="border-b border-[var(--color-border-subtle)] px-3 py-2 font-semibold">关联订单/工单</th>
                  <th className="border-b border-[var(--color-border-subtle)] px-3 py-2 font-semibold">交期/ETA</th>
                  <th className="border-b border-[var(--color-border-subtle)] px-3 py-2 font-semibold">更新时间</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((r) => (
                  <tr key={r.riskId} className="hover:bg-black/5 dark:hover:bg-white/5">
                    <td className="border-b border-[var(--color-border-subtle)] px-3 py-2">
                      <Link
                        className="font-medium text-[var(--color-primary)] hover:underline"
                        to={`/production/risks/${encodeURIComponent(r.riskId)}`}
                      >
                        {r.riskId}
                      </Link>
                      <div className="mt-1 text-xs text-[var(--color-text-tertiary)]">{r.title}</div>
                    </td>
                    <td className="border-b border-[var(--color-border-subtle)] px-3 py-2">{typeLabel[r.type]}</td>
                    <td className="border-b border-[var(--color-border-subtle)] px-3 py-2">
                      <Badge tone={severityTone(r.severity)}>{r.severity}</Badge>
                    </td>
                    <td className="border-b border-[var(--color-border-subtle)] px-3 py-2">
                      <Badge tone={statusTone(r.status)}>{statusLabel[r.status]}</Badge>
                    </td>
                    <td className="border-b border-[var(--color-border-subtle)] px-3 py-2">
                      <div className="text-[var(--color-text-primary)]">{r.factoryName}</div>
                      <div className="text-xs text-[var(--color-text-tertiary)]">{r.line ?? '-'}</div>
                    </td>
                    <td className="border-b border-[var(--color-border-subtle)] px-3 py-2">
                      <div className="text-[var(--color-text-primary)]">{(r.orderIds ?? []).join(', ') || '-'}</div>
                      <div className="text-xs text-[var(--color-text-tertiary)]">{(r.workOrderIds ?? []).join(', ') || '-'}</div>
                    </td>
                    <td className="border-b border-[var(--color-border-subtle)] px-3 py-2 text-xs text-[var(--color-text-tertiary)]">
                      <div>{r.dueAt ?? '-'}</div>
                      <div>
                        {r.etaAt ?? '-'}
                        {r.delayMinutes != null ? ` · +${r.delayMinutes}m` : ''}
                      </div>
                    </td>
                    <td className="border-b border-[var(--color-border-subtle)] px-3 py-2 text-xs text-[var(--color-text-tertiary)]">
                      {r.updatedAt}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          {filtered.length === 0 ? <div className="mt-3 text-sm text-[var(--color-text-tertiary)]">无匹配数据。</div> : null}
        </CardBody>
      </Card>
    </div>
  )
}

