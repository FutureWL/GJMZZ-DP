import clsx from 'clsx'
import { ChevronDown, ChevronRight, PanelLeft, PanelRight } from 'lucide-react'
import { useEffect, useMemo, useState } from 'react'
import { NavLink, useLocation } from 'react-router-dom'
import type { MenuNode, PortalConfig } from '../config/portals'
import { useUserMenu } from '../state/useUserMenu'

type LeafItem = { id: string; label: string; to: string; icon?: any }

function flattenLeafItems(nodes: MenuNode[]): LeafItem[] {
  const out: LeafItem[] = []
  const walk = (list: MenuNode[]) => {
    for (const n of list) {
      if (n.children?.length) {
        walk(n.children)
        continue
      }
      if (n.to) out.push({ id: n.id, label: n.label, to: n.to, icon: n.icon })
    }
  }
  walk(nodes)
  return out
}

function findPath(nodes: MenuNode[], pathname: string): string[] | null {
  for (const n of nodes) {
    if (n.children?.length) {
      const child = findPath(n.children, pathname)
      if (child) return [n.id, ...child]
      continue
    }
    if (n.to && pathname.startsWith(n.to)) return [n.id]
  }
  return null
}

function SidebarSkeleton({ collapsed }: { collapsed: boolean }) {
  if (collapsed) {
    return (
      <div className="flex flex-col gap-2 px-2 py-4">
        {Array.from({ length: 10 }).map((_, i) => (
          <div key={i} className="flex items-center justify-center">
            <div className="h-9 w-9 animate-pulse rounded-[10px] bg-black/10 dark:bg-white/10" />
          </div>
        ))}
      </div>
    )
  }

  return (
    <div className="px-3 py-4">
      <div className="animate-pulse space-y-3">
        {Array.from({ length: 12 }).map((_, i) => (
          <div key={i} className="h-9 rounded-[8px] bg-black/10 dark:bg-white/10" />
        ))}
      </div>
    </div>
  )
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
  const userMenu = useUserMenu()
  const menu = userMenu.data

  const activePath = useMemo(() => findPath(menu, loc.pathname) ?? [], [menu, loc.pathname])
  const activeRootId = activePath[0]

  const [openRoots, setOpenRoots] = useState<Record<string, boolean>>({})

  const [openChildByParent, setOpenChildByParent] = useState<Record<string, string | null>>({})

  useEffect(() => {
    if (menu.length === 0) return
    setOpenRoots((prev) => {
      if (activeRootId) {
        if (prev[activeRootId]) return prev
        return { ...prev, [activeRootId]: true }
      }
      if (Object.keys(prev).length > 0) return prev
      const first = menu[0]?.id
      if (!first) return prev
      return { [first]: true }
    })
  }, [activeRootId, menu])

  useEffect(() => {
    if (activePath.length < 2) return
    setOpenChildByParent((prev) => {
      let changed = false
      const next = { ...prev }
      for (let i = 0; i < activePath.length - 1; i++) {
        const parentId = activePath[i]
        const childId = activePath[i + 1]
        if (next[parentId] !== childId) {
          next[parentId] = childId
          changed = true
        }
      }
      return changed ? next : prev
    })
  }, [activePath])

  const renderNodes = (nodes: MenuNode[], level: number, parentId: string) => {
    return (
      <div className="flex flex-col gap-1">
        {nodes.map((node) => {
          const isParent = !!node.children?.length
          const isInActivePath = activePath.includes(node.id)
          const paddingLeft = `${level * 16}px`

          if (isParent) {
            const isOpen = level === 1 ? !!openRoots[node.id] : openChildByParent[parentId] === node.id
            const chevronSize = level === 2 ? 'h-3.5 w-3.5' : 'h-4 w-4'

            return (
              <div key={node.id}>
                <button
                  type="button"
                  className={clsx(
                    'flex w-full items-center justify-between rounded-[8px] py-2 pr-2 text-left hover:bg-black/5 dark:hover:bg-white/5',
                    level === 1
                      ? 'text-sm font-semibold text-[var(--color-text-primary)]'
                      : 'text-sm font-medium text-[var(--color-text-secondary)]',
                    isInActivePath && 'bg-black/5 dark:bg-white/5',
                  )}
                  style={{ paddingLeft }}
                  onClick={() => {
                    if (level === 1) {
                      setOpenRoots((prev) => ({ ...prev, [node.id]: !prev[node.id] }))
                      return
                    }
                    setOpenChildByParent((prev) => ({
                      ...prev,
                      [parentId]: prev[parentId] === node.id ? null : node.id,
                    }))
                  }}
                  aria-expanded={isOpen}
                >
                  <span className="truncate">{node.label}</span>
                  {isOpen ? (
                    <ChevronDown className={clsx('shrink-0 text-[var(--color-text-tertiary)]', chevronSize)} />
                  ) : (
                    <ChevronRight className={clsx('shrink-0 text-[var(--color-text-tertiary)]', chevronSize)} />
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
                    <div className="mt-1">{renderNodes(node.children ?? [], level + 1, node.id)}</div>
                  </div>
                </div>
              </div>
            )
          }

          if (!node.to) {
            return (
              <div
                key={node.id}
                className={clsx(
                  'flex rounded-[8px] py-2 pr-2 text-sm text-[var(--color-text-tertiary)]',
                  isInActivePath && 'bg-black/5 dark:bg-white/5',
                )}
                style={{ paddingLeft }}
              >
                <span className="truncate">{node.label}</span>
              </div>
            )
          }
          const Icon = node.icon
          return (
            <NavLink
              key={node.id}
              to={node.to}
              className={({ isActive }) =>
                clsx(
                  'flex rounded-[8px] py-2 pr-2 text-sm text-[var(--color-text-secondary)] hover:bg-black/5 dark:hover:bg-white/5',
                  isActive && 'bg-black/5 text-[var(--color-text-primary)] dark:bg-white/5',
                )
              }
              style={{ paddingLeft }}
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
      <div className={clsx('no-scrollbar h-[calc(100vh-56px)] overflow-auto py-4', collapsed ? 'px-2' : 'px-3')}>
        {userMenu.loading ? (
          <SidebarSkeleton collapsed={collapsed} />
        ) : userMenu.error ? (
          collapsed ? (
            <div className="px-2 py-4">
              <button
                type="button"
                className="flex w-full items-center justify-center rounded-[10px] bg-black/5 py-2 text-sm text-[var(--color-text-secondary)] hover:bg-black/10 dark:bg-white/5 dark:hover:bg-white/10"
                onClick={userMenu.reload}
                title="菜单加载失败，点击重试"
              >
                重试
              </button>
            </div>
          ) : (
            <div className="px-3 py-4">
              <div className="rounded-[10px] border border-[var(--color-border-subtle)] bg-black/5 p-3 text-sm dark:bg-white/5">
                <div className="text-[var(--color-text-secondary)]">菜单加载失败</div>
                <button
                  type="button"
                  className="mt-2 inline-flex items-center rounded-[8px] bg-black/10 px-3 py-1.5 text-sm text-[var(--color-text-primary)] hover:bg-black/15 dark:bg-white/10 dark:hover:bg-white/15"
                  onClick={userMenu.reload}
                >
                  点击重试
                </button>
              </div>
            </div>
          )
        ) : menu.length === 0 ? (
          collapsed ? null : (
            <div className="px-3 py-4 text-sm text-[var(--color-text-secondary)]">暂无可用菜单</div>
          )
        ) : collapsed ? (
          <div className="flex flex-col gap-1">
            {flattenLeafItems(menu).map((item) => {
              const Icon = item.icon as any
              return (
                <NavLink
                  key={item.id}
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
          <div className="flex flex-col gap-4">{renderNodes(menu, 1, 'root')}</div>
        )}
      </div>
    </aside>
  )
}
