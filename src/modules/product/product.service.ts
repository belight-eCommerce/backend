import { Injectable } from '@nestjs/common';
import { ProductsRepository } from './repository/product.repository';
import { CloudinaryService } from './cloudinary.service';
import { CreateProductDto } from './dto/create-product.dto';
import { UpdateProductDto } from './dto/update-product.dto';
import { Product } from './schemas/product.schema';
import {ProductNotFoundException,ProductOwnershipException,ProductImageLimitException,} from '../../exceptions/product.exceptions';
import { PaginatedResult, PaginationMeta } from '../../common/dto/pagination.dto';

@Injectable()
export class ProductService {
  constructor(
    private readonly repo: ProductsRepository,
    private readonly cloudinary: CloudinaryService,
  ) {}

  async createWithImages(
    dto: CreateProductDto,
    files: any,
    ownerId: string,
  ): Promise<Product> {
    if (files.length > 3) {
      throw new ProductImageLimitException();
    }

    const imageUrls = await Promise.all(
      files.map((file) => this.cloudinary.uploadImage(file)),
    );

    return this.repo.create({ ...dto, images: imageUrls }, ownerId);
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
  }): Promise<PaginatedResult<Product>> {
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
    if (query.sortBy) {
      sort[query.sortBy] = query.sortOrder === 'desc' ? -1 : 1;
    }

    const { items, total } = await this.repo.findAndCount(filter, {
      skip,
      limit,
      sort,
    });

    const totalPages = Math.ceil(total / limit);
    const meta: PaginationMeta = { total, page, limit, totalPages };
    return { data: items, meta };
  }

  async getByIdOrFail(id: string): Promise<Product> {
    const product = await this.repo.findById(id);
    if (!product) {
      throw new ProductNotFoundException(id);
    }
    return product;
  }

  async updateWithImages(
    id: string,
    dto: UpdateProductDto,
    files: any,
    userId: string,
    userRole: string,
  ): Promise<Product> {
    const product = await this.getByIdOrFail(id);

    const isAdmin = ['admin', 'super-admin'].includes(userRole);
    if (!isAdmin && product.owner.toString() !== userId) {
      throw new ProductOwnershipException();
    }

    const toRemove = dto.removeImages ?? [];
    if (toRemove.length) {
      dto.images = product.images.filter((url) => !toRemove.includes(url));
      await Promise.all(
        toRemove.map((url) => this.cloudinary.deleteImageByUrl(url)),
      );
    }

    const currentCount = dto.images?.length ?? product.images.length;
    if (files.length + currentCount > 3) {
      throw new ProductImageLimitException();
    }
    const newUrls = await Promise.all(
      files.map((file) => this.cloudinary.uploadImage(file)),
    );
    dto.images = [...(dto.images ?? []), ...newUrls];

    return this.repo.update(id, dto);
  }

  async deleteById(
    id: string,
    userId: string,
    userRole: string,
  ): Promise<void> {
    const product = await this.getByIdOrFail(id);

    const isAdmin = ['admin', 'super-admin'].includes(userRole);
    if (!isAdmin && product.owner.toString() !== userId) {
      throw new ProductOwnershipException();
    }

    await Promise.all(
      product.images.map((url) => this.cloudinary.deleteImageByUrl(url)),
    );

    await this.repo.remove(id);
  }
}
