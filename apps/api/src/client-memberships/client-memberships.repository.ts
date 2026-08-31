import { Injectable, Inject } from '@nestjs/common';
import { Pool } from 'pg';
import { PG_POOL } from '../database/database.constants';
import {
  ClientMembershipRow,
  ClientMembershipView,
} from '../database/database.types';
import {
  CreateClientMembershipDto,
  UpdateClientMembershipDto,
} from './dto/client-memberships.dto';

@Injectable()
export class ClientMembershipsRepository {
  constructor(@Inject(PG_POOL) private readonly pool: Pool) {}

  async findAll(): Promise<ClientMembershipView[]> {
    const { rows } = await this.pool.query<ClientMembershipView>(
      `SELECT cm.id, cm.client_id, c.name AS client_name,
              cm.membership_id, m.name AS membership_name,
              cm.start_date, cm.end_date, cm.status,
              cm.created_at, cm.updated_at
       FROM client_memberships cm
       JOIN clients c ON c.id = cm.client_id
       JOIN memberships m ON m.id = cm.membership_id
       ORDER BY cm.start_date DESC`,
    );
    return rows;
  }

  async findById(id: number): Promise<ClientMembershipView | null> {
    const { rows } = await this.pool.query<ClientMembershipView>(
      `SELECT cm.id, cm.client_id, c.name AS client_name,
              cm.membership_id, m.name AS membership_name,
              cm.start_date, cm.end_date, cm.status,
              cm.created_at, cm.updated_at
       FROM client_memberships cm
       JOIN clients c ON c.id = cm.client_id
       JOIN memberships m ON m.id = cm.membership_id
       WHERE cm.id = $1`,
      [id],
    );
    return rows[0] ?? null;
  }

  async findByClientId(clientId: number): Promise<ClientMembershipView[]> {
    const { rows } = await this.pool.query<ClientMembershipView>(
      `SELECT cm.id, cm.client_id, c.name AS client_name,
              cm.membership_id, m.name AS membership_name,
              cm.start_date, cm.end_date, cm.status,
              cm.created_at, cm.updated_at
       FROM client_memberships cm
       JOIN clients c ON c.id = cm.client_id
       JOIN memberships m ON m.id = cm.membership_id
       WHERE cm.client_id = $1
       ORDER BY cm.start_date DESC`,
      [clientId],
    );
    return rows;
  }

  async create(
    dto: CreateClientMembershipDto,
    endDate: string,
  ): Promise<ClientMembershipRow> {
    const { rows } = await this.pool.query<ClientMembershipRow>(
      `INSERT INTO client_memberships (client_id, membership_id, start_date, end_date, status)
       VALUES ($1, $2, $3, $4, $5)
       RETURNING id, client_id, membership_id, start_date, end_date, status, created_at, updated_at`,
      [
        dto.client_id,
        dto.membership_id,
        dto.start_date,
        endDate,
        dto.status ?? 'active',
      ],
    );
    return rows[0];
  }

  async updateById(
    id: number,
    dto: UpdateClientMembershipDto,
  ): Promise<ClientMembershipRow | null> {
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
    if (dto.status !== undefined) {
      fields.push(`status = $${idx++}`);
      values.push(dto.status);
    }

    if (fields.length === 0) return null;

    fields.push(`updated_at = NOW()`);
    values.push(id);

    const { rows } = await this.pool.query<ClientMembershipRow>(
      `UPDATE client_memberships SET ${fields.join(', ')} WHERE id = $${idx}
       RETURNING id, client_id, membership_id, start_date, end_date, status, created_at, updated_at`,
      values,
    );
    return rows[0] ?? null;
  }

  async deleteById(
    id: number,
  ): Promise<Pick<ClientMembershipRow, 'id'> | null> {
    const { rows } = await this.pool.query<Pick<ClientMembershipRow, 'id'>>(
      `DELETE FROM client_memberships WHERE id = $1 RETURNING id`,
      [id],
    );
    return rows[0] ?? null;
  }
}
