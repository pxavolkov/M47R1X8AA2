import { Controller, Get, UseGuards, Request, Post, Body, BadRequestException } from '@nestjs/common';
import { Logger } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { CitizenGuard } from '../auth/citizen.guard';
import { InventoryService } from './inventory.service';
import { InventoryItem } from './inventory.entity';
import { TransferItem } from '@shared/requests';
import { InventoryItemAmount } from '@shared/responses';
import { EventService } from '../event/event.service';
import { EventType } from '@shared/enums';

@Controller('inventory')
export class InventoryController {
  private readonly logger = new Logger(InventoryController.name);
  constructor(
    private readonly inventoryService: InventoryService,
    private readonly eventService: EventService,
  ) {}

  @Get('load')
  @UseGuards(AuthGuard('jwt'), new CitizenGuard())
  async load(@Request() {user}): Promise<InventoryItem[]> {
    return await this.inventoryService.getUserInventory(user.id);
  }

  @Post('transfer')
  @UseGuards(AuthGuard('jwt'))
  async transfer(@Request() {user}, @Body() data: TransferItem): Promise<InventoryItemAmount> {
    if (!(data.amount > 0)) throw new BadRequestException();

    await this.inventoryService.transferItem(user.id, data.userId, data.itemId, data.amount);
    const item = await this.inventoryService.getInventoryItemAmount(user.id, data.itemId);
    this.eventService.add(user, EventType.ITEM_TRANSFER, {
      toUserId: data.userId,
      itemId: data.itemId,
      amount: data.amount,
      amountRemaining: item ? item.amount : 0,
    });
    return {
      itemId: data.itemId,
      amount: item ? item.amount : 0,
    };
  }
}
