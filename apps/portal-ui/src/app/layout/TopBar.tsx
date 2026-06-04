import { Moon, Search, Sun } from 'lucide-react'
import { useMemo, useState } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import { PORTALS } from '../config/portals'
import type { OrgScope, PortalId } from '../types'
import { useOrgScope } from '../state/useOrgScope'
import { useTheme } from '../state/useTheme'
import { useTimeRange, type TimeRange } from '../state/useTimeRange'
import { Input } from '../ui/Input'
import { Select } from '../ui/Select'
import { getPortalFromPathname } from '../utils/portal'

const ORG_OPTIONS: OrgScope[] = [
  { type: 'group', id: 'G001', name: '集团' },
  { type: 'factory', id: 'F001', name: '一厂' },
  { type: 'factory', id: 'F002', name: '二厂' },
  { type: 'department', id: 'D-QA', name: '质量部' },
  { type: 'department', id: 'D-IT', name: '信息化部' },
  { type: 'line', id: 'L-A', name: '产线A' },
]

const TIME_OPTIONS: { value: TimeRange; label: string }[] = [
  { value: 'today', label: '今日' },
  { value: '7d', label: '近7天' },
  { value: '30d', label: '近30天' },
]

export function TopBar() {
  const { scope, setScope } = useOrgScope()
  const { range, setRange } = useTimeRange()
  const { theme, toggle } = useTheme()
  const [q, setQ] = useState('')
  const nav = useNavigate()
  const loc = useLocation()

  const portalId = useMemo<PortalId>(() => getPortalFromPathname(loc.pathname), [loc.pathname])

  return (
    <header className="flex h-14 items-center gap-3 border-b border-[var(--color-border-subtle)] bg-[var(--color-bg-surface)] px-4">
      <div className="flex items-center gap-2">
        <Select
          className="w-[120px]"
          value={portalId}
          onChange={(e) => {
            const next = e.target.value as PortalId
            const portal = PORTALS.find((p) => p.id === next)
            nav(portal?.defaultPath ?? '/production/overview')
          }}
        >
          {PORTALS.map((p) => (
            <option key={p.id} value={p.id}>
              {p.label}门户
            </option>
          ))}
        </Select>
        <Select
          className="w-[140px]"
          value={scope.id}
          onChange={(e) => {
            const found = ORG_OPTIONS.find((o) => o.id === e.target.value)
            if (found) setScope(found)
          }}
        >
          {ORG_OPTIONS.map((o) => (
            <option key={o.id} value={o.id}>
              {o.name}
            </option>
          ))}
        </Select>
        <Select
          className="w-[110px]"
          value={range}
          onChange={(e) => setRange(e.target.value as TimeRange)}
        >
          {TIME_OPTIONS.map((o) => (
            <option key={o.value} value={o.value}>
              {o.label}
            </option>
          ))}
        </Select>
      </div>

      <div className="flex flex-1 items-center gap-2">
        <div className="relative w-full max-w-[560px]">
          <Search className="pointer-events-none absolute left-3 top-2.5 h-4 w-4 text-[var(--color-text-tertiary)]" />
          <Input
            className="pl-9"
            placeholder="全局搜索：工单/设备/批次/告警/PR/PO/供应商/外协工厂/人员（示例）"
            value={q}
            onChange={(e) => setQ(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter') nav(`/search?q=${encodeURIComponent(q)}`)
            }}
          />
        </div>
      </div>

      <button
        className="inline-flex h-9 w-9 items-center justify-center rounded-[6px] border border-[var(--color-border-subtle)] bg-[var(--color-bg-surface)] text-[var(--color-text-secondary)] hover:bg-black/5 dark:hover:bg-white/5"
        onClick={toggle}
        aria-label="Toggle theme"
      >
        {theme === 'dark' ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
      </button>
    </header>
  )
}

