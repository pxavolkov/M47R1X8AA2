import { Injectable, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Transaction, TransactionRepository } from 'typeorm';
import { InventoryItem } from './inventory.entity';

@Injectable()
export class InventoryService {
  constructor(
    @InjectRepository(InventoryItem)
    private readonly invRepository: Repository<InventoryItem>,
  ) {}

  async getUserInventory(userId: number): Promise<InventoryItem[]> {
    return await this.invRepository.find({
      where: {userId},
      relations: ['item'],
    });
  }

  async getUserInventoryItem(userId: number, itemId: number): Promise<InventoryItem> {
    return await this.invRepository.findOne({
      where: {userId, itemId},
      relations: ['item'],
    });
  }

  async getInventoryItemAmount(userId: number, itemId: number): Promise<InventoryItem> {
    return await this.invRepository.findOne({
      where: {userId, itemId},
      select: ['amount'],
    });
  }

  @Transaction()
  async addItem(
    userId: number, itemId: number, amount: number = 1,
    @TransactionRepository(InventoryItem) invRepository?: Repository<InventoryItem>
  ): Promise<void> {
    if (amount < 1) throw new BadRequestException();

    const invItem = new InventoryItem();
    invItem.userId = userId;
    invItem.itemId = itemId;
    invItem.amount = amount;
    try {
      await invRepository.insert(invItem);
    } catch (e) {
      if (e.code === 'ER_DUP_ENTRY') invRepository.increment({userId, itemId}, 'amount', amount);
      else throw e;
    }
  }

  @Transaction()
  async removeItem(
    userId: number, itemId: number, amount: number = 1,
    @TransactionRepository(InventoryItem) invRepository?: Repository<InventoryItem>
  ): Promise<void> {
    if (amount < 1) throw new BadRequestException();

    const invItem = await invRepository.findOneOrFail({userId, itemId});
    if (invItem.amount < amount) {
      throw new BadRequestException();
    } else if (invItem.amount === amount) invRepository.remove(invItem);
    else {
      invItem.amount -= amount;
      invRepository.save(invItem);
    }
  }

  @Transaction()
  async transferItem(
    fromUserId: number, toUserId: number, itemId: number, amount: number = 1,
    @TransactionRepository(InventoryItem) invRepository?: Repository<InventoryItem>
  ) {
    await this.removeItem(fromUserId, itemId, amount, invRepository);
    await this.addItem(toUserId, itemId, amount, invRepository);
  }
}
