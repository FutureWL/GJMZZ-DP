import { Outlet } from 'react-router-dom'
import { PORTAL_BY_ID } from '../config/portals'
import type { PortalId } from '../types'
import { Sidebar } from './Sidebar'
import { TopBar } from './TopBar'

export function AppLayout({ portalId }: { portalId: PortalId }) {
  const portal = PORTAL_BY_ID[portalId]
  return (
    <div className="flex h-screen flex-col">
      <TopBar />
      <div className="flex min-h-0 flex-1">
        <Sidebar portal={portal} />
        <main className="min-h-0 flex-1 overflow-auto bg-[var(--color-bg-page)]">
          <div className="mx-auto max-w-[1400px] p-4">
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  )
}

