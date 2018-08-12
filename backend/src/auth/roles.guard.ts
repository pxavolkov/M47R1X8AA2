import { Injectable, CanActivate, ExecutionContext } from '@nestjs/common';
import { Role } from '../user/roles';
import { User } from '../user/user.entity';

@Injectable()
export class RolesGuard implements CanActivate {
  constructor(
    private role: Role
  ) { }

  canActivate(context: ExecutionContext): boolean {
    if (!this.role) {
      return true;
    }
    const request = context.switchToHttp().getRequest();
    const user: User | undefined = request.user;
    return user && user.roles && user.roles.has(this.role);
  }
}