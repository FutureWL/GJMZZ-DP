import { Controller, Get, Req } from '@nestjs/common'
import type { FastifyRequest } from 'fastify'

@Controller('me')
export class MeController {
  @Get()
  getMe(@Req() req: FastifyRequest & { user?: unknown }) {
    return { user: req.user ?? null }
  }
}
