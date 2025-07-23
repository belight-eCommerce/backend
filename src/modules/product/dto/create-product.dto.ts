import {IsString,IsNotEmpty,IsOptional,IsNumber,Min,IsArray,ArrayNotEmpty,IsBoolean,} from 'class-validator';
import { Type } from 'class-transformer';

export class CreateProductDto {
  @IsString()
  @IsNotEmpty()
  name: string;

  @IsString()
  @IsNotEmpty()
  description: string;

  @Type(() => Number)
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
  @ArrayNotEmpty()
  @IsString({ each: true })
  @IsOptional()
  images?: string[];

  @Type(() => Number)
  @IsNumber()
  @Min(0)
  stock_quantity: number;

  @Type(() => Number)
  @IsNumber()
  @Min(0)
  @IsOptional()
  discount?: number;

  @Type(() => Number)
  @IsNumber()
  @IsOptional()
  ratings?: number;

  @Type(() => Number)
  @IsNumber()
  @IsOptional()
  num_reviews?: number;

  @Type(() => Boolean)
  @IsBoolean()
  @IsOptional()
  is_available?: boolean;
}
