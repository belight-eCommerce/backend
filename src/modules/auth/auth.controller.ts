import {Controller,Request,Post,UseGuards,Body,ConflictException,} from '@nestjs/common';
import {ApiTags,ApiOperation,ApiBody,ApiResponse,ApiConflictResponse,ApiUnauthorizedResponse,ApiBadRequestResponse,} from '@nestjs/swagger';
import { AuthGuard }   from '@nestjs/passport';
import { AuthService } from './auth.service';
import { CreateUserDto } from '../user/dto/create-user.dto';
import { LoginDto }      from './dto/login.dto';
import { UserService }   from '../user/user.service';


@ApiTags('auth')
@Controller('auth')
export class AuthController {
  constructor(
    private authService: AuthService,
    private userService: UserService,
  ) {}

  @Post('register')
  @ApiOperation({ summary: 'Register a new Buyer or Seller' })
  @ApiBody({ type: CreateUserDto })
  @ApiResponse({ status: 201, description: 'User registered successfully.' })
  @ApiBadRequestResponse({ description: 'Validation failed (missing or invalid fields).' })
  @ApiConflictResponse({ description: 'Email or phone already exists.' })
  async register(@Body() dto: CreateUserDto) {
    const allowedRoles = ['buyer', 'seller'];
    if (!dto.role || !allowedRoles.includes(dto.role.toLowerCase())) {
      throw new ConflictException(
        'Registration allowed only for Buyer or Seller roles.'
      );
    }

    if (dto.email && (await this.userService.findByEmail(dto.email))) {
      throw new ConflictException('Email already exists');
    }

    if (dto.phone && (await this.userService.findByPhone(dto.phone))) {
      throw new ConflictException('Phone number already exists');
    }

    return this.authService.register(dto);
  }

  @UseGuards(AuthGuard('local'))
  @Post('login')
  @ApiOperation({ summary: 'Login with email/phone and password' })
  @ApiBody({ type: LoginDto })
  @ApiResponse({
    status: 200,
    description: 'Returns JWT access token',
    schema: {
      properties: {
        access_token: { type: 'string', example: 'eyJhbGciOiJIUzI1Ni…' },
      },
    },
  })
  
  @ApiBadRequestResponse({ description: 'Missing or invalid username/password.' })
  @ApiUnauthorizedResponse({description: 'Invalid credentials' })
  async login(@Request() req) {
    return this.authService.login(req.user);
  }
}
