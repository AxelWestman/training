import {
  IsNotEmpty,
  IsOptional,
  IsInt,
  IsBoolean,
  IsDateString,
} from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreateClientRoutineDto {
  @ApiProperty({ example: 1, description: 'Client id' })
  @IsInt()
  @IsNotEmpty()
  client_id: number;

  @ApiProperty({ example: 1, description: 'Routine id' })
  @IsInt()
  @IsNotEmpty()
  routine_id: number;

  @ApiProperty({
    example: '2026-09-01',
    description: 'Start date (YYYY-MM-DD)',
  })
  @IsDateString()
  start_date: string;

  @ApiPropertyOptional({
    example: '2026-10-01',
    description: 'End date (YYYY-MM-DD)',
  })
  @IsOptional()
  @IsDateString()
  end_date?: string;

  @ApiPropertyOptional({
    example: true,
    description: 'Whether the assignment is active (default true)',
  })
  @IsOptional()
  @IsBoolean()
  is_active?: boolean;
}

export class UpdateClientRoutineDto {
  @ApiPropertyOptional({
    example: '2026-09-15',
    description: 'Start date (YYYY-MM-DD)',
  })
  @IsOptional()
  @IsDateString()
  start_date?: string;

  @ApiPropertyOptional({
    example: '2026-11-01',
    description: 'End date (YYYY-MM-DD)',
  })
  @IsOptional()
  @IsDateString()
  end_date?: string;

  @ApiPropertyOptional({
    example: false,
    description: 'Whether the assignment is active',
  })
  @IsOptional()
  @IsBoolean()
  is_active?: boolean;
}

export class ClientRoutineResponseDto {
  @ApiProperty({ example: 1 })
  id: number;

  @ApiProperty({ example: 1 })
  client_id: number;

  @ApiProperty({ example: 'Juan Perez' })
  client_name: string;

  @ApiProperty({ example: 1 })
  routine_id: number;

  @ApiProperty({ example: 'Push / Pull / Legs' })
  routine_name: string;

  @ApiProperty({ example: 1 })
  assigned_by: number;

  @ApiProperty({ example: '2026-09-01' })
  start_date: string;

  @ApiProperty({ example: '2026-10-01', nullable: true })
  end_date: string | null;

  @ApiProperty({ example: true })
  is_active: boolean;

  @ApiProperty({ example: '2026-08-22T12:00:00.000Z' })
  created_at: string;

  @ApiProperty({ example: '2026-08-22T12:00:00.000Z' })
  updated_at: string;
}
