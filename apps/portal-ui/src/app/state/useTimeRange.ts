import { useEffect, useMemo, useState } from 'react'

export type TimeRange = 'today' | '7d' | '30d'

const STORAGE_KEY = 'portal-ui:timeRange'

export function useTimeRange() {
  const [range, setRange] = useState<TimeRange>(() => {
    const saved = localStorage.getItem(STORAGE_KEY)
    if (saved === 'today' || saved === '7d' || saved === '30d') return saved
    return '7d'
  })

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, range)
  }, [range])

  return useMemo(() => ({ range, setRange }), [range])
}

