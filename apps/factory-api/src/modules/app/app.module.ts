import { Module } from '@nestjs/common'

import { AuthModule } from '../auth/auth.module'
import { DbModule } from '../db/db.module'
import { FactoriesModule } from '../factories/factories.module'
import { HealthModule } from '../health/health.module'

@Module({
  imports: [AuthModule, DbModule, HealthModule, FactoriesModule],
})
export class AppModule {}
