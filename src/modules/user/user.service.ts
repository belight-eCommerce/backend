import { Injectable } from '@nestjs/common';
import * as bcrypt from 'bcrypt';
import { UsersRepository } from './repository/users.repository';
import { CreateUserDto } from './dto/create-user.dto';
import { CreateAdminDto } from './dto/create-admin-dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { User } from './schemas/user.schema';
import { UserConflictException } from 'src/exceptions/user.exception';
import {  GetUsersQueryDto } from './dto/get-user-query.dto';
import { PaginatedResult } from 'src/common/dto/pagination.dto';

@Injectable()
export class UserService {
  constructor(private readonly repo: UsersRepository) {}

  async createUser(dto: CreateUserDto): Promise<User> {
    await this.checkConflicts(dto.email, dto.phone);
    const hashedPassword = await bcrypt.hash(dto.password, 10);
    return this.repo.create({ ...dto, password: hashedPassword });
  }

  async createAdmin(dto: CreateAdminDto): Promise<User> {
    await this.checkConflicts(dto.email, dto.phone);
    const hashedPassword = await bcrypt.hash(dto.password, 10);
    return this.repo.create({ ...dto, password: hashedPassword, role: 'admin',is_verified: true });
  }

  async getUsersPaginated(
      dto: GetUsersQueryDto
    ): Promise<PaginatedResult<User>> {
      const { page = 1, limit = 10 } = dto;
      const { data, total, totalPages } =
        await this.repo.findUsersPaginated(page, limit);

      return {
        items: data,
        meta: { total, page, limit, totalPages },
      };
    }

  async getUserByIdOrFail(id: string): Promise<User> {
    return this.repo.findById(id);
  }

  async updateUser(id: string, dto: UpdateUserDto): Promise<User> {
    if (dto.email || dto.phone) {
      const value = dto.email ?? dto.phone;
      if (typeof value === 'string') {
        const existing = await this.repo.findByPhoneOrEmail(value);
        if (existing && existing.id.toString() !== id) {
          throw new UserConflictException(dto.email ? 'email' : 'phone');
        }
      }
    }
    return this.repo.update(id, dto);
  }

  async deleteUser(id: string): Promise<void> {
    await this.repo.delete(id);
  }

async getAdminsPaginated(
    dto: GetUsersQueryDto
  ): Promise<PaginatedResult<User>> {
    const { page = 1, limit = 10 } = dto;

    const { data: admins, total, totalPages } =
      await this.repo.findAdminsPaginated('admin', page, limit);

    return {
      items: admins,
      meta: { total, page, limit, totalPages },
    }
  }

  async findByEmail(email: string) {
    return this.repo.findByEmail(email);
  }

  async findByPhone(phone: string) {
    return this.repo.findByPhone(phone);
  }

  async findByPhoneOrEmail(value: string) {
    return this.repo.findByPhoneOrEmail(value);
  }

  private async checkConflicts(email?: string, phone?: string) {
    if (email) {
      const exists = await this.repo.findByEmail(email);
      if (exists) 
        throw new UserConflictException('email');
    }

    if (phone) {
      const exists = await this.repo.findByPhone(phone);
      if (exists) 
        throw new UserConflictException('phone');
    }
  }
}
