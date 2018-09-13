import { Column, Entity, JoinColumn, PrimaryGeneratedColumn, CreateDateColumn } from 'typeorm';
import { User } from '../user/user.entity';
import { EventType } from '@shared/enums';

@Entity('events')
export class Event {
  @PrimaryGeneratedColumn()
  id: number;

  @JoinColumn({name: 'userId'})
  user: User;

  @Column({ nullable: false })
  userId: number;

  @CreateDateColumn()
  date: Date;

  @Column('enum', {enum: EventType})
  type: EventType;

  @Column('json')
  data: object;
}