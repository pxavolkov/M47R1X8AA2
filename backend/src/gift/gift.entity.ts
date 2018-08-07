import { Column, Entity, JoinColumn, OneToOne, PrimaryColumn, PrimaryGeneratedColumn } from 'typeorm';
import { User } from '../user/user.entity';

@Entity('gifts')
export class Gift {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({length: 32})
  code: string;

  @Column('int')
  creditsBonus: number;

  @OneToOne(type => User, {cascade: true})
  @JoinColumn({name: 'usedUserId'})
  usedBy: User;

  @Column({nullable: true})
  usedUserId: number;

  @Column({nullable: true})
  usedDate: Date;
}