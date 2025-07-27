import { Strategy } from 'passport-local';
import { PassportStrategy } from '@nestjs/passport';
import { Injectable, UnauthorizedException } from '@nestjs/common';
import { AuthService } from '../auth.service';

@Injectable()
export class LocalStrategy extends PassportStrategy(Strategy) {
  constructor(private authService: AuthService) {
    super({ usernameField: 'username', passwordField: 'password' });
  }

  async validate(email: string, password: string): Promise<any> {
  
    let user = await this.authService.validateUser(email, password);

    if (!user) {
      user = await this.authService.validateUserByPhone(email, password);
    }

    if (!user) {
      throw new UnauthorizedException('Invalid credentials');
    }
    return user;
  }
}
