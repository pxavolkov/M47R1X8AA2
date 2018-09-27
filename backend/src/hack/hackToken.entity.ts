import { Column, Entity, JoinColumn, PrimaryGeneratedColumn, CreateDateColumn, ManyToOne } from 'typeorm';
import { User } from '../user/user.entity';
import { HackType, HackMinigame } from '@shared/enums';
import { KbServer } from '../kb/kbserver.entity';
import { KbEntry } from '../kb/kbentry.entity';

@Entity('hack_tokens')
export class HackToken {
  @PrimaryGeneratedColumn()
  id: number;

  @ManyToOne(type => User, {primary: true, cascade: true})
  @JoinColumn({name: 'userId'})
  user: User;

  @Column({ nullable: false })
  userId: number;

  @CreateDateColumn()
  create: Date;

  @Column('enum', {enum: HackMinigame})
  minigame: HackMinigame;

  @Column()
  minScore: number;

  @Column({nullable: true})
  score: number;

  @Column({nullable: true})
  start: Date;

  @Column({nullable: true})
  expire: Date;

  @Column('enum', {enum: HackType})
  type: HackType;

  @ManyToOne(type => User, {primary: true, cascade: true})
  @JoinColumn({name: 'targetUserId'})
  targetUser: User;

  @Column({nullable: true})
  targetUserId: number;

  @ManyToOne(type => KbServer, {primary: true, cascade: true})
  @JoinColumn({name: 'targetServerId'})
  targetServer: KbServer;

  @Column({nullable: true})
  targetServerId: number;

  @ManyToOne(type => KbEntry, {primary: true, cascade: true})
  @JoinColumn({name: 'targetEntryId'})
  targetEntry: KbEntry;

  @Column({nullable: true})
  targetEntryId: number;
}