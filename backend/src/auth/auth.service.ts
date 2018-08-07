import { Injectable } from '@nestjs/common';
import * as jwt from 'jsonwebtoken';
import { LoginRequest } from '@shared/requests';
import { LoginResponse } from '@shared/responses';
import { UserService } from '../user/user.service';
import { JwtPayload } from './jwt-payload.interface';

@Injectable()
export class AuthService {
  constructor(private readonly userService: UserService) {}

  async createToken(data: LoginRequest): Promise<LoginResponse> {
    const expiresIn = data.rememberMe ? 604800 : 3600;
    const accessToken = jwt.sign({email: data.email}, process.env.JWT_SECRET_KEY, { expiresIn });
    return {
      expiresIn,
      accessToken,
    };
  }

  async validateUser(payload: JwtPayload): Promise<any> {
    return await this.userService.findOneByEmail(payload.email);
  }
}