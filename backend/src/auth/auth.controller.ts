import { Body, Controller, Get, Post, Request, UseGuards } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { LoginRequest } from '@shared/requests';
import { LoginResponse } from '@shared/responses';
import { AuthService } from './auth.service';
import { EventService } from '../event/event.service';
import { EventType } from '@shared/enums';

@Controller('auth')
export class AuthController {
  constructor(
    private readonly authService: AuthService,
    private readonly eventService: EventService,
  ) {}

  @Post('login')
  @UseGuards(AuthGuard('local'))
  async login(@Request() {user}, @Body() data: LoginRequest): Promise<LoginResponse> {
    this.eventService.add(user, EventType.LOGIN, {rememberMe: data.rememberMe});
    return await this.authService.createToken(data);
  }

  @Get('data')
  @UseGuards(AuthGuard('jwt'))
  testData() {
    return 'access granted';
  }
}