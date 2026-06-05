import { NavLink, Outlet } from 'react-router-dom'
import { TopBar } from '../../layout/TopBar'
import clsx from 'clsx'
import { Footer } from '../../ui/Footer'

const items = [
  { to: '/account/profile', label: '个人信息' },
  { to: '/account/security', label: '安全设置' },
  { to: '/account/roles', label: '角色与权限' },
  { to: '/account/sessions', label: '最近登录' },
]

export function AccountLayout() {
  return (
    <div className="flex h-screen flex-col">
      <TopBar />
      <div className="min-h-0 flex-1 overflow-auto bg-[var(--color-bg-page)]">
        <div className="mx-auto max-w-[1200px] p-4">
          <div className="grid grid-cols-1 gap-4 lg:grid-cols-4">
            <aside className="lg:col-span-1">
              <div className="rounded-[12px] border border-[var(--color-border-subtle)] bg-[var(--color-bg-surface)] p-2 shadow-[var(--shadow-1)]">
                {items.map((it) => (
                  <NavLink
                    key={it.to}
                    to={it.to}
                    className={({ isActive }) =>
                      clsx(
                        'block rounded-[10px] px-3 py-2 text-sm text-[var(--color-text-secondary)] hover:bg-black/5 dark:hover:bg-white/5',
                        isActive && 'bg-black/5 font-medium text-[var(--color-text-primary)] dark:bg-white/5',
                      )
                    }
                  >
                    {it.label}
                  </NavLink>
                ))}
              </div>
            </aside>
            <section className="lg:col-span-3">
              <Outlet />
            </section>
          </div>
          <Footer />
        </div>
      </div>
    </div>
  )
}
