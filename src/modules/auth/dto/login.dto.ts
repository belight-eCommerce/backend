import { ApiProperty } from '@nestjs/swagger';

export class LoginDto {
  @ApiProperty({
    description: 'Email or phone number',
    example: 'kubsa@gmail.com',
  })
  username: string;

  @ApiProperty({
    description: 'User password',
    example: 's3cr3tP@ss',
  })
  password: string;
}
