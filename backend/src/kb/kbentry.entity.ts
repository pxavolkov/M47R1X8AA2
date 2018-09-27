import { Column, Entity, ManyToOne, JoinColumn, CreateDateColumn, PrimaryGeneratedColumn, Unique } from 'typeorm';
import { RolesTransformer, Roles } from '../user/roles';
import { KbServer } from './kbserver.entity';

@Entity('kbdata')
@Unique(['serverId', 'key'])
export class KbEntry {
  @PrimaryGeneratedColumn()
  id: number;

  @ManyToOne(type => KbServer, {primary: true, cascade: true})
  @JoinColumn({name: 'serverId'})
  server: KbServer;

  @Column({nullable: false})
  serverId: number;

  @Column({length: 100})
  key: string;

  @Column({length: 100, nullable: true})
  password: string;

  @Column({type: 'int', default: 0, transformer: new RolesTransformer()})
  roles: Roles;

  @Column({length: 4000, nullable: false})
  text: string;

  @Column({length: 200, nullable: true})
  link: string;

  @Column({length: 100, nullable: true})
  encryptionKey: string;

  @Column({default: false})
  isHidden: boolean;

  @Column({default: false})
  isDeleted: boolean;

  @CreateDateColumn()
  creationDate: Date;

  @Column({default: 0})
  hackDefense: number;
}