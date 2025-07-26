import { Injectable} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { Product, ProductDocument } from '../schemas/product.schema';
import { CreateProductDto } from '../dto/create-product.dto';
import { UpdateProductDto } from '../dto/update-product.dto';
import { ProductNotFoundException } from 'src/exceptions/product.exceptions';

@Injectable()
export class ProductsRepository {
  constructor(
    @InjectModel(Product.name) private readonly productModel: Model<ProductDocument>,
  ) {}

  async create(createDto: CreateProductDto, ownerId: string): Promise<Product> {
    const data = { ...createDto, owner: new Types.ObjectId(ownerId) };
    const created = new this.productModel(data);
    return created.save(); 
  }

  async findAndCount(
    filter: any,
    options: { skip: number; limit: number; sort: any },
  ): Promise<{ items: Product[]; total: number }> {
    const { skip, limit, sort } = options;

    const [items, total] = await Promise.all([
      this.productModel
        .find(filter)
        .sort(sort)
        .skip(skip)
        .limit(limit)
        .exec(),
      this.productModel.countDocuments(filter).exec(),
    ]);

    return { items, total };
  }

  async findById(id: string): Promise<Product | null> {
    return this.productModel.findById(new Types.ObjectId(id)).exec();
  }

  async update(id: string, updateDto: UpdateProductDto): Promise<Product> {
    const updated = await this.productModel.findByIdAndUpdate(
      new Types.ObjectId(id),
      { $set: updateDto },
      { new: true, runValidators: true },
    ).exec();

    if (!updated) {
      throw new ProductNotFoundException(id);
    }
    return updated;
  }

  async remove(id: string): Promise<void> {
    const result = await this.productModel.findByIdAndDelete(new Types.ObjectId(id)).exec();
    if (!result) {
      throw new ProductNotFoundException(id);
    }
  }
}