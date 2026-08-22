import { IsEmail, IsString, IsNotEmpty } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class LoginDto {
  @ApiProperty({ example: 'admin@example.com', description: 'Account email' })
  @IsEmail()
  @IsNotEmpty()
  email: string;

  @ApiProperty({ example: 'secret123', description: 'Account password' })
  @IsString()
  @IsNotEmpty()
  password: string;
}

export class LoginResponseDto {
  @ApiProperty({ example: 1 })
  id: number;

  @ApiProperty({ example: 'Ana' })
  name: string;

  @ApiProperty({ example: 'Lopez' })
  lastname: string;

  @ApiProperty({ example: 'admin@example.com' })
  email: string;

  @ApiProperty({ enum: ['admin', 'client'], example: 'admin' })
  type: string;

  @ApiProperty({ enum: ['admin', 'superadmin', 'client'], example: 'admin' })
  role: string;
}
