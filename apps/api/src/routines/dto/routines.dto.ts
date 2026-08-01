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

export class CreateRoutineExerciseDto {
  @IsInt()
  @IsNotEmpty()
  exercise_id: number;

  @IsInt()
  @Min(1)
  @Max(7)
  day_of_week: number;

  @IsInt()
  @Min(1)
  sets: number;

  @IsInt()
  @Min(1)
  reps: number;

  @IsOptional()
  @IsInt()
  @Min(0)
  rest_time?: number;

  @IsInt()
  @Min(0)
  order: number;

  @IsOptional()
  @IsString()
  notes?: string;
}

export class CreateRoutineDto {
  @IsString()
  @IsNotEmpty()
  name: string;

  @IsOptional()
  @IsString()
  description?: string;

  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => CreateRoutineExerciseDto)
  exercises?: CreateRoutineExerciseDto[];
}

export class UpdateRoutineDto {
  @IsOptional()
  @IsString()
  name?: string;

  @IsOptional()
  @IsString()
  description?: string;

  @IsOptional()
  @IsBoolean()
  is_active?: boolean;
}

export class UpdateRoutineExerciseDto {
  @IsOptional()
  @IsInt()
  @Min(1)
  @Max(7)
  day_of_week?: number;

  @IsOptional()
  @IsInt()
  @Min(1)
  sets?: number;

  @IsOptional()
  @IsInt()
  @Min(1)
  reps?: number;

  @IsOptional()
  @IsInt()
  @Min(0)
  rest_time?: number;

  @IsOptional()
  @IsInt()
  @Min(0)
  order?: number;

  @IsOptional()
  @IsString()
  notes?: string;
}
