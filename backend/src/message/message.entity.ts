import { Column, Entity, JoinColumn, PrimaryGeneratedColumn, CreateDateColumn } from 'typeorm';
import { User } from '../user/user.entity';

@Entity('messages')
export class Message {
  @PrimaryGeneratedColumn()
  id: number;

  @JoinColumn({name: 'fromUserId'})
  from: User;

  @Column({ nullable: false })
  fromUserId: number;

  @JoinColumn({name: 'toUserId'})
  to: User;

  @Column({ nullable: false })
  toUserId: number;

  @Column()
  text: string;

  @CreateDateColumn()
  date: Date;
}