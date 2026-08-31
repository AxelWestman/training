import {
  IsString,
  IsEmail,
  IsNotEmpty,
  IsOptional,
  IsIn,
} from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreateAdminDto {
  @ApiProperty({ example: 'Ana', description: 'First name' })
  @IsString()
  @IsNotEmpty()
  name: string;

  @ApiProperty({ example: 'Lopez', description: 'Last name' })
  @IsString()
  @IsNotEmpty()
  lastname: string;

  @ApiProperty({ example: 'ana@example.com', description: 'Email address' })
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

  @ApiPropertyOptional({
    enum: ['admin', 'superadmin'],
    example: 'admin',
    description: 'Admin role',
  })
  @IsOptional()
  @IsIn(['admin', 'superadmin'])
  role: 'admin' | 'superadmin';

  @ApiProperty({ example: '12345678', description: 'National ID (DNI)' })
  @IsString()
  @IsNotEmpty()
  dni: string;

  @ApiPropertyOptional({
    example: '+549112345678',
    description: 'Phone number',
  })
  @IsOptional()
  @IsString()
  phone?: string;
}

export class UpdateAdminDto {
  @ApiPropertyOptional({ example: 'Ana', description: 'First name' })
  @IsOptional()
  @IsString()
  name?: string;

  @ApiPropertyOptional({ example: 'Lopez', description: 'Last name' })
  @IsOptional()
  @IsString()
  lastname?: string;

  @ApiPropertyOptional({
    example: 'ana@example.com',
    description: 'Email address',
  })
  @IsOptional()
  @IsEmail()
  email?: string;

  @ApiPropertyOptional({
    example: 'secret123',
    description: 'New password (hashed on save)',
  })
  @IsOptional()
  @IsString()
  password?: string;

  @ApiPropertyOptional({
    example: '12345678',
    description: 'National ID (DNI)',
  })
  @IsOptional()
  @IsString()
  dni?: string;

  @ApiPropertyOptional({
    example: '+549112345678',
    description: 'Phone number',
  })
  @IsOptional()
  @IsString()
  phone?: string;

  @ApiPropertyOptional({
    enum: ['admin', 'superadmin'],
    example: 'admin',
    description: 'Admin role',
  })
  @IsOptional()
  @IsIn(['admin', 'superadmin'])
  role?: 'admin' | 'superadmin';
}

export class AdminResponseDto {
  @ApiProperty({ example: 1 })
  id: number;

  @ApiProperty({ example: 'Ana' })
  name: string;

  @ApiProperty({ example: 'Lopez' })
  lastname: string;

  @ApiProperty({ example: 'ana@example.com' })
  email: string;

  @ApiProperty({ example: '12345678' })
  dni: string;

  @ApiProperty({ example: '+549112345678' })
  phone: string;

  @ApiProperty({ enum: ['admin', 'superadmin'], example: 'admin' })
  role: string;

  @ApiProperty({ example: '2026-08-22T12:00:00.000Z' })
  created_at: string;
}
