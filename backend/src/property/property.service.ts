import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, DeepPartial } from 'typeorm';
import { Property } from './property.entity';
import { PropertyValue } from './propertyValue.entity';
import { Role } from '@shared/enums';
import { PropertyValueEditable } from '@shared/responses';
import { Roles } from '../user/roles';

@Injectable()
export class PropertyService {
  constructor(
    @InjectRepository(Property)
    private readonly propertyRepository: Repository<Property>,
    @InjectRepository(PropertyValue)
    private readonly valueRepository: Repository<PropertyValue>,
  ) {}

  async allProperties(): Promise<Property[]> {
    return await this.propertyRepository.find();
  }

  async updateProperty(id: number, data: DeepPartial<Property>): Promise<void> {
    await this.propertyRepository.update({id}, data);
  }

  async addProperty(data: {name: string, viewRoles: Roles | number, editRoles: Roles | number}): Promise<Property> {
    const item = new Property();
    item.name = data.name;
    item.viewRoles = data.viewRoles as any;
    item.editRoles = data.editRoles as any;
    return await this.propertyRepository.save(item);
  }

  async getPropertyById(id: number): Promise<Property> {
    return await this.propertyRepository.findOneOrFail(id);
  }

  async getValueById(propertyId: number, userId: number): Promise<string> {
    const item = await this.valueRepository.findOne({propertyId, userId});
    return item ? item.value : null;
  }

  async updateValue(propertyId: number, userId: number, value: string): Promise<void> {
    await this.valueRepository.update({propertyId, userId}, {value});
  }

  async addValue(propertyId: number, userId: number, value: string): Promise<PropertyValue> {
    const item = new PropertyValue();
    item.propertyId = propertyId;
    item.userId = userId;
    item.value = value;
    return await this.valueRepository.save(item);
  }

  async setValue(propertyId: number, userId: number, value: string): Promise<void> {
    try {
      await this.addValue(propertyId, userId, value);
    } catch (e) {
      await this.updateValue(propertyId, userId, value);
    }
  }

  async getUserValues(userId: number, roles: number, self: boolean = false): Promise<PropertyValueEditable[]> {
    let mask = new Roles(roles).addAll();
    if (self) mask = mask.addSelf();
    return (await this.propertyRepository
      .createQueryBuilder('p')
      .select('p.id', 'id')
      .addSelect('p.name', 'name')
      .addSelect('(p.editRoles & :mask) > 0', 'canEdit')
      .addSelect('v.value', 'value')
      .leftJoin(PropertyValue, 'v', 'p.id = v.propertyId AND v.userId = :userId')
      .where('((p.viewRoles & :mask) > 0 AND v.value IS NOT NULL) OR (p.editRoles & :mask) > 0')
      .setParameters({userId, mask: mask.toNumber()})
      .getRawMany() as any)
      .map(({canEdit, ...values}) => ({canEdit: canEdit === '1', ...values}));
  }
}
