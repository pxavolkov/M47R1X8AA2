import { Injectable, ForbiddenException } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { validatePassword as aspValidatePassword } from 'aspnet-identity-pw';
import { compare } from 'bcryptjs';
import { Strategy } from 'passport-local';
import { User } from '../user/user.entity';
import { UserService } from '../user/user.service';

@Injectable()
export class LocalStrategy extends PassportStrategy(Strategy) {
  constructor(private readonly userService: UserService) {
    super({
      usernameField: 'email',
      passwordField: 'password',
      session: false,
    });
  }

  async validate(email: string, password: string, done: (error: Error, user: User | false) => void) {
    const user = await this.userService.findOneByEmail(email);
    if (!user) return done(new ForbiddenException(), false);

    if (user.passwordHash.startsWith('$2')) {
      if (await compare(password, user.passwordHash)) done(null, user);
      else done(new ForbiddenException(), false);
    } else {
      aspValidatePassword(password, user.passwordHash, (err, result) => {
        if (err) done(err, false);
        else if (result) done(null, user);
        else done(new ForbiddenException(), false);
      });
    }
  }
}