import { useEffect, useMemo, useState } from 'react'

const STORAGE_KEY = 'portal-ui:sidebar-collapsed'

function getInitialValue(): boolean {
  const saved = localStorage.getItem(STORAGE_KEY)
  if (saved === '1') return true
  if (saved === '0') return false
  return false
}

export function useSidebarCollapse() {
  const [collapsed, setCollapsed] = useState<boolean>(() => getInitialValue())

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, collapsed ? '1' : '0')
  }, [collapsed])

  return useMemo(
    () => ({
      collapsed,
      setCollapsed,
      toggle: () => setCollapsed((v) => !v),
    }),
    [collapsed],
  )
}

