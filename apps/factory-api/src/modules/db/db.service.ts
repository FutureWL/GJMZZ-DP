import { Injectable, OnModuleDestroy, OnModuleInit } from '@nestjs/common'
import { Pool, type QueryResultRow } from 'pg'

type QueryResult<T extends QueryResultRow> = {
  rowCount: number | null
  rows: T[]
}

@Injectable()
export class DbService implements OnModuleInit, OnModuleDestroy {
  private pool!: Pool

  onModuleInit() {
    const connectionString = process.env.DATABASE_URL
    if (!connectionString) {
      throw new Error('DATABASE_URL is required')
    }

    this.pool = new Pool({ connectionString })
  }

  async onModuleDestroy() {
    if (this.pool) {
      await this.pool.end()
    }
  }

  async query<T extends QueryResultRow>(text: string, values?: unknown[]): Promise<QueryResult<T>> {
    const res = await this.pool.query<T>(text, values)
    return { rowCount: res.rowCount, rows: res.rows }
  }
}

