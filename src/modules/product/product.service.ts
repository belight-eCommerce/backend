import { Injectable, NotFoundException } from '@nestjs/common';
import { CreateProductDto } from './dto/create-product.dto';
import { UpdateProductDto } from './dto/update-product.dto';
import { ProductsRepository } from './repository/product.repository';
import { Product } from './schemas/product.schema';

@Injectable()
export class ProductService {
  constructor(private readonly repo: ProductsRepository) {}

  async create(createDto: CreateProductDto, ownerId: string): Promise<Product> {
    return this.repo.create(createDto, ownerId);
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
    if (query.search) filter.name = { $regex: query.search, $options: 'i' };
    if (query.category) filter.category = query.category;
    if (query.minPrice || query.maxPrice) {
      filter.price = {};
      if (query.minPrice) filter.price.$gte = query.minPrice;
      if (query.maxPrice) filter.price.$lte = query.maxPrice;
    }

    const page = query.page ?? 1;
    const limit = query.limit ?? 10;
    const skip = (page - 1) * limit;
    const sort: any = {};
    if (query.sortBy) sort[query.sortBy] = query.sortOrder === 'desc' ? -1 : 1;

    return this.repo.findAll(filter, { skip, limit, sort });
  }

  async findById(id: string): Promise<Product> {
    const product = await this.repo.findById(id);
    if (!product) throw new NotFoundException(`Product with ID ${id} not found`);
    return product;
  }

  async update(id: string, updateDto: UpdateProductDto): Promise<Product> {
    return this.repo.update(id, updateDto);
  }

  async remove(id: string): Promise<void> {
    return this.repo.remove(id);
  }
}