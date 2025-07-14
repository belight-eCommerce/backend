import { Injectable, Logger } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import * as bcrypt from 'bcrypt';
import { User, UserDocument } from './schemas/user.schema';

@Injectable()
export class SuperAdminSeederService {

  private readonly logger = new Logger(SuperAdminSeederService.name);
  constructor(
    @InjectModel(User.name) private userModel: Model<UserDocument>,
  ) {}

  async ensureSuperAdmin() {
    try {
      const email = process.env.SUPER_ADMIN_EMAIL 
      const phone = process.env.SUPER_ADMIN_PHONE 
      const password = process.env.SUPER_ADMIN_PASSWORD
      const firstName = process.env.SUPER_ADMIN_FIRST_NAME
      const lastName = process.env.SUPER_ADMIN_LAST_NAME
      const superAdmin = await this.userModel.findOne({
        $or: [
          { role: 'super-admin' },
          { email },
          { phone }
        ]
      });

      if (superAdmin) {
        this.logger.log('Super-Admin or user with this email/phone already exists.');
        return;
      }

      if (!password) {
        this.logger.error('SUPER_ADMIN_PASSWORD environment variable is not set.');
        return;
      }

      const hashedPassword = await bcrypt.hash(password, 10);

      await this.userModel.create({
        firstName,
        lastName,
        email,
        phone,
        role: 'super-admin',
        password: hashedPassword,
        is_verified: true,
      });

      this.logger.log('Super-Admin created successfully.');
    } catch (error) {
      this.logger.error('Failed to ensure Super-Admin:', error);
    }
  }
}