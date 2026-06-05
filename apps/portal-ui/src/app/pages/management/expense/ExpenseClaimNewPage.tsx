import { useMemo, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import type { ExpenseClaimLine } from '../../../mock/models'
import { useAuth } from '../../../state/auth/useAuth'
import { useExpenseFlow } from '../../../state/expense/ExpenseFlowContext'
import { Button } from '../../../ui/Button'
import { Card, CardBody, CardHeader, CardTitle } from '../../../ui/Card'
import { Input } from '../../../ui/Input'
import { PageHeader } from '../../../ui/PageHeader'
import { Select } from '../../../ui/Select'

function newLineId() {
  return `ECLL-${Math.floor(Math.random() * 9000) + 1000}`
}

export function ExpenseClaimNewPage() {
  const auth = useAuth()
  const flow = useExpenseFlow()
  const nav = useNavigate()

  const [title, setTitle] = useState('')
  const [departmentId, setDepartmentId] = useState(flow.departments[0]?.id ?? '')
  const [projectId, setProjectId] = useState(flow.projects[0]?.id ?? '')
  const [costCenterId, setCostCenterId] = useState(flow.costCenters[0]?.id ?? '')
  const [claimType, setClaimType] = useState('差旅')
  const [payeeType, setPayeeType] = useState<'personal' | 'corporate'>('personal')
  const [payeeName, setPayeeName] = useState(auth.user?.name ?? '用户')
  const [bankAccount, setBankAccount] = useState('6222 **** **** 0000')
  const [lines, setLines] = useState<ExpenseClaimLine[]>(() => [
    {
      id: newLineId(),
      occurredAt: '2026-06-05',
      category: '交通',
      subject: '出差交通费',
      amount: 120,
      invoiceType: '电子发票',
      invoiceNo: null,
      taxRate: null,
      paymentMethod: '个人垫付',
    },
  ])

  const amountTotal = useMemo(() => lines.reduce((acc, x) => acc + (Number.isFinite(x.amount) ? x.amount : 0), 0), [lines])

  return (
    <div>
      <PageHeader
        title="发起报销"
        description="表单（mock）｜支持保存草稿/提交审批"
        right={
          <div className="flex flex-wrap items-center gap-2">
            <Link to="/management/expense/guide">
              <Button variant="secondary">返回流程说明</Button>
            </Link>
            <Link to="/management/approval?from=expense-new">
              <Button variant="secondary">审批中心</Button>
            </Link>
          </div>
        }
      />

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle>单据信息</CardTitle>
          </CardHeader>
          <CardBody>
            <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
              <div className="md:col-span-2">
                <div className="mb-1 text-xs font-semibold text-[var(--color-text-tertiary)]">标题</div>
                <Input value={title} onChange={(e) => setTitle(e.target.value)} placeholder="例如：差旅报销（外协工厂走访）" />
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
              <div>
                <div className="mb-1 text-xs font-semibold text-[var(--color-text-tertiary)]">费用类型</div>
                <Select value={claimType} onChange={(e) => setClaimType(e.target.value)}>
                  {['差旅', '招待', '办公', '运输', '外协/服务', '培训', '其它'].map((t) => (
                    <option key={t} value={t}>
                      {t}
                    </option>
                  ))}
                </Select>
              </div>
              <div>
                <div className="mb-1 text-xs font-semibold text-[var(--color-text-tertiary)]">付款类型</div>
                <Select value={payeeType} onChange={(e) => setPayeeType(e.target.value as 'personal' | 'corporate')}>
                  <option value="personal">对私</option>
                  <option value="corporate">对公</option>
                </Select>
              </div>
              <div>
                <div className="mb-1 text-xs font-semibold text-[var(--color-text-tertiary)]">收款方</div>
                <Input value={payeeName} onChange={(e) => setPayeeName(e.target.value)} placeholder="个人姓名或公司名称" />
              </div>
              {payeeType === 'personal' ? (
                <div className="md:col-span-2">
                  <div className="mb-1 text-xs font-semibold text-[var(--color-text-tertiary)]">银行卡</div>
                  <Input value={bankAccount} onChange={(e) => setBankAccount(e.target.value)} placeholder="卡号/开户行（示例）" />
                </div>
              ) : null}
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
                <div className="text-xs font-semibold text-[var(--color-text-tertiary)]">汇总</div>
                <div className="mt-2 text-2xl font-semibold text-[var(--color-text-primary)]">¥{amountTotal.toLocaleString()}</div>
                <div className="mt-1 text-xs text-[var(--color-text-tertiary)]">金额来自明细行汇总（mock）</div>
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
                      claimType,
                      payeeType,
                      payeeName,
                      bankAccount: payeeType === 'personal' ? bankAccount : null,
                      lines,
                    })
                    nav(`/management/expense/claims/${encodeURIComponent(created.id)}`)
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
                      claimType,
                      payeeType,
                      payeeName,
                      bankAccount: payeeType === 'personal' ? bankAccount : null,
                      lines,
                    })
                    flow.submit(created.id)
                    nav(`/management/expense/claims/${encodeURIComponent(created.id)}`)
                  }}
                >
                  提交审批
                </Button>
              </div>
              <div className="text-xs text-[var(--color-text-tertiary)]">
                提交后会在“审批中心”生成待办（mock），并按项目/成本中心/部门/财务/出纳顺序流转。
              </div>
            </div>
          </CardBody>
        </Card>
      </div>

      <Card className="mt-4">
        <CardHeader>
          <CardTitle>费用明细</CardTitle>
        </CardHeader>
        <CardBody>
          <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
            <div className="text-sm text-[var(--color-text-tertiary)]">支持多行；金额自动汇总</div>
            <Button
              variant="secondary"
              size="sm"
              onClick={() => {
                setLines((prev) => [
                  ...prev,
                  {
                    id: newLineId(),
                    occurredAt: '2026-06-05',
                    category: '其它',
                    subject: '',
                    amount: 0,
                    invoiceType: null,
                    invoiceNo: null,
                    taxRate: null,
                    paymentMethod: '个人垫付',
                  },
                ])
              }}
            >
              添加一行
            </Button>
          </div>

          <div className="overflow-auto">
            <table className="w-full table-auto border-separate border-spacing-0 text-left text-sm">
              <thead>
                <tr className="text-xs text-[var(--color-text-tertiary)]">
                  <th className="border-b border-[var(--color-border-subtle)] px-3 py-2 font-semibold">日期</th>
                  <th className="border-b border-[var(--color-border-subtle)] px-3 py-2 font-semibold">科目</th>
                  <th className="border-b border-[var(--color-border-subtle)] px-3 py-2 font-semibold">事项</th>
                  <th className="border-b border-[var(--color-border-subtle)] px-3 py-2 font-semibold">金额</th>
                  <th className="border-b border-[var(--color-border-subtle)] px-3 py-2 font-semibold">票据</th>
                  <th className="border-b border-[var(--color-border-subtle)] px-3 py-2 font-semibold"></th>
                </tr>
              </thead>
              <tbody>
                {lines.map((l) => (
                  <tr key={l.id} className="hover:bg-black/5 dark:hover:bg-white/5">
                    <td className="border-b border-[var(--color-border-subtle)] px-3 py-2">
                      <Input
                        value={l.occurredAt}
                        onChange={(e) =>
                          setLines((prev) => prev.map((x) => (x.id === l.id ? { ...x, occurredAt: e.target.value } : x)))
                        }
                      />
                    </td>
                    <td className="border-b border-[var(--color-border-subtle)] px-3 py-2">
                      <Input
                        value={l.category}
                        onChange={(e) =>
                          setLines((prev) => prev.map((x) => (x.id === l.id ? { ...x, category: e.target.value } : x)))
                        }
                      />
                    </td>
                    <td className="border-b border-[var(--color-border-subtle)] px-3 py-2">
                      <Input
                        value={l.subject}
                        onChange={(e) =>
                          setLines((prev) => prev.map((x) => (x.id === l.id ? { ...x, subject: e.target.value } : x)))
                        }
                        placeholder="用途/事由"
                      />
                    </td>
                    <td className="border-b border-[var(--color-border-subtle)] px-3 py-2">
                      <Input
                        value={String(l.amount)}
                        onChange={(e) => {
                          const num = Number(e.target.value)
                          setLines((prev) =>
                            prev.map((x) => (x.id === l.id ? { ...x, amount: Number.isFinite(num) ? num : 0 } : x)),
                          )
                        }}
                      />
                    </td>
                    <td className="border-b border-[var(--color-border-subtle)] px-3 py-2">
                      <Input
                        value={l.invoiceNo ?? ''}
                        onChange={(e) =>
                          setLines((prev) => prev.map((x) => (x.id === l.id ? { ...x, invoiceNo: e.target.value || null } : x)))
                        }
                        placeholder="发票号（可选）"
                      />
                    </td>
                    <td className="border-b border-[var(--color-border-subtle)] px-3 py-2">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => setLines((prev) => prev.filter((x) => x.id !== l.id))}
                      >
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

