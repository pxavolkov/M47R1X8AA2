import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, IsNull, Not, MoreThan } from 'typeorm';
import { HackToken } from './hackToken.entity';
import { HackMinigame, HackType } from '@shared/enums';

@Injectable()
export class HackService {
  private readonly hackTime = parseInt(process.env.HACK_TIME_MS, 10);
  constructor(
    @InjectRepository(HackToken)
    private readonly hackTokenRepository: Repository<HackToken>,
  ) {}

  async create(
    userId: number,
    type: HackType,
    targetId: number,
    minigame: HackMinigame,
    minScore: number
  ): Promise<HackToken> {
    const data = {userId, type, minigame, minScore, ...this.getTypedTargetId(type, targetId)};
    const entity = this.hackTokenRepository.create(data);
    return await this.hackTokenRepository.save(entity);
  }

  async start(
    id: number,
    score: number,
  ): Promise<void> {
    await this.hackTokenRepository.update(
      {id},
      {score, start: new Date(), expire: new Date(Date.now() + this.hackTime)}
    );
  }

  async getById(id: number): Promise<HackToken> {
    return await this.hackTokenRepository.findOneOrFail(id);
  }

  async findActiveToken(userId: number, type: HackType, targetId: number): Promise<HackToken> {
    return await this.hackTokenRepository.findOne({
      userId,
      type,
      ...this.getTypedTargetId(type, targetId),
      start: Not(IsNull()),
      expire: MoreThan(new Date()),
    });
  }

  async getUserTokens(userId: number) {
    return await this.hackTokenRepository.find({
      where: {userId, start: Not(IsNull()), expire: MoreThan(new Date())},
      select: ['id', 'expire', 'type', 'targetUserId', 'targetServerId', 'targetEntryId'],
    });
  }

  async updateTargetServerId(id: number, targetServerId: number): Promise<void> {
    await this.hackTokenRepository.update({id}, {targetServerId});
  }

  getTargetType(type: HackType) {
    if ([
      HackType.PROFILE_VIEW, HackType.PROFILE_EDIT, HackType.INVENTORY_VIEW, HackType.INVENTORY_EDIT,
      HackType.MESSAGES_VIEW, HackType.MESSAGES_EDIT,
    ].includes(type)) {
      return 'user';
    } else if (type === HackType.KB_SERVER_PASSWORD) {
      return 'server';
    } else if ([HackType.KB_ENTRY_PASSWORD, HackType.KB_ENTRY_ENCRYPTION_KEY].includes(type)) {
      return 'entry';
    } else if (type === HackType.KB_FIND_SERVER) {
      return 'findServer';
    }
  }

  private getTypedTargetId(type: HackType, targetId: number) {
    switch (this.getTargetType(type)) {
      case 'user':
        return {targetUserId: targetId};
      case 'server':
        return {targetServerId: targetId};
      case 'entry':
        return {targetEntryId: targetId};
      default:
        return {};
    }
  }
}
