import { Controller, Get, UseGuards, Request, Post, Body, Query } from '@nestjs/common';
import { Logger } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { CitizenGuard } from '../auth/citizen.guard';
import { PropertyService } from './property.service';
import { EventType } from '@shared/enums';
import { EventService } from '../event/event.service';
import { User } from '../user/user.entity';
import { PropertiesResponse, PublicProfile } from '@shared/responses';
import { ProfileService } from '../profile/profile.service';
import { SetProperty } from '@shared/requests';

@Controller('property')
@UseGuards(AuthGuard('jwt'))
export class PropertyController {
  private readonly logger = new Logger(PropertyController.name);
  constructor(
    private readonly propertyService: PropertyService,
    private readonly profileService: ProfileService,
    private readonly eventService: EventService,
  ) {}

  @Get('load')
  async load(@Request() {user}: {user: User}, @Query('userId') userId): Promise<PropertiesResponse> {
    let profileValues = null;
    if (userId) {
      userId = parseInt(userId, 10);
      profileValues = await this.profileService.getPublicProfile(userId);
    } else {
      userId = user.id;
      profileValues = user.profile;
    }
    const {firstName, lastName, photoUploaded} = profileValues;
    const profile = {id: userId, firstName, lastName, photoUploaded};

    const list = await this.propertyService.getUserValues(userId, user.roles.toNumber(), userId === user.id);
    return {list, profile};
  }

  @Post('updateValue')
  async updateValue(@Request() {user}: {user: User}, @Body() data: SetProperty): Promise<any> {
    data.userId = data.userId || user.id;
    const oldValue = await this.propertyService.getValueById(data.propertyId, data.userId);

    if (oldValue) await this.propertyService.updateValue(data.propertyId, data.userId, data.value);
    else await this.propertyService.addValue(data.propertyId, data.userId, data.value);

    this.eventService.add(user, EventType.VALUE_EDIT, {
      propertyId: data.propertyId,
      userId: data.userId,
      old: {value: oldValue},
      new: {value: data.value},
    });

    return data;
  }
}
