import {Controller,Get,Post,Body,Patch,Param,Delete,UseGuards,ConflictException,} from '@nestjs/common';
import {ApiTags,ApiBearerAuth,ApiOperation,ApiBody,ApiParam,ApiOkResponse,ApiUnauthorizedResponse,ApiConflictResponse,ApiBadRequestResponse,} from '@nestjs/swagger';
import { UserService } from './user.service';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';

@ApiTags('user')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('user')
export class UserController {
  constructor(private readonly userService: UserService) {}
  
  @Post()
  @Roles('super-admin', 'admin')
  @ApiOperation({ summary: 'Create a new user (admin only)' })
  @ApiBody({ type: CreateUserDto })
  @ApiBadRequestResponse({ description: 'Validation failed (missing or invalid fields).' })
  @ApiConflictResponse({ description: 'Email or phone already exists.' })
  @ApiOkResponse({ description: 'User created successfully' })
  @ApiUnauthorizedResponse({ description: 'Unauthorized or inactive admin' })
  async create(@Body() dto: CreateUserDto) {
    if (dto.email) {
      const existing = await this.userService.findByEmail(dto.email);
      if (existing) {
        throw new ConflictException('Email already exists');
      }
    }
    if (dto.phone) {
      const existing = await this.userService.findByPhone(dto.phone);
      if (existing) {
        throw new ConflictException('Phone number already exists');
      }
    }

    try {
      return await this.userService.create(dto);
    } catch (err: any) {
      if (err.code === 11000) {
        throw new ConflictException('Email or phone already exists');
      }
      throw err;
    }
  }

  @Get()
  @Roles('super-admin', 'admin')
  @ApiOperation({ summary: 'Get all users (admin only)' })
  @ApiOkResponse({ description: 'List of users' })
  @ApiUnauthorizedResponse({ description: 'Unauthorized or inactive admin' })
  findAll() {
    return this.userService.findAll();
  }

  @Get(':id')
  @Roles('super-admin', 'admin')
  @ApiOperation({ summary: 'Get a single user by ID (admin only)' })
  @ApiParam({ name: 'id', description: 'User ID' })
  @ApiOkResponse({ description: 'User data' })
  @ApiUnauthorizedResponse({ description: 'Unauthorized or inactive admin' })
  findOne(@Param('id') id: string) {
    return this.userService.findOne(id);
  }

  @Patch(':id')
  @Roles('super-admin', 'admin')
  @ApiOperation({ summary: 'Update a user by ID (admin only)' })
  @ApiParam({ name: 'id', description: 'User ID' })
  @ApiBody({ type: UpdateUserDto })
  @ApiBadRequestResponse({ description: 'Validation failed (e.g. missing or invalid fields).' })
  @ApiConflictResponse({ description: 'Email or phone conflict on update.' })
  @ApiOkResponse({ description: 'User updated successfully' })
  @ApiUnauthorizedResponse({ description: 'Unauthorized or inactive admin' })
  update(@Param('id') id: string, @Body() dto: UpdateUserDto) {
    return this.userService.update(id, dto);
  }

  @Delete(':id')
  @Roles('super-admin', 'admin')
  @ApiOperation({ summary: 'Delete a user by ID (admin only)' })
  @ApiParam({ name: 'id', description: 'User ID' })
  @ApiBadRequestResponse({ description: 'Invalid ID parameter.' })
  @ApiOkResponse({ description: 'User removed successfully' })
  @ApiUnauthorizedResponse({ description: 'Unauthorized or inactive admin' })
  remove(@Param('id') id: string) {
    return this.userService.remove(id);
  }
}
