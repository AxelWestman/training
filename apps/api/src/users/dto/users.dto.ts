import { IsString, IsEmail, IsNotEmpty } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateUsersDto {
  @ApiProperty({ example: 'Juan', description: 'First name' })
  @IsString()
  @IsNotEmpty()
  name: string;

  @ApiProperty({ example: 'Perez', description: 'Last name' })
  @IsString()
  @IsNotEmpty()
  lastname: string;

  @ApiProperty({ example: 'juan@example.com', description: 'Email address' })
  @IsEmail()
  @IsNotEmpty()
  email: string;

  @ApiProperty({
    example: 'secret123',
    description: 'Plain password (hashed on save)',
  })
  @IsString()
  @IsNotEmpty()
  password: string;

  @ApiProperty({ example: '12345678', description: 'National ID (DNI)' })
  @IsString()
  @IsNotEmpty()
  dni: string;
}

export class UserResponseDto {
  @ApiProperty({ example: 1 })
  id: number;

  @ApiProperty({ example: 'Juan' })
  name: string;

  @ApiProperty({ example: 'Perez' })
  lastname: string;

  @ApiProperty({ example: 'juan@example.com' })
  email: string;

  @ApiProperty({ example: '12345678' })
  dni: string;

  @ApiProperty({ example: '+549112345678' })
  phone: string;

  @ApiProperty({ example: '1990-05-20' })
  birth_date: string;

  @ApiProperty({ example: 'No known conditions' })
  health_specs: string;

  @ApiProperty({ example: 'Av. Siempre Viva 123' })
  address: string;

  @ApiProperty({ example: true })
  is_active: boolean;

  @ApiProperty({ example: '2026-08-22T12:00:00.000Z' })
  created_at: string;

  @ApiProperty({ example: '2026-08-22T12:00:00.000Z' })
  updated_at: string;
}
