import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { User, UserDocument } from '../schemas/user.schema';
import { UserNotFoundException} from 'src/exceptions/user.exception';

@Injectable()
export class UsersRepository {
  constructor(@InjectModel(User.name) private readonly model: Model<UserDocument>) {}

  async findByEmail(email: string): Promise<UserDocument | null> {
    return this.model.findOne({ email }).exec();
  }

  async findByPhone(phone: string): Promise<UserDocument | null> {
    return this.model.findOne({ phone }).exec();
  }

  async findByPhoneOrEmail(value: string): Promise<UserDocument | null> {
    return this.model.findOne({
      $or: [{ email: value }, { phone: value }],
    }).exec();
  }

  async create(data: Partial<User>): Promise<UserDocument> {
    return this.model.create(data);
  }

  async findUsersPaginated(page = 1, limit = 10) {
      const skip = (page - 1) * limit;
      const [users, total] = await Promise.all([
        this.model.find().skip(skip).limit(limit).exec(),
        this.model.countDocuments(),
      ]);

      return {
        data: users,
        total,
        totalPages: Math.ceil(total / limit),
      };
    }

  async findById(id: string): Promise<UserDocument> {
    const user = await this.model.findById(id).exec();
    if (!user) 
      throw new UserNotFoundException(id);
    return user;
  }

  async update(id: string, dto: Partial<User>): Promise<UserDocument> {
    const user = await this.model.findByIdAndUpdate(id, dto, { new: true }).exec();
    if (!user) 
      throw new UserNotFoundException(id);
    return user;
  }

  async delete(id: string): Promise<void> {
    const result = await this.model.findByIdAndDelete(id).exec();
    if (!result) 
      throw new UserNotFoundException(id);
  }

  async findAdminsPaginated(role: string, page = 1, limit = 10) {
    const skip = (page - 1) * limit;
    const [admins, total] = await Promise.all([
      this.model.find({ role }).skip(skip).limit(limit).exec(),
      this.model.countDocuments({ role }),
    ]);

    return {
      data: admins,
      page,
      total,
      totalPages: Math.ceil(total / limit),
    };
  }
}
