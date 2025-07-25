import {Controller,Post,Get,UseGuards,UseInterceptors,UploadedFiles,Body,Request,BadRequestException,Query,Param,NotFoundException,ForbiddenException,Patch,Delete,} from '@nestjs/common';
import { FilesInterceptor } from '@nestjs/platform-express';
import { AuthGuard } from '@nestjs/passport';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { ProductService } from './product.service';
import { CloudinaryService } from './cloudinary.service';
import { CreateProductDto } from './dto/create-product.dto';
import { ParseObjectIdPipe } from '@nestjs/mongoose';
import { UpdateProductDto } from './dto/update-product.dto';

@Controller('product')
@UseGuards(AuthGuard('jwt'), RolesGuard)
export class ProductController {
  constructor(
    private readonly productService: ProductService,
    private readonly cloudinaryService: CloudinaryService,
  ) {}

  @Post()
  @Roles('seller', 'admin', 'super-admin')
  @UseInterceptors(FilesInterceptor('images', 5))
  async createProduct(
    @Body() createProductDto: CreateProductDto,
    @UploadedFiles() files: any[],
    @Request() req: any,
  ) {
    if (files.length > 3) {
      throw new BadRequestException('You can upload up to 3 images per product.');
    }

    const imageUrls = await Promise.all(
      files.map((f) => this.cloudinaryService.uploadImage(f)),
    );

    const ownerId = req.user?.userId;
    if (!ownerId) {
      throw new BadRequestException('User ID not found in request.');
    }

    const product = await this.productService.create(
      { ...createProductDto, images: imageUrls },
      ownerId,
    );

    return {
      statusCode: 201,
      message: 'Product created successfully',
      data: product,
    };
  }

  @Get()
  @Roles('buyer', 'seller', 'admin', 'super-admin')
  async getAllProducts(
    @Query('search') search?: string,
    @Query('category') category?: string,
    @Query('minPrice') minPrice?: number,
    @Query('maxPrice') maxPrice?: number,
    @Query('sortBy') sortBy?: string,
    @Query('sortOrder') sortOrder: 'asc' | 'desc' = 'asc',
    @Query('page') page: number = 1,
    @Query('limit') limit: number = 10,
  ) {
    return this.productService.findAll({
      search,
      category,
      minPrice,
      maxPrice,
      sortBy,
      sortOrder,
      page,
      limit,
    });
  }

  @Get(':id')
  @Roles('buyer', 'seller', 'admin', 'super-admin')
  async getProductById(@Param('id', ParseObjectIdPipe) id: string) {
    const product = await this.productService.findById(id);
    if (!product) {
      throw new NotFoundException(`Product with ID ${id} not found`);
    }
    return product;
  }

  @Patch(':id')
  @Roles('seller', 'admin', 'super-admin')
  @UseInterceptors(FilesInterceptor('images', 5))
  async updateProduct(
    @Param('id', ParseObjectIdPipe) id: string,
    @Body() dto: UpdateProductDto,
    @UploadedFiles() files: any[],
    @Request() req: any,
  ) {
    const existing = await this.productService.findById(id);
    if (!existing) {
      throw new NotFoundException(`Product ${id} not found`);
    }

    const userId = req.user.userId;
    const isAdmin = ['admin', 'super-admin'].includes(req.user.role);
    if (!isAdmin && existing.owner.toString() !== userId) {
      throw new ForbiddenException(`You cannot edit someone else’s product`);
    }

    const toRemove: string[] = Array.isArray(dto.removeImages) ? dto.removeImages : [];
    if (toRemove.length) {
      dto.images = existing.images.filter((url) => !toRemove.includes(url));
      await Promise.all(
        toRemove.map((url) => this.cloudinaryService.deleteImageByUrl(url)),
      );
    }

    if (files && files.length) {
      const currentImageCount = dto.images?.length ?? existing.images.length;
      if (files.length + currentImageCount > 3) {
        throw new BadRequestException('You can upload up to 3 images per product.');
      }

      const newUrls = await Promise.all(
        files.map((f: any) => this.cloudinaryService.uploadImage(f)),
      );
      dto.images = [...(dto.images ?? existing.images), ...newUrls];
    }

    const updated = await this.productService.update(id, dto);
    return updated;
  }

  @Delete(':id')
  @Roles('seller', 'admin', 'super-admin')
  async deleteProduct(@Param('id', ParseObjectIdPipe) id: string, @Request() req: any) {
    const existing = await this.productService.findById(id);
    if (!existing) {
      throw new NotFoundException(`Product ${id} not found`);
    }

    const userId = req.user.userId;
    const isAdmin = ['admin', 'super-admin'].includes(req.user.role);
    if (!isAdmin && existing.owner.toString() !== userId) {
      throw new ForbiddenException(`You cannot delete someone else’s product`);
    }

    await Promise.all(
      existing.images.map((url) => this.cloudinaryService.deleteImageByUrl(url)),
    );

    await this.productService.remove(id);
    return { message: 'Deleted successfully', statusCode: 204 };
  }
}
