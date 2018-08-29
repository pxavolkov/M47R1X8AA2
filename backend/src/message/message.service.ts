import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Message } from './message.entity';

@Injectable()
export class MessageService {
  private readonly logger = new Logger(MessageService.name);
  constructor(
    @InjectRepository(Message)
    private readonly messageRepository: Repository<Message>,
  ) {}

  async getDialog(user1: number, user2: number): Promise<Message[]> {
    return await this.messageRepository
      .createQueryBuilder('user')
      .where(
        '(fromUserId = :user1 AND toUserId = :user2) OR (fromUserId = :user2 AND toUserId = :user1)', {user1, user2}
      )
      .getMany();
  }

  async add(message: Message): Promise<Message> {
    return await this.messageRepository.save(message);
  }
}