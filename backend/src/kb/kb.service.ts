import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { KbEntry } from './kbentry.entity';
import { KbServer } from './kbserver.entity';

@Injectable()
export class KbService {
  constructor(
    @InjectRepository(KbEntry)
    private readonly kbEntryRepository: Repository<KbEntry>,
    @InjectRepository(KbServer)
    private readonly kbServerRepository: Repository<KbServer>,
  ) {}

  async getServers(): Promise<KbServer[]> {
    return await this.kbServerRepository.find({
      select: ['id', 'name', 'description', 'roles', 'password'],
      where: {isHidden: false, isDeleted: false}
    });
  }

  async getEntries(serverId: number): Promise<KbEntry[]> {
    return await this.kbEntryRepository.find({
      select: ['id', 'key', 'password', 'roles'],
      where: {serverId, isHidden: false, isDeleted: false}
    });
  }

  async getServer(id: number): Promise<KbServer> {
    return await this.kbServerRepository.findOneOrFail({id, isDeleted: false});
  }

  async getServerByName(name: string): Promise<KbServer> {
    return await this.kbServerRepository.findOneOrFail({name, isDeleted: false});
  }

  async getEntryWithServer(id: number): Promise<KbEntry> {
    return await this.kbEntryRepository.findOneOrFail({id, isDeleted: false}, {relations: ['server']});
  }

  async getEntryByKeyWithServer(key: string, serverId: number): Promise<KbEntry> {
    return await this.kbEntryRepository.findOneOrFail({key, serverId, isDeleted: false}, {relations: ['server']});
  }
}
