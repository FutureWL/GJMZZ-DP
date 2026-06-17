/* eslint-disable react-refresh/only-export-components */
import { createContext, useCallback, useContext, useMemo, useState, type ReactNode } from 'react'
import type { DeliveryRisk, DeliveryRiskStatus } from '../../mock/models'
import { deliveryRisksSeed } from '../../mock/data'

function deepCopy<T>(value: T): T {
  if (typeof structuredClone === 'function') {
    return structuredClone(value)
  }
  return JSON.parse(JSON.stringify(value)) as T
}

function formatAt(now = new Date()) {
  const pad = (n: number) => String(n).padStart(2, '0')
  return `${now.getFullYear()}-${pad(now.getMonth() + 1)}-${pad(now.getDate())} ${pad(now.getHours())}:${pad(
    now.getMinutes(),
  )}`
}

export interface RiskDataContextValue {
  risks: DeliveryRisk[]
  updateRisk: (risk: DeliveryRisk) => void
  setRiskStatus: (riskId: string, status: DeliveryRiskStatus, note?: string) => void
  archiveRisk: (riskId: string, note?: string) => void
}

export const RiskDataContext = createContext<RiskDataContextValue | null>(null)

export function useRiskData() {
  const ctx = useContext(RiskDataContext)
  if (!ctx) {
    throw new Error('RiskDataProvider missing')
  }
  return ctx
}

export function RiskDataProvider({ children }: { children: ReactNode }) {
  const [risks, setRisks] = useState<DeliveryRisk[]>(() => deepCopy(deliveryRisksSeed))

  const updateRisk = useCallback((risk: DeliveryRisk) => {
    setRisks((prev) => {
      const idx = prev.findIndex((x) => x.riskId === risk.riskId)
      if (idx < 0) return [risk, ...prev]
      const next = prev.slice()
      next[idx] = risk
      return next
    })
  }, [])

  const setRiskStatus = useCallback((riskId: string, status: DeliveryRiskStatus, note?: string) => {
    setRisks((prev) => {
      const idx = prev.findIndex((x) => x.riskId === riskId)
      if (idx < 0) return prev
      const at = formatAt()
      const next = prev.slice()
      const current = next[idx]
      next[idx] = {
        ...current,
        status,
        updatedAt: at,
        timeline: [...current.timeline, { at, action: `status:${status}`, note }],
      }
      return next
    })
  }, [])

  const archiveRisk = useCallback(
    (riskId: string, note?: string) => {
      setRiskStatus(riskId, 'archived', note)
    },
    [setRiskStatus],
  )

  const value = useMemo<RiskDataContextValue>(
    () => ({ risks, updateRisk, setRiskStatus, archiveRisk }),
    [archiveRisk, risks, setRiskStatus, updateRisk],
  )

  return <RiskDataContext.Provider value={value}>{children}</RiskDataContext.Provider>
}

