import { IsString, IsEmail, MinLength, MaxLength, IsOptional, Validate, ValidationArguments, ValidatorConstraint, ValidatorConstraintInterface } from 'class-validator';

@ValidatorConstraint({ name: 'emailOrPhone', async: false })
class EmailOrPhoneConstraint implements ValidatorConstraintInterface {
  validate(_: any, args: ValidationArguments) {
    const obj = args.object as any;
    return !!(obj.email || obj.phone);
  }
  defaultMessage(args: ValidationArguments) {
    return 'Either email or phone must be provided.';
  }
}

export class RegisterDto {
  @IsString()
  @MinLength(2)
  @MaxLength(20)
  readonly username: string;

  @IsOptional()
  @IsEmail()
  readonly email?: string;

  @IsOptional()
  @IsString()
  @MinLength(7)
  @MaxLength(15)
  readonly phone?: string;

  @IsString()
  @MinLength(6)
  readonly password: string;

  @Validate(EmailOrPhoneConstraint)
  private readonly emailOrPhoneCheck: string;
}
