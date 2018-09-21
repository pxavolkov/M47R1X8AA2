import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Gift } from './gift.entity';
import { GiftService } from './gift.service';
import { GiftController } from './gift.controller';
import { ProfileModule } from '../profile/profile.module';
import { InventoryModule } from '../inventory/inventory.module';
import { PropertyModule } from '../property/property.module';
import { EventModule } from '../event/event.module';

@Module({
  imports: [TypeOrmModule.forFeature([Gift]), ProfileModule, InventoryModule, PropertyModule, EventModule],
  providers: [GiftService],
  controllers: [GiftController],
  exports: [GiftService],
})
export class GiftModule {}
