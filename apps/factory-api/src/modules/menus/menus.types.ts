export type ApiMenuItem = {
  id: string
  portalId: string
  parentId: string | null
  label: string
  path: string | null
  iconName: string | null
  sortOrder: number
  requiredRoles: string[]
}

