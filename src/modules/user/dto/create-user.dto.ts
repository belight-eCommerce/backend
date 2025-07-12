import { IsEmail, IsNotEmpty, IsString, MinLength, ValidateIf } from 'class-validator';

export class CreateUserDto {
  @IsNotEmpty({ message: 'First name is required' })
  @IsString()
  firstName: string;

  @IsNotEmpty({ message: 'Last name is required' })
  @IsString()
  lastName: string;

  @ValidateIf(o => !o.phone)
  @IsNotEmpty({ message: 'Email is required if phone is not provided' })
  @IsEmail({}, { message: 'Invalid email format' })
  email?: string;

  @ValidateIf(o => !o.email)
  @IsNotEmpty({ message: 'Phone number is required if email is not provided' })
  @IsString()
  phone?: string;

  @IsNotEmpty({ message: 'Role is required' })
  @IsString()
  role: string;

  @IsNotEmpty({ message: 'Password is required' })
  @MinLength(6, { message: 'Password must be at least 6 characters long' })
  password: string;
}
