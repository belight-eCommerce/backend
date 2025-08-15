import { PartialType } from '@nestjs/mapped-types';
import { CreateOrderDto } from '../dto/create-order.dto'
import { IsString, IsOptional } from 'class-validator';

export class UpdateOrderDto extends PartialType(CreateOrderDto) {
  @IsString()
  @IsOptional()
  order_status?: string;
}
