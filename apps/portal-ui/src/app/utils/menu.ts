import type { ComponentType } from 'react'
import type { ApiMenuItem } from '../api/menus'
import type { MenuNode } from '../config/portals'

type IconGetter = (iconName: string | null | undefined) => ComponentType<{ className?: string }> | undefined

export function buildMenuTree(items: ApiMenuItem[], getIcon: IconGetter): MenuNode[] {
  const byParent = new Map<string | null, ApiMenuItem[]>()
  for (const item of items) {
    const list = byParent.get(item.parentId) ?? []
    list.push(item)
    byParent.set(item.parentId, list)
  }

  for (const list of byParent.values()) {
    list.sort((a, b) => {
      const sa = typeof a.sortOrder === 'number' ? a.sortOrder : 0
      const sb = typeof b.sortOrder === 'number' ? b.sortOrder : 0
      if (sa !== sb) return sa - sb
      return a.label.localeCompare(b.label, 'zh-CN')
    })
  }

  const build = (parentId: string | null): MenuNode[] => {
    const list = byParent.get(parentId) ?? []
    return list.map((item) => {
      const children = build(item.id)
      const to = item.path ?? undefined
      return {
        id: item.id,
        label: item.label,
        to,
        icon: to ? getIcon(item.iconName) : undefined,
        children: children.length ? children : undefined,
      }
    })
  }

  return build(null)
}

