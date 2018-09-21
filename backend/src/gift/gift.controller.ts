import { Controller, Get, UseGuards, Request, Post, Body, Query, BadRequestException } from '@nestjs/common';
import { Logger } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { GiftService } from './gift.service';
import { ActivateCode } from '@shared/requests';
import { ActivateResponse } from '@shared/responses';
import { ProfileService } from '../profile/profile.service';
import { InventoryService } from '../inventory/inventory.service';
import { PropertyService } from 'property/property.service';
import { EventService } from 'event/event.service';
import { EventType } from '@shared/enums';

@Controller('gift')
@UseGuards(AuthGuard('jwt'))
export class GiftController {
  private readonly logger = new Logger(GiftController.name);
  constructor(
    private readonly giftService: GiftService,
    private readonly profileService: ProfileService,
    private readonly inventoryService: InventoryService,
    private readonly propertyService: PropertyService,
    private readonly eventService: EventService,
  ) {}

  @Get('load')
  async load(@Request() {user}, @Query() {code}): Promise<any> {
    const isCodeValid = await this.giftService.isCodeValid(code);
    this.eventService.add(user.id, EventType.GIFT_CHECK, {code});
    return {
      isCodeValid,
      profile: {
        id: user.id,
        firstName: user.profile.firstName,
        lastName: user.profile.lastName,
        photoUploaded: user.profile.photoUploaded,
      },
    };
  }

  @Post('activate')
  async activate(@Request() {user}, @Body() {userId, code}: ActivateCode): Promise<ActivateResponse> {
    if (userId !== user.id) throw new BadRequestException();

    const data = await this.giftService.getGift(code);

    if (data.usedUserId) throw new BadRequestException();

    if (data.creditsBonus) {
      await this.profileService.addMoney(userId, data.creditsBonus);
      this.eventService.add(user.id, EventType.GIFT_CREDITS, {id: data.id, userId, creditsBonus: data.creditsBonus});
    }
    if (data.itemId) {
      await this.inventoryService.addItem(userId, data.itemId, data.itemAmount);
      this.eventService.add(
        user.id,
        EventType.GIFT_ITEM,
        {id: data.id, userId, itemId: data.itemId, itemAmount: data.itemAmount}
      );
    }
    if (data.propertyId) {
      await this.propertyService.setValue(data.propertyId, userId, data.propertyValue);
      this.eventService.add(
        user.id,
        EventType.GIFT_PROPERTY,
        {id: data.id, userId, propertyId: data.propertyId, propertyValue: data.propertyValue}
      );
    }

    await this.giftService.activate(data.id, user.id);
    this.eventService.add(user.id, EventType.GIFT_ACTIVATE, {id: data.id, userId});

    const response = {};
    for (const key of ['creditsBonus', 'item', 'itemId', 'itemAmount', 'property', 'propertyId', 'propertyValue']) {
      response[key] = data[key];
    }
    return response as ActivateResponse;
  }
}
