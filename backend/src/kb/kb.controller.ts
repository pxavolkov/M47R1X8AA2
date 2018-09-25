import { Controller, Get, UseGuards, Request, Post, Body, ForbiddenException, BadRequestException,
  NotFoundException } from '@nestjs/common';
import { Logger } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { EventService } from '../event/event.service';
import { KbService } from './kb.service';
import { User } from 'user/user.entity';
import { KbEntry } from './kbentry.entity';
import { KbServer, KbEntriesResponse, KbEntry as IKbEntry } from '@shared/responses';
import { LoadServer, LoadEntry } from '@shared/requests';

@Controller('kb')
@UseGuards(AuthGuard('jwt'))
export class KbController {
  private readonly logger = new Logger(KbController.name);
  constructor(
    private readonly kbService: KbService,
    private readonly eventService: EventService,
  ) {}

  @Get('loadServers')
  async loadServers(@Request() {user}: {user: User}): Promise<KbServer[]> {
    return (await this.kbService.getServers()).map(
      ({roles, password, ...rest}) =>
      ({...rest, hasAccess: roles.intersects(user.roles.addAll()), needPassword: password !== null})
    );
  }

  @Post('loadServer')
  async loadServer(@Request() {user}: {user: User}, @Body() {serverId, serverName, serverPassword}: LoadServer):
    Promise<KbServer> {
    let server;
    try {
      server = serverId ?
      await this.kbService.getServer(serverId) :
      await this.kbService.getServerByName(serverName);
    } catch (err) {
      throw new NotFoundException();
    }
    if (server.isHidden && serverName !== server.name) throw new NotFoundException();

    return {
      id: server.id,
      name: server.name,
      description: server.description,
      hasAccess: server.roles.intersects(user.roles.addAll()),
      needPassword: server.password !== null,
      correctPassword: this.verifyPassword(serverPassword, server.password),
    };
  }

  @Post('loadEntries')
  async loadEntries(@Request() {user}: {user: User}, @Body() {serverId, serverPassword, serverName}: LoadServer):
    Promise<KbEntriesResponse> {
    const server = serverId ?
      await this.kbService.getServer(serverId) :
      await this.kbService.getServerByName(serverName);
    if (server.isHidden && serverName !== server.name) throw new NotFoundException();
    if (!server.roles.intersects(user.roles.addAll())) throw new ForbiddenException();
    if (!this.verifyPassword(serverPassword, server.password)) throw new BadRequestException();
    return {server: {
      id: server.id,
      name: server.name,
      description: server.description,
      hasAccess: server.roles.intersects(user.roles.addAll()),
      needPassword: server.password !== null,
      correctPassword: this.verifyPassword(serverPassword, server.password),
    }, entries: (await this.kbService.getEntries(server.id)).map(
      ({roles, password, ...rest}) =>
      ({...rest, hasAccess: roles.intersects(user.roles.addAll()), needPassword: password !== null})
    )};
  }

  @Post('loadEntry')
  async loadEntry(
    @Request() {user}: {user: User},
    @Body() {id, serverId, serverPassword, entryKey, entryPassword, decryptionKey}: LoadEntry
  ): Promise<IKbEntry> {
    let entry: KbEntry;
    try {
      entry = id ?
        await this.kbService.getEntryWithServer(id) :
        await this.kbService.getEntryByKeyWithServer(entryKey, serverId);
    } catch (err) {
      throw new NotFoundException();
    }
    const server = entry.server;

    if (!server.roles.intersects(user.roles.addAll())) throw new ForbiddenException();
    if (!entry.roles.intersects(user.roles.addAll())) throw new ForbiddenException();

    if (!this.verifyPassword(serverPassword, server.password)) throw new BadRequestException();
    const correctPassword = this.verifyPassword(entryPassword, entry.password);
    if (decryptionKey && !entry.encryptionKey) throw new ForbiddenException();

    let text = entry.encryptionKey ? this.encryptData(entry.text, entry.encryptionKey) : entry.text;
    let link = entry.encryptionKey ? this.encryptData(entry.link, entry.encryptionKey) : entry.link;

    if (decryptionKey) {
      text = this.decryptData(text, decryptionKey);
      link = this.decryptData(link, decryptionKey);
    }

    return {
      id: entry.id,
      key: entry.key,
      encrypted: correctPassword && !!entry.encryptionKey,
      text: correctPassword ? text : null,
      link: correctPassword ? link : null,
      decrypted: !!decryptionKey,
      hasAccess: entry.roles.intersects(user.roles.addAll()),
      needPassword: entry.password !== null,
      correctPassword,
    };
  }

  private verifyPassword(enteredPassword: string, correctPassword: string) {
    return ((enteredPassword === undefined || enteredPassword === null) && correctPassword === null) ||
      enteredPassword === correctPassword;
  }

  private encryptData(data: string, key: string): string {
    return this.xor(Buffer.from(data), Buffer.from(key)).toString('base64');
  }

  private decryptData(data: string, key: string) {
    return this.xor(Buffer.from(data, 'base64'), Buffer.from(key)).toString('utf8');
  }

  private xor(data: Buffer, key: Buffer): Buffer {
    for (let i = 0, j = 0; i < data.length; i++, j++) {
      if (j >= key.length) j = 0;
      // tslint:disable-next-line no-bitwise
      data[i] ^= key[j];
    }
    return data;
  }
}
