import { Injectable, Inject } from '@nestjs/common';
import { Pool } from 'pg';
import { PG_POOL } from '../database/database.constants';
import { MembershipRow } from '../database/database.types';
import {
  CreateMembershipDto,
  UpdateMembershipDto,
} from './dto/memberships.dto';

@Injectable()
export class MembershipsRepository {
  constructor(@Inject(PG_POOL) private readonly pool: Pool) {}

  async findAll(): Promise<MembershipRow[]> {
    const { rows } = await this.pool.query<MembershipRow>(
      `SELECT id, name, duration_days, price, is_active, created_at
       FROM memberships ORDER BY name`,
    );
    return rows;
  }

  async findById(id: number): Promise<MembershipRow | null> {
    const { rows } = await this.pool.query<MembershipRow>(
      `SELECT id, name, duration_days, price, is_active, created_at
       FROM memberships WHERE id = $1`,
      [id],
    );
    return rows[0] ?? null;
  }

  async create(dto: CreateMembershipDto): Promise<MembershipRow> {
    const { rows } = await this.pool.query<MembershipRow>(
      `INSERT INTO memberships (name, duration_days, price, is_active)
       VALUES ($1, $2, $3, $4)
       RETURNING id, name, duration_days, price, is_active, created_at`,
      [dto.name, dto.duration_days, dto.price, dto.is_active ?? true],
    );
    return rows[0];
  }

  async updateById(
    id: number,
    dto: UpdateMembershipDto,
  ): Promise<MembershipRow | null> {
    const fields: string[] = [];
    const values: any[] = [];
    let idx = 1;

    if (dto.name !== undefined) {
      fields.push(`name = $${idx++}`);
      values.push(dto.name);
    }
    if (dto.duration_days !== undefined) {
      fields.push(`duration_days = $${idx++}`);
      values.push(dto.duration_days);
    }
    if (dto.price !== undefined) {
      fields.push(`price = $${idx++}`);
      values.push(dto.price);
    }
    if (dto.is_active !== undefined) {
      fields.push(`is_active = $${idx++}`);
      values.push(dto.is_active);
    }

    if (fields.length === 0) return null;

    values.push(id);

    const { rows } = await this.pool.query<MembershipRow>(
      `UPDATE memberships SET ${fields.join(', ')} WHERE id = $${idx}
       RETURNING id, name, duration_days, price, is_active, created_at`,
      values,
    );
    return rows[0] ?? null;
  }

  async deleteById(
    id: number,
  ): Promise<Pick<MembershipRow, 'id' | 'name'> | null> {
    const { rows } = await this.pool.query<Pick<MembershipRow, 'id' | 'name'>>(
      `DELETE FROM memberships WHERE id = $1 RETURNING id, name`,
      [id],
    );
    return rows[0] ?? null;
  }
}
