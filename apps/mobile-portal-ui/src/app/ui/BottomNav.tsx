import { ClipboardList, Home, Phone, UserRound } from 'lucide-react'
import { NavLink } from 'react-router-dom'

const base =
  'flex flex-1 flex-col items-center justify-center gap-1 rounded-[12px] py-2 text-xs outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-focus)]'

export function BottomNav() {
  return (
    <div className="sticky bottom-0 mt-4 border-t border-[var(--color-border-subtle)] bg-[var(--color-bg-surface)] p-2">
      <div className="mx-auto flex max-w-[520px] items-center gap-2">
        <NavLink
          to="/"
          className={({ isActive }) =>
            `${base} ${isActive ? 'bg-black/5 text-[var(--color-text-primary)] dark:bg-white/5' : 'text-[var(--color-text-tertiary)]'}`
          }
        >
          <Home className="h-4 w-4" />
          首页
        </NavLink>
        <NavLink
          to="/crm"
          className={({ isActive }) =>
            `${base} ${isActive ? 'bg-black/5 text-[var(--color-text-primary)] dark:bg-white/5' : 'text-[var(--color-text-tertiary)]'}`
          }
        >
          <Phone className="h-4 w-4" />
          外勤
        </NavLink>
        <NavLink
          to="/tasks"
          className={({ isActive }) =>
            `${base} ${isActive ? 'bg-black/5 text-[var(--color-text-primary)] dark:bg-white/5' : 'text-[var(--color-text-tertiary)]'}`
          }
        >
          <ClipboardList className="h-4 w-4" />
          任务
        </NavLink>
        <NavLink
          to="/me"
          className={({ isActive }) =>
            `${base} ${isActive ? 'bg-black/5 text-[var(--color-text-primary)] dark:bg-white/5' : 'text-[var(--color-text-tertiary)]'}`
          }
        >
          <UserRound className="h-4 w-4" />
          我的
        </NavLink>
      </div>
    </div>
  )
}
