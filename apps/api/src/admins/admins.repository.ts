import { Injectable, Inject } from '@nestjs/common';
import { Pool } from 'pg';
import { PG_POOL } from '../database/database.constants';
import { CreateAdminDto, UpdateAdminDto } from './dto/admins.dto';

@Injectable()
export class AdminsRepository {
  constructor(@Inject(PG_POOL) private readonly pool: Pool) {}

  async findByEmail(email: string) {
    const { rows } = await this.pool.query(
      `SELECT id, email FROM admins WHERE email = $1`,
      [email],
    );
    return rows[0] ?? null;
  }

  async findById(id: number) {
    const { rows } = await this.pool.query(
      `SELECT id, name, lastname, email, dni, phone, role, created_at FROM admins WHERE id = $1`,
      [id],
    );
    return rows[0] ?? null;
  }

  async findByDni(dni: string) {
    const { rows } = await this.pool.query(
      `SELECT id, name, lastname, email, dni, role, created_at FROM admins WHERE dni = $1`,
      [dni],
    );
    return rows[0] ?? null;
  }

  async findAll() {
    const { rows } = await this.pool.query(
      `SELECT id, name, lastname, email, dni, phone, role, created_at FROM admins ORDER BY id`,
    );
    return rows;
  }

  async create(dto: CreateAdminDto) {
    const { rows } = await this.pool.query(
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

  async updateById(id: number, dto: UpdateAdminDto) {
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

    const { rows } = await this.pool.query(
      `UPDATE admins SET ${fields.join(', ')} WHERE id = $${idx}
       RETURNING id, name, lastname, email, dni, phone, role, created_at`,
      values,
    );
    return rows[0] ?? null;
  }

  async deleteById(id: number) {
    const { rows } = await this.pool.query(
      `DELETE FROM admins WHERE id = $1 RETURNING id, name, lastname, email, role`,
      [id],
    );
    return rows[0] ?? null;
  }
}
