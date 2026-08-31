import { Injectable, Inject } from '@nestjs/common';
import { Pool } from 'pg';
import { PG_POOL } from '../database/database.constants';
import { AdminRow } from '../database/database.types';
import { CreateAdminDto, UpdateAdminDto } from './dto/admins.dto';

type AdminPublicRow = Omit<AdminRow, 'updated_at'>;
type AdminEmailRef = Pick<AdminRow, 'id' | 'email'>;

@Injectable()
export class AdminsRepository {
  constructor(@Inject(PG_POOL) private readonly pool: Pool) {}

  async findByEmail(email: string): Promise<AdminEmailRef | null> {
    const { rows } = await this.pool.query<AdminEmailRef>(
      `SELECT id, email FROM admins WHERE email = $1`,
      [email],
    );
    return rows[0] ?? null;
  }

  async findById(id: number): Promise<AdminPublicRow | null> {
    const { rows } = await this.pool.query<AdminPublicRow>(
      `SELECT id, name, lastname, email, dni, phone, role, created_at FROM admins WHERE id = $1`,
      [id],
    );
    return rows[0] ?? null;
  }

  async findByDni(dni: string): Promise<Pick<AdminRow, 'id'> | null> {
    const { rows } = await this.pool.query<Pick<AdminRow, 'id'>>(
      `SELECT id FROM admins WHERE dni = $1`,
      [dni],
    );
    return rows[0] ?? null;
  }

  async findAll(): Promise<AdminPublicRow[]> {
    const { rows } = await this.pool.query<AdminPublicRow>(
      `SELECT id, name, lastname, email, dni, phone, role, created_at FROM admins ORDER BY id`,
    );
    return rows;
  }

  async create(dto: CreateAdminDto): Promise<AdminPublicRow> {
    const { rows } = await this.pool.query<AdminPublicRow>(
      `INSERT INTO admins (name, lastname, email, password_hash, role, dni, phone)
       VALUES ($1, $2, $3, $4, $5, $6, $7)
       RETURNING id, name, lastname, email, dni, phone, role, created_at`,
      [
        dto.name,
        dto.lastname,
        dto.email,
        dto.password,
        dto.role ?? 'admin',
        dto.dni,
        dto.phone,
      ],
    );
    return rows[0];
  }

  async updateById(
    id: number,
    dto: UpdateAdminDto,
  ): Promise<AdminPublicRow | null> {
    const fields: string[] = [];
    const values: any[] = [];
    let idx = 1;

    if (dto.name !== undefined) {
      fields.push(`name = $${idx++}`);
      values.push(dto.name);
    }
    if (dto.lastname !== undefined) {
      fields.push(`lastname = $${idx++}`);
      values.push(dto.lastname);
    }
    if (dto.email !== undefined) {
      fields.push(`email = $${idx++}`);
      values.push(dto.email);
    }
    if (dto.dni !== undefined) {
      fields.push(`dni = $${idx++}`);
      values.push(dto.dni);
    }
    if (dto.phone !== undefined) {
      fields.push(`phone = $${idx++}`);
      values.push(dto.phone);
    }
    if (dto.password !== undefined) {
      fields.push(`password_hash = $${idx++}`);
      values.push(dto.password);
    }
    if (dto.role !== undefined) {
      fields.push(`role = $${idx++}`);
      values.push(dto.role);
    }

    if (fields.length === 0) return null;

    fields.push(`updated_at = NOW()`);
    values.push(id);

    const { rows } = await this.pool.query<AdminPublicRow>(
      `UPDATE admins SET ${fields.join(', ')} WHERE id = $${idx}
       RETURNING id, name, lastname, email, dni, phone, role, created_at`,
      values,
    );
    return rows[0] ?? null;
  }

  async deleteById(
    id: number,
  ): Promise<Pick<
    AdminRow,
    'id' | 'name' | 'lastname' | 'email' | 'role'
  > | null> {
    const { rows } = await this.pool.query<
      Pick<AdminRow, 'id' | 'name' | 'lastname' | 'email' | 'role'>
    >(
      `DELETE FROM admins WHERE id = $1 RETURNING id, name, lastname, email, role`,
      [id],
    );
    return rows[0] ?? null;
  }
}
