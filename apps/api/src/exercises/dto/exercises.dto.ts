import { IsString, IsNotEmpty, IsOptional, IsInt } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreateExerciseDto {
  @ApiProperty({ example: 'Bench Press', description: 'Exercise name' })
  @IsString()
  @IsNotEmpty()
  name: string;

  @ApiPropertyOptional({
    example: 'Chest press with a barbell',
    description: 'How to perform it',
  })
  @IsOptional()
  @IsString()
  description?: string;

  @ApiProperty({ example: 'chest', description: 'Target muscle group' })
  @IsString()
  @IsNotEmpty()
  muscle_group: string;

  @ApiPropertyOptional({
    example: 'barbell',
    description: 'Required equipment',
  })
  @IsOptional()
  @IsString()
  equipment?: string;

  @ApiPropertyOptional({ example: 'https://example.com/bench-press.png' })
  @IsOptional()
  @IsString()
  image_url?: string;
}

export class UpdateExerciseDto {
  @ApiPropertyOptional({ example: 'Bench Press', description: 'Exercise name' })
  @IsOptional()
  @IsString()
  name?: string;

  @ApiPropertyOptional({ example: 'Chest press with a barbell' })
  @IsOptional()
  @IsString()
  description?: string;

  @ApiPropertyOptional({ example: 'chest' })
  @IsOptional()
  @IsString()
  muscle_group?: string;

  @ApiPropertyOptional({ example: 'barbell' })
  @IsOptional()
  @IsString()
  equipment?: string;

  @ApiPropertyOptional({ example: 'https://example.com/bench-press.png' })
  @IsOptional()
  @IsString()
  image_url?: string;
}

export class ExerciseResponseDto {
  @ApiProperty({ example: 1 })
  @IsInt()
  id: number;

  @ApiProperty({ example: 'Bench Press' })
  name: string;

  @ApiProperty({ example: 'Chest press with a barbell' })
  description: string;

  @ApiProperty({ example: 'chest' })
  muscle_group: string;

  @ApiProperty({ example: 'barbell' })
  equipment: string;

  @ApiProperty({ example: 'https://example.com/bench-press.png' })
  image_url: string;

  @ApiProperty({ example: '2026-08-22T12:00:00.000Z' })
  created_at: string;

  @ApiProperty({ example: '2026-08-22T12:00:00.000Z' })
  updated_at: string;
}
