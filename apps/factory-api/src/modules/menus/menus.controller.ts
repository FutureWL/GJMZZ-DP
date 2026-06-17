import { BadRequestException, Controller, Get, Logger, Req } from '@nestjs/common'
import type { FastifyRequest } from 'fastify'

import { ProfilesService } from '../profiles/profiles.service'
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
  return roles.filter((r): r is string => typeof r === 'string' && r.trim().length > 0)
}

@Controller('menus')
export class MenusController {
  private readonly logger = new Logger(MenusController.name)

  constructor(
    private readonly menus: MenusService,
    private readonly profiles: ProfilesService,
  ) {}

  @Get('me')
  async getMyMenu(@Req() req: RequestWithUser) {
    const userId = req.user?.sub
    if (!userId) {
      throw new BadRequestException('User not identified')
    }

    // 角色来源: 1) JWT realm_access.roles (Keycloak 内置)
    //           2) public.profile.position (业务侧,通过 PUT /profiles/me 设置)
    // 任一存在即生效;profile.position 缺失时仅用 JWT roles
    const jwtRoles = parseRealmRoles(req.user?.realm_access)
    const merged: string[] = [...jwtRoles]
    let profilePosition: string | null = null
    try {
      const profile = await this.profiles.getByUserId(userId)
      if (profile?.position && profile.position.trim().length > 0) {
        profilePosition = profile.position.trim()
        merged.push(profilePosition)
      }
    } catch (e) {
      this.logger.warn(`getMyMenu: profile lookup failed for userId=${userId}: ${(e as Error).message}`)
    }

    const items = await this.menus.listForUser('main', merged)

    return {
      // 元信息(便于前端调试 / 测试断言)
      roles: Array.from(new Set(merged)),
      profilePosition,
      count: items.length,
      items,
    }
  }
}