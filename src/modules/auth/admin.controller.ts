import {Controller,Post,Patch,Delete,Get,Body,Param,Query,UseGuards,} from '@nestjs/common';
import {ApiTags,ApiBearerAuth,ApiOperation,ApiResponse,ApiParam,ApiQuery,ApiBody,ApiUnauthorizedResponse,ApiForbiddenResponse,ApiNotFoundResponse,ApiBadRequestResponse,ApiConflictResponse,} from '@nestjs/swagger';
import { UserService } from '../user/user.service';
import { CreateAdminDto } from '../user/dto/create-admin-dto';
import { UpdateUserDto } from '../user/dto/update-user.dto';
import { GetUsersQueryDto } from '../user/dto/get-user-query.dto';
import { AuthGuard } from '@nestjs/passport';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';

@ApiTags('admin')
@ApiBearerAuth()
@Controller('admin')
@UseGuards(AuthGuard('jwt'), RolesGuard)
@Roles('super-admin')
export class AdminController {
  constructor(private readonly userService: UserService) {}

  @Post()
  @ApiOperation({ summary: 'Create a new admin user' })
  @ApiBody({ type: CreateAdminDto })
  @ApiResponse({ status: 201, description: 'Admin created successfully.' })
  @ApiBadRequestResponse({ description: 'Invalid request body.' })
  @ApiConflictResponse({ description: 'Admin with given email or phone already exists.' })
  @ApiUnauthorizedResponse({ description: 'Unauthorized.' })
  @ApiForbiddenResponse({ description: 'Forbidden. Requires super-admin role.' })
  async createAdmin(@Body() dto: CreateAdminDto) {
    return this.userService.createAdmin(dto);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get an admin user by ID' })
  @ApiParam({ name: 'id', type: 'string', description: 'Admin user ID' })
  @ApiResponse({ status: 200, description: 'Returns the admin user.' })
  @ApiNotFoundResponse({ description: 'Admin user not found.' })
  @ApiUnauthorizedResponse({ description: 'Unauthorized.' })
  @ApiForbiddenResponse({ description: 'Forbidden. Requires super-admin role.' })
  async findOne(@Param('id') id: string) {
    return this.userService.getUserByIdOrFail(id);
  }

  @Get()
  @ApiOperation({ summary: 'Get paginated list of admin users' })
  @ApiQuery({ name: 'page', required: false, type: Number, description: 'Page number' })
  @ApiQuery({ name: 'limit', required: false, type: Number, description: 'Items per page' })
  @ApiResponse({ status: 200, description: 'Returns paginated admins.' })
  @ApiUnauthorizedResponse({ description: 'Unauthorized.' })
  @ApiForbiddenResponse({ description: 'Forbidden. Requires super-admin role.' })
  async getAdmins(@Query() query: GetUsersQueryDto) {
    const { items, meta } = await this.userService.getAdminsPaginated(query);
    return { items, meta };
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update an admin user' })
  @ApiParam({ name: 'id', type: 'string', description: 'Admin user ID' })
  @ApiBody({ type: UpdateUserDto })
  @ApiResponse({ status: 200, description: 'Admin updated successfully.' })
  @ApiNotFoundResponse({ description: 'Admin user not found.' })
  @ApiBadRequestResponse({ description: 'Invalid update data.' })
  @ApiUnauthorizedResponse({ description: 'Unauthorized.' })
  @ApiForbiddenResponse({ description: 'Forbidden. Requires super-admin role.' })
  async updateAdmin(
    @Param('id') id: string,
    @Body() dto: UpdateUserDto
  ) {
    return this.userService.updateUser(id, dto);
  }

  @Patch(':id/deactivate')
  @ApiOperation({ summary: 'Deactivate an admin user' })
  @ApiParam({ name: 'id', type: 'string', description: 'Admin user ID' })
  @ApiResponse({ status: 200, description: 'Admin deactivated successfully.' })
  @ApiNotFoundResponse({ description: 'Admin user not found.' })
  @ApiUnauthorizedResponse({ description: 'Unauthorized.' })
  @ApiForbiddenResponse({ description: 'Forbidden. Requires super-admin role.' })
  async deactivateAdmin(@Param('id') id: string) {
    return this.userService.updateUser(id, { isActive: false });
  }

  @Patch(':id/activate')
  @ApiOperation({ summary: 'Activate an admin user' })
  @ApiParam({ name: 'id', type: 'string', description: 'Admin user ID' })
  @ApiResponse({ status: 200, description: 'Admin activated successfully.' })
  @ApiNotFoundResponse({ description: 'Admin user not found.' })
  @ApiUnauthorizedResponse({ description: 'Unauthorized.' })
  @ApiForbiddenResponse({ description: 'Forbidden. Requires super-admin role.' })
  async activateAdmin(@Param('id') id: string) {
    return this.userService.updateUser(id, { isActive: true });
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete an admin user' })
  @ApiParam({ name: 'id', type: 'string', description: 'Admin user ID' })
  @ApiResponse({ status: 200, description: 'Admin deleted successfully.' })
  @ApiNotFoundResponse({ description: 'Admin user not found.' })
  @ApiUnauthorizedResponse({ description: 'Unauthorized.' })
  @ApiForbiddenResponse({ description: 'Forbidden. Requires super-admin role.' })
  async deleteAdmin(@Param('id') id: string) {
    return this.userService.deleteUser(id);
  }
}
