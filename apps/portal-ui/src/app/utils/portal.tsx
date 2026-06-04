import { useLocation } from 'react-router-dom'
import type { PortalId } from '../types'

const portalPrefixes: Record<string, PortalId> = {
  business: 'business',
  management: 'management',
  production: 'production',
  support: 'support',
  additional: 'additional',
}

export function getPortalFromPathname(pathname: string): PortalId {
  const seg = pathname.split('/').filter(Boolean)[0]
  if (!seg) return 'production'
  return portalPrefixes[seg] ?? 'production'
}

export function usePortalId(): PortalId {
  const { pathname } = useLocation()
  return getPortalFromPathname(pathname)
}

