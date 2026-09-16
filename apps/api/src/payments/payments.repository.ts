import { Injectable, Inject } from '@nestjs/common';
import { Pool } from 'pg';
import { PG_POOL } from '../database/database.constants';
import { PaymentRow, PaymentView } from '../database/database.types';
import { CreatePaymentDto, UpdatePaymentDto } from './dto/payments.dto';

@Injectable()
export class PaymentsRepository {
  constructor(@Inject(PG_POOL) private readonly pool: Pool) {}

  async findAll(): Promise<PaymentView[]> {
    const { rows } = await this.pool.query<PaymentView>(
      `SELECT p.id, p.client_id, c.name AS client_name,
              p.client_membership_id, m.name AS membership_name,
              p.amount, p.payment_date, p.due_date, p.method, p.status,
              p.created_at, p.updated_at
       FROM payments p
       JOIN clients c ON c.id = p.client_id
       LEFT JOIN client_memberships cm ON cm.id = p.client_membership_id
       LEFT JOIN memberships m ON m.id = cm.membership_id
       ORDER BY p.payment_date DESC`,
    );
    return rows;
  }

  async findById(id: number): Promise<PaymentView | null> {
    const { rows } = await this.pool.query<PaymentView>(
      `SELECT p.id, p.client_id, c.name AS client_name,
              p.client_membership_id, m.name AS membership_name,
              p.amount, p.payment_date, p.due_date, p.method, p.status,
              p.created_at, p.updated_at
       FROM payments p
       JOIN clients c ON c.id = p.client_id
       LEFT JOIN client_memberships cm ON cm.id = p.client_membership_id
       LEFT JOIN memberships m ON m.id = cm.membership_id
       WHERE p.id = $1`,
      [id],
    );
    return rows[0] ?? null;
  }

  async findByClientId(clientId: number): Promise<PaymentView[]> {
    const { rows } = await this.pool.query<PaymentView>(
      `SELECT p.id, p.client_id, c.name AS client_name,
              p.client_membership_id, m.name AS membership_name,
              p.amount, p.payment_date, p.due_date, p.method, p.status,
              p.created_at, p.updated_at
       FROM payments p
       JOIN clients c ON c.id = p.client_id
       LEFT JOIN client_memberships cm ON cm.id = p.client_membership_id
       LEFT JOIN memberships m ON m.id = cm.membership_id
       WHERE p.client_id = $1
       ORDER BY p.payment_date DESC`,
      [clientId],
    );
    return rows;
  }

  async create(dto: CreatePaymentDto): Promise<PaymentRow> {
    const { rows } = await this.pool.query<PaymentRow>(
      `INSERT INTO payments (client_id, client_membership_id, amount, payment_date, due_date, method, status)
       VALUES ($1, $2, $3, $4, $5, $6, $7)
       RETURNING id, client_id, client_membership_id, amount, payment_date, due_date, method, status, created_at, updated_at`,
      [
        dto.client_id,
        dto.client_membership_id ?? null,
        dto.amount,
        dto.payment_date,
        dto.due_date,
        dto.method,
        dto.status ?? 'pending',
      ],
    );
    return rows[0];
  }

  async updateById(
    id: number,
    dto: UpdatePaymentDto,
  ): Promise<PaymentRow | null> {
    const fields: string[] = [];
    const values: any[] = [];
    let idx = 1;

    if (dto.client_membership_id !== undefined) {
      fields.push(`client_membership_id = $${idx++}`);
      values.push(dto.client_membership_id);
    }
    if (dto.amount !== undefined) {
      fields.push(`amount = $${idx++}`);
      values.push(dto.amount);
    }
    if (dto.payment_date !== undefined) {
      fields.push(`payment_date = $${idx++}`);
      values.push(dto.payment_date);
    }
    if (dto.due_date !== undefined) {
      fields.push(`due_date = $${idx++}`);
      values.push(dto.due_date);
    }
    if (dto.method !== undefined) {
      fields.push(`method = $${idx++}`);
      values.push(dto.method);
    }
    if (dto.status !== undefined) {
      fields.push(`status = $${idx++}`);
      values.push(dto.status);
    }

    if (fields.length === 0) return null;

    fields.push(`updated_at = NOW()`);
    values.push(id);

    const { rows } = await this.pool.query<PaymentRow>(
      `UPDATE payments SET ${fields.join(', ')} WHERE id = $${idx}
       RETURNING id, client_id, client_membership_id, amount, payment_date, due_date, method, status, created_at, updated_at`,
      values,
    );
    return rows[0] ?? null;
  }

  async deleteById(id: number): Promise<Pick<PaymentRow, 'id'> | null> {
    const { rows } = await this.pool.query<Pick<PaymentRow, 'id'>>(
      `DELETE FROM payments WHERE id = $1 RETURNING id`,
      [id],
    );
    return rows[0] ?? null;
  }
}
