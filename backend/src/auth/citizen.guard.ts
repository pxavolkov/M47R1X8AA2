import { Injectable, CanActivate, ExecutionContext } from '@nestjs/common';
import { User } from '../user/user.entity';

@Injectable()
export class CitizenGuard implements CanActivate {
  canActivate(context: ExecutionContext): boolean {
    const request = context.switchToHttp().getRequest();
    const user: User | undefined = request.user;
    return user && user.profile && user.profile.isCitizen;
  }
}