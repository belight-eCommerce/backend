import { IsString, IsNotEmpty, IsOptional, IsNumber, IsArray, IsBoolean, Min, ArrayNotEmpty } from 'class-validator';

export class CreateProductDto {
  @IsString()
  @IsNotEmpty()
  name: string;

  @IsString()
  @IsNotEmpty()
  description: string;

  @IsNumber()
  @Min(0)
  price: number;

  @IsString()
  @IsNotEmpty()
  category: string;

  @IsString()
  @IsOptional()
  sub_category?: string;

  @IsArray()
  @IsString({ each: true })
  @IsOptional()
  images?: string[];

  @IsNumber()
  @Min(0)
  stock_quantity: number;

  @IsString()
  @IsOptional()
  brand?: string;

  @IsNumber()
  @IsOptional()
  ratings?: number;

  @IsNumber()
  @IsOptional()
  num_reviews?: number;

  @IsBoolean()
  @IsOptional()
  is_available?: boolean;
}
