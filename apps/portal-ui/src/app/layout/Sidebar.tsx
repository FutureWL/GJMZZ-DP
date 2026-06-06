import clsx from 'clsx'
import { ChevronDown, ChevronRight, PanelLeft, PanelRight } from 'lucide-react'
import { useEffect, useMemo, useState } from 'react'
import { NavLink, useLocation } from 'react-router-dom'
import type { PortalConfig } from '../config/portals'

function flattenLeafItems(items: PortalConfig['sections'][number]['items']) {
  const out: Array<{ label: string; to: string; icon?: any }> = []
  const walk = (nodes: PortalConfig['sections'][number]['items']) => {
    for (const n of nodes) {
      if (n.children?.length) {
        walk(n.children)
        continue
      }
      if (n.to) out.push({ label: n.label, to: n.to, icon: n.icon })
    }
  }
  walk(items)
  return out
}

function findNodePath(items: PortalConfig['sections'][number]['items'], pathname: string): string[] | null {
  for (const n of items) {
    if (n.children?.length) {
      const child = findNodePath(n.children, pathname)
      if (child) return [n.label, ...child]
      continue
    }
    if (n.to && pathname.startsWith(n.to)) return [n.label]
  }
  return null
}

function makeNodeKey(sectionLabel: string, pathLabels: string[]) {
  return `${sectionLabel}::${pathLabels.join('>')}`
}

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
      .filter((s) => !!findNodePath(s.items, pathname))
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

  const [openChildByParent, setOpenChildByParent] = useState<Record<string, string | null>>(() => {
    const pathname = loc.pathname
    const next: Record<string, string | null> = {}
    for (const section of portal.sections) {
      const path = findNodePath(section.items, pathname)
      if (!path || path.length < 2) continue
      const rootKey = `section:${section.label}`
      for (let i = 0; i < path.length - 1; i++) {
        const parentKey = i === 0 ? rootKey : makeNodeKey(section.label, path.slice(0, i))
        const childKey = makeNodeKey(section.label, path.slice(0, i + 1))
        next[parentKey] = childKey
      }
    }
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

  useEffect(() => {
    const pathname = loc.pathname
    const next: Record<string, string | null> = {}
    for (const section of portal.sections) {
      const path = findNodePath(section.items, pathname)
      if (!path || path.length < 2) continue
      const rootKey = `section:${section.label}`
      for (let i = 0; i < path.length - 1; i++) {
        const parentKey = i === 0 ? rootKey : makeNodeKey(section.label, path.slice(0, i))
        const childKey = makeNodeKey(section.label, path.slice(0, i + 1))
        next[parentKey] = childKey
      }
    }
    setOpenChildByParent((prev) => {
      let changed = false
      const merged = { ...prev }
      for (const [k, v] of Object.entries(next)) {
        if (merged[k] !== v) {
          merged[k] = v
          changed = true
        }
      }
      return changed ? merged : prev
    })
  }, [loc.pathname, portal.sections])

  const renderNodes = (
    sectionLabel: string,
    nodes: PortalConfig['sections'][number]['items'],
    parentKey: string,
    level: number,
    pathLabels: string[],
  ) => {
    return (
      <div className="flex flex-col gap-1">
        {nodes.map((node) => {
          const nodePathLabels = [...pathLabels, node.label]
          const nodeKey = makeNodeKey(sectionLabel, nodePathLabels)
          const isParent = !!node.children?.length
          if (isParent) {
            const isOpen = openChildByParent[parentKey] === nodeKey
            return (
              <div key={nodeKey}>
                <button
                  type="button"
                  className={clsx(
                    'flex w-full items-center justify-between rounded-[8px] py-2 pr-2 text-left hover:bg-black/5 dark:hover:bg-white/5',
                    level === 2
                      ? 'text-sm font-medium text-[var(--color-text-secondary)]'
                      : 'text-sm font-semibold text-[var(--color-text-primary)]',
                    isOpen && 'bg-black/5 dark:bg-white/5',
                  )}
                  style={{ paddingLeft: `${level * 16}px` }}
                  onClick={() =>
                    setOpenChildByParent((prev) => ({
                      ...prev,
                      [parentKey]: prev[parentKey] === nodeKey ? null : nodeKey,
                    }))
                  }
                  aria-expanded={isOpen}
                >
                  <span className="truncate">{node.label}</span>
                  {isOpen ? (
                    <ChevronDown className={clsx('shrink-0 text-[var(--color-text-tertiary)]', level === 2 ? 'h-3.5 w-3.5' : 'h-4 w-4')} />
                  ) : (
                    <ChevronRight className={clsx('shrink-0 text-[var(--color-text-tertiary)]', level === 2 ? 'h-3.5 w-3.5' : 'h-4 w-4')} />
                  )}
                </button>
                <div
                  className={clsx(
                    'grid transition-[grid-template-rows] duration-200 ease-in-out',
                    isOpen ? 'grid-rows-[1fr]' : 'grid-rows-[0fr]',
                  )}
                >
                  <div
                    className={clsx(
                      'overflow-hidden transition-opacity duration-200 ease-in-out',
                      isOpen ? 'opacity-100' : 'opacity-0',
                    )}
                  >
                    {renderNodes(sectionLabel, node.children ?? [], nodeKey, level + 1, nodePathLabels)}
                  </div>
                </div>
              </div>
            )
          }

          if (!node.to) return null
          const Icon = node.icon
          return (
            <NavLink
              key={nodeKey}
              to={node.to}
              className={({ isActive }) =>
                clsx(
                  'flex rounded-[8px] py-2 pr-2 text-sm text-[var(--color-text-secondary)] hover:bg-black/5 dark:hover:bg-white/5',
                  isActive && 'bg-black/5 text-[var(--color-text-primary)] dark:bg-white/5',
                )
              }
              style={{ paddingLeft: `${level * 16}px` }}
            >
              {Icon ? <Icon className="h-4 w-4 shrink-0 opacity-80" /> : null}
              <span className="ml-2 truncate">{node.label}</span>
            </NavLink>
          )
        })}
      </div>
    )
  }

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
                  {flattenLeafItems(section.items).map((item) => {
                    const Icon = item.icon as any
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
                      'flex w-full items-center justify-between rounded-[8px] py-2 pr-2 text-left text-sm font-semibold text-[var(--color-text-primary)] hover:bg-black/5 dark:hover:bg-white/5',
                      activeSectionLabels.includes(section.label) && 'bg-black/5 dark:bg-white/5',
                    )}
                    style={{ paddingLeft: `${16}px` }}
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
                      <div className="mt-1">
                        {renderNodes(section.label, section.items, `section:${section.label}`, 2, [])}
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
