import * as bcrypt from 'bcrypt';
import { Client } from 'pg';

export interface SeedUser {
  email: string;
  password: string;
}

export interface SeedSuperadminOptions {
  email?: string;
  password?: string;
  dni?: string;
}

export async function seedSuperadmin(
  databaseUrl: string,
  options: SeedSuperadminOptions = {},
): Promise<SeedUser> {
  const email = options.email ?? 'superadmin@test.com';
  const password = options.password ?? 'superadmin123';
  const dni = options.dni ?? '00000001';
  const passwordHash = await bcrypt.hash(password, 10);

  const client = new Client({ connectionString: databaseUrl });
  await client.connect();
  try {
    await client.query(
      `INSERT INTO admins (name, lastname, email, password_hash, dni, role)
       VALUES ($1, $2, $3, $4, $5, $6)`,
      ['Super', 'Admin', email, passwordHash, dni, 'superadmin'],
    );
  } finally {
    await client.end();
  }

  return { email, password };
}
