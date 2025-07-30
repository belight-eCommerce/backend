import {Controller,Get,Post,Body,Patch,Param,Delete,UseGuards,Query,} from '@nestjs/common';
import {ApiTags,ApiBearerAuth,ApiOperation,ApiBody,ApiParam,ApiOkResponse,ApiUnauthorizedResponse,} from '@nestjs/swagger';
import { UserService } from './user.service';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { GetUsersQueryDto } from './dto/get-user-query.dto';
import { PaginatedResult } from 'src/common/dto/pagination.dto';
import { User } from './schemas/user.schema';

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
  @ApiOkResponse({ description: 'User created successfully' })
  @ApiUnauthorizedResponse({ description: 'Unauthorized or inactive admin' })
  create(@Body() dto: CreateUserDto) {
    return this.userService.createUser(dto);
  }

  @Get()
  @Roles('super-admin', 'admin')
  @ApiOperation({ summary: 'Get all users (admin only)' })
  @ApiOkResponse({ description: 'List of users' })
  @ApiUnauthorizedResponse({ description: 'Unauthorized or inactive admin' })
  findAll(
   @Query() query: GetUsersQueryDto
   ): Promise<PaginatedResult<User>> {
   return this.userService.getUsersPaginated(query);
  }

  @Get(':id')
  @Roles('super-admin', 'admin')
  @ApiOperation({ summary: 'Get a single user by ID (admin only)' })
  @ApiParam({ name: 'id', description: 'User ID' })
  @ApiOkResponse({ description: 'User data' })
  @ApiUnauthorizedResponse({ description: 'Unauthorized or inactive admin' })
  findOne(@Param('id') id: string) {
    return this.userService.getUserByIdOrFail(id);
  }

  @Patch(':id')
  @Roles('super-admin', 'admin')
  @ApiOperation({ summary: 'Update a user by ID (admin only)' })
  @ApiParam({ name: 'id', description: 'User ID' })
  @ApiBody({ type: UpdateUserDto })
  @ApiOkResponse({ description: 'User updated successfully' })
  @ApiUnauthorizedResponse({ description: 'Unauthorized or inactive admin' })
  update(@Param('id') id: string, @Body() dto: UpdateUserDto) {
    return this.userService.updateUser(id, dto);
  }

  @Delete(':id')
  @Roles('super-admin', 'admin')
  @ApiOperation({ summary: 'Delete a user by ID (admin only)' })
  @ApiParam({ name: 'id', description: 'User ID' })
  @ApiOkResponse({ description: 'User removed successfully' })
  @ApiUnauthorizedResponse({ description: 'Unauthorized or inactive admin' })
  remove(@Param('id') id: string) {
    return this.userService.deleteUser(id);
  }
}
