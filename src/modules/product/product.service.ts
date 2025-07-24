import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { Product, ProductDocument } from './schemas/product.schema';
import { CreateProductDto } from './dto/create-product.dto';
import { UpdateProductDto } from './dto/update-product.dto';

@Injectable()
export class ProductService {
  constructor(
    @InjectModel(Product.name) private productModel: Model<ProductDocument>,
  ) {}

  async create(
    createProductDto: CreateProductDto,
    ownerId: string,
  ): Promise<Product> {
    const productData = {
      ...createProductDto,
      owner: new Types.ObjectId(ownerId), 
    };

    const created = new this.productModel(productData);
    return created.save();
  }
  
  async findAll(query: {
    search?: string;
    category?: string;
    minPrice?: number;
    maxPrice?: number;
    sortBy?: string;
    sortOrder?: 'asc' | 'desc';
    page?: number;
    limit?: number;
  }): Promise<Product[]> {
    const filter: any = {};
    if (query.search) {
      filter.name = { $regex: query.search, $options: 'i' };
    }
    if (query.category) {
      filter.category = query.category;
    }
    if (query.minPrice || query.maxPrice) {
      filter.price = {};
      if (query.minPrice) filter.price.$gte = query.minPrice;
      if (query.maxPrice) filter.price.$lte = query.maxPrice;
    }

    const sort: any = {};
    if (query.sortBy) {
      sort[query.sortBy] = query.sortOrder === 'desc' ? -1 : 1;
    }

    const page = query.page || 1;
    const limit = query.limit || 10;
    const skip = (page - 1) * limit;

    return this.productModel
      .find(filter)
      .sort(sort)
      .skip(skip)
      .limit(limit)
      .exec();
  }

  async findById(id: string): Promise<Product | null> {
    return this.productModel
      .findById(new Types.ObjectId(id))
      .exec();
  }

  async update(
    id: string,
    dto: UpdateProductDto,
  ): Promise<Product> {
    const updated = await this.productModel
      .findByIdAndUpdate(
        new Types.ObjectId(id),
        { $set: dto },
        { new: true, runValidators: true },
      )
      .exec();

    if (!updated) {
      throw new NotFoundException(`Product with ID ${id} not found`);
    }
    return updated;
  }

  async remove(id: string): Promise<void> {
    const result = await this.productModel
      .findByIdAndDelete(new Types.ObjectId(id))
      .exec();

    if (!result) {
      throw new NotFoundException(`Product with ID ${id} not found`);
    }
  }

}
