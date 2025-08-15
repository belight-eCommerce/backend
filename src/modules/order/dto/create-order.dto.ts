import {IsString,IsNotEmpty,IsNumber,Min,IsArray,ArrayNotEmpty,IsOptional,IsBoolean,IsDateString,ValidateNested,IsMongoId,} from 'class-validator';
import { Type } from 'class-transformer';

class OrderItemDto {
  @IsMongoId()
  @IsNotEmpty()
  product: string;

  @IsString()
  @IsNotEmpty()
  name: string;

  @Type(() => Number)
  @IsNumber()
  @Min(1)
  quantity: number;

  @Type(() => Number)
  @IsNumber()
  @Min(0)
  price: number;

  @IsString()
  @IsOptional()
  image?: string;
}

class ShippingAddressDto {
  @IsString()
  @IsNotEmpty()
  address: string;

  @IsString()
  @IsNotEmpty()
  city: string;

  @IsString()
  @IsNotEmpty()
  postal_code: string;

  @IsString()
  @IsNotEmpty()
  country: string;
}

class PaymentResultDto {
  @IsString()
  @IsOptional()
  id?: string;

  @IsString()
  @IsOptional()
  status?: string;

  @IsDateString()
  @IsOptional()
  update_time?: Date;

  @IsString()
  @IsOptional()
  email_address?: string;
}

export class CreateOrderDto {
  @IsMongoId()
  @IsNotEmpty()
  user: string;

  @IsArray()
  @ArrayNotEmpty()
  @ValidateNested({ each: true })
  @Type(() => OrderItemDto)
  order_items: OrderItemDto[];

  @ValidateNested()
  @Type(() => ShippingAddressDto)
  shipping_address: ShippingAddressDto;

  @IsString()
  @IsNotEmpty()
  payment_method: string;

  @ValidateNested()
  @Type(() => PaymentResultDto)
  @IsOptional()
  payment_result?: PaymentResultDto;

  @Type(() => Number)
  @IsNumber()
  @Min(0)
  tax_price: number;

  @Type(() => Number)
  @IsNumber()
  @Min(0)
  shipping_price: number;

  @Type(() => Number)
  @IsNumber()
  @Min(0)
  total_price: number;

  @IsString()
  @IsOptional()
  order_status?: string;

  @IsBoolean()
  @IsOptional()
  is_paid?: boolean;

  @IsDateString()
  @IsOptional()
  paid_at?: Date;

  @IsBoolean()
  @IsOptional()
  is_delivered?: boolean;

  @IsDateString()
  @IsOptional()
  delivered_at?: Date;
}
