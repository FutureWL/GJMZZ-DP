import { LogOut, Maximize, Minimize, Moon, Settings, Shield, Search, Sun, User } from 'lucide-react'
import { useEffect, useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import type { OrgScope } from '../types'
import { useOrgScope } from '../state/useOrgScope'
import { useAuth } from '../state/auth/useAuth'
import { useTheme } from '../state/useTheme'
import { useTimeRange, type TimeRange } from '../state/useTimeRange'
import { Input } from '../ui/Input'
import { Avatar } from '../ui/Avatar'
import { Menu, MenuItem } from '../ui/Menu'
import { Select } from '../ui/Select'
import { ProductMark } from '../ui/ProductMark'

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

  const fullscreenSupported = useMemo(() => {
    if (typeof document === 'undefined') return false
    // 全屏 API 在不同浏览器使用不同前缀(webkit/ms)
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const el = document.documentElement as any
    const request = el?.requestFullscreen ?? el?.webkitRequestFullscreen ?? el?.msRequestFullscreen
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const exit = (document as any).exitFullscreen ?? (document as any).webkitExitFullscreen ?? (document as any).msExitFullscreen
    return !!request && !!exit
  }, [])

  useEffect(() => {
    if (typeof document === 'undefined') return

    const getIsFs = () => {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const d = document as any
      return !!(d.fullscreenElement ?? d.webkitFullscreenElement ?? d.msFullscreenElement)
    }

    // 初始同步(仅 mount 时 set 一次,不会有级联渲染)
    setIsFullscreen(getIsFs())
    const onChange = () => setIsFullscreen(getIsFs())

    document.addEventListener('fullscreenchange', onChange)
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    document.addEventListener('webkitfullscreenchange' as any, onChange)
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    document.addEventListener('msfullscreenchange' as any, onChange)
    return () => {
      document.removeEventListener('fullscreenchange', onChange)
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      document.removeEventListener('webkitfullscreenchange' as any, onChange)
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      document.removeEventListener('msfullscreenchange' as any, onChange)
    }
  }, [])

  const toggleFullscreen = async () => {
    if (typeof document === 'undefined') return

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const d = document as any
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
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
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const d2 = document as any
      setIsFullscreen(!!(d2.fullscreenElement ?? d2.webkitFullscreenElement ?? d2.msFullscreenElement))
    }
  }

  return (
    <header className="flex h-14 items-center gap-3 border-b border-[var(--color-border-subtle)] bg-[var(--color-bg-surface)] px-4">
      <ProductMark />
      <div className="flex items-center gap-2">
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
        <div className="relative w-full max-w-[560px]" title="搜索服务后端联调中">
          <Search className="pointer-events-none absolute left-3 top-2.5 h-4 w-4 text-[var(--color-text-tertiary)]" />
          <Input
            className="pl-9"
            placeholder="🔍 全局搜索功能开发中，敬请期待..."
            value={q}
            onChange={(e) => setQ(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter') nav(`/search?q=${encodeURIComponent(q)}`)
            }}
            disabled
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
