import { Injectable }      from '@nestjs/common';
import { JwtService }      from '@nestjs/jwt';
import * as bcrypt         from 'bcrypt';
import { UserService }     from '../user/user.service';
import { CreateUserDto }   from '../user/dto/create-user.dto';
import { UserDocument }    from '../user/schemas/user.schema';

@Injectable()
export class AuthService {
  constructor(
    private usersService: UserService,
    private jwtService:   JwtService,
  ) {}

  async validateUser(
    email: string,
    pass: string
  ): Promise<Omit<UserDocument, 'password'> | null> {
    const user = await this.usersService.findByEmail(email);
    if (user && await bcrypt.compare(pass, user.password)) {
      const { password, ...result } = user.toObject();
      return result;
    }
    return null;
  }

  async validateUserByPhone(
    phone: string,
    pass: string
  ): Promise<Omit<UserDocument, 'password'> | null> {
    const user = await this.usersService.findByPhone(phone);
    if (user && await bcrypt.compare(pass, user.password)) {
      const { password, ...result } = user.toObject();
      return result;
    }
    return null;
  }

  async login(user: Omit<UserDocument, 'password'>) {
    const payload = {
      sub:   user._id,
      email: user.email,
      role:  (user as any).role,
    };
    return {
      access_token: this.jwtService.sign(payload),
    };
  }

  async register(dto: CreateUserDto) {
    const hash = await bcrypt.hash(dto.password, 10);
    return this.usersService.create({ ...dto, password: hash });
  }
}
