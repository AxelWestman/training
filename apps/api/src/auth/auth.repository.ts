import { Injectable, Inject } from '@nestjs/common';
import { Pool } from 'pg';
import { PG_POOL } from '../database/database.constants';
import { AuthUser } from '../database/database.types';

interface AuthAdminRow {
  id: number;
  name: string;
  lastname: string;
  email: string;
  password_hash: string;
  role: 'admin' | 'superadmin';
}

interface AuthClientRow {
  id: number;
  name: string;
  lastname: string;
  email: string;
  password: string;
}

@Injectable()
export class AuthRepository {
  constructor(@Inject(PG_POOL) private readonly pool: Pool) {}

  async findUserByEmail(email: string): Promise<AuthUser | null> {
    const adminResult = await this.pool.query<AuthAdminRow>(
      `SELECT id, name, lastname, email, password_hash, role FROM admins WHERE email = $1`,
      [email],
    );
    if (adminResult.rows[0]) {
      const a = adminResult.rows[0];
      return {
        id: a.id,
        name: a.name,
        lastname: a.lastname,
        email: a.email,
        password_hash: a.password_hash,
        type: 'admin',
        role: a.role,
      };
    }

    const clientResult = await this.pool.query<AuthClientRow>(
      `SELECT id, name, lastname, email, password FROM clients WHERE email = $1`,
      [email],
    );
    if (clientResult.rows[0]) {
      const c = clientResult.rows[0];
      return {
        id: c.id,
        name: c.name,
        lastname: c.lastname,
        email: c.email,
        password_hash: c.password,
        type: 'client',
        role: 'client',
      };
    }

    return null;
  }
}
