import { Column, PrimaryGeneratedColumn, Entity } from 'typeorm';

@Entity('items')
export class Item {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  title: string;

  @Column({length: 1000})
  shortDesc: string;

  @Column('text')
  longDesc: string;
}
