import { Module } from '@nestjs/common'

import { ProfilesModule } from '../profiles/profiles.module'
import { MenusController } from './menus.controller'
import { MenusService } from './menus.service'

@Module({
  imports: [ProfilesModule],
  controllers: [MenusController],
  providers: [MenusService],
})
export class MenusModule {}

