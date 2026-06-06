import { BadRequestException, Body, Controller, Get, Put, Req } from '@nestjs/common'
import type { FastifyRequest } from 'fastify'

import type { UpdateProfileBody } from './profiles.types'
import { ProfilesService } from './profiles.service'

type RequestWithUser = FastifyRequest & { user?: { sub?: string } }

function parseUpdateProfileBody(body: unknown): UpdateProfileBody {
  if (!body || typeof body !== 'object') {
    throw new BadRequestException('Invalid body')
  }
  const b = body as Record<string, unknown>
  const result: UpdateProfileBody = {}
  if (typeof b.name === 'string') result.name = b.name.trim()
  if (typeof b.employee_id === 'string') result.employee_id = b.employee_id.trim()
  if (typeof b.department === 'string') result.department = b.department.trim()
  if (typeof b.position === 'string') result.position = b.position.trim()
  if (typeof b.phone === 'string') result.phone = b.phone.trim()
  if (typeof b.email === 'string') result.email = b.email.trim()
  if (typeof b.avatar_text === 'string') result.avatar_text = b.avatar_text.trim()
  return result
}

@Controller('profiles')
export class ProfilesController {
  constructor(private readonly profiles: ProfilesService) {}

  @Get('me')
  async getMe(@Req() req: RequestWithUser) {
    const userId = req.user?.sub
    if (!userId) {
      throw new BadRequestException('User not identified')
    }
    const row = await this.profiles.getByUserId(userId)
    return row ?? null
  }

  @Put('me')
  async updateMe(@Req() req: RequestWithUser, @Body() body: unknown) {
    const userId = req.user?.sub
    if (!userId) {
      throw new BadRequestException('User not identified')
    }
    const parsed = parseUpdateProfileBody(body)
    return this.profiles.upsert(userId, parsed)
  }
}
