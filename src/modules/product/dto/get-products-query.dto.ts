import { IsOptional, IsString, IsNumber, Min, IsIn } from 'class-validator';
import { Type } from 'class-transformer';
import { PaginationOptions } from '../../../common/dto/pagination.dto';

export class GetProductsQueryDto extends PaginationOptions {
  @IsOptional()
  @IsString()
  readonly search?: string;

  @IsOptional()
  @IsString()
  readonly category?: string;

  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Min(0)
  readonly minPrice?: number;

  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Min(0)
  readonly maxPrice?: number;

  @IsOptional()
  @IsString()
  readonly sortBy?: string;

  @IsOptional()
  @IsIn(['asc', 'desc'])
  readonly sortOrder?: 'asc' | 'desc';
}
