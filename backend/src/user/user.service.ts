import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { hash } from 'bcryptjs';
import { RegisterRequest } from '@shared/requests';
import { Repository } from 'typeorm';
import { User } from './user.entity';
import { News } from '../news/news.entity';

@Injectable()
export class UserService {
  constructor(
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
  ) {}

  async findAll(): Promise<User[]> {
    return await this.userRepository.find();
  }

  async findAllForMaster(): Promise<User[]> {
    return await this.userRepository.createQueryBuilder('user')
      .select('user.id')
      .addSelect('user.playerName')
      .addSelect('user.playerAge')
      .addSelect('user.info')
      .addSelect('user.allergy')
      .addSelect('user.registrationDate')
      .addSelect('user.email')
      .addSelect('profile.firstName')
      .addSelect('profile.lastName')
      .addSelect('profile.sex')
      .addSelect('profile.age')
      .addSelect('profile.quentaPath')
      .addSelect('profile.isCitizen')
      .addSelect('profile.balance')
      .addSelect('profile.donated')
      .addSelect('profile.dead')
      .addSelect('profile.injured')
      .leftJoin('user.profile', 'profile')
      .getMany();
  }

  async findOneByEmail(email: string): Promise<User> {
    return await this.userRepository.findOne({ email });
  }

  async findOneByEmailWithProfile(email: string): Promise<User> {
    return await this.userRepository.findOneOrFail({email}, {relations: ['profile']});
  }

  async register(data: RegisterRequest): Promise<User> {
    const user = new User();
    for (const k of ['playerName', 'playerAge', 'info', 'allergy', 'email']) user[k] = data[k];
    user.emailConfirmed = false;
    user.passwordHash = await hash(data.password, 10);
    return await this.userRepository.save(user);
  }

  async remove(user: User): Promise<User> {
    return await this.userRepository.remove(user);
  }

  async markReadNews(user: User, news: News[]): Promise<User> {
    if (!user.readNews) user.readNews = [];
    user.readNews.push(...news);
    return await this.userRepository.save(user);
  }
}