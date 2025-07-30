import { IsOptional, IsString, IsNumber, Min } from 'class-validator';
import { PaginationOptions } from 'src/common/dto/pagination.dto';

export class GetUsersQueryDto extends PaginationOptions {
  @IsOptional()
  @IsString()
  readonly searchEmail?: string;
}
