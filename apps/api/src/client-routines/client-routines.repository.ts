import { Injectable, Inject } from '@nestjs/common';
import { Pool } from 'pg';
import { PG_POOL } from '../database/database.constants';
import {
  ClientRoutineRow,
  ClientRoutineView,
} from '../database/database.types';
import {
  CreateClientRoutineDto,
  UpdateClientRoutineDto,
} from './dto/client-routines.dto';

@Injectable()
export class ClientRoutinesRepository {
  constructor(@Inject(PG_POOL) private readonly pool: Pool) {}

  async findAll(): Promise<ClientRoutineView[]> {
    const { rows } = await this.pool.query<ClientRoutineView>(
      `SELECT cr.id, cr.client_id, c.name AS client_name,
              cr.routine_id, r.name AS routine_name,
              cr.assigned_by, cr.start_date, cr.end_date, cr.is_active,
              cr.created_at, cr.updated_at
       FROM client_routines cr
       JOIN clients c ON c.id = cr.client_id
       JOIN routines r ON r.id = cr.routine_id
       ORDER BY cr.start_date DESC`,
    );
    return rows;
  }

  async findById(id: number): Promise<ClientRoutineView | null> {
    const { rows } = await this.pool.query<ClientRoutineView>(
      `SELECT cr.id, cr.client_id, c.name AS client_name,
              cr.routine_id, r.name AS routine_name,
              cr.assigned_by, cr.start_date, cr.end_date, cr.is_active,
              cr.created_at, cr.updated_at
       FROM client_routines cr
       JOIN clients c ON c.id = cr.client_id
       JOIN routines r ON r.id = cr.routine_id
       WHERE cr.id = $1`,
      [id],
    );
    return rows[0] ?? null;
  }

  async findByClientId(clientId: number): Promise<ClientRoutineView[]> {
    const { rows } = await this.pool.query<ClientRoutineView>(
      `SELECT cr.id, cr.client_id, c.name AS client_name,
              cr.routine_id, r.name AS routine_name,
              cr.assigned_by, cr.start_date, cr.end_date, cr.is_active,
              cr.created_at, cr.updated_at
       FROM client_routines cr
       JOIN clients c ON c.id = cr.client_id
       JOIN routines r ON r.id = cr.routine_id
       WHERE cr.client_id = $1
       ORDER BY cr.start_date DESC`,
      [clientId],
    );
    return rows;
  }

  async findByRoutineId(routineId: number): Promise<ClientRoutineView[]> {
    const { rows } = await this.pool.query<ClientRoutineView>(
      `SELECT cr.id, cr.client_id, c.name AS client_name,
              cr.routine_id, r.name AS routine_name,
              cr.assigned_by, cr.start_date, cr.end_date, cr.is_active,
              cr.created_at, cr.updated_at
       FROM client_routines cr
       JOIN clients c ON c.id = cr.client_id
       JOIN routines r ON r.id = cr.routine_id
       WHERE cr.routine_id = $1
       ORDER BY cr.start_date DESC`,
      [routineId],
    );
    return rows;
  }

  async create(
    dto: CreateClientRoutineDto,
    assignedBy: number,
  ): Promise<ClientRoutineRow> {
    const { rows } = await this.pool.query<ClientRoutineRow>(
      `INSERT INTO client_routines (client_id, routine_id, assigned_by, start_date, end_date, is_active)
       VALUES ($1, $2, $3, $4, $5, $6)
       RETURNING id, client_id, routine_id, assigned_by, start_date, end_date, is_active, created_at, updated_at`,
      [
        dto.client_id,
        dto.routine_id,
        assignedBy,
        dto.start_date,
        dto.end_date ?? null,
        dto.is_active ?? true,
      ],
    );
    return rows[0];
  }

  async updateById(
    id: number,
    dto: UpdateClientRoutineDto,
  ): Promise<ClientRoutineRow | null> {
    const fields: string[] = [];
    const values: any[] = [];
    let idx = 1;

    if (dto.start_date !== undefined) {
      fields.push(`start_date = $${idx++}`);
      values.push(dto.start_date);
    }
    if (dto.end_date !== undefined) {
      fields.push(`end_date = $${idx++}`);
      values.push(dto.end_date);
    }
    if (dto.is_active !== undefined) {
      fields.push(`is_active = $${idx++}`);
      values.push(dto.is_active);
    }

    if (fields.length === 0) return null;

    fields.push(`updated_at = NOW()`);
    values.push(id);

    const { rows } = await this.pool.query<ClientRoutineRow>(
      `UPDATE client_routines SET ${fields.join(', ')} WHERE id = $${idx}
       RETURNING id, client_id, routine_id, assigned_by, start_date, end_date, is_active, created_at, updated_at`,
      values,
    );
    return rows[0] ?? null;
  }

  async deleteById(id: number): Promise<Pick<ClientRoutineRow, 'id'> | null> {
    const { rows } = await this.pool.query<Pick<ClientRoutineRow, 'id'>>(
      `DELETE FROM client_routines WHERE id = $1 RETURNING id`,
      [id],
    );
    return rows[0] ?? null;
  }
}
