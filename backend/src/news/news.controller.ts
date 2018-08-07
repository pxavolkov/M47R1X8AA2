import { Controller, Get, UseGuards, Request } from '@nestjs/common';
import { Logger } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { NewsService } from '../news/news.service';
import { NewsResponse } from '@shared/responses';
import { UserService } from '../user/user.service';

@Controller('news')
export class NewsController {
  private readonly logger = new Logger(NewsController.name);
  constructor(
    private readonly newsService: NewsService,
    private readonly userService: UserService,
  ) {}

  @Get('load')
  @UseGuards(AuthGuard('jwt'))
  async load(@Request() {user}): Promise<NewsResponse> {
    const news = await this.newsService.all();
    this.userService.markReadNews(user, news);
    const response = new NewsResponse();
    response.news = news.map(v => ({title: v.title, text: v.text, date: v.createDate.getTime()}));
    return response;
  }
}
