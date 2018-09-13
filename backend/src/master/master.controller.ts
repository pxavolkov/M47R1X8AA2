import { Controller, Get, UseGuards, Body, Post, UseInterceptors, FileInterceptor, UploadedFile, BadRequestException,
  UnprocessableEntityException, InternalServerErrorException } from '@nestjs/common';
import { Logger } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { RolesGuard } from '../auth/roles.guard';
import { Role } from '../user/roles';
import { UserService } from '../user/user.service';
import { User } from '../user/user.entity';
import { NewsService } from '../news/news.service';
import { ProfileService } from '../profile/profile.service';
import { News } from '../news/news.entity';
import paths from '../paths';
import { SetBalance, SetCitizen, UploadQuenta } from '@shared/master';
import { unlink, rename } from 'fs';
import * as mkdirp from 'mkdirp';

@Controller('master')
@UseGuards(AuthGuard('jwt'), new RolesGuard(Role.Master))
export class MasterController {
  private readonly logger = new Logger(MasterController.name);
  constructor(
    private readonly userService: UserService,
    private readonly newsService: NewsService,
    private readonly profileService: ProfileService,
  ) {}

  @Get('users')
  async users(): Promise<User[]> {
    return this.userService.findAllForMaster();
  }

  @Get('news')
  async news(): Promise<any> {
    return this.newsService.all();
  }

  @Post('setCitizen')
  async setCitizen(@Body() {userId, isCitizen}): Promise<SetCitizen> {
    await this.profileService.setCitizen(userId, isCitizen);
    return {userId, isCitizen};
  }

  @Post('setDonated')
  async setDonated(@Body() {userId, donated}): Promise<SetDonated> {
    await this.profileService.setDonated(userId, donated);
    return {userId, donated};
  }

  @Post('updateNews')
  async updateNews(@Body() {newsId, data}): Promise<any> {
    await this.newsService.update(newsId, data);
    return {newsId, data};
  }

  @Post('addNews')
  async addNews(@Body() data): Promise<News> {
    return await this.newsService.add(data);
  }

  @Post('setBalance')
  async setBalance(@Body() {userId, balance}): Promise<SetBalance> {
    await this.profileService.setBalance(userId, balance);
    return {userId, balance};
  }

  @Post('uploadQuenta')
  @UseInterceptors(FileInterceptor('quenta', {dest: paths.upload}))
  async uploadQuenta(@Body() {userId}, @UploadedFile() quenta): Promise<UploadQuenta> {
    userId = parseInt(userId, 10);
    if (quenta) this.logger.log(`File uploaded: quenta: ${quenta.originalname}`);
    else throw new BadRequestException();

    const newPath = paths.quenta + '/' + userId;
    try {
      await new Promise((resolve, reject) => mkdirp(newPath, (err) => !err ? resolve() : reject(err)));
      await new Promise((resolve, reject) => {
        rename(quenta.path, newPath + '/' + quenta.originalname, (err) => !err ? resolve() : reject(err));
      });
      this.logger.log('quenta: Rename completed!');
    } catch (err) {
      this.logger.error(`Failed to move quenta file(${quenta.filename}, ${quenta.originalname}): `, err.stack);
      unlink(quenta.path, (err) => {
        if (!err) this.logger.log(`File removed: quenta: ${quenta.originalname}`);
        else this.logger.error(`Error removing file: quenta: ${quenta.originalname}: ${err.stack || err.message}`);
      });
      throw new UnprocessableEntityException();
    }

    try {
      const quentaPath = quenta.originalname;
      this.profileService.setQuentaPath(userId, quentaPath);
      return {userId, quentaPath};
    } catch (err) {
      unlink(newPath, (err) => {
        if (!err) this.logger.log(`File removed: quenta: ${quenta.originalname}`);
        else this.logger.error(`Error removing file: quenta: ${quenta.originalname}: ${err.stack || err.message}`);
      });
      throw new InternalServerErrorException();
    }
  }
}
