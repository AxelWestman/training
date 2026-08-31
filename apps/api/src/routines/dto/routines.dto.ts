import {
  IsString,
  IsNotEmpty,
  IsOptional,
  IsInt,
  IsBoolean,
  Min,
  Max,
  ValidateNested,
  IsArray,
} from 'class-validator';
import { Type } from 'class-transformer';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreateRoutineExerciseDto {
  @ApiProperty({ example: 1, description: 'Exercise id' })
  @IsInt()
  @IsNotEmpty()
  exercise_id: number;

  @ApiProperty({ example: 1, description: 'Day of week (1-7)' })
  @IsInt()
  @Min(1)
  @Max(7)
  day_of_week: number;

  @ApiProperty({ example: 3, description: 'Number of sets' })
  @IsInt()
  @Min(1)
  sets: number;

  @ApiProperty({ example: 12, description: 'Reps per set' })
  @IsInt()
  @Min(1)
  reps: number;

  @ApiPropertyOptional({ example: 60, description: 'Rest time in seconds' })
  @IsOptional()
  @IsInt()
  @Min(0)
  rest_time?: number;

  @ApiProperty({ example: 0, description: 'Order within the day' })
  @IsInt()
  @Min(0)
  order: number;

  @ApiPropertyOptional({
    example: 'Keep form strict',
    description: 'Extra notes',
  })
  @IsOptional()
  @IsString()
  notes?: string;
}

export class CreateRoutineDto {
  @ApiProperty({ example: 'Full Body', description: 'Routine name' })
  @IsString()
  @IsNotEmpty()
  name: string;

  @ApiPropertyOptional({
    example: 'Beginner full body routine',
    description: 'Routine description',
  })
  @IsOptional()
  @IsString()
  description?: string;

  @ApiPropertyOptional({
    type: [CreateRoutineExerciseDto],
    description: 'Exercises to include in the routine',
  })
  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => CreateRoutineExerciseDto)
  exercises?: CreateRoutineExerciseDto[];
}

export class UpdateRoutineDto {
  @ApiPropertyOptional({ example: 'Full Body', description: 'Routine name' })
  @IsOptional()
  @IsString()
  name?: string;

  @ApiPropertyOptional({
    example: 'Beginner full body routine',
    description: 'Routine description',
  })
  @IsOptional()
  @IsString()
  description?: string;

  @ApiPropertyOptional({
    example: true,
    description: 'Whether the routine is active',
  })
  @IsOptional()
  @IsBoolean()
  is_active?: boolean;
}

export class UpdateRoutineExerciseDto {
  @ApiPropertyOptional({ example: 2, description: 'Day of week (1-7)' })
  @IsOptional()
  @IsInt()
  @Min(1)
  @Max(7)
  day_of_week?: number;

  @ApiPropertyOptional({ example: 4, description: 'Number of sets' })
  @IsOptional()
  @IsInt()
  @Min(1)
  sets?: number;

  @ApiPropertyOptional({ example: 10, description: 'Reps per set' })
  @IsOptional()
  @IsInt()
  @Min(1)
  reps?: number;

  @ApiPropertyOptional({ example: 45, description: 'Rest time in seconds' })
  @IsOptional()
  @IsInt()
  @Min(0)
  rest_time?: number;

  @ApiPropertyOptional({ example: 1, description: 'Order within the day' })
  @IsOptional()
  @IsInt()
  @Min(0)
  order?: number;

  @ApiPropertyOptional({ example: 'Lower weight', description: 'Extra notes' })
  @IsOptional()
  @IsString()
  notes?: string;
}

export class RoutineExerciseResponseDto {
  @ApiProperty({ example: 1 })
  id: number;

  @ApiProperty({ example: 1 })
  routine_id: number;

  @ApiProperty({ example: 1 })
  exercise_id: number;

  @ApiProperty({ example: 'Bench Press' })
  exercise_name: string;

  @ApiProperty({ example: 'chest' })
  muscle_group: string;

  @ApiProperty({ example: 'barbell' })
  equipment: string;

  @ApiProperty({ example: 1 })
  day_of_week: number;

  @ApiProperty({ example: 3 })
  sets: number;

  @ApiProperty({ example: 12 })
  reps: number;

  @ApiProperty({ example: 60 })
  rest_time: number;

  @ApiProperty({ example: 0 })
  order: number;

  @ApiProperty({ example: 'Keep form strict' })
  notes: string;

  @ApiProperty({ example: '2026-08-22T12:00:00.000Z' })
  created_at: string;

  @ApiProperty({ example: '2026-08-22T12:00:00.000Z' })
  updated_at: string;
}

export class RoutineResponseDto {
  @ApiProperty({ example: 1 })
  id: number;

  @ApiProperty({ example: 'Full Body' })
  name: string;

  @ApiProperty({ example: 'Beginner full body routine' })
  description: string;

  @ApiProperty({ example: 1 })
  created_by: number;

  @ApiProperty({ example: true })
  is_active: boolean;

  @ApiProperty({ example: '2026-08-22T12:00:00.000Z' })
  created_at: string;

  @ApiProperty({ example: '2026-08-22T12:00:00.000Z' })
  updated_at: string;

  @ApiProperty({
    type: [RoutineExerciseResponseDto],
    description: 'Exercises belonging to the routine',
  })
  exercises: RoutineExerciseResponseDto[];
}
