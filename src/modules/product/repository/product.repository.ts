import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { Product, ProductDocument } from '../schemas/product.schema';
import { CreateProductDto } from '../dto/create-product.dto';
import { UpdateProductDto } from '../dto/update-product.dto';

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

  async findAll(filter: any, options: { skip: number; limit: number; sort: any }): Promise<Product[]> {
    return this.productModel.find(filter)
      .sort(options.sort)
      .skip(options.skip)
      .limit(options.limit)
      .exec();
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
      throw new NotFoundException(`Product with ID ${id} not found`);
    }
    return updated;
  }

  async remove(id: string): Promise<void> {
    const result = await this.productModel.findByIdAndDelete(new Types.ObjectId(id)).exec();
    if (!result) {
      throw new NotFoundException(`Product with ID ${id} not found`);
    }
  }
}