import { Module } from '@nestjs/common'

import { DbModule } from '../db/db.module'
import { FactoriesModule } from '../factories/factories.module'
import { HealthModule } from '../health/health.module'

@Module({
  imports: [DbModule, HealthModule, FactoriesModule],
})
export class AppModule {}

