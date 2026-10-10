import { existsSync, readFileSync } from 'fs';
import { resolve } from 'path';
import { Client } from 'pg';

const TEST_DATABASE_NAME = 'gimnasio_test';

const TABLES = [
  'attendance',
  'client_routines',
  'routine_exercises',
  'routines',
  'exercises',
  'payments',
  'client_memberships',
  'memberships',
  'clients',
  'admins',
];

export function getTestDatabaseUrl(): string {
  if (process.env.TEST_DATABASE_URL) {
    return process.env.TEST_DATABASE_URL;
  }

  const base = process.env.DATABASE_URL;
  if (!base) {
    throw new Error(
      'DATABASE_URL (or TEST_DATABASE_URL) must be set to run e2e tests',
    );
  }

  const url = new URL(base);
  url.pathname = `/${TEST_DATABASE_NAME}`;
  return url.toString();
}

function getDatabaseName(databaseUrl: string): string {
  return new URL(databaseUrl).pathname.replace(/^\//, '');
}

function getMaintenanceUrl(databaseUrl: string): string {
  const url = new URL(databaseUrl);
  url.pathname = '/postgres';
  return url.toString();
}

async function withClient<T>(
  databaseUrl: string,
  fn: (client: Client) => Promise<T>,
): Promise<T> {
  const client = new Client({ connectionString: databaseUrl });
  await client.connect();
  try {
    return await fn(client);
  } finally {
    await client.end();
  }
}

export async function ensureTestDatabase(databaseUrl: string): Promise<void> {
  const databaseName = getDatabaseName(databaseUrl);

  await withClient(getMaintenanceUrl(databaseUrl), async (client) => {
    const { rowCount } = await client.query(
      'SELECT 1 FROM pg_database WHERE datname = $1',
      [databaseName],
    );
    if (rowCount === 0) {
      await client.query(`CREATE DATABASE "${databaseName}"`);
    }
  });
}

function resolveSchemaPath(): string {
  const candidates = [
    resolve(process.cwd(), '../../database/schema.sql'),
    resolve(__dirname, '../../../../../database/schema.sql'),
  ];
  const schemaPath = candidates.find((candidate) => existsSync(candidate));
  if (!schemaPath) {
    throw new Error(
      `Could not find database/schema.sql (looked in: ${candidates.join(', ')})`,
    );
  }
  return schemaPath;
}

export async function applySchema(databaseUrl: string): Promise<void> {
  const schema = readFileSync(resolveSchemaPath(), 'utf8');
  const createOnly = schema
    .split('-- Workflow de ejemplo')[0]
    .replace(/CREATE INDEX /g, 'CREATE INDEX IF NOT EXISTS ');

  await withClient(databaseUrl, async (client) => {
    await client.query(createOnly);
  });
}

export async function resetDatabase(databaseUrl: string): Promise<void> {
  await withClient(databaseUrl, async (client) => {
    await client.query(
      `TRUNCATE ${TABLES.join(', ')} RESTART IDENTITY CASCADE`,
    );
  });
}
