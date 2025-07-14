import {Controller,Post,Body,UseGuards,ConflictException,Get,Param,Patch,} from '@nestjs/common';
import { UserService } from '../user/user.service';
import { CreateAdminDto } from '../user/dto/create-admin-dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { UpdateUserDto } from '../user/dto/update-admin-dto';

@Controller('admin')
@UseGuards(JwtAuthGuard, RolesGuard)
export class AdminController {
  constructor(private readonly userService: UserService) {}
  @Post()
  @Roles('super-admin')
  async createAdmin(@Body() dto: CreateAdminDto) {
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

    return this.userService.create({ ...dto, role: 'admin' });
  }

  @Get()  
  @Roles('super-admin')
  async listAdmins() {
    return this.userService.findAllByRole('admin');
  }

  @Patch(':id')
  @Roles('super-admin')
  async updateAdmin(@Param('id') id: string, @Body() dto: UpdateUserDto) {
    if (dto.role && dto.role !== 'admin') {
      throw new ConflictException('Cannot change role to anything other than admin');
    }
    return this.userService.update(id, { ...dto, role: 'admin' });
  }

  @Patch(':id/deactivate')
  @Roles('super-admin')
  async deactivateAdmin(@Param('id') id: string) {
    return this.userService.update(id, { isActive: false });
  }

  @Patch(':id/activate')
  @Roles('super-admin')
  async activateAdmin(@Param('id') id: string) {
    return this.userService.update(id, { isActive: true });
  }
}