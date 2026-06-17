import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useContractFlow } from '../../../state/contract/ContractFlowContext'
import { useStartWorkflow } from '../../../state/workflow/useStartWorkflow'
import { Button } from '../../../ui/Button'
import { Card, CardBody, CardHeader, CardTitle } from '../../../ui/Card'
import { Input } from '../../../ui/Input'
import { PageHeader } from '../../../ui/PageHeader'
import { Select } from '../../../ui/Select'

export function ContractReviewNewPage() {
  const flow = useContractFlow()
  const startWf = useStartWorkflow()
  const nav = useNavigate()

  const [title, setTitle] = useState('')
  const [departmentId, setDepartmentId] = useState(flow.departments[0]?.id ?? '')
  const [projectId, setProjectId] = useState(flow.projects[0]?.id ?? '')
  const [costCenterId, setCostCenterId] = useState(flow.costCenters[0]?.id ?? '')
  const [contractType, setContractType] = useState('框架合同')
  const [counterparty, setCounterparty] = useState('XX外协加工厂')
  const [amountTotal, setAmountTotal] = useState(520000)
  const [paymentTerms, setPaymentTerms] = useState('月结30天；验收合格后付款')
  const [riskLevel, setRiskLevel] = useState<'low' | 'medium' | 'high'>('medium')

  return (
    <div>
      <PageHeader
        title="发起合同评审"
        description="表单（mock）｜支持保存草稿/提交审批"
        right={
          <div className="flex flex-wrap items-center gap-2">
            <Link to="/management/contract/guide">
              <Button variant="secondary">流程说明</Button>
            </Link>
            <Link to="/management/approval?from=contract-new">
              <Button variant="secondary">审批中心</Button>
            </Link>
          </div>
        }
      />

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle>合同信息</CardTitle>
          </CardHeader>
          <CardBody>
            <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
              <div className="md:col-span-2">
                <div className="mb-1 text-xs font-semibold text-[var(--color-text-tertiary)]">标题</div>
                <Input value={title} onChange={(e) => setTitle(e.target.value)} placeholder="例如：外协加工框架合同评审" />
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
                <div className="mb-1 text-xs font-semibold text-[var(--color-text-tertiary)]">合同类型</div>
                <Select value={contractType} onChange={(e) => setContractType(e.target.value)}>
                  {['框架合同', '采购合同', '服务合同', '外协合同', '保密协议', '其它'].map((t) => (
                    <option key={t} value={t}>
                      {t}
                    </option>
                  ))}
                </Select>
              </div>
              <div className="md:col-span-2">
                <div className="mb-1 text-xs font-semibold text-[var(--color-text-tertiary)]">相对方</div>
                <Input value={counterparty} onChange={(e) => setCounterparty(e.target.value)} placeholder="供应商/客户/服务商名称" />
              </div>
              <div>
                <div className="mb-1 text-xs font-semibold text-[var(--color-text-tertiary)]">合同金额</div>
                <Input
                  value={String(amountTotal)}
                  onChange={(e) => {
                    const num = Number(e.target.value)
                    setAmountTotal(Number.isFinite(num) ? num : 0)
                  }}
                />
              </div>
              <div>
                <div className="mb-1 text-xs font-semibold text-[var(--color-text-tertiary)]">风险等级</div>
                <Select value={riskLevel} onChange={(e) => setRiskLevel(e.target.value as 'low' | 'medium' | 'high')}>
                  <option value="low">低</option>
                  <option value="medium">中</option>
                  <option value="high">高</option>
                </Select>
              </div>
              <div className="md:col-span-2">
                <div className="mb-1 text-xs font-semibold text-[var(--color-text-tertiary)]">付款条款</div>
                <Input value={paymentTerms} onChange={(e) => setPaymentTerms(e.target.value)} placeholder="例如：月结30天；验收合格后付款" />
              </div>
              <div className="md:col-span-2">
                <div className="mb-1 text-xs font-semibold text-[var(--color-text-tertiary)]">附件（mock）</div>
                <input
                  type="file"
                  multiple
                  className="block w-full text-sm text-[var(--color-text-tertiary)] file:mr-3 file:rounded-[6px] file:border-0 file:bg-[var(--color-bg-surface)] file:px-3 file:py-2 file:text-sm file:font-medium file:text-[var(--color-text-primary)]"
                />
              </div>
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
                <div className="text-xs font-semibold text-[var(--color-text-tertiary)]">金额</div>
                <div className="mt-2 text-2xl font-semibold text-[var(--color-text-primary)]">¥{amountTotal.toLocaleString()}</div>
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
                      contractType,
                      counterparty,
                      amountTotal,
                      paymentTerms,
                      riskLevel,
                    })
                    nav(`/management/contract/reviews/${encodeURIComponent(created.id)}`)
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
                      contractType,
                      counterparty,
                      amountTotal,
                      paymentTerms,
                      riskLevel,
                    })
                    flow.submit(created.id)
                    // L3:同时启动 Flowable simple_approval_v1,businessKey=合同 id
                    void startWf.start({
                      businessKey: created.id,
                      businessType: 'contract_review',
                      variables: { amountTotal, contractType, riskLevel },
                    })
                    nav(`/management/contract/reviews/${encodeURIComponent(created.id)}`)
                  }}
                >
                  提交评审
                </Button>
              </div>
              <div className="text-xs text-[var(--color-text-tertiary)]">提交后会在审批中心生成待办（mock）。</div>
            </div>
          </CardBody>
        </Card>
      </div>
    </div>
  )
}

