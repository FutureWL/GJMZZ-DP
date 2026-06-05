import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useState,
  type ReactNode,
} from 'react'
import type {
  ApprovalWorkItem,
  ProcurementRequestFlow,
  ProcurementRequestLine,
  ProcurementRequestFlowNode,
} from '../../mock/models'
import { costCenters, departments, procurementRequestFlows as mockProcurementFlows, projects } from '../../mock/data'
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

function sumAmount(lines: ProcurementRequestLine[]) {
  return lines.reduce((acc, x) => acc + (Number.isFinite(x.amount) ? x.amount : 0), 0)
}

function pickNameFromOptions(items: { id: string; name: string }[], id: string, fallback = '-') {
  return items.find((x) => x.id === id)?.name ?? fallback
}

function buildWorkItem(pr: ProcurementRequestFlow): ApprovalWorkItem {
  return {
    id: `APR-${pr.id}`,
    title: `${pr.id} 采购申请审批`,
    domain: 'management',
    status: pr.status === 'in_review' ? 'todo' : 'done',
    overdue: false,
    businessType: 'procurement_pr',
    businessId: pr.id,
    createdAt: pr.createdAt,
    assignee: pr.currentAssignee,
  }
}

export interface ProcurementFlowContextValue {
  departments: typeof departments
  projects: typeof projects
  costCenters: typeof costCenters
  requests: ProcurementRequestFlow[]
  workItems: ApprovalWorkItem[]
  createDraft: (input: {
    title: string
    departmentId: string
    projectId: string
    costCenterId: string
    lines: ProcurementRequestLine[]
  }) => ProcurementRequestFlow
  submit: (requestId: string) => void
  approve: (requestId: string, note?: string) => void
  reject: (requestId: string, note?: string) => void
  returnToApplicant: (requestId: string, note?: string) => void
  getRequest: (requestId: string) => ProcurementRequestFlow | undefined
}

export const ProcurementFlowContext = createContext<ProcurementFlowContextValue | null>(null)

export function useProcurementFlow() {
  const ctx = useContext(ProcurementFlowContext)
  if (!ctx) {
    throw new Error('ProcurementFlowProvider missing')
  }
  return ctx
}

export function ProcurementFlowProvider({ children }: { children: ReactNode }) {
  const auth = useAuth()
  const [requests, setRequests] = useState<ProcurementRequestFlow[]>(() => deepCopy(mockProcurementFlows))

  const workItems = useMemo(() => {
    return requests
      .filter((r) => r.status !== 'draft')
      .map((r) => buildWorkItem(r))
      .sort((a, b) => (a.createdAt < b.createdAt ? 1 : -1))
  }, [requests])

  const getRequest = useCallback((requestId: string) => requests.find((r) => r.id === requestId), [requests])

  const createDraft = useCallback(
    (input: { title: string; departmentId: string; projectId: string; costCenterId: string; lines: ProcurementRequestLine[] }) => {
      const id = newId('PRF')
      const ts = nowText()
      const amountTotal = sumAmount(input.lines)
      const departmentName = pickNameFromOptions(departments, input.departmentId)
      const projectName = pickNameFromOptions(projects, input.projectId)
      const costCenterName = pickNameFromOptions(costCenters, input.costCenterId)
      const next: ProcurementRequestFlow = {
        id,
        title: input.title || `采购申请-${auth.user?.name ?? '用户'}`,
        requester: auth.user?.name ?? '用户',
        departmentId: input.departmentId,
        departmentName,
        projectId: input.projectId,
        projectName,
        costCenterId: input.costCenterId,
        costCenterName,
        amountTotal,
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
          { key: 'procurement_review', label: '采购评审', assignee: '采购-张', status: 'pending', completedAt: null },
          { key: 'finance_review', label: '财务审核', assignee: '财务-钱', status: 'pending', completedAt: null },
          { key: 'archive', label: '归档', assignee: '系统', status: 'pending', completedAt: null },
        ],
        timeline: [{ at: ts, actor: auth.user?.name ?? '用户', action: 'save_draft' }],
      }
      setRequests((prev) => [next, ...prev])
      return next
    },
    [auth.user?.name],
  )

  const submit = useCallback(
    (requestId: string) => {
      const ts = nowText()
      setRequests((prev) =>
        prev.map((r) => {
          if (r.id !== requestId) return r
          if (r.status === 'canceled') return r
          const nodes: ProcurementRequestFlowNode[] = r.nodes.map((n) =>
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

  const moveToNextNode = useCallback((r: ProcurementRequestFlow, ts: string): ProcurementRequestFlow => {
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
    (requestId: string, note?: string) => {
      const ts = nowText()
      setRequests((prev) =>
        prev.map((r) => {
          if (r.id !== requestId) return r
          if (r.status !== 'in_review') return r
          const next = moveToNextNode(r, ts)
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
    (requestId: string, note?: string) => {
      const ts = nowText()
      setRequests((prev) =>
        prev.map((r) => {
          if (r.id !== requestId) return r
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
    (requestId: string, note?: string) => {
      const ts = nowText()
      setRequests((prev) =>
        prev.map((r) => {
          if (r.id !== requestId) return r
          if (r.status !== 'in_review') return r
          return {
            ...r,
            status: 'returned',
            updatedAt: ts,
            currentNodeKey: null,
            currentAssignee: r.requester,
            timeline: [...r.timeline, { at: ts, actor: auth.user?.name ?? '用户', action: 'return', note }],
          }
        }),
      )
    },
    [auth.user?.name],
  )

  const value = useMemo<ProcurementFlowContextValue>(
    () => ({
      departments,
      projects,
      costCenters,
      requests,
      workItems,
      createDraft,
      submit,
      approve,
      reject,
      returnToApplicant,
      getRequest,
    }),
    [approve, createDraft, getRequest, reject, requests, returnToApplicant, submit, workItems],
  )

  return <ProcurementFlowContext.Provider value={value}>{children}</ProcurementFlowContext.Provider>
}
