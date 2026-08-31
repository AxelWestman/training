import {
  IsString,
  IsNotEmpty,
  IsOptional,
  IsInt,
  IsBoolean,
  IsNumber,
  Min,
} from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreateMembershipDto {
  @ApiProperty({ example: 'Mensual', description: 'Membership plan name' })
  @IsString()
  @IsNotEmpty()
  name: string;

  @ApiProperty({ example: 30, description: 'Duration in days' })
  @IsInt()
  @Min(1)
  duration_days: number;

  @ApiProperty({ example: 15000.0, description: 'Price' })
  @IsNumber()
  @Min(0)
  price: number;

  @ApiPropertyOptional({
    example: true,
    description: 'Whether the plan is active',
  })
  @IsOptional()
  @IsBoolean()
  is_active?: boolean;
}

export class UpdateMembershipDto {
  @ApiPropertyOptional({
    example: 'Mensual',
    description: 'Membership plan name',
  })
  @IsOptional()
  @IsString()
  name?: string;

  @ApiPropertyOptional({ example: 30, description: 'Duration in days' })
  @IsOptional()
  @IsInt()
  @Min(1)
  duration_days?: number;

  @ApiPropertyOptional({ example: 15000.0, description: 'Price' })
  @IsOptional()
  @IsNumber()
  @Min(0)
  price?: number;

  @ApiPropertyOptional({
    example: true,
    description: 'Whether the plan is active',
  })
  @IsOptional()
  @IsBoolean()
  is_active?: boolean;
}

export class MembershipResponseDto {
  @ApiProperty({ example: 1 })
  id: number;

  @ApiProperty({ example: 'Mensual' })
  name: string;

  @ApiProperty({ example: 30 })
  duration_days: number;

  @ApiProperty({ example: 15000.0 })
  price: string;

  @ApiProperty({ example: true })
  is_active: boolean;

  @ApiProperty({ example: '2026-08-22T12:00:00.000Z' })
  created_at: string;
}
