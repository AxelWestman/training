import { Injectable, Inject } from '@nestjs/common';
import { Pool } from 'pg';
import { PG_POOL } from '../database/database.constants';
import { AttendanceRow } from '../database/database.types';

@Injectable()
export class AttendanceRepository {
  constructor(@Inject(PG_POOL) private readonly pool: Pool) {}

  async create(clientId: number): Promise<AttendanceRow> {
    const { rows } = await this.pool.query<AttendanceRow>(
      `INSERT INTO attendance (client_id)
       VALUES ($1)
       RETURNING id, client_id, check_in, check_out, created_at`,
      [clientId],
    );
    return rows[0];
  }

  async findByClientId(clientId: number): Promise<AttendanceRow[]> {
    const { rows } = await this.pool.query<AttendanceRow>(
      `SELECT id, client_id, check_in, check_out, created_at
       FROM attendance
       WHERE client_id = $1
       ORDER BY check_in DESC`,
      [clientId],
    );
    return rows;
  }

  async findTodayCheckIn(clientId: number): Promise<AttendanceRow | null> {
    const { rows } = await this.pool.query<AttendanceRow>(
      `SELECT id, client_id, check_in, check_out, created_at
       FROM attendance
       WHERE client_id = $1 AND check_in::date = CURRENT_DATE
       LIMIT 1`,
      [clientId],
    );
    return rows[0] ?? null;
  }
}
