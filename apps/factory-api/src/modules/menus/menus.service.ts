import { Injectable } from '@nestjs/common'

import { DbService } from '../db/db.service'
import type { ApiMenuItem } from './menus.types'

type MenuItemRow = {
  id: string
  portal_id: string
  parent_id: string | null
  label: string
  path: string | null
  icon_name: string | null
  sort_order: number | null
  required_roles: string[] | null
}

@Injectable()
export class MenusService {
  constructor(private readonly db: DbService) {}

  async listForUser(portalId: string, roles: string[]): Promise<ApiMenuItem[]> {
    const safeRoles = roles.filter((r) => typeof r === 'string' && r.trim().length > 0)
    const sql = `
      select
        id,
        portal_id,
        parent_id,
        label,
        path,
        icon_name,
        sort_order,
        required_roles
      from public.menu_item
      where
        enabled = true
        and portal_id = $1
        and (
          required_roles is null
          or cardinality(required_roles) = 0
          or required_roles && $2::text[]
        )
      order by sort_order asc, label asc
    `
    const result = await this.db.query<MenuItemRow>(sql, [portalId, safeRoles])

    return result.rows.map((r) => ({
      id: r.id,
      portalId: r.portal_id,
      parentId: r.parent_id,
      label: r.label,
      path: r.path,
      iconName: r.icon_name,
      sortOrder: r.sort_order ?? 0,
      requiredRoles: Array.isArray(r.required_roles) ? r.required_roles : [],
    }))
  }
}

