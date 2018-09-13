import { Controller, Get, UseGuards, Request, ForbiddenException } from '@nestjs/common';
import { Logger } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { NewsService } from '../news/news.service';
import { NewsResponse } from '@shared/responses';
import { UserService } from '../user/user.service';
import { ProfileService } from '../profile/profile.service';
import { CitizenGuard } from '../auth/citizen.guard';

@Controller('news')
@UseGuards(AuthGuard('jwt'), new CitizenGuard())
export class NewsController {
  private readonly logger = new Logger(NewsController.name);
  constructor(
    private readonly newsService: NewsService,
    private readonly userService: UserService,
    private readonly profileService: ProfileService,
  ) {}

  @Get('load')
  async load(@Request() {user}): Promise<NewsResponse> {
    if (!await this.profileService.isCitizen(user.id)) throw new ForbiddenException();

    const news = await this.newsService.all();
    this.userService.markReadNews(user, news);
    const response = new NewsResponse();
    response.news = news.map(v => ({title: v.title, text: v.text, date: v.createDate.getTime()}));
    return response;
  }
}
