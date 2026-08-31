import { Injectable, Inject } from '@nestjs/common';
import { Pool } from 'pg';
import { PG_POOL } from '../database/database.constants';
import { ExerciseRow } from '../database/database.types';
import { CreateExerciseDto, UpdateExerciseDto } from './dto/exercises.dto';

@Injectable()
export class ExercisesRepository {
  constructor(@Inject(PG_POOL) private readonly pool: Pool) {}

  async findById(id: number): Promise<ExerciseRow | null> {
    const { rows } = await this.pool.query<ExerciseRow>(
      `SELECT id, name, description, muscle_group, equipment, image_url, created_at, updated_at
       FROM exercises WHERE id = $1`,
      [id],
    );
    return rows[0] ?? null;
  }

  async findAll(): Promise<ExerciseRow[]> {
    const { rows } = await this.pool.query<ExerciseRow>(
      `SELECT id, name, description, muscle_group, equipment, image_url, created_at, updated_at
       FROM exercises ORDER BY name`,
    );
    return rows;
  }

  async create(dto: CreateExerciseDto): Promise<ExerciseRow> {
    const { rows } = await this.pool.query<ExerciseRow>(
      `INSERT INTO exercises (name, description, muscle_group, equipment, image_url)
       VALUES ($1, $2, $3, $4, $5)
       RETURNING id, name, description, muscle_group, equipment, image_url, created_at, updated_at`,
      [
        dto.name,
        dto.description ?? null,
        dto.muscle_group,
        dto.equipment ?? null,
        dto.image_url ?? null,
      ],
    );
    return rows[0];
  }

  async updateById(
    id: number,
    dto: UpdateExerciseDto,
  ): Promise<ExerciseRow | null> {
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
    if (dto.muscle_group !== undefined) {
      fields.push(`muscle_group = $${idx++}`);
      values.push(dto.muscle_group);
    }
    if (dto.equipment !== undefined) {
      fields.push(`equipment = $${idx++}`);
      values.push(dto.equipment);
    }
    if (dto.image_url !== undefined) {
      fields.push(`image_url = $${idx++}`);
      values.push(dto.image_url);
    }

    if (fields.length === 0) return null;

    fields.push(`updated_at = NOW()`);
    values.push(id);

    const { rows } = await this.pool.query<ExerciseRow>(
      `UPDATE exercises SET ${fields.join(', ')} WHERE id = $${idx}
       RETURNING id, name, description, muscle_group, equipment, image_url, created_at, updated_at`,
      values,
    );
    return rows[0] ?? null;
  }

  async deleteById(
    id: number,
  ): Promise<Pick<ExerciseRow, 'id' | 'name'> | null> {
    const { rows } = await this.pool.query<Pick<ExerciseRow, 'id' | 'name'>>(
      `DELETE FROM exercises WHERE id = $1 RETURNING id, name`,
      [id],
    );
    return rows[0] ?? null;
  }
}
