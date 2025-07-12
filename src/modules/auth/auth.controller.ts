import { Controller, Request, Post, UseGuards, Body, ConflictException } from '@nestjs/common';
import { AuthGuard }      from '@nestjs/passport';
import { AuthService }    from './auth.service';
import { CreateUserDto }  from '../user/dto/create-user.dto';
import { UserService }    from '../user/user.service';

@Controller('auth')
export class AuthController {
  constructor(
    private authService: AuthService,
    private userService: UserService
  ) {}

  @UseGuards(AuthGuard('local'))
  @Post('login')
  async login(@Request() req) {
    return this.authService.login(req.user);
  }

  @Post('register')
  async register(@Body() dto: CreateUserDto) {
    if (dto.email) {
      const existingEmail = await this.userService.findByEmail(dto.email);
    if (existingEmail) {
      throw new ConflictException('Email already exists');
    }
    }

    if (dto.phone) {
      const existingPhone = await this.userService.findByPhone(dto.phone);
      if (existingPhone) {
        throw new ConflictException('Phone number already exists');
      }
    }

    return this.authService.register(dto);
  }
}
