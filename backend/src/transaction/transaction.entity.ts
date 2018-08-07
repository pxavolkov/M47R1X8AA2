import { Column, CreateDateColumn, Entity, PrimaryGeneratedColumn, ManyToOne, JoinColumn } from 'typeorm';
import { User } from '../user/user.entity';
import { TransactionType } from '@shared/enums';

@Entity('transactions')
export class Transaction {
  @PrimaryGeneratedColumn()
  id: number;

  @ManyToOne(type => User, {primary: true, cascade: true})
  @JoinColumn({name: 'fromUserId'})
  from: User;

  @Column({nullable: true})
  fromUserId: number;

  @ManyToOne(type => User, {primary: true, cascade: true})
  @JoinColumn({name: 'toUserId'})
  to: User;

  @Column()
  toUserId: number;

  @Column('int')
  amount: number;

  @Column('enum', {enum: TransactionType})
  type: TransactionType;

  @CreateDateColumn()
  date: Date;
}