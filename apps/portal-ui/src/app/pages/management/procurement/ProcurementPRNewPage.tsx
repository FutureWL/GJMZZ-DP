import { useMemo, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import type { ProcurementRequestLine } from '../../../mock/models'
import { useProcurementFlow } from '../../../state/procurement/ProcurementFlowContext'
import { Button } from '../../../ui/Button'
import { Card, CardBody, CardHeader, CardTitle } from '../../../ui/Card'
import { Input } from '../../../ui/Input'
import { PageHeader } from '../../../ui/PageHeader'
import { Select } from '../../../ui/Select'

function newLineId() {
  return `PRFL-${Math.floor(Math.random() * 9000) + 1000}`
}

export function ProcurementPRNewPage() {
  const flow = useProcurementFlow()
  const nav = useNavigate()

  const [title, setTitle] = useState('')
  const [departmentId, setDepartmentId] = useState(flow.departments[0]?.id ?? '')
  const [projectId, setProjectId] = useState(flow.projects[0]?.id ?? '')
  const [costCenterId, setCostCenterId] = useState(flow.costCenters[0]?.id ?? '')
  const [lines, setLines] = useState<ProcurementRequestLine[]>(() => [
    {
      id: newLineId(),
      material: '硬质合金铣刀',
      spec: 'Ø10',
      qty: 10,
      uom: '支',
      unitPrice: 1200,
      amount: 12000,
      needBy: '2026-06-10',
      category: '刀具',
    },
  ])

  const amountTotal = useMemo(() => lines.reduce((acc, x) => acc + (Number.isFinite(x.amount) ? x.amount : 0), 0), [lines])

  return (
    <div>
      <PageHeader
        title="发起采购申请（PR）"
        description="表单（mock）｜支持保存草稿/提交审批"
        right={
          <div className="flex flex-wrap items-center gap-2">
            <Link to="/management/procurement/guide">
              <Button variant="secondary">流程说明</Button>
            </Link>
            <Link to="/management/approval?from=procurement-new">
              <Button variant="secondary">审批中心</Button>
            </Link>
          </div>
        }
      />

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle>申请信息</CardTitle>
          </CardHeader>
          <CardBody>
            <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
              <div className="md:col-span-2">
                <div className="mb-1 text-xs font-semibold text-[var(--color-text-tertiary)]">标题</div>
                <Input value={title} onChange={(e) => setTitle(e.target.value)} placeholder="例如：刀具补充采购（铣刀/钻头）" />
              </div>
              <div>
                <div className="mb-1 text-xs font-semibold text-[var(--color-text-tertiary)]">部门</div>
                <Select value={departmentId} onChange={(e) => setDepartmentId(e.target.value)}>
                  {flow.departments.map((d) => (
                    <option key={d.id} value={d.id}>
                      {d.name}
                    </option>
                  ))}
                </Select>
              </div>
              <div>
                <div className="mb-1 text-xs font-semibold text-[var(--color-text-tertiary)]">项目</div>
                <Select value={projectId} onChange={(e) => setProjectId(e.target.value)}>
                  {flow.projects.map((p) => (
                    <option key={p.id} value={p.id}>
                      {p.name}
                    </option>
                  ))}
                </Select>
              </div>
              <div>
                <div className="mb-1 text-xs font-semibold text-[var(--color-text-tertiary)]">成本中心</div>
                <Select value={costCenterId} onChange={(e) => setCostCenterId(e.target.value)}>
                  {flow.costCenters.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.name}
                    </option>
                  ))}
                </Select>
              </div>
              <div />
            </div>
          </CardBody>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>提交操作</CardTitle>
          </CardHeader>
          <CardBody>
            <div className="space-y-3">
              <div className="rounded-[10px] border border-[var(--color-border-subtle)] bg-[var(--color-bg-surface)] p-3">
                <div className="text-xs font-semibold text-[var(--color-text-tertiary)]">汇总金额</div>
                <div className="mt-2 text-2xl font-semibold text-[var(--color-text-primary)]">¥{amountTotal.toLocaleString()}</div>
                <div className="mt-1 text-xs text-[var(--color-text-tertiary)]">金额来自明细行金额汇总（mock）</div>
              </div>
              <div className="flex flex-wrap items-center gap-2">
                <Button
                  variant="secondary"
                  onClick={() => {
                    const created = flow.createDraft({
                      title,
                      departmentId,
                      projectId,
                      costCenterId,
                      lines,
                    })
                    nav(`/management/procurement/pr/${encodeURIComponent(created.id)}`)
                  }}
                >
                  保存草稿
                </Button>
                <Button
                  variant="primary"
                  onClick={() => {
                    const created = flow.createDraft({
                      title,
                      departmentId,
                      projectId,
                      costCenterId,
                      lines,
                    })
                    flow.submit(created.id)
                    nav(`/management/procurement/pr/${encodeURIComponent(created.id)}`)
                  }}
                >
                  提交审批
                </Button>
              </div>
              <div className="text-xs text-[var(--color-text-tertiary)]">提交后会在审批中心生成待办（mock）。</div>
            </div>
          </CardBody>
        </Card>
      </div>

      <Card className="mt-4">
        <CardHeader>
          <CardTitle>采购明细</CardTitle>
        </CardHeader>
        <CardBody>
          <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
            <div className="text-sm text-[var(--color-text-tertiary)]">支持多行；数量/单价变化自动刷新金额</div>
            <Button
              variant="secondary"
              size="sm"
              onClick={() =>
                setLines((prev) => [
                  ...prev,
                  {
                    id: newLineId(),
                    material: '',
                    spec: '',
                    qty: 1,
                    uom: '件',
                    unitPrice: 0,
                    amount: 0,
                    needBy: '2026-06-10',
                    category: '其它',
                  },
                ])
              }
            >
              添加一行
            </Button>
          </div>

          <div className="overflow-auto">
            <table className="w-full table-auto border-separate border-spacing-0 text-left text-sm">
              <thead>
                <tr className="text-xs text-[var(--color-text-tertiary)]">
                  <th className="border-b border-[var(--color-border-subtle)] px-3 py-2 font-semibold">物料</th>
                  <th className="border-b border-[var(--color-border-subtle)] px-3 py-2 font-semibold">规格</th>
                  <th className="border-b border-[var(--color-border-subtle)] px-3 py-2 font-semibold">数量</th>
                  <th className="border-b border-[var(--color-border-subtle)] px-3 py-2 font-semibold">单价</th>
                  <th className="border-b border-[var(--color-border-subtle)] px-3 py-2 font-semibold">金额</th>
                  <th className="border-b border-[var(--color-border-subtle)] px-3 py-2 font-semibold">需求日期</th>
                  <th className="border-b border-[var(--color-border-subtle)] px-3 py-2 font-semibold"></th>
                </tr>
              </thead>
              <tbody>
                {lines.map((l) => (
                  <tr key={l.id} className="hover:bg-black/5 dark:hover:bg-white/5">
                    <td className="border-b border-[var(--color-border-subtle)] px-3 py-2">
                      <Input value={l.material} onChange={(e) => setLines((prev) => prev.map((x) => (x.id === l.id ? { ...x, material: e.target.value } : x)))} />
                    </td>
                    <td className="border-b border-[var(--color-border-subtle)] px-3 py-2">
                      <Input value={l.spec} onChange={(e) => setLines((prev) => prev.map((x) => (x.id === l.id ? { ...x, spec: e.target.value } : x)))} />
                    </td>
                    <td className="border-b border-[var(--color-border-subtle)] px-3 py-2">
                      <Input
                        value={String(l.qty)}
                        onChange={(e) => {
                          const num = Number(e.target.value)
                          setLines((prev) =>
                            prev.map((x) => {
                              if (x.id !== l.id) return x
                              const qty = Number.isFinite(num) ? num : 0
                              return { ...x, qty, amount: qty * x.unitPrice }
                            }),
                          )
                        }}
                      />
                    </td>
                    <td className="border-b border-[var(--color-border-subtle)] px-3 py-2">
                      <Input
                        value={String(l.unitPrice)}
                        onChange={(e) => {
                          const num = Number(e.target.value)
                          setLines((prev) =>
                            prev.map((x) => {
                              if (x.id !== l.id) return x
                              const unitPrice = Number.isFinite(num) ? num : 0
                              return { ...x, unitPrice, amount: x.qty * unitPrice }
                            }),
                          )
                        }}
                      />
                    </td>
                    <td className="border-b border-[var(--color-border-subtle)] px-3 py-2">¥{l.amount.toLocaleString()}</td>
                    <td className="border-b border-[var(--color-border-subtle)] px-3 py-2">
                      <Input value={l.needBy} onChange={(e) => setLines((prev) => prev.map((x) => (x.id === l.id ? { ...x, needBy: e.target.value } : x)))} />
                    </td>
                    <td className="border-b border-[var(--color-border-subtle)] px-3 py-2">
                      <Button variant="ghost" size="sm" onClick={() => setLines((prev) => prev.filter((x) => x.id !== l.id))}>
                        删除
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardBody>
      </Card>
    </div>
  )
}

