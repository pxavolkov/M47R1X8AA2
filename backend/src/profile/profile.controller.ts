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
import { CitizenGuard } from 'auth/citizen.guard';

@Controller('profile')
export class ProfileController {
  private readonly logger = new Logger(ProfileController.name);
  constructor(
    private readonly profileService: ProfileService,
    private readonly newsService: NewsService,
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
      await new Promise((resolve, reject) => mkdirp(newPath, (err) => !err ? resolve() : reject(err)));
      await new Promise((resolve, reject) => {
        rename(photo.path, `${newPath}/${user.id}.png`, (err) => !err ? resolve() : reject(err));
      });

      this.profileService.setUploadedPhoto(user.id, true);

      success = true;
      this.logger.log(`Uploaded photo for user ${user.id}!`);
      return 'success';
    } finally {
      if (!success) {
        unlink(photo.path, (err) => {
          if (!err) this.logger.log(`File removed: photo: ${photo.originalname}`);
          else this.logger.error(`Error removing file: photo: ${photo.originalname}: ${err.stack || err.message}`);
        });
      }
    }
  }

  @Post('transfer')
  @UseGuards(AuthGuard('jwt'))
  async transfer(@Request() {user}, @Body() data): Promise<'success'> {
    const amount = parseInt(data.amount, 10);
    if (!(amount > 0)) throw new BadRequestException();

    const balance = await this.profileService.getBalance(user.id);
    if (balance >= amount) {
      await this.profileService.transfer(user.id, data.userId, amount);
      return 'success';
    } else throw new ForbiddenException();
  }

  @Get('list')
  @UseGuards(AuthGuard('jwt'))
  async list(@Request() {user}): Promise<PublicProfile[]> {
    return (await this.profileService.allPublicExcept(user.id)).map(
      ({userId, firstName, lastName, photoUploaded}) => ({
        id: userId,
        firstName,
        lastName,
        photoUploaded,
      }),
    );
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
