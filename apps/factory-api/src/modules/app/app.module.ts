import { Module } from '@nestjs/common'

import { AuthModule } from '../auth/auth.module'
import { DbModule } from '../db/db.module'
import { FactoriesModule } from '../factories/factories.module'
import { HealthModule } from '../health/health.module'
import { IncidentsModule } from '../incidents/incidents.module'
import { PrismaModule } from '../prisma/prisma.module'
import { ProfilesModule } from '../profiles/profiles.module'

@Module({
  imports: [AuthModule, DbModule, PrismaModule, HealthModule, FactoriesModule, ProfilesModule, IncidentsModule],
})
export class AppModule {}
