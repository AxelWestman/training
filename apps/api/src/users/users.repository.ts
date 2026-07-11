import { Injectable, Inject } from '@nestjs/common';
import { Pool } from 'pg';
import { PG_POOL } from '../database/database.constants';
import { CreateUsersDto } from './dto/users.dto';

@Injectable()
export class UsersRepository {
  constructor(@Inject(PG_POOL) private readonly pool: Pool) {}

  async findByEmail(email: string) {
    const { rows } = await this.pool.query(
      `SELECT id, email FROM clients WHERE email = $1`,
      [email],
    );
    return rows[0] ?? null;
  }

  async findByDni(dni: string) {
    const { rows } = await this.pool.query(
      `SELECT id, dni FROM clients WHERE dni = $1`,
      [dni],
    );
    return rows[0] ?? null;
  }

  async findById(id: number) {
    const { rows } = await this.pool.query(
      `SELECT id, name, lastname, email, dni, phone, birth_date, health_specs, address, is_active, created_at, updated_at FROM clients WHERE id = $1`,
      [id],
    );
    return rows[0] ?? null;
  }

  async activateById(id: number) {
    const { rows } = await this.pool.query(
      `UPDATE clients SET is_active = true, updated_at = NOW() WHERE id = $1 RETURNING id, name, lastname, is_active`,
      [id],
    );
    return rows[0] ?? null;
  }

  async deactivateById(id: number) {
    const { rows } = await this.pool.query(
      `UPDATE clients SET is_active = false, updated_at = NOW() WHERE id = $1 RETURNING id, name, lastname, is_active`,
      [id],
    );
    return rows[0] ?? null;
  }

  async deleteById(id: number) {
    const { rows } = await this.pool.query(
      `DELETE FROM clients WHERE id = $1 RETURNING id`,
      [id],
    );
    return rows[0] ?? null;
  }

  async findAll() {
    const { rows } = await this.pool.query(
      `SELECT id, name, lastname, email, dni, phone, birth_date, health_specs, address, is_active, created_at, updated_at FROM clients ORDER BY id`,
    );
    return rows;
  }

  async create(dto: CreateUsersDto) {
    const { rows } = await this.pool.query(
      `INSERT INTO clients (name, lastname, email, password, dni)
       VALUES ($1, $2, $3, $4, $5)
       RETURNING id, name, lastname, email, created_at, updated_at`,
      [dto.name, dto.lastname, dto.email, dto.password, dto.dni],
    );
    return rows[0];
  }
}
