import { Column, CreateDateColumn, PrimaryGeneratedColumn, ManyToMany, Entity } from 'typeorm';
import { User } from '../user/user.entity';

@Entity()
export class News {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  title: string;

  @Column({length: 10000})
  text: string;

  @CreateDateColumn()
  createDate: Date;

  @ManyToMany(type => User, user => user.readNews)
  readByUsers: User[];
}