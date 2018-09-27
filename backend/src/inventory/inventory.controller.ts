import { Controller, Get, UseGuards, Request, Post, Body, BadRequestException, Query,
  ForbiddenException } from '@nestjs/common';
import { Logger } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { CitizenGuard } from '../auth/citizen.guard';
import { InventoryService } from './inventory.service';
import { InventoryItem } from './inventory.entity';
import { TransferItem } from '@shared/requests';
import { InventoryItemAmount } from '@shared/responses';
import { EventService } from '../event/event.service';
import { EventType, Role, HackType } from '@shared/enums';
import { HackService } from '../hack/hack.service';
import { User } from '../user/user.entity';

@Controller('inventory')
@UseGuards(AuthGuard('jwt'))
export class InventoryController {
  private readonly logger = new Logger(InventoryController.name);
  constructor(
    private readonly inventoryService: InventoryService,
    private readonly eventService: EventService,
    private readonly hackService: HackService,
  ) {}

  @Get('load')
  async load(@Request() {user}: {user: User}, @Query('userId') userId): Promise<InventoryItem[]> {
    const isMasterOrHacker = user.roles.has(Role.Master) ||
      (user.roles.has(Role.Hacker) && await this.hackService.findActiveToken(user.id, HackType.INVENTORY_VIEW, userId));
    if (userId) {
      if (isMasterOrHacker) userId = parseInt(userId, 10);
      else throw new ForbiddenException();
    }
    const inv = await this.inventoryService.getUserInventory(userId || user.id);
    if (isMasterOrHacker) this.eventService.add(user.id, EventType.INVENTORY_VIEW, {userId});
    return inv;
  }

  @Post('transfer')
  async transfer(
    @Request() {user}: {user: User},
    @Body() data: TransferItem,
    @Query('userId') userId
  ): Promise<InventoryItemAmount> {
    if (!(data.amount > 0)) throw new BadRequestException();

    if (userId) userId = parseInt(userId, 10);
    const mainUserId = userId || user.id;
    const isHacker = (
      user.roles.has(Role.Hacker) &&
      await this.hackService.findActiveToken(user.id, HackType.INVENTORY_EDIT, userId)
    );
    const isMaster = user.roles.has(Role.Master);
    const isMasterOrHacker = isMaster || isHacker;
    if (userId && !isMasterOrHacker) throw new ForbiddenException();

    await this.inventoryService.transferItem(mainUserId, data.userId, data.itemId, data.amount);
    const item = await this.inventoryService.getInventoryItemAmount(mainUserId, data.itemId);
    this.eventService.add(mainUserId, EventType.ITEM_TRANSFER, {
      toUserId: data.userId,
      itemId: data.itemId,
      amount: data.amount,
      amountRemaining: item ? item.amount : 0,
      hacker: isHacker ? user.id : undefined,
      master: isMaster ? user.id : undefined,
    });
    return {
      itemId: data.itemId,
      amount: item ? item.amount : 0,
    };
  }
}
