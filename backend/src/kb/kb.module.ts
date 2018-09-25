import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { KbEntry } from './kbentry.entity';
import { KbServer } from './kbserver.entity';
import { KbService } from './kb.service';
import { KbController } from './kb.controller';
import { EventModule } from 'event/event.module';

@Module({
  imports: [TypeOrmModule.forFeature([KbEntry, KbServer]), EventModule],
  providers: [KbService],
  controllers: [KbController],
  exports: [KbService],
})
export class KbModule {}