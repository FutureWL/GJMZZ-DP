/* eslint-disable react-refresh/only-export-components */
import { contacts, customers, type Contact, type Customer } from '@factory/mock-data'
import { createContext, useContext, useEffect, useMemo, useState, type ReactNode } from 'react'

export type VisitStatus = 'planned' | 'checked_in' | 'done' | 'canceled'

export interface VisitPlan {
  id: string
  customerId: string
  contactId: string | null
  address: string
  planStart: string
  planEnd: string
  purpose: string
  plannedLat: number | null
  plannedLng: number | null
}

export interface VisitState {
  status: VisitStatus
  checkInAt: string | null
  checkInLat: number | null
  checkInLng: number | null
  checkInPhotoDataUrl: string | null
}

export interface FollowUpRecord {
  id: string
  visitId: string
  createdAt: string
  note: string
  nextAt: string | null
}

export type TaskStatus = 'todo' | 'done'

export interface TaskItem {
  id: string
  title: string
  dueAt: string | null
  status: TaskStatus
  createdAt: string
  relatedVisitId: string | null
  relatedCustomerId: string | null
}

export interface VisitCardModel {
  visit: VisitPlan
  customer: Customer
  contact: Contact | null
  state: VisitState
  followUps: FollowUpRecord[]
}

const STORAGE_KEY = 'mobile-crm:v2'
const STORAGE_KEY_V1 = 'mobile-crm:v1'

type StoreV2 = {
  visits: VisitPlan[]
  states: Record<string, VisitState>
  followUps: FollowUpRecord[]
  tasks: TaskItem[]
}

type StoreV1 = {
  states: Record<string, { status: VisitStatus; checkInAt: string | null }>
  followUps: FollowUpRecord[]
}

const seedVisits: VisitPlan[] = [
  {
    id: 'VST-20260605-001',
    customerId: 'CUST-001',
    contactId: 'CON-001',
    address: '浦东新区张江路 88 号',
    planStart: '2026-06-05 09:30',
    planEnd: '2026-06-05 10:30',
    purpose: '确认合同条款与首批交期',
    plannedLat: 31.2066,
    plannedLng: 121.6039,
  },
  {
    id: 'VST-20260605-002',
    customerId: 'CUST-002',
    contactId: 'CON-002',
    address: '闵行区虹梅路 168 号',
    planStart: '2026-06-05 13:30',
    planEnd: '2026-06-05 14:30',
    purpose: '试产评审与报价版本确认',
    plannedLat: 31.1658,
    plannedLng: 121.4051,
  },
  {
    id: 'VST-20260605-003',
    customerId: 'CUST-003',
    contactId: 'CON-003',
    address: '嘉定区安亭镇工业园',
    planStart: '2026-06-05 16:00',
    planEnd: '2026-06-05 16:40',
    purpose: '补充资质文件并确认付款条款',
    plannedLat: 31.3029,
    plannedLng: 121.1618,
  },
]

function loadStoreV2(): StoreV2 | undefined {
  const raw = localStorage.getItem(STORAGE_KEY)
  if (!raw) return undefined
  try {
    return JSON.parse(raw) as StoreV2
  } catch {
    return undefined
  }
}

function migrateFromV1(v1: StoreV1 | undefined): StoreV2 {
  const states: Record<string, VisitState> = Object.fromEntries(
    Object.entries(v1?.states ?? {}).map(([k, s]) => [
      k,
      {
        status: s.status,
        checkInAt: s.checkInAt,
        checkInLat: null,
        checkInLng: null,
        checkInPhotoDataUrl: null,
      },
    ]),
  )
  return {
    visits: seedVisits,
    states,
    followUps: v1?.followUps ?? [],
    tasks: [],
  }
}

function loadStore(): StoreV2 {
  const v2 = loadStoreV2()
  if (v2) return v2
  const rawV1 = localStorage.getItem(STORAGE_KEY_V1)
  if (!rawV1) {
    return {
      visits: seedVisits,
      states: {},
      followUps: [],
      tasks: [],
    }
  }
  try {
    const v1 = JSON.parse(rawV1) as StoreV1
    const migrated = migrateFromV1(v1)
    localStorage.setItem(STORAGE_KEY, JSON.stringify(migrated))
    return migrated
  } catch {
    return {
      visits: seedVisits,
      states: {},
      followUps: [],
      tasks: [],
    }
  }
}

function saveStore(store: StoreV2) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(store))
}

function getNowText() {
  const now = new Date()
  const pad = (n: number) => String(n).padStart(2, '0')
  return `${now.getFullYear()}-${pad(now.getMonth() + 1)}-${pad(now.getDate())} ${pad(now.getHours())}:${pad(now.getMinutes())}`
}

function newId(prefix: string) {
  return `${prefix}-${Math.random().toString(16).slice(2)}`
}

function defaultState(): VisitState {
  return { status: 'planned', checkInAt: null, checkInLat: null, checkInLng: null, checkInPhotoDataUrl: null }
}

