import {Controller,Post,Body,UseGuards,ConflictException,Get,Param,Patch,Query,DefaultValuePipe,ParseIntPipe,} from '@nestjs/common';
import {ApiTags,ApiBearerAuth,ApiOperation,ApiBody,ApiResponse,ApiConflictResponse,ApiBadRequestResponse,ApiParam,ApiOkResponse,ApiQuery,} from '@nestjs/swagger';
import { UserService }           from '../user/user.service';
import { JwtAuthGuard }          from '../auth/guards/jwt-auth.guard';
import { RolesGuard }            from '../auth/guards/roles.guard';
import { Roles }                 from '../auth/decorators/roles.decorator';
import { UpdateAdminDto } from '../user/dto/update-admin-dto';
import { CreateAdminDto } from '../user/dto/create-admin-dto';

@ApiTags('admin')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('admin')
export class AdminController {
  constructor(private readonly userService: UserService) {}

  @Post()
  @Roles('super-admin')
  @ApiOperation({ summary: 'Create a new admin user' })
  @ApiBody({ type: CreateAdminDto })
  @ApiResponse({status: 201,description: 'Admin created successfully',})
  @ApiBadRequestResponse({ description: 'Validation failed (missing or invalid fields)' })
  @ApiConflictResponse({ description: 'Email or phone already exists' })
  async createAdmin(@Body() dto: CreateAdminDto) {
    if (dto.email && (await this.userService.findByEmail(dto.email))) {
      throw new ConflictException('Email already exists');
    }
    if (dto.phone && (await this.userService.findByPhone(dto.phone))) {
      throw new ConflictException('Phone number already exists');
    }
    return this.userService.create({ ...dto, role: 'admin' });
  }

  @Get()
  @Roles('super-admin')
  @ApiOperation({ summary: 'List all admin users with pagination' })
  @ApiQuery({
    name: 'page',
    required: false,
    type: Number,
    description: 'Page number (default: 1)',
    example: 1,
  })
  @ApiQuery({
    name: 'limit',
    required: false,
    type: Number,
    description: 'Items per page (default: 10)',
    example: 10,
  })
  @ApiBadRequestResponse({ description: 'Invalid query parameters.' })
  @ApiOkResponse({
    description: 'Paginated list of admin users',
    schema: {
      type: 'object',
      properties: {
        items: { type: 'array' },
        total: { type: 'number', example: 50 },
        page: { type: 'number', example: 1 },
        limit: { type: 'number', example: 10 },
        totalPages: { type: 'number', example: 5 },
      },
    },
  })
  async listAdmins(
    @Query('page', new DefaultValuePipe(1), ParseIntPipe) page: number,
    @Query('limit', new DefaultValuePipe(10), ParseIntPipe) limit: number,
  ) {
    return this.userService.findAdminsPaginated('admin', page, limit);
  }

  @Patch(':id')
  @Roles('super-admin')
  @ApiOperation({ summary: 'Update admin user by ID' })
  @ApiParam({ name: 'id', description: 'Admin user ID' })
  @ApiBody({ type: UpdateAdminDto })
  @ApiOkResponse({description: 'Admin updated successfully',})
  @ApiBadRequestResponse({ description: 'Validation failed (invalid ID or body).' })
  @ApiConflictResponse({description: 'Cannot change role to anything other than admin',})
  async updateAdmin(
    @Param('id') id: string,
    @Body() dto: UpdateAdminDto,
  ) {
    if (dto.role && dto.role !== 'admin') {
      throw new ConflictException(
        'Cannot change role to anything other than admin',
      );
    }
    return this.userService.update(id, { ...dto, role: 'admin' });
  }

  @Patch(':id/deactivate')
  @Roles('super-admin')
  @ApiOperation({ summary: 'Deactivate an admin account' })
  @ApiParam({ name: 'id', description: 'Admin user ID' })
  @ApiBadRequestResponse({ description: 'Invalid ID parameter.' })
  @ApiOkResponse({description: 'Admin deactivated successfully',})
  async deactivateAdmin(@Param('id') id: string) {
    return this.userService.update(id, { isActive: false });
  }

  @Patch(':id/activate')
  @Roles('super-admin')
  @ApiOperation({ summary: 'Activate an admin account' })
  @ApiParam({ name: 'id', description: 'Admin user ID' })
  @ApiBadRequestResponse({ description: 'Invalid ID parameter.' })
  @ApiOkResponse({description: 'Admin activated successfully',})
  async activateAdmin(@Param('id') id: string) {
    return this.userService.update(id, { isActive: true });
  }
}
