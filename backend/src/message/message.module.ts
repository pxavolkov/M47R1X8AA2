import { Module, forwardRef } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Message } from './message.entity';
import { ProfileModule } from '../profile/profile.module';
import { MessageService } from './message.service';
import { MessageGateway } from './message.gateway';
import { AuthModule } from '../auth/auth.module';
import { HackModule } from '../hack/hack.module';
import { EventModule } from '../event/event.module';

@Module({
  imports: [TypeOrmModule.forFeature([Message]), forwardRef(() => ProfileModule), forwardRef(() => AuthModule),
    HackModule, EventModule],
  providers: [MessageService, MessageGateway],
  exports: [MessageService],
})
export class MessageModule {}