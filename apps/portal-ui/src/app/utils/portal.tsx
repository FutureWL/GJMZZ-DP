import { useLocation } from 'react-router-dom'
import type { PortalId } from '../types'

export function getPortalFromPathname(pathname: string): PortalId {
  void pathname
  return 'main'
}

export function usePortalId(): PortalId {
  const { pathname } = useLocation()
  return getPortalFromPathname(pathname)
}
