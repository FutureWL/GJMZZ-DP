import clsx from 'clsx'
import { NavLink } from 'react-router-dom'
import type { PortalConfig } from '../config/portals'

export function Sidebar({ portal }: { portal: PortalConfig }) {
  return (
    <aside className="w-[264px] shrink-0 border-r border-[var(--color-border-subtle)] bg-[var(--color-bg-surface)]">
      <div className="flex h-14 items-center gap-2 border-b border-[var(--color-border-subtle)] px-4">
        <div
          className="h-2.5 w-2.5 rounded-full"
          style={{ backgroundColor: `var(${portal.domainColorVar})` }}
        />
        <div className="text-sm font-semibold text-[var(--color-text-primary)]">{portal.label}门户</div>
      </div>
      <div className="h-[calc(100vh-56px)] overflow-auto px-3 py-4">
        <div className="flex flex-col gap-5">
          {portal.sections.map((section) => (
            <div key={section.label}>
              <div className="px-2 pb-2 text-xs font-semibold text-[var(--color-text-tertiary)]">
                {section.label}
              </div>
              <div className="flex flex-col gap-1">
                {section.items.map((item) => {
                  const Icon = item.icon
                  return (
                    <NavLink
                      key={item.to}
                      to={item.to}
                      className={({ isActive }) =>
                        clsx(
                          'flex items-center gap-2 rounded-[8px] px-2 py-2 text-sm text-[var(--color-text-secondary)] hover:bg-black/5 dark:hover:bg-white/5',
                          isActive &&
                            'bg-black/5 text-[var(--color-text-primary)] dark:bg-white/5',
                        )
                      }
                    >
                      {Icon ? <Icon className="h-4 w-4 shrink-0 opacity-80" /> : null}
                      <span className="truncate">{item.label}</span>
                    </NavLink>
                  )
                })}
              </div>
            </div>
          ))}
        </div>
      </div>
    </aside>
  )
}
