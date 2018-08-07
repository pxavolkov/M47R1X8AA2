import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Gift } from './gift.entity';
import { GiftService } from './gift.service';

@Module({
  imports: [TypeOrmModule.forFeature([Gift])],
  providers: [GiftService],
  exports: [GiftService],
})
export class GiftModule {}