import { PartialType } from '@nestjs/mapped-types';
import { CreateProductDto } from './create-product.dto';
import { ArrayNotEmpty, IsArray, IsOptional, IsString, IsUrl } from 'class-validator';

export class UpdateProductDto extends PartialType(CreateProductDto) {
  @IsArray()
  @ArrayNotEmpty()
  @IsString({ each: true })
  @IsUrl({}, { each: true })
  @IsOptional()
  removeImages?: string[];
}

