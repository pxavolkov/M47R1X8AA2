import { Column, Entity, JoinColumn, PrimaryGeneratedColumn, CreateDateColumn, ManyToOne } from 'typeorm';
import { User } from '../user/user.entity';

@Entity('messages')
export class Message {
  @PrimaryGeneratedColumn()
  id: number;

  @ManyToOne(type => User, {primary: true, cascade: true})
  @JoinColumn({name: 'fromUserId'})
  from: User;

  @Column({ nullable: false })
  fromUserId: number;

  @ManyToOne(type => User, {primary: true, cascade: true})
  @JoinColumn({name: 'toUserId'})
  to: User;

  @Column({ nullable: false })
  toUserId: number;

  @Column()
  text: string;

  @CreateDateColumn()
  date: Date;

  @Column({default: false})
  read: boolean;
}