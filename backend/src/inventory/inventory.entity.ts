import { Column, Entity, JoinColumn, OneToOne, PrimaryColumn, ManyToOne } from 'typeorm';
import { User } from '../user/user.entity';
import { Item } from '../item/item.entity';

@Entity('inventories')
export class InventoryItem {
  @ManyToOne(type => User, {primary: true, cascade: true})
  @JoinColumn({name: 'userId'})
  user: User;

  @PrimaryColumn({ nullable: false })
  userId: number;

  @ManyToOne(type => Item, {primary: true, cascade: true})
  @JoinColumn({name: 'itemId'})
  item: User;

  @PrimaryColumn({ nullable: false })
  itemId: number;

  @Column({type: 'int', default: 1})
  amount: number;
}
