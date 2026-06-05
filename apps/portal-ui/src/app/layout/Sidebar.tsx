import clsx from 'clsx'
import { PanelLeft, PanelRight } from 'lucide-react'
import { NavLink } from 'react-router-dom'
import type { PortalConfig } from '../config/portals'

export function Sidebar({
  portal,
  collapsed,
  onToggleCollapsed,
}: {
  portal: PortalConfig
  collapsed: boolean
  onToggleCollapsed: () => void
}) {
  return (
    <aside
      className={clsx(
        'shrink-0 border-r border-[var(--color-border-subtle)] bg-[var(--color-bg-surface)]',
        collapsed ? 'w-[72px]' : 'w-[264px]',
      )}
    >
      <div
        className={clsx(
          'flex h-14 items-center border-b border-[var(--color-border-subtle)]',
          collapsed ? 'justify-center gap-2 px-2' : 'gap-2 px-4',
        )}
        title={collapsed ? `${portal.label}门户` : undefined}
      >
        <div
          className="h-2.5 w-2.5 rounded-full"
          style={{ backgroundColor: `var(${portal.domainColorVar})` }}
        />
        {!collapsed ? (
          <div className="flex flex-1 items-center justify-between gap-2">
            <div className="text-sm font-semibold text-[var(--color-text-primary)]">{portal.label}门户</div>
            <button
              type="button"
              className="inline-flex h-8 w-8 items-center justify-center rounded-[8px] text-[var(--color-text-secondary)] hover:bg-black/5 dark:hover:bg-white/5"
              onClick={onToggleCollapsed}
              aria-label="Collapse sidebar"
              title="折叠侧边栏"
            >
              <PanelLeft className="h-4 w-4" />
            </button>
          </div>
        ) : (
          <button
            type="button"
            className="inline-flex h-9 w-9 items-center justify-center rounded-[10px] text-[var(--color-text-secondary)] hover:bg-black/5 dark:hover:bg-white/5"
            onClick={onToggleCollapsed}
            aria-label="Expand sidebar"
            title="展开侧边栏"
          >
            <PanelRight className="h-4 w-4" />
          </button>
        )}
      </div>
      <div className={clsx('h-[calc(100vh-56px)] overflow-auto py-4', collapsed ? 'px-2' : 'px-3')}>
        <div className="flex flex-col gap-5">
          {portal.sections.map((section) => (
            <div key={section.label}>
              {!collapsed ? (
                <div className="px-2 pb-2 text-xs font-semibold text-[var(--color-text-tertiary)]">
                  {section.label}
                </div>
              ) : null}
              <div className="flex flex-col gap-1">
                {section.items.map((item) => {
                  const Icon = item.icon
                  return (
                    <NavLink
                      key={item.to}
                      to={item.to}
                      title={collapsed ? item.label : undefined}
                      className={({ isActive }) =>
                        clsx(
                          'flex rounded-[8px] text-sm text-[var(--color-text-secondary)] hover:bg-black/5 dark:hover:bg-white/5',
                          collapsed ? 'items-center justify-center px-2 py-2.5' : 'items-center gap-2 px-2 py-2',
                          isActive &&
                            'bg-black/5 text-[var(--color-text-primary)] dark:bg-white/5',
                        )
                      }
                    >
                      {Icon ? <Icon className="h-4 w-4 shrink-0 opacity-80" /> : null}
                      {collapsed ? <span className="sr-only">{item.label}</span> : <span className="truncate">{item.label}</span>}
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
