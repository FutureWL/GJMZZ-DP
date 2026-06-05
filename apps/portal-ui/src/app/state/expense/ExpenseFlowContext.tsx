import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useState,
  type ReactNode,
} from 'react'
import type { ApprovalWorkItem, ExpenseApprovalNode, ExpenseClaim, ExpenseClaimLine } from '../../mock/models'
import { costCenters, departments, expenseClaims as mockExpenseClaims, projects } from '../../mock/data'
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

function sumAmount(lines: ExpenseClaimLine[]) {
  return lines.reduce((acc, x) => acc + (Number.isFinite(x.amount) ? x.amount : 0), 0)
}

function buildWorkItem(claim: ExpenseClaim): ApprovalWorkItem {
  return {
    id: `APR-${claim.id}`,
    title: `${claim.id} ${claim.claimType}报销审批`,
    domain: 'management',
    status: claim.status === 'in_review' ? 'todo' : 'done',
    overdue: false,
    businessType: 'expense_claim',
    businessId: claim.id,
    createdAt: claim.createdAt,
    assignee: claim.currentAssignee,
  }
}

function pickNameFromOptions(
  items: { id: string; name: string }[],
  id: string,
  fallback = '-',
) {
  return items.find((x) => x.id === id)?.name ?? fallback
}

export interface ExpenseFlowContextValue {
  departments: typeof departments
  projects: typeof projects
  costCenters: typeof costCenters
  claims: ExpenseClaim[]
  workItems: ApprovalWorkItem[]
  createDraft: (input: {
    title: string
    departmentId: string
    projectId: string
    costCenterId: string
    claimType: string
    payeeType: ExpenseClaim['payeeType']
    payeeName: string
    bankAccount: string | null
    lines: ExpenseClaimLine[]
  }) => ExpenseClaim
  submit: (claimId: string) => void
  approve: (claimId: string, note?: string) => void
  reject: (claimId: string, note?: string) => void
  returnToApplicant: (claimId: string, note?: string) => void
  getClaim: (claimId: string) => ExpenseClaim | undefined
  getWorkItem: (workItemId: string) => ApprovalWorkItem | undefined
}

export const ExpenseFlowContext = createContext<ExpenseFlowContextValue | null>(null)

export function useExpenseFlow() {
  const ctx = useContext(ExpenseFlowContext)
  if (!ctx) {
    throw new Error('ExpenseFlowProvider missing')
  }
  return ctx
}

