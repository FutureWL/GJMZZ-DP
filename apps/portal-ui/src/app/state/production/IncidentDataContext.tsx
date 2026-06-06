import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from 'react'
import type { Incident } from '../../mock/models'
import { apiGet, apiPost, apiPut } from '../../api/client'
import { useAuth } from '../auth/useAuth'

export interface IncidentDataContextValue {
  incidents: Incident[]
  isLoading: boolean
  error: string | null
  refresh: () => Promise<void>
  createIncident: (incident: Omit<Incident, 'id' | 'createdAt' | 'updatedAt'>) => Promise<Incident>
  updateIncident: (incident: Incident) => Promise<void>
  archiveIncident: (id: string) => Promise<void>
}

export const IncidentDataContext = createContext<IncidentDataContextValue | null>(null)

export function useIncidentData() {
  const ctx = useContext(IncidentDataContext)
  if (!ctx) {
    throw new Error('IncidentDataProvider missing')
  }
  return ctx
}

export function IncidentDataProvider({ children }: { children: ReactNode }) {
  const auth = useAuth()
  const [incidents, setIncidents] = useState<Incident[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const refresh = useCallback(async () => {
    if (!auth.token) return
    setIsLoading(true)
    setError(null)
    try {
      const rows = await apiGet<Incident[]>('/incidents', auth.token)
      setIncidents(rows)
    } catch (e) {
      setError(e instanceof Error ? e.message : '加载失败')
    } finally {
      setIsLoading(false)
    }
  }, [auth.token])

  useEffect(() => {
    if (!auth.token) return
    refresh().catch(() => {})
  }, [auth.token, refresh])

  const createIncident = useCallback(
    async (input: Omit<Incident, 'id' | 'createdAt' | 'updatedAt'>) => {
      if (!auth.token) {
        throw new Error('未登录')
      }
      const created = await apiPost<Incident>('/incidents', auth.token, input)
      setIncidents((prev) => [created, ...prev])
      return created
    },
    [auth.token],
  )

  const updateIncident = useCallback(
    async (incident: Incident) => {
      if (!auth.token) {
        throw new Error('未登录')
      }
      const updated = await apiPut<Incident>(`/incidents/${encodeURIComponent(incident.id)}`, auth.token, incident)
      setIncidents((prev) => {
        const idx = prev.findIndex((x) => x.id === updated.id)
        if (idx < 0) return [updated, ...prev]
        const next = prev.slice()
        next[idx] = updated
        return next
      })
    },
    [auth.token],
  )

  const archiveIncident = useCallback(
    async (id: string) => {
      if (!auth.token) {
        throw new Error('未登录')
      }
      const updated = await apiPost<Incident>(`/incidents/${encodeURIComponent(id)}/archive`, auth.token, {})
      setIncidents((prev) => {
        const idx = prev.findIndex((x) => x.id === updated.id)
        if (idx < 0) return [updated, ...prev]
        const next = prev.slice()
        next[idx] = updated
        return next
      })
    },
    [auth.token],
  )

  const value = useMemo<IncidentDataContextValue>(
    () => ({ incidents, isLoading, error, refresh, createIncident, updateIncident, archiveIncident }),
    [archiveIncident, createIncident, error, incidents, isLoading, refresh, updateIncident],
  )

  return <IncidentDataContext.Provider value={value}>{children}</IncidentDataContext.Provider>
}
