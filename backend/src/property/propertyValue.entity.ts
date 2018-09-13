import { Column, Entity, ManyToOne, JoinColumn, PrimaryColumn } from 'typeorm';
import { User } from '../user/user.entity';
import { Property } from './property.entity';

@Entity('property_values')
export class PropertyValue {
  @ManyToOne(type => User, {primary: true, cascade: true})
  @JoinColumn({name: 'userId'})
  user: User;

  @PrimaryColumn({ nullable: false })
  userId: number;

  @ManyToOne(type => Property, {primary: true, cascade: true})
  @JoinColumn({name: 'propertyId'})
  property: Property;

  @PrimaryColumn({ nullable: false })
  propertyId: number;

  @Column()
  value: string;
}
