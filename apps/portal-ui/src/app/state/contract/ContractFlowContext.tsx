/* eslint-disable react-refresh/only-export-components */
import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useState,
  type ReactNode,
} from 'react'
import type { ApprovalWorkItem, ContractReviewFlow, ContractReviewFlowNode } from '../../mock/models'
import { contractReviewFlows as mockContractReviews, costCenters, departments, projects } from '../../mock/data'
import { useAuth } from '../auth/useAuth'

function deepCopy<T>(value: T): T {
  if (typeof structuredClone === 'function') {
    return structuredClone(value)
  }
  return JSON.parse(JSON.stringify(value)) as T
}

function nowText() {
  const d = new Date()
  const pad = (n: number) => String(n).padStart(2, '0')
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())} ${pad(d.getHours())}:${pad(d.getMinutes())}`
}

function newId(prefix: string) {
  const d = new Date()
  const pad = (n: number) => String(n).padStart(2, '0')
  const date = `${d.getFullYear()}${pad(d.getMonth() + 1)}${pad(d.getDate())}`
  const tail = String(Math.floor(Math.random() * 900) + 100)
  return `${prefix}-${date}-${tail}`
}

function pickNameFromOptions(items: { id: string; name: string }[], id: string, fallback = '-') {
  return items.find((x) => x.id === id)?.name ?? fallback
}

function buildWorkItem(c: ContractReviewFlow): ApprovalWorkItem {
  return {
    id: `APR-${c.id}`,
    title: `${c.id} 合同评审`,
    domain: 'management',
    status: c.status === 'in_review' ? 'todo' : 'done',
    overdue: false,
    businessType: 'contract_review',
    businessId: c.id,
    createdAt: c.createdAt,
    assignee: c.currentAssignee,
  }
}

export interface ContractFlowContextValue {
  departments: typeof departments
  projects: typeof projects
  costCenters: typeof costCenters
  reviews: ContractReviewFlow[]
  workItems: ApprovalWorkItem[]
  createDraft: (input: {
    title: string
    departmentId: string
    projectId: string
    costCenterId: string
    contractType: string
    counterparty: string
    amountTotal: number
    paymentTerms: string
    riskLevel: ContractReviewFlow['riskLevel']
  }) => ContractReviewFlow
  submit: (reviewId: string) => void
  approve: (reviewId: string, note?: string) => void
  reject: (reviewId: string, note?: string) => void
  returnToApplicant: (reviewId: string, note?: string) => void
  getReview: (reviewId: string) => ContractReviewFlow | undefined
}

export const ContractFlowContext = createContext<ContractFlowContextValue | null>(null)

export function useContractFlow() {
  const ctx = useContext(ContractFlowContext)
  if (!ctx) {
    throw new Error('ContractFlowProvider missing')
  }
  return ctx
}

export function ContractFlowProvider({ children }: { children: ReactNode }) {
  const auth = useAuth()
  const [reviews, setReviews] = useState<ContractReviewFlow[]>(() => deepCopy(mockContractReviews))

  const workItems = useMemo(() => {
    return reviews
      .filter((r) => r.status !== 'draft')
      .map((r) => buildWorkItem(r))
      .sort((a, b) => (a.createdAt < b.createdAt ? 1 : -1))
  }, [reviews])

  const getReview = useCallback((reviewId: string) => reviews.find((r) => r.id === reviewId), [reviews])

  const createDraft = useCallback(
    (input: {
      title: string
      departmentId: string
      projectId: string
      costCenterId: string
      contractType: string
      counterparty: string
      amountTotal: number
      paymentTerms: string
      riskLevel: ContractReviewFlow['riskLevel']
    }) => {
      const id = newId('CTR')
      const ts = nowText()
      const departmentName = pickNameFromOptions(departments, input.departmentId)
      const projectName = pickNameFromOptions(projects, input.projectId)
      const costCenterName = pickNameFromOptions(costCenters, input.costCenterId)
      const next: ContractReviewFlow = {
        id,
        title: input.title || `合同评审-${auth.user?.name ?? '用户'}`,
        applicant: auth.user?.name ?? '用户',
        departmentId: input.departmentId,
        departmentName,
        projectId: input.projectId,
        projectName,
        costCenterId: input.costCenterId,
        costCenterName,
        contractType: input.contractType,
        counterparty: input.counterparty,
        amountTotal: input.amountTotal,
        paymentTerms: input.paymentTerms,
        riskLevel: input.riskLevel,
        status: 'draft',
        createdAt: ts,
        updatedAt: ts,
        currentNodeKey: null,
        currentAssignee: null,
        attachments: [],
        nodes: [
          { key: 'submit', label: '提交', assignee: auth.user?.name ?? '用户', status: 'pending', completedAt: null },
          { key: 'project_owner', label: '项目负责人', assignee: '项目-周', status: 'pending', completedAt: null },
          { key: 'cost_center_owner', label: '成本中心负责人', assignee: '成本中心-张', status: 'pending', completedAt: null },
          { key: 'dept_head', label: '部门负责人', assignee: departmentName ? `${departmentName}-负责人` : '部门负责人', status: 'pending', completedAt: null },
          { key: 'legal_review', label: '法务评审', assignee: '法务-孙', status: 'pending', completedAt: null },
          { key: 'finance_review', label: '财务审核', assignee: '财务-钱', status: 'pending', completedAt: null },
          { key: 'seal', label: '盖章', assignee: '印章管理员-吴', status: 'pending', completedAt: null },
          { key: 'archive', label: '归档', assignee: '系统', status: 'pending', completedAt: null },
        ],
        timeline: [{ at: ts, actor: auth.user?.name ?? '用户', action: 'save_draft' }],
      }
      setReviews((prev) => [next, ...prev])
      return next
    },
    [auth.user?.name],
  )

  const submit = useCallback(
    (reviewId: string) => {
      const ts = nowText()
      setReviews((prev) =>
        prev.map((r) => {
          if (r.id !== reviewId) return r
          if (r.status === 'canceled') return r
          const nodes: ContractReviewFlowNode[] = r.nodes.map((n) =>
            n.key === 'submit' ? { ...n, status: 'done', completedAt: ts } : n,
          )
          const current = nodes.find((n) => n.key === 'project_owner') ?? nodes.find((n) => n.key !== 'submit')
          const currentNodeKey = current?.key ?? null
          const currentAssignee = current?.assignee ?? null
          return {
            ...r,
            status: 'in_review',
            updatedAt: ts,
            currentNodeKey,
            currentAssignee,
            nodes,
            timeline: [...r.timeline, { at: ts, actor: auth.user?.name ?? '用户', action: 'submit' }],
          }
        }),
      )
    },
    [auth.user?.name],
  )

  const moveToNextNode = useCallback((r: ContractReviewFlow, ts: string): ContractReviewFlow => {
    const idx = r.nodes.findIndex((n) => n.key === r.currentNodeKey)
    if (idx < 0) {
      return { ...r, updatedAt: ts, status: 'approved', currentNodeKey: null, currentAssignee: null }
    }
    const nodes = r.nodes.slice()
    nodes[idx] = { ...nodes[idx], status: 'done', completedAt: ts }
    const nextIdx = nodes.findIndex((n, i) => i > idx && n.status === 'pending')
    if (nextIdx < 0) {
      return { ...r, updatedAt: ts, status: 'approved', currentNodeKey: null, currentAssignee: null, nodes }
    }
    return { ...r, updatedAt: ts, currentNodeKey: nodes[nextIdx].key, currentAssignee: nodes[nextIdx].assignee, nodes }
  }, [])

  const approve = useCallback(
    (reviewId: string, note?: string) => {
      const ts = nowText()
      setReviews((prev) =>
        prev.map((r) => {
          if (r.id !== reviewId) return r
          if (r.status !== 'in_review') return r
          const next = moveToNextNode(r, ts)
          return { ...next, timeline: [...next.timeline, { at: ts, actor: auth.user?.name ?? '用户', action: 'approve', note }] }
        }),
      )
    },
    [auth.user?.name, moveToNextNode],
  )

  const reject = useCallback(
    (reviewId: string, note?: string) => {
      const ts = nowText()
      setReviews((prev) =>
        prev.map((r) => {
          if (r.id !== reviewId) return r
          if (r.status !== 'in_review') return r
          return {
            ...r,
            status: 'rejected',
            updatedAt: ts,
            currentNodeKey: null,
            currentAssignee: null,
            timeline: [...r.timeline, { at: ts, actor: auth.user?.name ?? '用户', action: 'reject', note }],
          }
        }),
      )
    },
    [auth.user?.name],
  )

  const returnToApplicant = useCallback(
    (reviewId: string, note?: string) => {
      const ts = nowText()
      setReviews((prev) =>
        prev.map((r) => {
          if (r.id !== reviewId) return r
          if (r.status !== 'in_review') return r
          return {
            ...r,
            status: 'returned',
            updatedAt: ts,
            currentNodeKey: null,
            currentAssignee: r.applicant,
            timeline: [...r.timeline, { at: ts, actor: auth.user?.name ?? '用户', action: 'return', note }],
          }
        }),
      )
    },
    [auth.user?.name],
  )

  const value = useMemo<ContractFlowContextValue>(
    () => ({
      departments,
      projects,
      costCenters,
      reviews,
      workItems,
      createDraft,
      submit,
      approve,
      reject,
      returnToApplicant,
      getReview,
    }),
    [approve, createDraft, getReview, reject, reviews, returnToApplicant, submit, workItems],
  )

  return <ContractFlowContext.Provider value={value}>{children}</ContractFlowContext.Provider>
}
