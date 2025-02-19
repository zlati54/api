import { forwardRef, Module } from '@nestjs/common'
import { ConfigService } from '@nestjs/config'
import { PersonService } from '../person/person.service'
import { PrismaService } from '../prisma/prisma.service'
import { VaultModule } from '../vault/vault.module'
import { VaultService } from '../vault/vault.service'
import { CampaignTypeController } from './campaign-type.controller'
import { CampaignController } from './campaign.controller'
import { CampaignService } from './campaign.service'
import { NotificationModule } from '../sockets/notifications/notification.module'
import { CampaignNewsModule } from '../campaign-news/campaign-news.module'
@Module({
  imports: [forwardRef(() => VaultModule), NotificationModule, CampaignNewsModule],

  controllers: [CampaignController, CampaignTypeController],
  providers: [CampaignService, PrismaService, VaultService, PersonService, ConfigService],


  exports: [CampaignService],
})
export class CampaignModule {}
