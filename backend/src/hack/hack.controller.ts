import { Controller, UseGuards, Request, Post, Body, BadRequestException, Get, Query } from '@nestjs/common';
import { Logger } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { Role, HackType, HackMinigame } from '@shared/enums';
import { RolesGuard } from '../auth/roles.guard';
import { User } from '../user/user.entity';
import { ProfileService } from '../profile/profile.service';
import { KbService } from '../kb/kb.service';
import { HackService } from './hack.service';
import { HackToken, HackStart, HackKbResponse } from '@shared/responses';

@Controller('hack')
@UseGuards(AuthGuard('jwt'), new RolesGuard(Role.Hacker))
export class HackController {
  private readonly logger = new Logger(HackController.name);
  constructor(
    private readonly hackService: HackService,
    private readonly profileService: ProfileService,
    private readonly kbService: KbService,
  ) {}

  @Post('tryHack')
  async tryHack(
    @Request() {user}: {user: User},
    @Body() {type, targetId}
  ): Promise<HackStart> {
    let canHack = false;
    switch (this.hackService.getTargetType(type)) {
      case 'user':
        const targetProfile = await this.profileService.getProfile(targetId);
        canHack = (
            [HackType.PROFILE_VIEW, HackType.PROFILE_EDIT].includes(type) &&
            user.profile.hackLevel > targetProfile.hackDefenseProfile
          ) || (
            [HackType.INVENTORY_VIEW, HackType.INVENTORY_EDIT].includes(type) &&
            user.profile.hackLevel > targetProfile.hackDefenseInventory
          ) || (
            [HackType.MESSAGES_VIEW, HackType.MESSAGES_EDIT].includes(type) &&
            user.profile.hackLevel > targetProfile.hackDefenseMessages
          );
        break;
      case 'server':
        const targetServer = await this.kbService.getServer(targetId);
        canHack = user.profile.hackLevel > targetServer.hackDefense;
        break;
      case 'entry':
        const targetEntry = await this.kbService.getEntryWithServer(targetId);
        canHack = user.profile.hackLevel > targetEntry.hackDefense;
        break;
      case 'findServer':
        canHack = user.profile.hackLevel > 5;
    }
    if (!canHack) throw new BadRequestException();

    const games = Object.keys(HackMinigame);
    const minigame = HackMinigame[games[Math.floor(Math.random() * games.length)]];
    const minScore = 1;
    const hackToken = await this.hackService.create(user.id, type, targetId, minigame, minScore);
    return {id: hackToken.id, minigame, minScore};
  }

  @Post('finishMinigame')
  async finishMinigame(
    @Request() {user}: {user: User},
    @Body() {id, minigame, score}
  ): Promise<void> {
    const hackToken = await this.hackService.getById(id);
    if (hackToken.start !== null) throw new BadRequestException();
    if (hackToken.userId !== user.id) throw new BadRequestException();
    if (hackToken.minigame !== minigame) throw new BadRequestException();
    if (score < hackToken.minScore) throw new BadRequestException();

    await this.hackService.start(id, score);
  }

  @Get('list')
  async list(@Request() {user}: {user: User}): Promise<HackToken[]> {
    return await this.hackService.getUserTokens(user.id);
  }

  @Get('getKbData')
  async getKbData(
    @Request() {user}: {user: User},
    @Query('id') hackTokenId
  ): Promise<HackKbResponse> {
    const hackToken = await this.hackService.getById(hackTokenId);
    if (hackToken.userId !== user.id) throw new BadRequestException();
    if (hackToken.start === null) throw new BadRequestException();
    if (hackToken.expire <= new Date()) throw new BadRequestException();

    let data;
    const type = hackToken.type;
    if (type === HackType.KB_SERVER_PASSWORD) {
      const {name, password} = await this.kbService.getServer(hackToken.targetServerId);
      data = {serverName: name, password};
    } else if (type === HackType.KB_ENTRY_PASSWORD) {
      const {server, key, password} = await this.kbService.getEntryWithServer(hackToken.targetEntryId);
      data = {serverName: server.name, key, password};
    } else if (type === HackType.KB_ENTRY_ENCRYPTION_KEY) {
      const {server, key, encryptionKey} = await this.kbService.getEntryWithServer(hackToken.targetEntryId);
      data = {serverName: server.name, key, encryptionKey};
    } else if (type === HackType.KB_FIND_SERVER) {
      if (hackToken.targetServerId) {
        const server = await this.kbService.getServer(hackToken.targetServerId);
        data = {serverName: server.name, description: server.description};
      } else {
        const servers = await this.kbService.getHiddenServers();
        const server = servers[Math.floor(Math.random() * servers.length)];
        await this.hackService.updateTargetServerId(hackToken.id, server.id);
        data = {serverName: server.name, description: server.description};
      }
    } else throw new BadRequestException();

    return {
      type: hackToken.type,
      data
    };
  }
}
