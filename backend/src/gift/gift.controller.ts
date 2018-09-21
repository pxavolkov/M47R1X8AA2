import { Controller, Get, UseGuards, Request, Post, Body, Query, BadRequestException } from '@nestjs/common';
import { Logger } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { GiftService } from './gift.service';
import { ActivateCode } from '@shared/requests';
import { ActivateResponse } from '@shared/responses';
import { ProfileService } from '../profile/profile.service';
import { InventoryService } from '../inventory/inventory.service';
import { PropertyService } from 'property/property.service';

@Controller('gift')
@UseGuards(AuthGuard('jwt'))
export class GiftController {
  private readonly logger = new Logger(GiftController.name);
  constructor(
    private readonly giftService: GiftService,
    private readonly profileService: ProfileService,
    private readonly inventoryService: InventoryService,
    private readonly propertyService: PropertyService,
  ) {}

  @Get('load')
  async load(@Request() {user}, @Query() {code}): Promise<any> {
    return {
      isCodeValid: await this.giftService.isCodeValid(code),
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

    if (data.creditsBonus) await this.profileService.addMoney(userId, data.creditsBonus);
    if (data.itemId) await this.inventoryService.addItem(userId, data.itemId, data.itemAmount);
    if (data.propertyId) await this.propertyService.setValue(data.propertyId, userId, data.propertyValue);

    await this.giftService.activate(data.id, user.id);

    const response = {};
    for (const key of ['creditsBonus', 'item', 'itemId', 'itemAmount', 'property', 'propertyId', 'propertyValue']) {
      response[key] = data[key];
    }
    return response as ActivateResponse;
  }
}
