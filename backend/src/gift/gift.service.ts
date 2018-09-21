import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, IsNull } from 'typeorm';
import { Gift } from './gift.entity';

@Injectable()
export class GiftService {
  constructor(
    @InjectRepository(Gift)
    private readonly giftRepository: Repository<Gift>,
  ) {}

  async isCodeValid(code: string): Promise<boolean> {
    const obj = await this.giftRepository.findOne({code, usedUserId: IsNull()}, {select: ['code']});
    return !!obj;
  }

  async getGift(code: string): Promise<Gift> {
    return await this.giftRepository.findOneOrFail({code}, {relations: ['item', 'property']});
  }

  async activate(id: number, usedUserId: number) {
    await this.giftRepository.update({id}, {usedUserId, usedDate: new Date()});
  }
}
