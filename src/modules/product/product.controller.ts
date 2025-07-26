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

@Controller('product')
@UseGuards(AuthGuard('jwt'), RolesGuard)
export class ProductController {
  constructor(private readonly svc: ProductService) {}

  @Post()
  @Roles('seller', 'admin', 'super-admin')
  @UseInterceptors(FilesInterceptor('images', 5))
  create(
    @Body() dto: CreateProductDto,
    @UploadedFiles() files: any,
    @Request() req: any,
  ) {
    return this.svc.createWithImages(dto, files, req.user.userId);
  }

  @Get()
  @Roles('buyer', 'seller', 'admin', 'super-admin')
  findAll(
    @Query('search') search?: string,
    @Query('category') category?: string,
    @Query('minPrice') minPrice?: number,
    @Query('maxPrice') maxPrice?: number,
    @Query('sortBy') sortBy?: string,
    @Query('sortOrder') sortOrder: 'asc' | 'desc' = 'asc',
    @Query('page') page = 1,
    @Query('limit') limit = 10,
  ): Promise<PaginatedResult<Product>> {
    return this.svc.findAll({
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
  getOne(@Param('id', ParseObjectIdPipe) id: string) {
    return this.svc.getByIdOrFail(id);
  }

  @Patch(':id')
  @Roles('seller', 'admin', 'super-admin')
  @UseInterceptors(FilesInterceptor('images', 5))
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
  delete(
  @Param('id', ParseObjectIdPipe) id: string,
  @Request() req: any,
  ) {
    return this.svc.deleteById(id, req.user.userId, req.user.role);
  }
}
