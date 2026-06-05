import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useState,
  type ReactNode,
} from 'react'
import type {
  AdditionalCenter,
  AdditionalCenterId,
  AdditionalContent,
  AdditionalMember,
  AdditionalRole,
  AdditionalRoleBinding,
  AdditionalRequest,
  AdditionalRequestStatus,
  AdditionalService,
} from '../../mock/models'
import {
  additionalCenters as mockCenters,
  additionalContents as mockContents,
  additionalServices as mockServices,
  buildInitialAdditionalRequests,
} from '../../mock/additional'
import {
  additionalMembers as mockMembers,
  additionalRoleBindings as mockRoleBindings,
  additionalRoles as mockRoles,
} from '../../mock/additional-admin'

function deepCopy<T>(value: T): T {
  if (typeof structuredClone === 'function') {
    return structuredClone(value)
  }
  return JSON.parse(JSON.stringify(value)) as T
}

const STORAGE_KEY = 'portal-ui:additional:v2'

function nowText() {
  const d = new Date()
  const pad = (n: number) => String(n).padStart(2, '0')
  const yyyy = d.getFullYear()
  const mm = pad(d.getMonth() + 1)
  const dd = pad(d.getDate())
  const hh = pad(d.getHours())
  const mi = pad(d.getMinutes())
  return `${yyyy}-${mm}-${dd} ${hh}:${mi}`
}

function newRequestId() {
  const d = new Date()
  const pad = (n: number) => String(n).padStart(2, '0')
  const yyyymmdd = `${d.getFullYear()}${pad(d.getMonth() + 1)}${pad(d.getDate())}`
  const rand = String(Math.floor(Math.random() * 900) + 100)
  return `REQ-AD-${yyyymmdd}-${rand}`
}

type PersistedState = {
  services?: AdditionalService[]
  requests?: AdditionalRequest[]
  contents?: AdditionalContent[]
  roleBindings?: AdditionalRoleBinding[]
}

function readPersisted(): PersistedState | null {
  const raw = localStorage.getItem(STORAGE_KEY)
  if (!raw) return null
  try {
    const parsed = JSON.parse(raw) as PersistedState
    if (parsed.services && !Array.isArray(parsed.services)) return null
    if (parsed.requests && !Array.isArray(parsed.requests)) return null
    if (parsed.contents && !Array.isArray(parsed.contents)) return null
    if (parsed.roleBindings && !Array.isArray(parsed.roleBindings)) return null
    return parsed
  } catch {
    return null
  }
}

function writePersisted(state: PersistedState) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(state))
}

export interface AdditionalDataContextValue {
  centers: AdditionalCenter[]
  services: AdditionalService[]
  contents: AdditionalContent[]
  roles: AdditionalRole[]
  members: AdditionalMember[]
  roleBindings: AdditionalRoleBinding[]
  requests: AdditionalRequest[]
  setServiceEnabled: (serviceId: string, enabled: boolean) => void
  upsertContent: (content: AdditionalContent) => void
  deleteContent: (contentId: string) => void
  setContentPinned: (contentId: string, pinned: boolean) => void
  addRoleBinding: (binding: Omit<AdditionalRoleBinding, 'id' | 'createdAt'>) => void
  removeRoleBinding: (bindingId: string) => void
  createRequest: (params: {
    centerId: AdditionalCenterId
    serviceId: string
    applicant: string
    formData: Record<string, string>
  }) => AdditionalRequest
  updateRequestStatus: (params: {
    requestId: string
    status: AdditionalRequestStatus
    actor: string
    note?: string
    assignee?: string | null
  }) => void
}

export const AdditionalDataContext = createContext<AdditionalDataContextValue | null>(null)

export function useAdditionalData() {
  const ctx = useContext(AdditionalDataContext)
  if (!ctx) {
    throw new Error('AdditionalDataProvider missing')
  }
  return ctx
}

