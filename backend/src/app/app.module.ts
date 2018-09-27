import * as dotenv from 'dotenv';
dotenv.config();

import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UserModule } from '../user/user.module';
import { AuthModule } from '../auth/auth.module';
import { NewsModule } from '../news/news.module';
import { ProfileService } from '../profile/profile.service';
import { ProfileModule } from '../profile/profile.module';
import { GiftModule } from '../gift/gift.module';
import { TransactionModule } from '../transaction/transaction.module';
import { MasterModule } from '../master/master.module';
import { MessageModule } from '../message/message.module';
import { ItemModule } from '../item/item.module';
import { InventoryModule } from '../inventory/inventory.module';
import { KbModule } from '../kb/kb.module';
import { HackModule } from '../hack/hack.module';

@Module({
  imports: [
    TypeOrmModule.forRoot(),
    UserModule,
    AuthModule,
    NewsModule,
    ProfileModule,
    TransactionModule,
    GiftModule,
    MasterModule,
    MessageModule,
    ItemModule,
    InventoryModule,
    KbModule,
    HackModule,
  ],
  controllers: [AppController],
})
export class AppModule {
  constructor(
    private readonly profileService: ProfileService,
  ) {
    profileService.updateMiningForAll();
  }
}
