import { BadRequestException, Controller, Get, Req } from '@nestjs/common'
import type { FastifyRequest } from 'fastify'

import { MenusService } from './menus.service'

type RequestWithUser = FastifyRequest & {
  user?: {
    sub?: string
    realm_access?: { roles?: unknown }
  }
}

function parseRealmRoles(value: unknown): string[] {
  if (!value || typeof value !== 'object') return []
  const roles = (value as { roles?: unknown }).roles
  if (!Array.isArray(roles)) return []
  return roles.filter((r): r is string => typeof r === 'string')
}

@Controller('menus')
export class MenusController {
  constructor(private readonly menus: MenusService) {}

  @Get('me')
  async getMyMenu(@Req() req: RequestWithUser) {
    const userId = req.user?.sub
    if (!userId) {
      throw new BadRequestException('User not identified')
    }
    const roles = parseRealmRoles(req.user?.realm_access)
    return this.menus.listForUser('main', roles)
  }
}

