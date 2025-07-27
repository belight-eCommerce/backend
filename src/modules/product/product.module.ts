import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { ProductController } from './product.controller';
import { ProductService } from './product.service';
import { CloudinaryService } from './cloudinary.service';
import { ProductsRepository } from './repository/product.repository';
import { Product, ProductSchema } from './schemas/product.schema';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: Product.name, schema: ProductSchema },
    ]),
  ],
  controllers: [ProductController],
  providers: [
    ProductService,
    CloudinaryService,
    ProductsRepository,
  ],
  exports: [ProductService, ProductsRepository],
})
export class ProductModule {}
