import { Injectable, Inject } from '@nestjs/common';
import { Pool } from 'pg';
import { PG_POOL } from '../database/database.constants';
import { CreateAdminDto } from './dto/admins.dto';

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
      `SELECT id, name, lastname, email, role, created_at FROM admins WHERE id = $1`,
      [id],
    );
    return rows[0] ?? null;
  }

  async findByDni(dni: string) {
    const { rows } = await this.pool.query(
      `SELECT id, name, lastname, email, role, created_at FROM admins WHERE dni = $1`,
      [dni],
    );
    return rows[0] ?? null;
  }

  async create(dto: CreateAdminDto) {
    const { rows } = await this.pool.query(
      `INSERT INTO admins (name, lastname, email, password_hash, role, dni, phone)
       VALUES ($1, $2, $3, $4, $5, $6, $7)
       RETURNING id, name, lastname, email, role, created_at`,
      [dto.name, dto.lastname, dto.email, dto.password, dto.role ?? 'admin', dto.dni, dto.phone],
    );
    return rows[0];
  }
}
