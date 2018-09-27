import { Module, forwardRef } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { HackToken } from './hackToken.entity';
import { HackService } from './hack.service';
import { HackController } from './hack.controller';
import { KbModule } from '../kb/kb.module';
import { ProfileModule } from '../profile/profile.module';

@Module({
  imports: [TypeOrmModule.forFeature([HackToken]), forwardRef(() => ProfileModule), forwardRef(() => KbModule)],
  providers: [HackService],
  controllers: [HackController],
  exports: [HackService],
})
export class HackModule {}