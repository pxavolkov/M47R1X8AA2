import { Injectable, NestInterceptor, ExecutionContext } from '@nestjs/common';
import { AuthService } from './auth.service';
import { JwtPayload } from './jwt-payload.interface';
import * as jwt from 'jsonwebtoken';
import { GatewayMiddleware, WsException } from '@nestjs/websockets';

@Injectable()
export class SocketAuthMiddleware implements GatewayMiddleware {
  constructor(private readonly authService: AuthService) {}

  public resolve() {
    return async (socket, next) => {
      if (!socket.handshake.query.token) {
        socket.disconnect();
      }

      try {
        const payload = jwt.verify(socket.handshake.query.token, process.env.JWT_SECRET_KEY) as JwtPayload;
        const user = await this.authService.validateUser(payload);
        socket.user = user;
        return next();
      } catch (err) {
        socket.disconnect(true);
      }
    };
  }
}