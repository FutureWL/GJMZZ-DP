import { Injectable } from '@nestjs/common'

import { DbService } from '../db/db.service'
import type { ProfileRow, UpdateProfileBody } from './profiles.types'

@Injectable()
export class ProfilesService {
  constructor(private readonly db: DbService) {}

  async getByUserId(userId: string): Promise<ProfileRow | null> {
    const res = await this.db.query<ProfileRow>(
      'select user_id, name, employee_id, department, position, phone, email, avatar_text, updated_at from public.profile where user_id = $1 limit 1',
      [userId],
    )
    return res.rows[0] ?? null
  }

  async upsert(userId: string, body: UpdateProfileBody): Promise<ProfileRow> {
    const res = await this.db.query<ProfileRow>(
      `insert into public.profile (user_id, name, employee_id, department, position, phone, email, avatar_text)
       values ($1, $2, $3, $4, $5, $6, $7, $8)
       on conflict (user_id) do update set
         name        = coalesce($2, public.profile.name),
         employee_id = coalesce($3, public.profile.employee_id),
         department  = coalesce($4, public.profile.department),
         position    = coalesce($5, public.profile.position),
         phone       = coalesce($6, public.profile.phone),
         email       = coalesce($7, public.profile.email),
         avatar_text = coalesce($8, public.profile.avatar_text),
         updated_at  = now()
       returning user_id, name, employee_id, department, position, phone, email, avatar_text, updated_at`,
      [
        userId,
        body.name ?? null,
        body.employee_id ?? null,
        body.department ?? null,
        body.position ?? null,
        body.phone ?? null,
        body.email ?? null,
        body.avatar_text ?? null,
      ],
    )
    const row = res.rows[0]
    if (!row) {
      throw new Error('Upsert failed')
    }
    return row
  }
}
