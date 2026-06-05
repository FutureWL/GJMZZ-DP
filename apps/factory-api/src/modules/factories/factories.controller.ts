import { BadRequestException, Body, Controller, Get, NotFoundException, Param, Post } from '@nestjs/common'

import type { CreateFactoryBody } from './factories.types'
import { FactoriesService } from './factories.service'

function parseCreateFactoryBody(body: unknown): CreateFactoryBody {
  if (!body || typeof body !== 'object') {
    throw new BadRequestException('Invalid body')
  }
  const b = body as Record<string, unknown>
  const code = b.code
  const name = b.name
  if (typeof code !== 'string' || code.trim().length === 0) {
    throw new BadRequestException('code is required')
  }
  if (typeof name !== 'string' || name.trim().length === 0) {
    throw new BadRequestException('name is required')
  }
  return { code: code.trim(), name: name.trim() }
}

@Controller('factories')
export class FactoriesController {
  constructor(private readonly factories: FactoriesService) {}

  @Get()
  async list() {
    return this.factories.list()
  }

  @Get(':code')
  async getByCode(@Param('code') code: string) {
    const row = await this.factories.getByCode(code)
    if (!row) {
      throw new NotFoundException('Factory not found')
    }
    return row
  }

  @Post()
  async create(@Body() body: unknown) {
    const parsed = parseCreateFactoryBody(body)
    return this.factories.create(parsed)
  }
}

