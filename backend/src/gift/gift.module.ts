import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Gift } from './gift.entity';
import { GiftService } from './gift.service';
import { GiftController } from './gift.controller';
import { ProfileModule } from '../profile/profile.module';
import { InventoryModule } from '../inventory/inventory.module';
import { PropertyModule } from '../property/property.module';

@Module({
  imports: [TypeOrmModule.forFeature([Gift]), ProfileModule, InventoryModule, PropertyModule],
  providers: [GiftService],
  controllers: [GiftController],
  exports: [GiftService],
})
export class GiftModule {}
