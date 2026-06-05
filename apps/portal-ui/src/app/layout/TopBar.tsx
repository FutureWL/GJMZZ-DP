import { LogOut, Maximize, Minimize, Moon, Settings, Shield, Search, Sun, User } from 'lucide-react'
import { useEffect, useMemo, useState } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import { PORTALS } from '../config/portals'
import type { OrgScope, PortalId } from '../types'
import { useOrgScope } from '../state/useOrgScope'
import { useAuth } from '../state/auth/useAuth'
import { useTheme } from '../state/useTheme'
import { useTimeRange, type TimeRange } from '../state/useTimeRange'
import { Input } from '../ui/Input'
import { Avatar } from '../ui/Avatar'
import { Menu, MenuItem } from '../ui/Menu'
import { Select } from '../ui/Select'
import { ProductMark } from '../ui/ProductMark'
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
  const auth = useAuth()
  const { scope, setScope } = useOrgScope()
  const { range, setRange } = useTimeRange()
  const { theme, toggle } = useTheme()
  const [q, setQ] = useState('')
  const [openUserMenu, setOpenUserMenu] = useState(false)
  const [isFullscreen, setIsFullscreen] = useState(false)
  const nav = useNavigate()
  const loc = useLocation()

  const portalId = useMemo<PortalId>(() => getPortalFromPathname(loc.pathname), [loc.pathname])

  const fullscreenSupported = useMemo(() => {
    if (typeof document === 'undefined') return false
    const el = document.documentElement as any
    const request = el?.requestFullscreen ?? el?.webkitRequestFullscreen ?? el?.msRequestFullscreen
    const exit = (document as any).exitFullscreen ?? (document as any).webkitExitFullscreen ?? (document as any).msExitFullscreen
    return !!request && !!exit
  }, [])

  useEffect(() => {
    if (typeof document === 'undefined') return

    const getIsFs = () => {
      const d = document as any
      return !!(d.fullscreenElement ?? d.webkitFullscreenElement ?? d.msFullscreenElement)
    }

    setIsFullscreen(getIsFs())
    const onChange = () => setIsFullscreen(getIsFs())

    document.addEventListener('fullscreenchange', onChange)
    document.addEventListener('webkitfullscreenchange' as any, onChange)
    document.addEventListener('msfullscreenchange' as any, onChange)
    return () => {
      document.removeEventListener('fullscreenchange', onChange)
      document.removeEventListener('webkitfullscreenchange' as any, onChange)
      document.removeEventListener('msfullscreenchange' as any, onChange)
    }
  }, [])

  const toggleFullscreen = async () => {
    if (typeof document === 'undefined') return

    const d = document as any
    const el = document.documentElement as any
    const fsEl = d.fullscreenElement ?? d.webkitFullscreenElement ?? d.msFullscreenElement

    try {
      if (fsEl) {
        const exit = d.exitFullscreen ?? d.webkitExitFullscreen ?? d.msExitFullscreen
        await exit?.call(d)
        return
      }

      const request = el.requestFullscreen ?? el.webkitRequestFullscreen ?? el.msRequestFullscreen
      await request?.call(el)
    } catch {
      setIsFullscreen(!!(d.fullscreenElement ?? d.webkitFullscreenElement ?? d.msFullscreenElement))
    }
  }

  return (
    <header className="flex h-14 items-center gap-3 border-b border-[var(--color-border-subtle)] bg-[var(--color-bg-surface)] px-4">
      <ProductMark />
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

      <button
        className="inline-flex h-9 w-9 items-center justify-center rounded-[6px] border border-[var(--color-border-subtle)] bg-[var(--color-bg-surface)] text-[var(--color-text-secondary)] hover:bg-black/5 disabled:cursor-not-allowed disabled:opacity-50 dark:hover:bg-white/5"
        onClick={toggleFullscreen}
        aria-label={isFullscreen ? 'Exit fullscreen' : 'Enter fullscreen'}
        disabled={!fullscreenSupported}
      >
        {isFullscreen ? <Minimize className="h-4 w-4" /> : <Maximize className="h-4 w-4" />}
      </button>

      <div className="relative">
        <button
          className="inline-flex h-9 items-center gap-2 rounded-[6px] border border-[var(--color-border-subtle)] bg-[var(--color-bg-surface)] px-2 text-sm text-[var(--color-text-primary)] hover:bg-black/5 dark:hover:bg-white/5"
          onClick={() => setOpenUserMenu((v) => !v)}
        >
          <Avatar text={auth.user?.avatarText ?? 'U'} size={26} />
          <span className="max-w-[120px] truncate">{auth.user?.name ?? '用户'}</span>
        </button>
        <Menu open={openUserMenu} onClose={() => setOpenUserMenu(false)}>
          <div className="px-3 py-2">
            <div className="text-xs text-[var(--color-text-tertiary)]">当前用户</div>
            <div className="mt-1 text-sm font-semibold text-[var(--color-text-primary)]">
              {auth.user?.name ?? '用户'}
            </div>
            <div className="mt-1 text-xs text-[var(--color-text-tertiary)]">
              {auth.user?.department ?? '-'} · {auth.user?.position ?? '-'}
            </div>
          </div>
          <div className="my-1 h-px bg-[var(--color-border-subtle)]" />
          <MenuItem
            onClick={() => {
              setOpenUserMenu(false)
              nav('/account/profile')
            }}
          >
            <User className="h-4 w-4 opacity-80" />
            <span>个人信息</span>
          </MenuItem>
          <MenuItem
            onClick={() => {
              setOpenUserMenu(false)
              nav('/account/security')
            }}
          >
            <Settings className="h-4 w-4 opacity-80" />
            <span>安全设置</span>
          </MenuItem>
          <MenuItem
            onClick={() => {
              setOpenUserMenu(false)
              nav('/account/roles')
            }}
          >
            <Shield className="h-4 w-4 opacity-80" />
            <span>角色与权限</span>
          </MenuItem>
          <MenuItem
            onClick={() => {
              setOpenUserMenu(false)
              nav('/account/sessions')
            }}
          >
            <Search className="h-4 w-4 opacity-80" />
            <span>最近登录</span>
          </MenuItem>
          <div className="my-1 h-px bg-[var(--color-border-subtle)]" />
          <MenuItem
            danger
            onClick={() => {
              setOpenUserMenu(false)
              auth.signOut()
              nav('/login', { replace: true })
            }}
          >
            <LogOut className="h-4 w-4 opacity-80" />
            <span>退出登录</span>
          </MenuItem>
        </Menu>
      </div>
    </header>
  )
}
