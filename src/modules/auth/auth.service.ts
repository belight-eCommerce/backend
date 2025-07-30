import { Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import { UsersRepository } from '../user/repository/users.repository';
import { CreateUserDto } from '../user/dto/create-user.dto';
import { LoginDto } from './dto/login.dto';
import { RoleNotAllowedException, EmailConflictException, PhoneConflictException, InvalidCredentialsException } from 'src/exceptions/auth.exceptions';


@Injectable()
export class AuthService {
  constructor(
    private readonly usersRepo: UsersRepository,
    private readonly jwtService: JwtService,
  ) {}

  async validateUser(email: string, pass: string): Promise<any> {
    try {
      return await this.validateCredentials(email, pass, 'email');
    } catch {
      return null;
    }
  }

  async validateUserByPhone(phone: string, pass: string): Promise<any> {
    try {
      return await this.validateCredentials(phone, pass, 'phone');
    } catch {
      return null;
    }
  }

  async register(dto: CreateUserDto) {
    const role = dto.role?.toLowerCase();
    if (!['buyer', 'seller'].includes(role)) {
      throw new RoleNotAllowedException();
    }

    if (dto.email && (await this.usersRepo.findByEmail(dto.email))) {
      throw new EmailConflictException();
    }
    if (dto.phone && (await this.usersRepo.findByPhone(dto.phone))) {
      throw new PhoneConflictException();
    }

    const salt = await bcrypt.genSalt();
    const hashed = await bcrypt.hash(dto.password, salt);

    return this.usersRepo.create({ ...dto, password: hashed });
  }

  private async validateCredentials(
    identifier: string,
    pass: string,
    by: 'email' | 'phone',
  ) {
    const user = by === 'email'
      ? await this.usersRepo.findByEmail(identifier)
      : await this.usersRepo.findByPhone(identifier);

    if (!user) {
      throw new InvalidCredentialsException();
    }

    const match = await bcrypt.compare(pass, user.password);
    if (!match) {
      throw new InvalidCredentialsException();
    }

    const { password, ...rest } = user.toObject();
    return rest;
  }

  async login(user: any) {
    const payload = { sub: user._id, role: user.role };
    return { access_token: this.jwtService.sign(payload) };
  }

  async loginByEmail(dto: LoginDto) {
    const validated = await this.validateUser(dto.username, dto.password);
    return this.login(validated);
  }

  async loginByPhone(dto: LoginDto) {
    const validated = await this.validateUserByPhone(dto.username, dto.password);
    return this.login(validated);
  }
}
