import {
  Module,
  Global,
  OnApplicationShutdown,
  OnModuleInit,
  Inject,
  Logger,
} from '@nestjs/common';
import { Pool } from 'pg';
import { PG_POOL } from './database.constants';

@Global()
@Module({
  providers: [
    {
      provide: PG_POOL,
      useFactory: () =>
        new Pool({
          connectionString: process.env.DATABASE_URL,
          max: 20,
          idleTimeoutMillis: 30000,
          connectionTimeoutMillis: 5000,
        }),
    },
  ],
  exports: [PG_POOL],
})
export class DatabaseModule implements OnModuleInit, OnApplicationShutdown {
  private readonly logger = new Logger(DatabaseModule.name);

  constructor(@Inject(PG_POOL) private pool: Pool) {}

  async onModuleInit() {
    try {
      await this.pool.query('SELECT 1');
      this.logger.log('Database connected successfully');
    } catch (error) {
      this.logger.error('Database connection failed', error);
    }
  }

  async onApplicationShutdown() {
    await this.pool.end();
  }
}
