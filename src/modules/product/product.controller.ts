import {Controller,Post,Get,Patch,Delete,UseGuards,UseInterceptors,UploadedFiles,Body,Request,Query,Param,} from '@nestjs/common';
import { FilesInterceptor } from '@nestjs/platform-express';
import { AuthGuard } from '@nestjs/passport';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { ProductService } from './product.service';
import { CreateProductDto } from './dto/create-product.dto';
import { UpdateProductDto } from './dto/update-product.dto';
import { ParseObjectIdPipe } from '@nestjs/mongoose';
import { PaginatedResult } from 'src/common/dto/pagination.dto';
import { Product } from './schemas/product.schema';
import { GetProductsQueryDto } from './dto/get-products-query.dto';
import {
  ApiTags,ApiBearerAuth,ApiConsumes, ApiBody,ApiOperation,ApiResponse,
 ApiQuery,
  ApiParam,
} from '@nestjs/swagger';
@ApiTags('products')
@ApiBearerAuth()
@Controller('product')
@UseGuards(AuthGuard('jwt'), RolesGuard)
export class ProductController {
  constructor(private readonly svc: ProductService) {}

  @Post()
  @Roles('seller', 'admin', 'super-admin')
  @UseInterceptors(FilesInterceptor('images', 5))
  @ApiOperation({ summary: 'Create a new product (with image upload)' })
  @ApiConsumes('multipart/form-data')
  @ApiBody({
    description: 'Product data and images',
    type: CreateProductDto,
  })
  @ApiResponse({ status: 201, description: 'Product created successfully' })
  create(
    @Body() dto: CreateProductDto,
    @UploadedFiles() files: any,
    @Request() req: any,
  ) {
    return this.svc.createWithImages(dto, files, req.user.userId);
  }


  @Get()
  @Roles('buyer', 'seller', 'admin', 'super-admin')
  @ApiOperation({ summary: 'Get all products (paginated & filtered)' })
  @ApiQuery({ name: 'page', required: false, type: Number })
  @ApiQuery({ name: 'limit', required: false, type: Number })
  @ApiQuery({ name: 'search', required: false, type: String })
  @ApiQuery({ name: 'category', required: false, type: String })
  @ApiQuery({ name: 'minPrice', required: false, type: Number })
  @ApiQuery({ name: 'maxPrice', required: false, type: Number })
  @ApiResponse({ status: 200, description: 'List of products returned' })
  findAll(
    @Query() query: GetProductsQueryDto,
  ): Promise<PaginatedResult<Product>> {
    return this.svc.findAll(query);
  }

  @Get(':id')
  @Roles('buyer', 'seller', 'admin', 'super-admin')
  @ApiOperation({ summary: 'Get a single product by ID' })
  @ApiParam({ name: 'id', description: 'Product ID' })
  @ApiResponse({ status: 200, description: 'Product retrieved successfully' })
  @ApiResponse({ status: 404, description: 'Product not found' })
  getOne(@Param('id', ParseObjectIdPipe) id: string) {
    return this.svc.getByIdOrFail(id);
  }

  @Patch(':id')
  @Roles('seller', 'admin', 'super-admin')
  @UseInterceptors(FilesInterceptor('images', 5))
  @ApiOperation({ summary: 'Update product data and/or images' })
  @ApiConsumes('multipart/form-data')
  @ApiParam({ name: 'id', description: 'Product ID' })
  @ApiBody({ type: UpdateProductDto })
  @ApiResponse({ status: 200, description: 'Product updated successfully' })
  update(
    @Param('id', ParseObjectIdPipe) id: string,
    @Body() dto: UpdateProductDto,
    @UploadedFiles() files:any,
    @Request() req: any,
  ) {
    return this.svc.updateWithImages(
      id,
      dto,
      files,
      req.user.userId,
      req.user.role,
    );
  }

  @Delete(':id')
  @Roles('seller', 'admin', 'super-admin')
  @ApiOperation({ summary: 'Delete a product by ID' })
  @ApiParam({ name: 'id', description: 'Product ID' })
  @ApiResponse({ status: 200, description: 'Product deleted successfully' })
  @ApiResponse({ status: 404, description: 'Product not found' })

  delete(
  @Param('id', ParseObjectIdPipe) id: string,
  @Request() req: any,
  ) {
    return this.svc.deleteById(id, req.user.userId, req.user.role);
  }
}
