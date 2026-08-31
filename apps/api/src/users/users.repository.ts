import { Injectable, Inject } from '@nestjs/common';
import { Pool } from 'pg';
import { PG_POOL } from '../database/database.constants';
import { ClientRow } from '../database/database.types';
import { CreateUsersDto } from './dto/users.dto';

type ClientEmailRef = Pick<ClientRow, 'id' | 'email'>;
type ClientDniRef = Pick<ClientRow, 'id' | 'dni'>;
type ClientActivation = Pick<
  ClientRow,
  'id' | 'name' | 'lastname' | 'is_active'
>;
type ClientCreated = Pick<
  ClientRow,
  'id' | 'name' | 'lastname' | 'email' | 'created_at' | 'updated_at'
>;

@Injectable()
export class UsersRepository {
  constructor(@Inject(PG_POOL) private readonly pool: Pool) {}

  async findByEmail(email: string): Promise<ClientEmailRef | null> {
    const { rows } = await this.pool.query<ClientEmailRef>(
      `SELECT id, email FROM clients WHERE email = $1`,
      [email],
    );
    return rows[0] ?? null;
  }

  async findByDni(dni: string): Promise<ClientDniRef | null> {
    const { rows } = await this.pool.query<ClientDniRef>(
      `SELECT id, dni FROM clients WHERE dni = $1`,
      [dni],
    );
    return rows[0] ?? null;
  }

  async findById(id: number): Promise<ClientRow | null> {
    const { rows } = await this.pool.query<ClientRow>(
      `SELECT id, name, lastname, email, dni, phone, birth_date, health_specs, address, is_active, created_at, updated_at FROM clients WHERE id = $1`,
      [id],
    );
    return rows[0] ?? null;
  }

  async activateById(id: number): Promise<ClientActivation | null> {
    const { rows } = await this.pool.query<ClientActivation>(
      `UPDATE clients SET is_active = true, updated_at = NOW() WHERE id = $1 RETURNING id, name, lastname, is_active`,
      [id],
    );
    return rows[0] ?? null;
  }

  async deactivateById(id: number): Promise<ClientActivation | null> {
    const { rows } = await this.pool.query<ClientActivation>(
      `UPDATE clients SET is_active = false, updated_at = NOW() WHERE id = $1 RETURNING id, name, lastname, is_active`,
      [id],
    );
    return rows[0] ?? null;
  }

  async deleteById(id: number): Promise<Pick<ClientRow, 'id'> | null> {
    const { rows } = await this.pool.query<Pick<ClientRow, 'id'>>(
      `DELETE FROM clients WHERE id = $1 RETURNING id`,
      [id],
    );
    return rows[0] ?? null;
  }

  async findAll(): Promise<ClientRow[]> {
    const { rows } = await this.pool.query<ClientRow>(
      `SELECT id, name, lastname, email, dni, phone, birth_date, health_specs, address, is_active, created_at, updated_at FROM clients ORDER BY id`,
    );
    return rows;
  }

  async create(dto: CreateUsersDto): Promise<ClientCreated> {
    const { rows } = await this.pool.query<ClientCreated>(
      `INSERT INTO clients (name, lastname, email, password, dni)
       VALUES ($1, $2, $3, $4, $5)
       RETURNING id, name, lastname, email, created_at, updated_at`,
      [dto.name, dto.lastname, dto.email, dto.password, dto.dni],
    );
    return rows[0];
  }
}
