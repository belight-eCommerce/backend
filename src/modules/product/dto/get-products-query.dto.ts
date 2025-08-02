import { IsOptional, IsString, IsNumber, Min, IsIn } from 'class-validator';
import { Type } from 'class-transformer';
import { PaginationOptions } from '../../../common/dto/pagination.dto';
import { ApiPropertyOptional } from '@nestjs/swagger';

export class GetProductsQueryDto extends PaginationOptions {
  @ApiPropertyOptional({ description: 'Search term for product name or description' })
  @IsOptional()
  @IsString()
  readonly search?: string;
  @ApiPropertyOptional({ description: 'Filter by category ID or name' })
  @IsOptional()
  @IsString()
  readonly category?: string;
  @ApiPropertyOptional({ description: 'Minimum price filter', example: 0 })
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Min(0)
  readonly minPrice?: number;
  @ApiPropertyOptional({ description: 'Maximum price filter', example: 1000 })
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Min(0)
  readonly maxPrice?: number;
  @ApiPropertyOptional({ description: 'Sort field (e.g. price, name, createdAt)' })
  @IsOptional()
  @IsString()
  readonly sortBy?: string;
  @ApiPropertyOptional({ enum: ['asc', 'desc'], description: 'Sort order' })
  @IsOptional()
  @IsIn(['asc', 'desc'])
  readonly sortOrder?: 'asc' | 'desc';
}
