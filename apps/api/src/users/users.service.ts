import { Injectable, Inject, NotFoundException } from '@nestjs/common';
import { Pool } from 'pg';
import { PG_POOL } from '../database/database.constants';
import { CreateUsersDto } from './dto/users.dto';

@Injectable()
export class UsersService {
  constructor(@Inject(PG_POOL) private readonly pool: Pool) {}

  async create(dto: CreateUsersDto) {
    const { rows } = await this.pool.query(
      `INSERT INTO clients (name, lastname, email, password_hash, role)
       VALUES ($1, $2, $3, $4, $5)
       RETURNING id, name, lastname, email, role, created_at, updated_at`,
      [dto.name, dto.lastname, dto.email, dto.password, dto.role ?? 'user'],
    );
    return rows[0];
  }
}
