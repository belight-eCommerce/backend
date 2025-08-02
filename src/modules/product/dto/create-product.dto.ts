import {IsString,
  IsNotEmpty,
  IsOptional,
  IsNumber,
  Min,
  IsArray,
  ArrayNotEmpty,
  IsBoolean,
} from 'class-validator';
import { Type } from 'class-transformer';
import {
  ApiProperty,
  ApiPropertyOptional,
} from '@nestjs/swagger';

export class CreateProductDto {
  @ApiProperty({ example: 'iPhone 14 ProMax', description: 'Product name or brand' })
  @IsString()
  @IsNotEmpty()
  name: string;
  @ApiProperty({ example: 'The latest and high quality phone from Apple.', description: 'Product description' })
  @IsString()
  @IsNotEmpty()
  description: string;
  @ApiProperty({ example: 99999, description: 'Price in ETB' })
  @Type(() => Number)
  @IsNumber()
  @Min(0)
  price: number;
  @ApiProperty({ example: 'Electronics', description: 'Main product category' })
  @IsString()
  @IsNotEmpty()
  category: string;
  @ApiPropertyOptional({ example: 'Smartphones', description: 'Sub-category under main category' })
  @IsString()
  @IsOptional()
  sub_category?: string;

  @ApiPropertyOptional({
    example: ['https://cloudinary.com/image1.jpg', 'https://cloudinary.com/image2.jpg'],
    description: 'Array of product image URLs',
    type: [String],
  })
  @IsArray()
  @ArrayNotEmpty()
  @IsString({ each: true })
  @IsOptional()
  images?: string[];
@ApiProperty({ example: 50, description: 'Number of items in stock' })
  @Type(() => Number)
  @IsNumber()
  @Min(0)
  stock_quantity: number
 @ApiPropertyOptional({ example: 10, description: 'Discount percentage (e.g. 10 = 10%)' })
  @Type(() => Number)
  @IsNumber()
  @Min(0)
  @IsOptional()
  discount?: number;
  @ApiPropertyOptional({ example: 4.5, description: 'Average user rating' })
  @Type(() => Number)
  @IsNumber()
  @IsOptional()
  ratings?: number;
  @ApiPropertyOptional({ example: 120, description: 'Number of customer reviews' })
  @Type(() => Number)
  @IsNumber()
  @IsOptional()
  num_reviews?: number;
  @ApiPropertyOptional({ example: true, description: 'Is product available for purchase?' })
  @Type(() => Boolean)
  @IsBoolean()
  @IsOptional()
  is_available?: boolean;
}
