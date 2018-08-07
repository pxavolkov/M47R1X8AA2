import { Body, Controller, Get, Post, UseGuards } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { LoginRequest } from '@shared/requests';
import { LoginResponse } from '@shared/responses';
import { AuthService } from './auth.service';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('login')
  @UseGuards(AuthGuard('local'))
  async login(@Body() data: LoginRequest): Promise<LoginResponse> {
    return await this.authService.createToken(data);
  }

  @Get('data')
  @UseGuards(AuthGuard('jwt'))
  testData() {
    return 'access granted';
  }
}