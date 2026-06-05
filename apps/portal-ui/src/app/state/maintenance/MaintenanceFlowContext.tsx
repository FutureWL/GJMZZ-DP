import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useState,
  type ReactNode,
} from 'react'
import type {
  EquipmentAsset,
  MaintenanceTicket,
  MaintenanceFlowNode,
  MaintenanceSpareUsage,
} from '../../mock/models'
import { equipmentAssets, maintenanceTickets as seedTickets, spareParts } from '../../mock/data'
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

function addMinutes(date: Date, minutes: number) {
  return new Date(date.getTime() + minutes * 60_000)
}

function format(d: Date) {
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

function buildNodes(status: MaintenanceTicket['status'], completedAt: string | null): MaintenanceFlowNode[] {
  const keys: Array<{ key: MaintenanceFlowNode['key']; label: string }> = [
    { key: 'reported', label: '报修' },
    { key: 'dispatched', label: '派工' },
    { key: 'accepted', label: '接单' },
    { key: 'on_site', label: '到场' },
    { key: 'repairing', label: '维修中' },
    { key: 'done', label: '完工' },
    { key: 'verified', label: '验收' },
    { key: 'closed', label: '关闭' },
  ]
  const order = keys.map((x) => x.key)
  const idx = order.indexOf(status)
  return keys.map((x) => ({
    key: x.key,
    label: x.label,
    status: idx >= 0 && order.indexOf(x.key) <= idx ? 'done' : 'pending',
    completedAt: x.key === status ? completedAt : null,
  }))
}

function isOverdue(t: MaintenanceTicket) {
  if (t.status === 'closed' || t.status === 'canceled') return false
  return t.updatedAt > t.slaDueAt
}

export interface MaintenanceFlowContextValue {
  equipment: EquipmentAsset[]
  spareParts: typeof spareParts
  tickets: MaintenanceTicket[]
  createTicket: (input: {
    equipmentId: string
    title: string
    symptom: string
    priority: MaintenanceTicket['priority']
    attachments: string[]
  }) => MaintenanceTicket
  dispatch: (ticketId: string, assignee: string, note?: string) => void
  accept: (ticketId: string, note?: string) => void
  arrive: (ticketId: string, note?: string) => void
  startRepair: (ticketId: string, note?: string) => void
  addSpareUsage: (ticketId: string, usage: MaintenanceSpareUsage) => void
  complete: (ticketId: string, cause: string, solution: string, note?: string) => void
  verify: (ticketId: string, note?: string) => void
  close: (ticketId: string, note?: string) => void
  cancel: (ticketId: string, note?: string) => void
  getTicket: (ticketId: string) => MaintenanceTicket | undefined
  isOverdue: (ticket: MaintenanceTicket) => boolean
}

export const MaintenanceFlowContext = createContext<MaintenanceFlowContextValue | null>(null)

export function useMaintenanceFlow() {
  const ctx = useContext(MaintenanceFlowContext)
  if (!ctx) {
    throw new Error('MaintenanceFlowProvider missing')
  }
  return ctx
}

export function MaintenanceFlowProvider({ children }: { children: ReactNode }) {
  const auth = useAuth()
  const [tickets, setTickets] = useState<MaintenanceTicket[]>(() => deepCopy(seedTickets))

  const getTicket = useCallback((ticketId: string) => tickets.find((t) => t.id === ticketId), [tickets])

  const createTicket = useCallback(
    (input: { equipmentId: string; title: string; symptom: string; priority: MaintenanceTicket['priority']; attachments: string[] }) => {
      const ts = nowText()
      const due = format(addMinutes(new Date(), input.priority === 'critical' ? 90 : input.priority === 'high' ? 180 : 360))
      const eq = equipmentAssets.find((e) => e.id === input.equipmentId)
      const next: MaintenanceTicket = {
        id: newId('MT'),
        title: input.title,
        equipmentId: input.equipmentId,
        equipmentName: eq?.name ?? input.equipmentId,
        factory: eq?.factory ?? '-',
        line: eq?.line ?? '-',
        location: eq?.location ?? '-',
        priority: input.priority,
        status: 'reported',
        reporter: auth.user?.name ?? '用户',
        assignee: null,
        symptom: input.symptom,
        cause: null,
        solution: null,
        createdAt: ts,
        updatedAt: ts,
        slaDueAt: due,
        attachments: input.attachments,
        spareParts: [],
        nodes: buildNodes('reported', ts),
        timeline: [{ at: ts, actor: auth.user?.name ?? '用户', action: 'report' }],
      }
      setTickets((prev) => [next, ...prev])
      return next
    },
    [auth.user?.name],
  )

  const update = useCallback((ticketId: string, fn: (t: MaintenanceTicket, ts: string) => MaintenanceTicket) => {
    const ts = nowText()
    setTickets((prev) => prev.map((t) => (t.id === ticketId ? fn(t, ts) : t)))
  }, [])

  const dispatch = useCallback(
    (ticketId: string, assignee: string, note?: string) => {
      update(ticketId, (t, ts) => {
        if (t.status === 'closed' || t.status === 'canceled') return t
        const nextStatus: MaintenanceTicket['status'] = 'dispatched'
        return {
          ...t,
          status: nextStatus,
          assignee,
          updatedAt: ts,
          nodes: buildNodes(nextStatus, ts),
          timeline: [...t.timeline, { at: ts, actor: auth.user?.name ?? '用户', action: 'dispatch', note }],
        }
      })
    },
    [auth.user?.name, update],
  )

  const accept = useCallback(
    (ticketId: string, note?: string) => {
      update(ticketId, (t, ts) => {
        if (t.status !== 'dispatched') return t
        const nextStatus: MaintenanceTicket['status'] = 'accepted'
        return {
          ...t,
          status: nextStatus,
          assignee: t.assignee ?? auth.user?.name ?? '维修',
          updatedAt: ts,
          nodes: buildNodes(nextStatus, ts),
          timeline: [...t.timeline, { at: ts, actor: auth.user?.name ?? '用户', action: 'accept', note }],
        }
      })
    },
    [auth.user?.name, update],
  )

  const arrive = useCallback(
    (ticketId: string, note?: string) => {
      update(ticketId, (t, ts) => {
        if (t.status !== 'accepted') return t
        const nextStatus: MaintenanceTicket['status'] = 'on_site'
        return {
          ...t,
          status: nextStatus,
          updatedAt: ts,
          nodes: buildNodes(nextStatus, ts),
          timeline: [...t.timeline, { at: ts, actor: auth.user?.name ?? '用户', action: 'arrive', note }],
        }
      })
    },
    [auth.user?.name, update],
  )

  const startRepair = useCallback(
    (ticketId: string, note?: string) => {
      update(ticketId, (t, ts) => {
        if (t.status !== 'on_site') return t
        const nextStatus: MaintenanceTicket['status'] = 'repairing'
        return {
          ...t,
          status: nextStatus,
          updatedAt: ts,
          nodes: buildNodes(nextStatus, ts),
          timeline: [...t.timeline, { at: ts, actor: auth.user?.name ?? '用户', action: 'start_repair', note }],
        }
      })
    },
    [auth.user?.name, update],
  )

  const addSpareUsage = useCallback((ticketId: string, usage: MaintenanceSpareUsage) => {
    update(ticketId, (t, ts) => ({
      ...t,
      updatedAt: ts,
      spareParts: [usage, ...t.spareParts],
      timeline: [...t.timeline, { at: ts, actor: '系统', action: 'spare', note: `${usage.partName} × ${usage.qty}${usage.uom}` }],
    }))
  }, [update])

  const complete = useCallback(
    (ticketId: string, cause: string, solution: string, note?: string) => {
      update(ticketId, (t, ts) => {
        if (t.status !== 'repairing') return t
        const nextStatus: MaintenanceTicket['status'] = 'done'
        return {
          ...t,
          status: nextStatus,
          updatedAt: ts,
          cause,
          solution,
          nodes: buildNodes(nextStatus, ts),
          timeline: [...t.timeline, { at: ts, actor: auth.user?.name ?? '用户', action: 'complete', note }],
        }
      })
    },
    [auth.user?.name, update],
  )

  const verify = useCallback(
    (ticketId: string, note?: string) => {
      update(ticketId, (t, ts) => {
        if (t.status !== 'done') return t
        const nextStatus: MaintenanceTicket['status'] = 'verified'
        return {
          ...t,
          status: nextStatus,
          updatedAt: ts,
          nodes: buildNodes(nextStatus, ts),
          timeline: [...t.timeline, { at: ts, actor: auth.user?.name ?? '用户', action: 'verify', note }],
        }
      })
    },
    [auth.user?.name, update],
  )

  const close = useCallback(
    (ticketId: string, note?: string) => {
      update(ticketId, (t, ts) => {
        if (t.status !== 'verified') return t
        const nextStatus: MaintenanceTicket['status'] = 'closed'
        return {
          ...t,
          status: nextStatus,
          updatedAt: ts,
          nodes: buildNodes(nextStatus, ts),
          timeline: [...t.timeline, { at: ts, actor: auth.user?.name ?? '用户', action: 'close', note }],
        }
      })
    },
    [auth.user?.name, update],
  )

  const cancel = useCallback(
    (ticketId: string, note?: string) => {
      update(ticketId, (t, ts) => {
        if (t.status === 'closed') return t
        return {
          ...t,
          status: 'canceled',
          updatedAt: ts,
          nodes: t.nodes.map((n) => (n.status === 'done' ? n : { ...n, status: 'skipped' })),
          timeline: [...t.timeline, { at: ts, actor: auth.user?.name ?? '用户', action: 'cancel', note }],
        }
      })
    },
    [auth.user?.name, update],
  )

  const value = useMemo<MaintenanceFlowContextValue>(
    () => ({
      equipment: equipmentAssets,
      spareParts,
      tickets,
      createTicket,
      dispatch,
      accept,
      arrive,
      startRepair,
      addSpareUsage,
      complete,
      verify,
      close,
      cancel,
      getTicket,
      isOverdue,
    }),
    [accept, addSpareUsage, arrive, cancel, close, createTicket, dispatch, getTicket, startRepair, tickets, verify, complete],
  )

  return <MaintenanceFlowContext.Provider value={value}>{children}</MaintenanceFlowContext.Provider>
}

