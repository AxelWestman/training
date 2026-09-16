import {
  IsString,
  IsNotEmpty,
  IsOptional,
  IsInt,
  IsNumber,
  IsDateString,
  Min,
  Matches,
} from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreatePaymentDto {
  @ApiProperty({ example: 1, description: 'Client id' })
  @IsInt()
  @IsNotEmpty()
  client_id: number;

  @ApiPropertyOptional({
    example: 1,
    description: 'Client membership id the payment is linked to',
  })
  @IsOptional()
  @IsInt()
  client_membership_id?: number;

  @ApiProperty({ example: 15000.0, description: 'Amount paid' })
  @IsNumber()
  @Min(0)
  amount: number;

  @ApiProperty({
    example: '2026-09-01',
    description: 'Date the payment was made (YYYY-MM-DD)',
  })
  @IsDateString()
  payment_date: string;

  @ApiProperty({
    example: '2026-09-01',
    description: 'Due date of the payment (YYYY-MM-DD)',
  })
  @IsDateString()
  due_date: string;

  @ApiProperty({
    example: 'cash',
    description: "Method: 'cash' | 'card' | 'transfer'",
  })
  @IsString()
  @Matches(/^(cash|card|transfer)$/)
  method: string;

  @ApiPropertyOptional({
    example: 'pending',
    description: "Status: 'paid' | 'pending' | 'overdue' (default 'pending')",
  })
  @IsOptional()
  @IsString()
  @Matches(/^(paid|pending|overdue)$/)
  status?: string;
}

export class UpdatePaymentDto {
  @ApiPropertyOptional({
    example: 1,
    description: 'Client membership id the payment is linked to',
  })
  @IsOptional()
  @IsInt()
  client_membership_id?: number;

  @ApiPropertyOptional({ example: 15000.0, description: 'Amount paid' })
  @IsOptional()
  @IsNumber()
  @Min(0)
  amount?: number;

  @ApiPropertyOptional({
    example: '2026-09-01',
    description: 'Date the payment was made (YYYY-MM-DD)',
  })
  @IsOptional()
  @IsDateString()
  payment_date?: string;

  @ApiPropertyOptional({
    example: '2026-09-15',
    description: 'Due date of the payment (YYYY-MM-DD)',
  })
  @IsOptional()
  @IsDateString()
  due_date?: string;

  @ApiPropertyOptional({
    example: 'card',
    description: "Method: 'cash' | 'card' | 'transfer'",
  })
  @IsOptional()
  @IsString()
  @Matches(/^(cash|card|transfer)$/)
  method?: string;

  @ApiPropertyOptional({
    example: 'paid',
    description: "Status: 'paid' | 'pending' | 'overdue'",
  })
  @IsOptional()
  @IsString()
  @Matches(/^(paid|pending|overdue)$/)
  status?: string;
}

export class PaymentResponseDto {
  @ApiProperty({ example: 1 })
  id: number;

  @ApiProperty({ example: 1 })
  client_id: number;

  @ApiProperty({ example: 'Juan Perez' })
  client_name: string;

  @ApiProperty({ example: 1, nullable: true })
  client_membership_id: number | null;

  @ApiProperty({ example: 'Mensual', nullable: true })
  membership_name: string | null;

  @ApiProperty({ example: 15000.0 })
  amount: string;

  @ApiProperty({ example: '2026-09-01' })
  payment_date: string;

  @ApiProperty({ example: '2026-09-01' })
  due_date: string;

  @ApiProperty({ example: 'cash' })
  method: string;

  @ApiProperty({ example: 'paid' })
  status: string;

  @ApiProperty({ example: '2026-08-22T12:00:00.000Z' })
  created_at: string;

  @ApiProperty({ example: '2026-08-22T12:00:00.000Z' })
  updated_at: string;
}
