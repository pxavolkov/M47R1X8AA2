import { Column, PrimaryGeneratedColumn, Entity, Unique, CreateDateColumn } from 'typeorm';
import { RolesTransformer, Roles } from '../user/roles';

@Entity('kbserver')
@Unique(['name'])
export class KbServer {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({length: 100, nullable: false})
  name: string;

  @Column({length: 1000, nullable: false})
  description: string;

  @Column({length: 100, nullable: true})
  password: string;

  @Column({type: 'int', default: 0, transformer: new RolesTransformer()})
  roles: Roles;

  @Column({default: false})
  isHidden: boolean;

  @Column({default: false})
  isDeleted: boolean;

  @CreateDateColumn()
  creationDate: Date;
}