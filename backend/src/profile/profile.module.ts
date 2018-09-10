import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ProfileController } from './profile.controller';
import { Profile } from './profile.entity';
import { ProfileService } from './profile.service';
import { NewsModule } from '../news/news.module';
import { TransactionModule } from '../transaction/transaction.module';
import { MessageModule } from 'message/message.module';
import { EventModule } from 'event/event.module';

@Module({
  imports: [TypeOrmModule.forFeature([Profile]), NewsModule, TransactionModule, MessageModule, EventModule],
  providers: [ProfileService],
  controllers: [ProfileController],
  exports: [ProfileService],
})
export class ProfileModule {}