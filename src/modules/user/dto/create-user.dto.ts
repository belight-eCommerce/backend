import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {IsEmail,IsNotEmpty,IsString,MinLength,ValidateIf,} from 'class-validator';

export class CreateUserDto {
  @ApiProperty({
    example: 'Alice',
    description: 'First name of the user',
  })
  @IsNotEmpty({ message: 'First name is required' })
  @IsString()
  firstName: string;

  @ApiProperty({
    example: 'Johnson',
    description: 'Last name of the user',
  })
  @IsNotEmpty({ message: 'Last name is required' })
  @IsString()
  lastName: string;

  @ApiPropertyOptional({
    example: 'alice@example.com',
    description: 'Email address (required if phone is not provided)',
  })
  @ValidateIf(o => !o.phone)
  @IsNotEmpty({ message: 'Email is required if phone is not provided' })
  @IsEmail({}, { message: 'Invalid email format' })
  email?: string;

  @ApiPropertyOptional({
    example: '+251912345678',
    description: 'Phone number (required if email is not provided)',
  })
  @ValidateIf(o => !o.email)
  @IsNotEmpty({ message: 'Phone number is required if email is not provided' })
  @IsString()
  phone?: string;

  @ApiProperty({
    example: 'buyer',
    enum: ['buyer', 'seller', 'admin', 'super-admin'],
    description: 'Role of the user',
  })
  @IsNotEmpty({ message: 'Role is required' })
  @IsString()
  role: string;

  @ApiProperty({
    example: 's3cr3tP@ss',
    minLength: 6,
    description: 'Password (minimum 6 characters)',
  })
  @IsNotEmpty({ message: 'Password is required' })
  @MinLength(6, { message: 'Password must be at least 6 characters long' })
  password: string;
}
