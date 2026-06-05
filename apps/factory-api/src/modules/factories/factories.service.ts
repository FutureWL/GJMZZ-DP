import { Injectable } from '@nestjs/common'

import { DbService } from '../db/db.service'
import type { CreateFactoryBody, FactoryRow } from './factories.types'

@Injectable()
export class FactoriesService {
  constructor(private readonly db: DbService) {}

  async list(): Promise<FactoryRow[]> {
    const res = await this.db.query<FactoryRow>(
      'select id, code, name, created_at from public.factory order by id asc',
    )
    return res.rows
  }

  async getByCode(code: string): Promise<FactoryRow | null> {
    const res = await this.db.query<FactoryRow>(
      'select id, code, name, created_at from public.factory where code = $1 limit 1',
      [code],
    )
    return res.rows[0] ?? null
  }

  async create(body: CreateFactoryBody): Promise<FactoryRow> {
    const res = await this.db.query<FactoryRow>(
      'insert into public.factory (code, name) values ($1, $2) returning id, code, name, created_at',
      [body.code, body.name],
    )
    const row = res.rows[0]
    if (!row) {
      throw new Error('Insert failed')
    }
    return row
  }
}

