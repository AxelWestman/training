import {
  IsString,
  IsNotEmpty,
  IsOptional,
  IsInt,
  IsDateString,
  Matches,
} from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreateClientMembershipDto {
  @ApiProperty({ example: 1, description: 'Client id' })
  @IsInt()
  @IsNotEmpty()
  client_id: number;

  @ApiProperty({ example: 1, description: 'Membership plan id' })
  @IsInt()
  @IsNotEmpty()
  membership_id: number;

  @ApiProperty({
    example: '2026-09-01',
    description: 'Start date (YYYY-MM-DD)',
  })
  @IsDateString()
  start_date: string;

  @ApiPropertyOptional({
    example: '2026-10-01',
    description: 'End date. Defaults to start_date + membership duration_days',
  })
  @IsOptional()
  @IsDateString()
  end_date?: string;

  @ApiPropertyOptional({
    example: 'active',
    description: "Status: 'active' | 'expired' | 'cancelled'",
  })
  @IsOptional()
  @IsString()
  @Matches(/^(active|expired|cancelled)$/)
  status?: string;
}

export class UpdateClientMembershipDto {
  @ApiPropertyOptional({
    example: '2026-09-15',
    description: 'Start date (YYYY-MM-DD)',
  })
  @IsOptional()
  @IsDateString()
  start_date?: string;

  @ApiPropertyOptional({
    example: '2026-10-15',
    description: 'End date (YYYY-MM-DD)',
  })
  @IsOptional()
  @IsDateString()
  end_date?: string;

  @ApiPropertyOptional({
    example: 'cancelled',
    description: "Status: 'active' | 'expired' | 'cancelled'",
  })
  @IsOptional()
  @IsString()
  @Matches(/^(active|expired|cancelled)$/)
  status?: string;
}

export class ClientMembershipResponseDto {
  @ApiProperty({ example: 1 })
  id: number;

  @ApiProperty({ example: 1 })
  client_id: number;

  @ApiProperty({ example: 'Juan Perez' })
  client_name: string;

  @ApiProperty({ example: 1 })
  membership_id: number;

  @ApiProperty({ example: 'Mensual' })
  membership_name: string;

  @ApiProperty({ example: '2026-09-01' })
  start_date: string;

  @ApiProperty({ example: '2026-10-01' })
  end_date: string;

  @ApiProperty({ example: 'active' })
  status: string;

  @ApiProperty({ example: '2026-08-22T12:00:00.000Z' })
  created_at: string;

  @ApiProperty({ example: '2026-08-22T12:00:00.000Z' })
  updated_at: string;
}