export function ExpenseFlowProvider({ children }: { children: ReactNode }) {
  const auth = useAuth()
  const [claims, setClaims] = useState<ExpenseClaim[]>(() => deepCopy(mockExpenseClaims))

  const workItems = useMemo(() => {
    return claims
      .filter((c) => c.status !== 'draft')
      .map((c) => buildWorkItem(c))
      .sort((a, b) => (a.createdAt < b.createdAt ? 1 : -1))
  }, [claims])

  const getClaim = useCallback((claimId: string) => claims.find((c) => c.id === claimId), [claims])

  const getWorkItem = useCallback(
    (workItemId: string) => workItems.find((w) => w.id === workItemId),
    [workItems],
  )

  const createDraft = useCallback(
    (input: {
      title: string
      departmentId: string
      projectId: string
      costCenterId: string
      claimType: string
      payeeType: ExpenseClaim['payeeType']
      payeeName: string
      bankAccount: string | null
      lines: ExpenseClaimLine[]
    }) => {
      const id = newId('ECL')
      const ts = nowText()
      const amountTotal = sumAmount(input.lines)
      const departmentName = pickNameFromOptions(departments, input.departmentId)
      const projectName = pickNameFromOptions(projects, input.projectId)
      const costCenterName = pickNameFromOptions(costCenters, input.costCenterId)
      const next: ExpenseClaim = {
        id,
        title: input.title || `费用报销-${auth.user?.name ?? '用户'}`,
        applicant: auth.user?.name ?? '用户',
        departmentId: input.departmentId,
        departmentName,
        projectId: input.projectId,
        projectName,
        costCenterId: input.costCenterId,
        costCenterName,
        claimType: input.claimType,
        payeeType: input.payeeType,
        payeeName: input.payeeName,
        bankAccount: input.bankAccount,
        amountTotal,
        isOverBudget: false,
        isOverStandard: false,
        overBudgetReason: null,
        overStandardReason: null,
        status: 'draft',
        createdAt: ts,
        updatedAt: ts,
        currentNodeKey: null,
        currentAssignee: null,
        lines: input.lines,
        attachments: [],
        nodes: [
          { key: 'submit', label: '提交', assignee: auth.user?.name ?? '用户', status: 'pending', completedAt: null },
          { key: 'project_owner', label: '项目负责人', assignee: '项目-周', status: 'pending', completedAt: null },
          { key: 'cost_center_owner', label: '成本中心负责人', assignee: '成本中心-王', status: 'pending', completedAt: null },
          { key: 'dept_head', label: '部门负责人', assignee: departmentName ? `${departmentName}-负责人` : '部门负责人', status: 'pending', completedAt: null },
          { key: 'finance_review', label: '财务审核', assignee: '财务-钱', status: 'pending', completedAt: null },
          { key: 'cashier_pay', label: '出纳付款', assignee: '出纳-吴', status: 'pending', completedAt: null },
          { key: 'archive', label: '归档', assignee: '系统', status: 'pending', completedAt: null },
        ],
        timeline: [{ at: ts, actor: auth.user?.name ?? '用户', action: 'save_draft' }],
      }
      setClaims((prev) => [next, ...prev])
      return next
    },
    [auth.user?.name],
  )

  const submit = useCallback(
    (claimId: string) => {
      const ts = nowText()
      setClaims((prev) =>
        prev.map((c) => {
          if (c.id !== claimId) return c
          if (c.status === 'canceled') return c
          const nodes: ExpenseApprovalNode[] = c.nodes.map((n) =>
            n.key === 'submit' ? { ...n, status: 'done', completedAt: ts } : n,
          )
          const current = nodes.find((n) => n.key === 'project_owner') ?? nodes.find((n) => n.key !== 'submit')
          const currentNodeKey = current?.key ?? null
          const currentAssignee = current?.assignee ?? null
          return {
            ...c,
            status: 'in_review',
            updatedAt: ts,
            currentNodeKey,
            currentAssignee,
            nodes,
            timeline: [...c.timeline, { at: ts, actor: auth.user?.name ?? '用户', action: 'submit' }],
          }
        }),
      )
    },
    [auth.user?.name],
  )

  const moveToNextNode = useCallback(
    (c: ExpenseClaim, ts: string): ExpenseClaim => {
      const idx = c.nodes.findIndex((n) => n.key === c.currentNodeKey)
      if (idx < 0) {
        return { ...c, updatedAt: ts, status: 'approved', currentNodeKey: null, currentAssignee: null }
      }
      const nodes: ExpenseApprovalNode[] = c.nodes.slice()
      nodes[idx] = { ...nodes[idx], status: 'done', completedAt: ts }
      const nextIdx = nodes.findIndex((n, i) => i > idx && n.status === 'pending')
      if (nextIdx < 0) {
        return {
          ...c,
          updatedAt: ts,
          status: 'approved',
          currentNodeKey: null,
          currentAssignee: null,
          nodes,
        }
      }
      return {
        ...c,
        updatedAt: ts,
        currentNodeKey: nodes[nextIdx].key,
        currentAssignee: nodes[nextIdx].assignee,
        nodes,
      }
    },
    [],
  )

  const approve = useCallback(
    (claimId: string, note?: string) => {
      const ts = nowText()
      setClaims((prev) =>
        prev.map((c) => {
          if (c.id !== claimId) return c
          if (c.status !== 'in_review') return c
          const next = moveToNextNode(c, ts)
          return {
            ...next,
            timeline: [...next.timeline, { at: ts, actor: auth.user?.name ?? '用户', action: 'approve', note }],
          }
        }),
      )
    },
    [auth.user?.name, moveToNextNode],
  )

  const reject = useCallback(
    (claimId: string, note?: string) => {
      const ts = nowText()
      setClaims((prev) =>
        prev.map((c) => {
          if (c.id !== claimId) return c
          if (c.status !== 'in_review') return c
          return {
            ...c,
            status: 'rejected',
            updatedAt: ts,
            currentNodeKey: null,
            currentAssignee: null,
            timeline: [...c.timeline, { at: ts, actor: auth.user?.name ?? '用户', action: 'reject', note }],
          }
        }),
      )
    },
    [auth.user?.name],
  )

  const returnToApplicant = useCallback(
    (claimId: string, note?: string) => {
      const ts = nowText()
      setClaims((prev) =>
        prev.map((c) => {
          if (c.id !== claimId) return c
          if (c.status !== 'in_review') return c
          return {
            ...c,
            status: 'returned',
            updatedAt: ts,
            currentNodeKey: null,
            currentAssignee: c.applicant,
            timeline: [...c.timeline, { at: ts, actor: auth.user?.name ?? '用户', action: 'return', note }],
          }
        }),
      )
    },
    [auth.user?.name],
  )

  const value = useMemo<ExpenseFlowContextValue>(
    () => ({
      departments,
      projects,
      costCenters,
      claims,
      workItems,
      createDraft,
      submit,
      approve,
      reject,
      returnToApplicant,
      getClaim,
      getWorkItem,
    }),
    [
      claims,
      createDraft,
      getClaim,
      getWorkItem,
      reject,
      returnToApplicant,
      submit,
      approve,
      workItems,
    ],
  )

  return <ExpenseFlowContext.Provider value={value}>{children}</ExpenseFlowContext.Provider>
}
