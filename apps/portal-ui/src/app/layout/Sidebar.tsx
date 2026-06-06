import clsx from 'clsx'
import { ChevronDown, ChevronRight, PanelLeft, PanelRight } from 'lucide-react'
import { useEffect, useMemo, useState } from 'react'
import { NavLink, useLocation } from 'react-router-dom'
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
  const loc = useLocation()

  const activeSectionLabels = useMemo(() => {
    const pathname = loc.pathname
    return portal.sections
      .filter((s) => s.items.some((it) => pathname.startsWith(it.to)))
      .map((s) => s.label)
  }, [loc.pathname, portal.sections])

  const [openSections, setOpenSections] = useState<Record<string, boolean>>(() => {
    const next: Record<string, boolean> = {}
    if (activeSectionLabels.length) {
      for (const label of activeSectionLabels) next[label] = true
      return next
    }
    if (portal.sections[0]) next[portal.sections[0].label] = true
    return next
  })

  useEffect(() => {
    if (!activeSectionLabels.length) return
    setOpenSections((prev) => {
      let changed = false
      const next = { ...prev }
      for (const label of activeSectionLabels) {
        if (!next[label]) {
          next[label] = true
          changed = true
        }
      }
      return changed ? next : prev
    })
  }, [activeSectionLabels])

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
        title={collapsed ? portal.label : undefined}
      >
        <div
          className="h-2.5 w-2.5 rounded-full"
          style={{ backgroundColor: `var(${portal.domainColorVar})` }}
        />
        {!collapsed ? (
          <div className="flex flex-1 items-center justify-between gap-2">
            <div className="text-sm font-semibold text-[var(--color-text-primary)]">{portal.label}</div>
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
              {collapsed ? (
                <div className="flex flex-col gap-1">
                  {section.items.map((item) => {
                    const Icon = item.icon
                    return (
                      <NavLink
                        key={item.to}
                        to={item.to}
                        title={item.label}
                        className={({ isActive }) =>
                          clsx(
                            'flex items-center justify-center rounded-[8px] px-2 py-2.5 text-sm text-[var(--color-text-secondary)] hover:bg-black/5 dark:hover:bg-white/5',
                            isActive && 'bg-black/5 text-[var(--color-text-primary)] dark:bg-white/5',
                          )
                        }
                      >
                        {Icon ? <Icon className="h-4 w-4 shrink-0 opacity-80" /> : null}
                        <span className="sr-only">{item.label}</span>
                      </NavLink>
                    )
                  })}
                </div>
              ) : (
                <div>
                  <button
                    type="button"
                    className={clsx(
                      'flex w-full items-center justify-between rounded-[8px] px-2 py-2 text-left text-sm font-semibold text-[var(--color-text-primary)] hover:bg-black/5 dark:hover:bg-white/5',
                      activeSectionLabels.includes(section.label) && 'bg-black/5 dark:bg-white/5',
                    )}
                    onClick={() =>
                      setOpenSections((prev) => ({ ...prev, [section.label]: !prev[section.label] }))
                    }
                    aria-expanded={!!openSections[section.label]}
                  >
                    <span className="truncate">{section.label}</span>
                    {openSections[section.label] ? (
                      <ChevronDown className="h-4 w-4 shrink-0 text-[var(--color-text-tertiary)]" />
                    ) : (
                      <ChevronRight className="h-4 w-4 shrink-0 text-[var(--color-text-tertiary)]" />
                    )}
                  </button>
                  <div
                    className={clsx(
                      'grid transition-[grid-template-rows] duration-200 ease-in-out',
                      openSections[section.label] ? 'grid-rows-[1fr]' : 'grid-rows-[0fr]',
                    )}
                  >
                    <div
                      className={clsx(
                        'overflow-hidden transition-opacity duration-200 ease-in-out',
                        openSections[section.label] ? 'opacity-100' : 'opacity-0',
                      )}
                    >
                      <div className="mt-1 flex flex-col gap-1">
                        {section.items.map((item) => {
                          const Icon = item.icon
                          return (
                            <NavLink
                              key={item.to}
                              to={item.to}
                              className={({ isActive }) =>
                                clsx(
                                  'flex rounded-[8px] text-sm text-[var(--color-text-secondary)] hover:bg-black/5 dark:hover:bg-white/5',
                                  'items-center gap-2 py-2 pl-6 pr-2',
                                  isActive && 'bg-black/5 text-[var(--color-text-primary)] dark:bg-white/5',
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
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </aside>
  )
}
