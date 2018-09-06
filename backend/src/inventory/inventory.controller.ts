import { Controller, Get, UseGuards, Request } from '@nestjs/common';
import { Logger } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { CitizenGuard } from '../auth/citizen.guard';
import { InventoryService } from './inventory.service';
import { InventoryItem } from './inventory.entity';

@Controller('inventory')
export class InventoryController {
  private readonly logger = new Logger(InventoryController.name);
  constructor(
    private readonly inventoryService: InventoryService,
  ) {}

  @Get('load')
  @UseGuards(AuthGuard('jwt'), new CitizenGuard())
  async load(@Request() {user}): Promise<InventoryItem[]> {
    return await this.inventoryService.getUserInventory(user.id);
  }
}
