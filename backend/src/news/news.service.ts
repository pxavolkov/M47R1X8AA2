import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, IsNull } from 'typeorm';
import { News } from './news.entity';
import { User } from '../user/user.entity';

@Injectable()
export class NewsService {
  constructor(
    @InjectRepository(News)
    private readonly newsRepository: Repository<News>,
  ) {}

  async unreadNewsCountByUserId(id: number): Promise<number> {
    return await this.newsRepository
    .createQueryBuilder('user')
    .leftJoin('readNews', 'readNews', 'readNews.userId = :id', {id})
    .where('readNews.userId IS NULL')
    .getCount();
  }

  async all(): Promise<News[]> {
    return await this.newsRepository.find({order: {createDate: 'DESC'}});
  }

  async update(id: number, data: News): Promise<void> {
    await this.newsRepository.update({id}, data);
  }

  async add(data: News): Promise<News> {
    return await this.newsRepository.save(data);
  }

  async getById(id: number): Promise<News> {
    return await this.newsRepository.findOneOrFail(id);
  }
}