import { Module, forwardRef } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { InventoryItem } from './inventory.entity';
import { InventoryService } from './inventory.service';
import { InventoryController } from './inventory.controller';
import { EventModule } from '../event/event.module';
import { HackModule } from '../hack/hack.module';

@Module({
  imports: [TypeOrmModule.forFeature([InventoryItem]), EventModule, forwardRef(() => HackModule)],
  providers: [InventoryService],
  controllers: [InventoryController],
  exports: [InventoryService],
})
export class InventoryModule {}
