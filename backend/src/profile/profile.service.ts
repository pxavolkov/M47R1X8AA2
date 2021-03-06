import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { RegisterRequest } from '@shared/requests';
import { Repository, UpdateResult, FindManyOptions, Not, Equal, MoreThan, LessThan, IsNull } from 'typeorm';
import { User } from '../user/user.entity';
import { Profile } from './profile.entity';
import { TransactionService } from '../transaction/transaction.service';
import { EventService } from '../event/event.service';
import { EventType } from '@shared/enums';

@Injectable()
export class ProfileService {
  private readonly logger = new Logger(ProfileService.name);
  private readonly miningTime = parseInt(process.env.MINING_TIME_MS, 10);
  private readonly miningAmount = parseInt(process.env.MINING_AMOUNT, 10);
  constructor(
    @InjectRepository(Profile)
    private readonly profileRepository: Repository<Profile>,
    private readonly transactionService: TransactionService,
    private readonly eventService: EventService,
  ) {}

  async register(userId: number, data: RegisterRequest, quentaPath: string): Promise<Profile> {
    const profile = new Profile();
    profile.userId = userId;
    for (const k of ['firstName', 'lastName', 'sex', 'age']) profile[k] = data[k];
    profile.quentaPath = quentaPath;
    return await this.profileRepository.save(profile);
  }

  async findByUser(user: User | number): Promise<Profile> {
    if (typeof(user) === 'number') return await this.profileRepository.findOneOrFail({userId: user});
    else return await this.profileRepository.findOneOrFail({user});
  }

  async remove(profile: Profile): Promise<Profile> {
    return await this.profileRepository.remove(profile);
  }

  async setUploadedPhoto(id: number, photoUploaded: boolean): Promise<UpdateResult> {
    return await this.profileRepository.update(id, {photoUploaded} as any);
  }

  async allPublicExcept(id: number): Promise<Profile[]> {
    return await this.profileRepository.find({
      where: {userId: Not(Equal(id))},
      select: ['userId', 'firstName', 'lastName', 'photoUploaded'],
      order: {firstName: 'ASC', lastName: 'ASC'},
    } as FindManyOptions<Profile>);
  }

  async getBalance(id: number): Promise<number> {
    return (await this.profileRepository.findOneOrFail(id, {select: ['balance']})).balance;
  }

  async transfer(fromId: number, toId: number, amount: number): Promise<void> {
    await this.profileRepository.decrement({userId: fromId}, 'balance', amount);
    await this.profileRepository.increment({userId: toId}, 'balance', amount);
    await this.transactionService.transfer(fromId, toId, amount);
    this.logger.log(`User #${fromId} sent ${amount} credits to user #${toId}!`);
  }

  async getMiningTime(id: number): Promise<Date> {
    const profile = await this.profileRepository.findOne(id, {select: ['miningTime']});
    return profile ? profile.miningTime : null;
  }

  async startMining(id: number): Promise<void> {
    await this.profileRepository.update({userId: id}, {miningTime: new Date()});
    this.logger.log(`Mining started for user #${id}!`);
    this.eventService.add(id, EventType.MINING_START, {time: this.miningTime, amount: this.miningAmount});
    // +500ms is fix for rounding issues when mining started on xx:xx:xx.500+
    setTimeout(() => this.updateMining(id), this.miningTime + 500);
  }

  async addMoney(id: number, amount: number): Promise<void> {
    await this.profileRepository.increment({userId: id}, 'balance', amount);
  }

  async updateMining(id: number): Promise<void> {
    const result = await this.profileRepository.update(
      {userId: id, miningTime: Not(MoreThan(new Date(Date.now() - this.miningTime)))},
      {miningTime: null},
    );
    if (result.raw.changedRows) {
      this.eventService.add(id, EventType.MINING_FINISH, {time: this.miningTime, amount: this.miningAmount});
      await this.addMoney(id, this.miningAmount);
      await this.transactionService.mining(id, this.miningAmount);
      this.logger.log(`Mining finished for user #${id}!`);
    } else this.logger.error(`Mining NOT finished for user #${id}!`);
  }

  async updateMiningForAll(): Promise<void> {
    const profiles = await this.profileRepository.find({
      where: {miningTime: Not(IsNull())},
      select: ['userId', 'miningTime'],
    } as FindManyOptions<Profile>);
    for (const p of profiles) {
      const timeTillEnd = this.miningTime - (Date.now() - new Date(p.miningTime).getTime());
      if (timeTillEnd <= 0) this.updateMining(p.userId);
      else setTimeout(() => this.updateMining(p.userId), timeTillEnd);
    }
    this.logger.log(`Mining updated for all users (${profiles.length})!`);
  }

  async setCitizen(userId: number, isCitizen: boolean): Promise<void> {
    await this.profileRepository.update({userId}, {isCitizen});
  }

  async setDonated(userId: number, donated: boolean): Promise<void> {
    await this.profileRepository.update({userId}, {donated});
  }

  async setDead(userId: number, dead: boolean): Promise<void> {
    await this.profileRepository.update({userId}, {dead});
  }

  async setInjured(userId: number, injured: boolean): Promise<void> {
    await this.profileRepository.update({userId}, {injured});
  }

  async isCitizen(id: number): Promise<boolean> {
    return (await this.profileRepository.findOneOrFail(id, {select: ['isCitizen']})).isCitizen;
  }

  async setBalance(userId: number, balance: number): Promise<void> {
    await this.profileRepository.update({userId}, {balance});
  }

  async setQuentaPath(userId: number, quentaPath: string): Promise<void> {
    await this.profileRepository.update({userId}, {quentaPath});
  }

  async getPublicProfile(userId: number):
  Promise<{userId: number, firstName: string, lastName: string, photoUploaded: boolean}> {
    return await this.profileRepository.findOneOrFail(
      {userId},
      {select: ['userId', 'firstName', 'lastName', 'photoUploaded']}
    );
  }

  async getProfile(userId: number): Promise<Profile> {
    return await this.profileRepository.findOneOrFail({userId});
  }
}