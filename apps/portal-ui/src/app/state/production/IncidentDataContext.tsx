import { createContext, useCallback, useContext, useMemo, useState, type ReactNode } from 'react'
import type { Incident } from '../../mock/models'
import { incidentSeed } from '../../mock/data'

function deepCopy<T>(value: T): T {
  if (typeof structuredClone === 'function') {
    return structuredClone(value)
  }
  return JSON.parse(JSON.stringify(value)) as T
}

export interface IncidentDataContextValue {
  incidents: Incident[]
  createIncident: (incident: Omit<Incident, 'id' | 'createdAt' | 'updatedAt'>) => Incident
  updateIncident: (incident: Incident) => void
  archiveIncident: (id: string) => void
}

export const IncidentDataContext = createContext<IncidentDataContextValue | null>(null)

export function useIncidentData() {
  const ctx = useContext(IncidentDataContext)
  if (!ctx) {
    throw new Error('IncidentDataProvider missing')
  }
  return ctx
}

function createId(now = new Date()) {
  const pad = (n: number) => String(n).padStart(2, '0')
  const yyyy = now.getFullYear()
  const mm = pad(now.getMonth() + 1)
  const dd = pad(now.getDate())
  const hh = pad(now.getHours())
  const mi = pad(now.getMinutes())
  const ss = pad(now.getSeconds())
  const rand = Math.random().toString(16).slice(2, 6).toUpperCase()
  return `INC-${yyyy}${mm}${dd}-${hh}${mi}${ss}-${rand}`
}

function formatAt(now = new Date()) {
  const pad = (n: number) => String(n).padStart(2, '0')
  return `${now.getFullYear()}-${pad(now.getMonth() + 1)}-${pad(now.getDate())} ${pad(now.getHours())}:${pad(
    now.getMinutes(),
  )}`
}

export function IncidentDataProvider({ children }: { children: ReactNode }) {
  const [incidents, setIncidents] = useState<Incident[]>(() => deepCopy(incidentSeed))

  const updateIncident = useCallback((incident: Incident) => {
    setIncidents((prev) => {
      const idx = prev.findIndex((x) => x.id === incident.id)
      if (idx < 0) return [incident, ...prev]
      const next = prev.slice()
      next[idx] = incident
      return next
    })
  }, [])

  const createIncident = useCallback(
    (input: Omit<Incident, 'id' | 'createdAt' | 'updatedAt'>) => {
      const now = new Date()
      const createdAt = formatAt(now)
      const created: Incident = { ...input, id: createId(now), createdAt, updatedAt: createdAt }
      setIncidents((prev) => [created, ...prev])
      return created
    },
    [],
  )

  const archiveIncident = useCallback(
    (id: string) => {
      setIncidents((prev) => {
        const idx = prev.findIndex((x) => x.id === id)
        if (idx < 0) return prev
        const now = formatAt()
        const next = prev.slice()
        next[idx] = { ...next[idx], status: 'archived', updatedAt: now }
        return next
      })
    },
    [],
  )

  const value = useMemo<IncidentDataContextValue>(
    () => ({ incidents, createIncident, updateIncident, archiveIncident }),
    [archiveIncident, createIncident, incidents, updateIncident],
  )

  return <IncidentDataContext.Provider value={value}>{children}</IncidentDataContext.Provider>
}

