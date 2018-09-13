import { Column, PrimaryGeneratedColumn, Entity } from 'typeorm';
import { RolesTransformer, Roles } from '../user/roles';

@Entity('properties')
export class Property {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  name: string;

  @Column({type: 'int', default: 0, transformer: new RolesTransformer()})
  viewRoles: Roles;

  @Column({type: 'int', default: 0, transformer: new RolesTransformer()})
  editRoles: Roles;
}
