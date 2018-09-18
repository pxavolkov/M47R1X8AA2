import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Not } from 'typeorm';
import { Message } from './message.entity';

@Injectable()
export class MessageService {
  private readonly logger = new Logger(MessageService.name);
  private readonly notificationUserId = parseInt(process.env.NOTIFICATION_USER_ID, 10);
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
      .orderBy("date", "DESC")
      .getMany();
  }

  async add(message: Message): Promise<Message> {
    return await this.messageRepository.save(message);
  }

  async unreadCountByUserId(id: number): Promise<number> {
    return await this.messageRepository.count({
      where: {fromUserId: Not(id), toUserId: id, read: false}
    });
  }

  async unreadCountByDialogs(toUserId: number): Promise<any[]> {
    return (await this.messageRepository
      .createQueryBuilder()
      .select('fromUserId')
      .addSelect('COUNT(*) as count')
      .where('toUserId = :toUserId', {toUserId})
      .andWhere('`read` = 0')
      .groupBy('fromUserId')
      .getRawMany()).map(({fromUserId, count}) => ({
        fromUserId,
        count: parseInt(count, 10),
      }));
  }

  async markDialogAsRead(fromUserId: number, toUserId: number): Promise<void> {
    await this.messageRepository.update({fromUserId, toUserId, read: false}, {read: true});
  }

  async sendNotification(userId: number, text: string): Promise<Message> {
    const msg = new Message();
    msg.fromUserId = this.notificationUserId;
    msg.toUserId = userId;
    msg.text = text;
    return await this.messageRepository.save(msg);
  }
}