interface MobileCrmContextValue {
  visits: VisitCardModel[]
  visitPlans: VisitPlan[]
  tasks: TaskItem[]
  getVisit(id: string | undefined): VisitCardModel | undefined
  getCustomerVisits(customerId: string | undefined): VisitCardModel[]
  getCustomerTasks(customerId: string | undefined): TaskItem[]
  createVisit(input: Omit<VisitPlan, 'id'>): string
  updateVisit(id: string, patch: Partial<Omit<VisitPlan, 'id'>>): void
  cancelVisit(id: string): void
  checkIn(input: { visitId: string; lat: number | null; lng: number | null; photoDataUrl: string | null }): void
  markDone(visitId: string): void
  addFollowUp(input: { visitId: string; note: string; nextAt?: string | null }): void
  markTaskDone(taskId: string): void
}

const MobileCrmContext = createContext<MobileCrmContextValue | null>(null)

export function MobileCrmProvider({ children }: { children: ReactNode }) {
  const initial = useMemo(() => loadStore(), [])
  const [visitPlans, setVisitPlans] = useState<VisitPlan[]>(initial.visits)
  const [states, setStates] = useState<Record<string, VisitState>>(initial.states)
  const [followUps, setFollowUps] = useState<FollowUpRecord[]>(initial.followUps)
  const [tasks, setTasks] = useState<TaskItem[]>(initial.tasks)

  useEffect(() => {
    saveStore({ visits: visitPlans, states, followUps, tasks })
  }, [visitPlans, states, followUps, tasks])

  const visits = useMemo<VisitCardModel[]>(() => {
    return visitPlans
      .map((v) => {
        const customer = customers.find((c) => c.id === v.customerId)
        if (!customer) return null
        const contact = v.contactId ? contacts.find((c) => c.id === v.contactId) ?? null : null
        const state = states[v.id] ?? defaultState()
        const records = followUps.filter((r) => r.visitId === v.id).sort((a, b) => b.createdAt.localeCompare(a.createdAt))
        return { visit: v, customer, contact, state, followUps: records }
      })
      .filter((v): v is VisitCardModel => Boolean(v))
  }, [visitPlans, states, followUps])

  const value = useMemo<MobileCrmContextValue>(() => {
    return {
      visits,
      visitPlans,
      tasks,
      getVisit(id) {
        if (!id) return undefined
        return visits.find((v) => v.visit.id === id)
      },
      getCustomerVisits(customerId) {
        if (!customerId) return []
        return visits.filter((v) => v.customer.id === customerId)
      },
      getCustomerTasks(customerId) {
        if (!customerId) return []
        return tasks.filter((t) => t.relatedCustomerId === customerId)
      },
      createVisit(input) {
        const id = newId('VST')
        setVisitPlans((prev) => [{ ...input, id }, ...prev])
        return id
      },
      updateVisit(id, patch) {
        setVisitPlans((prev) => prev.map((v) => (v.id === id ? { ...v, ...patch } : v)))
      },
      cancelVisit(id) {
        setStates((prev) => ({
          ...prev,
          [id]: {
            ...(prev[id] ?? defaultState()),
            status: 'canceled',
          },
        }))
      },
      checkIn({ visitId, lat, lng, photoDataUrl }) {
        setStates((prev) => ({
          ...prev,
          [visitId]: {
            status: 'checked_in',
            checkInAt: getNowText(),
            checkInLat: lat,
            checkInLng: lng,
            checkInPhotoDataUrl: photoDataUrl,
          },
        }))
      },
      markDone(visitId) {
        setStates((prev) => ({
          ...prev,
          [visitId]: {
            status: 'done',
            checkInAt: prev[visitId]?.checkInAt ?? getNowText(),
            checkInLat: prev[visitId]?.checkInLat ?? null,
            checkInLng: prev[visitId]?.checkInLng ?? null,
            checkInPhotoDataUrl: prev[visitId]?.checkInPhotoDataUrl ?? null,
          },
        }))
      },
      addFollowUp({ visitId, note, nextAt }) {
        const createdAt = getNowText()
        const visit = visits.find((v) => v.visit.id === visitId)
        setFollowUps((prev) => [
          {
            id: newId('FUP'),
            visitId,
            createdAt,
            note,
            nextAt: nextAt ?? null,
          },
          ...prev,
        ])
        if (nextAt) {
          setTasks((prev) => [
            {
              id: newId('TSK'),
              title: `跟进：${visit?.customer.name ?? visitId}`,
              dueAt: nextAt,
              status: 'todo',
              createdAt,
              relatedVisitId: visitId,
              relatedCustomerId: visit?.customer.id ?? null,
            },
            ...prev,
          ])
        }
      },
      markTaskDone(taskId) {
        setTasks((prev) => prev.map((t) => (t.id === taskId ? { ...t, status: 'done' } : t)))
      },
    }
  }, [visits, visitPlans, tasks])

  return <MobileCrmContext.Provider value={value}>{children}</MobileCrmContext.Provider>
}

export function useMobileCrm() {
  const ctx = useContext(MobileCrmContext)
  if (!ctx) {
    throw new Error('useMobileCrm must be used within MobileCrmProvider')
  }
  return ctx
}
