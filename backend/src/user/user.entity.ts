import { Column, CreateDateColumn, Entity, PrimaryGeneratedColumn, Unique, ManyToMany, JoinTable } from 'typeorm';
import { News } from '../news/news.entity';

@Entity('users')
@Unique(['email'])
export class User {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({length: 100})
  playerName: string;

  @Column('int')
  playerAge: number;

  @Column({length: 100})
  info: string;

  @Column({length: 1000, nullable: true})
  allergy: string;

  @CreateDateColumn()
  registrationDate: Date;

  @Column()
  email: string;

  @Column()
  emailConfirmed: boolean;

  @Column()
  passwordHash: string;

  @ManyToMany(type => News, news => news.readByUsers)
  @JoinTable({
    name: 'readNews',
    joinColumns: [
      {name: 'userId'},
    ],
  })
  readNews: News[];
}