export function AdditionalDataProvider({ children }: { children: ReactNode }) {
  const [centers] = useState<AdditionalCenter[]>(() => deepCopy(mockCenters))
  const [roles] = useState<AdditionalRole[]>(() => deepCopy(mockRoles))
  const [members] = useState<AdditionalMember[]>(() => deepCopy(mockMembers))

  const [contents, setContents] = useState<AdditionalContent[]>(() => {
    const persisted = readPersisted()
    if (persisted?.contents?.length) return deepCopy(persisted.contents)
    return deepCopy(mockContents)
  })

  const [roleBindings, setRoleBindings] = useState<AdditionalRoleBinding[]>(() => {
    const persisted = readPersisted()
    if (persisted?.roleBindings?.length) return deepCopy(persisted.roleBindings)
    return deepCopy(mockRoleBindings)
  })

  const [services, setServices] = useState<AdditionalService[]>(() => {
    const persisted = readPersisted()
    if (persisted?.services?.length) return deepCopy(persisted.services)
    return deepCopy(mockServices)
  })

  const [requests, setRequests] = useState<AdditionalRequest[]>(() => {
    const persisted = readPersisted()
    if (persisted?.requests?.length) return deepCopy(persisted.requests)
    return deepCopy(buildInitialAdditionalRequests())
  })

  const persist = useCallback(
    (next: {
      services?: AdditionalService[]
      requests?: AdditionalRequest[]
      contents?: AdditionalContent[]
      roleBindings?: AdditionalRoleBinding[]
    }) => {
      const s = next.services ?? services
      const r = next.requests ?? requests
      const c = next.contents ?? contents
      const b = next.roleBindings ?? roleBindings
      writePersisted({ services: s, requests: r, contents: c, roleBindings: b })
    },
    [contents, requests, roleBindings, services],
  )

  const setServiceEnabled = useCallback(
    (serviceId: string, enabled: boolean) => {
      setServices((prev) => {
        const next = prev.map((s) => (s.id === serviceId ? { ...s, enabled } : s))
        persist({ services: next })
        return next
      })
    },
    [persist],
  )

  const upsertContent = useCallback(
    (content: AdditionalContent) => {
      setContents((prev) => {
        const idx = prev.findIndex((x) => x.id === content.id)
        const next = idx < 0 ? [content, ...prev] : prev.map((x) => (x.id === content.id ? content : x))
        persist({ contents: next })
        return next
      })
    },
    [persist],
  )

  const deleteContent = useCallback(
    (contentId: string) => {
      setContents((prev) => {
        const next = prev.filter((x) => x.id !== contentId)
        persist({ contents: next })
        return next
      })
    },
    [persist],
  )

  const setContentPinned = useCallback(
    (contentId: string, pinned: boolean) => {
      setContents((prev) => {
        const next = prev.map((x) => (x.id === contentId ? { ...x, pinned } : x))
        persist({ contents: next })
        return next
      })
    },
    [persist],
  )

  const addRoleBinding = useCallback(
    (binding: Omit<AdditionalRoleBinding, 'id' | 'createdAt'>) => {
      const id = `RB-${Math.floor(Math.random() * 9000 + 1000)}`
      const createdAt = nowText()
      setRoleBindings((prev) => {
        const next = [{ id, createdAt, ...binding }, ...prev]
        persist({ roleBindings: next })
        return next
      })
    },
    [persist],
  )

  const removeRoleBinding = useCallback(
    (bindingId: string) => {
      setRoleBindings((prev) => {
        const next = prev.filter((x) => x.id !== bindingId)
        persist({ roleBindings: next })
        return next
      })
    },
    [persist],
  )

  const createRequest = useCallback(
    (params: {
      centerId: AdditionalCenterId
      serviceId: string
      applicant: string
      formData: Record<string, string>
    }) => {
      const service = services.find((s) => s.id === params.serviceId)
      if (!service) {
        throw new Error('Service not found')
      }
      const at = nowText()
      const req: AdditionalRequest = {
        id: newRequestId(),
        centerId: params.centerId,
        serviceId: params.serviceId,
        serviceName: service.name,
        applicant: params.applicant,
        status: 'submitted',
        createdAt: at,
        updatedAt: at,
        currentAssignee: null,
        formData: params.formData,
        timeline: [{ at, actor: params.applicant, action: '提交申请' }],
      }
      setRequests((prev) => {
        const next = [req, ...prev]
        persist({ requests: next })
        return next
      })
      return req
    },
    [persist, services],
  )

  const updateRequestStatus = useCallback(
    (params: {
      requestId: string
      status: AdditionalRequestStatus
      actor: string
      note?: string
      assignee?: string | null
    }) => {
      setRequests((prev) => {
        const idx = prev.findIndex((x) => x.id === params.requestId)
        if (idx < 0) return prev
        const at = nowText()
        const cur = prev[idx]
        const nextItem: AdditionalRequest = {
          ...cur,
          status: params.status,
          updatedAt: at,
          currentAssignee:
            typeof params.assignee === 'undefined' ? cur.currentAssignee : params.assignee,
          timeline: [
            { at, actor: params.actor, action: statusText(params.status), note: params.note },
            ...cur.timeline,
          ],
        }
        const next = prev.slice()
        next[idx] = nextItem
        persist({ requests: next })
        return next
      })
    },
    [persist],
  )

  const value = useMemo<AdditionalDataContextValue>(
    () => ({
      centers,
      services,
      contents,
      roles,
      members,
      roleBindings,
      requests,
      setServiceEnabled,
      upsertContent,
      deleteContent,
      setContentPinned,
      addRoleBinding,
      removeRoleBinding,
      createRequest,
      updateRequestStatus,
    }),
    [
      addRoleBinding,
      centers,
      contents,
      createRequest,
      deleteContent,
      members,
      removeRoleBinding,
      requests,
      roleBindings,
      roles,
      services,
      setContentPinned,
      setServiceEnabled,
      updateRequestStatus,
      upsertContent,
    ],
  )

  return <AdditionalDataContext.Provider value={value}>{children}</AdditionalDataContext.Provider>
}

function statusText(status: AdditionalRequestStatus) {
  if (status === 'submitted') return '已提交'
  if (status === 'accepted') return '已受理'
  if (status === 'in_progress') return '处理中'
  if (status === 'done') return '已完成'
  if (status === 'rejected') return '已驳回'
  if (status === 'canceled') return '已撤回'
  return '草稿'
}
