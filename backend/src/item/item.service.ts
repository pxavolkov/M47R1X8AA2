import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Item } from './item.entity';

@Injectable()
export class ItemService {
  constructor(
    @InjectRepository(Item)
    private readonly itemRepository: Repository<Item>,
  ) {}

  async all(): Promise<Item[]> {
    return await this.itemRepository.find();
  }

  async update(id: number, data: Item): Promise<void> {
    await this.itemRepository.update({id}, data);
  }

  async add(data: Item): Promise<Item> {
    const item = new Item();
    item.title = data.title;
    item.shortDesc = data.shortDesc;
    item.longDesc = data.longDesc;
    return await this.itemRepository.save(item);
  }

  async getById(id: number): Promise<Item> {
    return await this.itemRepository.findOneOrFail(id);
  }
}
