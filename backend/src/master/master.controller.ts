import { Controller, Get, UseGuards, Request, Body, Post } from '@nestjs/common';
import { Logger } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { RolesGuard } from '../auth/roles.guard';
import { Role } from '../user/roles';
import { UserService } from '../user/user.service';
import { User } from '../user/user.entity';
import { NewsService } from '../news/news.service';
import { ProfileService } from '../profile/profile.service';
import { News } from '../news/news.entity';

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
  async setCitizen(@Body() {userId, isCitizen}): Promise<any> {
    await this.profileService.setCitizen(userId, isCitizen);
    return {userId, isCitizen};
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
  async setBalance(@Body() {userId, balance}): Promise<any> {
    await this.profileService.setBalance(userId, balance);
    return {userId, balance};
  }
}
