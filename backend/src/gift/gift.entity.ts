import { Column, Entity, JoinColumn, OneToOne, PrimaryColumn, PrimaryGeneratedColumn, ManyToOne } from 'typeorm';
import { User } from '../user/user.entity';
import { Item } from '../item/item.entity';
import { Property } from '../property/property.entity';

@Entity('gifts')
export class Gift {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({length: 32})
  code: string;

  @Column('int', {nullable: true})
  creditsBonus: number;

  @ManyToOne(type => Item, {cascade: true})
  @JoinColumn({name: 'itemId'})
  item: Item;

  @Column({nullable: true})
  itemId: number;

  @Column('int', {nullable: true})
  itemAmount: number;

  @ManyToOne(type => Property, {cascade: true})
  @JoinColumn({name: 'propertyId'})
  property: Property;

  @Column({nullable: true})
  propertyId: number;

  @Column({nullable: true})
  propertyValue: string;

  @ManyToOne(type => User, {cascade: true})
  @JoinColumn({name: 'usedUserId'})
  usedBy: User;

  @Column({nullable: true})
  usedUserId: number;

  @Column({nullable: true})
  usedDate: Date;
}