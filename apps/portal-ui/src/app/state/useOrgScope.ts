import { useEffect, useMemo, useState } from 'react'
import type { OrgScope } from '../types'

const STORAGE_KEY = 'portal-ui:orgScope'

const DEFAULT_SCOPE: OrgScope = { type: 'factory', id: 'F001', name: '一厂' }

export function useOrgScope() {
  const [scope, setScope] = useState<OrgScope>(() => {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (!raw) return DEFAULT_SCOPE
    try {
      const parsed = JSON.parse(raw) as OrgScope
      if (parsed?.id && parsed?.name && parsed?.type) return parsed
      return DEFAULT_SCOPE
    } catch {
      return DEFAULT_SCOPE
    }
  })

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(scope))
  }, [scope])

  return useMemo(() => ({ scope, setScope }), [scope])
}

