import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Event } from './event.entity';
import { EventType } from '@shared/enums';
import { User } from '../user/user.entity';

@Injectable()
export class EventService {
  private readonly logger = new Logger(EventService.name);
  constructor(
    @InjectRepository(Event)
    private readonly eventRepository: Repository<Event>,
  ) {}

  async add(user: User | number, type: EventType, data?: object): Promise<Event> {
    const event = new Event();
    event.userId = typeof user === 'number' || typeof user === 'string' ? user : user.id;
    event.type = type;
    event.data = data;
    return await this.eventRepository.save(event);
  }
}