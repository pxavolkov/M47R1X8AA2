import { Module, forwardRef } from '@nestjs/common';
import { MasterController } from './master.controller';
import { UserModule } from '../user/user.module';
import { NewsModule } from '../news/news.module';
import { ProfileModule } from '../profile/profile.module';
import { ItemModule } from '../item/item.module';
import { InventoryModule } from '../inventory/inventory.module';
import { MessageModule } from 'message/message.module';

@Module({
  imports: [UserModule, NewsModule, ProfileModule, ItemModule, InventoryModule, MessageModule],
  controllers: [MasterController],
})
export class MasterModule {}