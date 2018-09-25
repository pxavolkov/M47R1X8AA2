import { Sex } from '@shared/enums';
import { Column, Entity, JoinColumn, OneToOne, PrimaryColumn, Unique } from 'typeorm';
import { User } from '../user/user.entity';

@Entity('profiles')
export class Profile {
  @OneToOne(type => User, {primary: true, cascade: true})
  @JoinColumn({name: 'userId'})
  user: User;

  @PrimaryColumn({ nullable: false })
  userId: number;

  @Column({length: 100})
  firstName: string;

  @Column({length: 100})
  lastName: string;

  @Column('enum', {enum: Sex})
  sex: Sex;

  @Column('int')
  age: number;

  @Column({default: false})
  photoUploaded: boolean;

  @Column({nullable: true})
  quentaPath: string;

  @Column({default: false})
  isCitizen: boolean;

  @Column('int', {default: 0})
  balance: number;

  @Column({nullable: true})
  miningTime: Date;

  @Column({default: false})
  donated: boolean;

  @Column({default: false})
  dead: boolean;

  @Column({default: false})
  injured: boolean;

  @Column({nullable: true})
  bandid: string;
}