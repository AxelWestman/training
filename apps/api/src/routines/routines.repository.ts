import { Injectable, Inject } from '@nestjs/common';
import { Pool } from 'pg';
import { PG_POOL } from '../database/database.constants';
import {
  RoutineRow,
  RoutineExerciseRow,
  RoutineExerciseView,
} from '../database/database.types';
import {
  CreateRoutineDto,
  UpdateRoutineDto,
  CreateRoutineExerciseDto,
  UpdateRoutineExerciseDto,
} from './dto/routines.dto';

@Injectable()
export class RoutinesRepository {
  constructor(@Inject(PG_POOL) private readonly pool: Pool) {}

  async findAll(): Promise<RoutineRow[]> {
    const { rows } = await this.pool.query<RoutineRow>(
      `SELECT id, name, description, created_by, is_active, created_at, updated_at
       FROM routines ORDER BY name`,
    );
    return rows;
  }

  async findById(id: number): Promise<RoutineRow | null> {
    const { rows } = await this.pool.query<RoutineRow>(
      `SELECT id, name, description, created_by, is_active, created_at, updated_at
       FROM routines WHERE id = $1`,
      [id],
    );
    return rows[0] ?? null;
  }

  async findExercisesByRoutineId(
    routineId: number,
  ): Promise<RoutineExerciseView[]> {
    const { rows } = await this.pool.query<RoutineExerciseView>(
      `SELECT re.id, re.routine_id, re.exercise_id, e.name AS exercise_name,
              e.muscle_group, e.equipment, re.day_of_week, re.sets, re.reps,
              re.rest_time, re."order", re.notes, re.created_at, re.updated_at
       FROM routine_exercises re
       JOIN exercises e ON e.id = re.exercise_id
       WHERE re.routine_id = $1
       ORDER BY re.day_of_week, re."order"`,
      [routineId],
    );
    return rows;
  }

  async create(dto: CreateRoutineDto, createdBy: number): Promise<RoutineRow> {
    const { rows } = await this.pool.query<RoutineRow>(
      `INSERT INTO routines (name, description, created_by)
       VALUES ($1, $2, $3)
       RETURNING id, name, description, created_by, is_active, created_at, updated_at`,
      [dto.name, dto.description ?? null, createdBy],
    );
    return rows[0];
  }

  async updateById(
    id: number,
    dto: UpdateRoutineDto,
  ): Promise<RoutineRow | null> {
    const fields: string[] = [];
    const values: any[] = [];
    let idx = 1;

    if (dto.name !== undefined) {
      fields.push(`name = $${idx++}`);
      values.push(dto.name);
    }
    if (dto.description !== undefined) {
      fields.push(`description = $${idx++}`);
      values.push(dto.description);
    }
    if (dto.is_active !== undefined) {
      fields.push(`is_active = $${idx++}`);
      values.push(dto.is_active);
    }

    if (fields.length === 0) return null;

    fields.push(`updated_at = NOW()`);
    values.push(id);

    const { rows } = await this.pool.query<RoutineRow>(
      `UPDATE routines SET ${fields.join(', ')} WHERE id = $${idx}
       RETURNING id, name, description, created_by, is_active, created_at, updated_at`,
      values,
    );
    return rows[0] ?? null;
  }

  async deleteById(
    id: number,
  ): Promise<Pick<RoutineRow, 'id' | 'name'> | null> {
    const { rows } = await this.pool.query<Pick<RoutineRow, 'id' | 'name'>>(
      `DELETE FROM routines WHERE id = $1 RETURNING id, name`,
      [id],
    );
    return rows[0] ?? null;
  }

  async addExercise(
    routineId: number,
    dto: CreateRoutineExerciseDto,
  ): Promise<RoutineExerciseRow> {
    const { rows } = await this.pool.query<RoutineExerciseRow>(
      `INSERT INTO routine_exercises (routine_id, exercise_id, day_of_week, sets, reps, rest_time, "order", notes)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
       RETURNING id, routine_id, exercise_id, day_of_week, sets, reps, rest_time, "order", notes, created_at, updated_at`,
      [
        routineId,
        dto.exercise_id,
        dto.day_of_week,
        dto.sets,
        dto.reps,
        dto.rest_time ?? null,
        dto.order,
        dto.notes ?? null,
      ],
    );
    return rows[0];
  }

  async findExerciseById(
    routineId: number,
    exerciseId: number,
  ): Promise<RoutineExerciseRow | null> {
    const { rows } = await this.pool.query<RoutineExerciseRow>(
      `SELECT id, routine_id, exercise_id, day_of_week, sets, reps, rest_time, "order", notes, created_at, updated_at
       FROM routine_exercises WHERE id = $1 AND routine_id = $2`,
      [exerciseId, routineId],
    );
    return rows[0] ?? null;
  }

  async updateExercise(
    routineId: number,
    exerciseId: number,
    dto: UpdateRoutineExerciseDto,
  ): Promise<RoutineExerciseRow | null> {
    const fields: string[] = [];
    const values: any[] = [];
    let idx = 1;

    if (dto.day_of_week !== undefined) {
      fields.push(`day_of_week = $${idx++}`);
      values.push(dto.day_of_week);
    }
    if (dto.sets !== undefined) {
      fields.push(`sets = $${idx++}`);
      values.push(dto.sets);
    }
    if (dto.reps !== undefined) {
      fields.push(`reps = $${idx++}`);
      values.push(dto.reps);
    }
    if (dto.rest_time !== undefined) {
      fields.push(`rest_time = $${idx++}`);
      values.push(dto.rest_time);
    }
    if (dto.order !== undefined) {
      fields.push(`"order" = $${idx++}`);
      values.push(dto.order);
    }
    if (dto.notes !== undefined) {
      fields.push(`notes = $${idx++}`);
      values.push(dto.notes);
    }

    if (fields.length === 0) return null;

    fields.push(`updated_at = NOW()`);
    values.push(exerciseId);
    values.push(routineId);

    const { rows } = await this.pool.query<RoutineExerciseRow>(
      `UPDATE routine_exercises SET ${fields.join(', ')} WHERE id = $${idx++} AND routine_id = $${idx}
       RETURNING id, routine_id, exercise_id, day_of_week, sets, reps, rest_time, "order", notes, created_at, updated_at`,
      values,
    );
    return rows[0] ?? null;
  }

  async removeExercise(
    routineId: number,
    exerciseId: number,
  ): Promise<Pick<RoutineExerciseRow, 'id' | 'exercise_id'> | null> {
    const { rows } = await this.pool.query<
      Pick<RoutineExerciseRow, 'id' | 'exercise_id'>
    >(
      `DELETE FROM routine_exercises WHERE id = $1 AND routine_id = $2 RETURNING id, exercise_id`,
      [exerciseId, routineId],
    );
    return rows[0] ?? null;
  }
}
