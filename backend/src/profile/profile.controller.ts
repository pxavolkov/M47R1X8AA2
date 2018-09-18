import { Controller, Get, Post, UseGuards, UploadedFile, FileInterceptor, Request,
        UseInterceptors, Body, ForbiddenException, BadRequestException} from '@nestjs/common';
import { Logger } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { rename, unlink} from 'fs';
import * as mkdirp from 'mkdirp';
import { ProfileService } from './profile.service';
import { NewsService } from '../news/news.service';
import { ProfileResponse, PublicProfile, StartMiningResponse } from '@shared/responses';
import paths from '../paths';
import { CitizenGuard } from '../auth/citizen.guard';
import { MessageService } from 'message/message.service';
import { TransferMoney } from '@shared/requests';
import { EventService } from '../event/event.service';
import { EventType } from '@shared/enums';
import utils from '../utils';

const objectify = (obj, [k, v]) => ({ ...obj, [k]: v });

@Controller('profile')
export class ProfileController {
  private readonly logger = new Logger(ProfileController.name);
  constructor(
    private readonly profileService: ProfileService,
    private readonly newsService: NewsService,
    private readonly messageService: MessageService,
    private readonly eventService: EventService,
  ) {}

  @Get('load')
  @UseGuards(AuthGuard('jwt'))
  async load(@Request() {user}): Promise<ProfileResponse> {
    const profile = await this.profileService.findByUser(user); // TODO: select only needed columns
    const response = new ProfileResponse();
    response.id = user.id;
    for (const p in response) response[p] = (p in profile ? profile : response)[p];

    response.miningEndTime = profile.miningTime ?
      profile.miningTime.getTime() + parseInt(process.env.MINING_TIME_MS, 10) :
      null;
    response.miningAmount = parseInt(process.env.MINING_AMOUNT, 10);

    response.unreadNews = await this.newsService.unreadNewsCountByUserId(user.id);
    response.unreadMessages = await this.messageService.unreadCountByUserId(user.id);
    response.quentaExists = !!profile.quentaPath;
    return response;
  }

  @Post('uploadPhoto')
  @UseGuards(AuthGuard('jwt'))
  @UseInterceptors(FileInterceptor('photo', {dest: paths.upload}))
  async uploadPhoto(@Request() {user}, @UploadedFile() photo): Promise<'success'> {
    if (!photo) throw new BadRequestException();
    let success = false;

    try {
      const newPath = paths.photo;
      const photoFile = `${newPath}/${user.id}.png`;
      await utils.mkdirp(newPath);

      const eventData = {
        old: {
          size: null,
          hash: null,
        },
        new: {
          size: null,
          hash: null,
        },
      };
      try {
        eventData.old.size = (await utils.stat(photoFile)).size;
        eventData.old.hash = await utils.fileHash(photoFile);
      } catch (err) {}

      await utils.rename(photo.path, photoFile);

      try {
        eventData.new.size = (await utils.stat(photoFile)).size;
        eventData.new.hash = await utils.fileHash(photoFile);
      } catch (err) {}

      await this.profileService.setUploadedPhoto(user.id, true);

      this.eventService.add(user, EventType.PHOTO_UPLOAD, eventData);
      success = true;
      this.logger.log(`Uploaded photo for user ${user.id}!`);
      return 'success';
    } finally {
      if (!success) {
        try {
          await utils.unlink(photo.path);
          this.logger.log(`File removed: photo: ${photo.originalname}`);
        } catch (err) {
          this.logger.error(`Error removing file: photo: ${photo.originalname}: ${err.stack || err.message}`);
        }
      }
    }
  }

  @Post('transfer')
  @UseGuards(AuthGuard('jwt'))
  async transfer(@Request() {user}, @Body() data: TransferMoney): Promise<'success'> {
    if (!(data.amount > 0)) throw new BadRequestException();

    const balance = await this.profileService.getBalance(user.id);
    if (balance >= data.amount) {
      await this.profileService.transfer(user.id, data.userId, data.amount);
      this.eventService.add(user, EventType.MONEY_TRANSFER, {
        toUserId: data.userId,
        balanceBefore: balance,
        amount: data.amount
      });
      return 'success';
    } else throw new ForbiddenException();
  }

  @Get('list')
  @UseGuards(AuthGuard('jwt'))
  async list(@Request() {user}): Promise<PublicProfile[]> {
    const unreadMessages = (await this.messageService.unreadCountByDialogs(user.id))
      .map((v) => [v.fromUserId, v.count])
      .reduce(objectify, {});
    const profiles = (await this.profileService.allPublicExcept(user.id)).map(
      ({userId, firstName, lastName, photoUploaded}) => ({
        id: userId,
        firstName,
        lastName,
        photoUploaded,
        unreadMessages: unreadMessages[userId] || 0,
      }),
    );

    const sorted = profiles.sort((i,j) => {
      if (i.unreadMessages > j.unreadMessages) return -1; 
      if (i.unreadMessages < j.unreadMessages) return 1;
      if (i.firstName.toUpperCase() < j.firstName.toUpperCase()) return -1; 
      if (i.firstName.toUpperCase() > j.firstName.toUpperCase()) return 1;
      if (i.lastName.toUpperCase() < j.lastName.toUpperCase()) return -1; 
      if (i.lastName.toUpperCase() > j.lastName.toUpperCase()) return 1;
      return 0;
    });
    
    return sorted;
  }

  @Post('startMining')
  @UseGuards(AuthGuard('jwt'), new CitizenGuard())
  async startMining(@Request() {user}): Promise<StartMiningResponse> {
    const miningTime = await this.profileService.getMiningTime(user.id);
    if (!miningTime) {
      await this.profileService.startMining(user.id);
      return {
        miningEndTime: Date.now() + parseInt(process.env.MINING_TIME_MS, 10),
        miningAmount: parseInt(process.env.MINING_AMOUNT, 10),
      };
    } else throw new ForbiddenException();
  }
}
