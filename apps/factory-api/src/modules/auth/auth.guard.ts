import { Injectable, type CanActivate, type ExecutionContext, UnauthorizedException } from '@nestjs/common'
import { Reflector } from '@nestjs/core'
import type { FastifyRequest } from 'fastify'

import { IS_PUBLIC_KEY } from './public.decorator'
import { AuthService } from './auth.service'

type RequestWithUser = FastifyRequest & { user?: unknown }

@Injectable()
export class AuthGuard implements CanActivate {
  constructor(
    private readonly reflector: Reflector,
    private readonly auth: AuthService,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    if (!this.auth.enabled) return true

    const req = context.switchToHttp().getRequest<RequestWithUser>()
    const url = req.url ?? ''
    if (url.startsWith('/docs') || url.startsWith('/docs-json')) return true

    const isPublic = this.reflector.getAllAndOverride<boolean>(IS_PUBLIC_KEY, [
      context.getHandler(),
      context.getClass(),
    ])
    if (isPublic) return true

    const authHeader = req.headers['authorization']
    if (typeof authHeader !== 'string' || !authHeader.startsWith('Bearer ')) {
      throw new UnauthorizedException('Missing bearer token')
    }

    const token = authHeader.slice('Bearer '.length).trim()
    if (!token) {
      throw new UnauthorizedException('Missing bearer token')
    }

    try {
      const payload = await this.auth.verifyAccessToken(token)
      req.user = payload
      return true
    } catch {
      throw new UnauthorizedException('Invalid token')
    }
  }
}
