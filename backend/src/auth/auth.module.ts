import { Module, forwardRef } from '@nestjs/common';
import { UserModule } from '../user/user.module';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { JwtStrategy } from './jwt.strategy';
import { LocalStrategy } from './local.strategy';
import { SocketAuthMiddleware } from './socket-auth.middleware';

@Module({
  imports: [forwardRef(() => UserModule)],
  controllers: [AuthController],
  providers: [AuthService, JwtStrategy, LocalStrategy, SocketAuthMiddleware],
  exports: [AuthService, SocketAuthMiddleware],
})
export class AuthModule {}