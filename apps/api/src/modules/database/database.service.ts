import { Injectable, OnModuleDestroy, OnModuleInit } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { Pool, PoolClient } from "pg";

@Injectable()
export class DatabaseService implements OnModuleInit, OnModuleDestroy {
  readonly pool: Pool;

  constructor(config: ConfigService) {
    this.pool = new Pool({ connectionString: config.getOrThrow<string>("DATABASE_URL") });
  }

  async onModuleInit() {
    await this.pool.query("SELECT 1");
  }

  async onModuleDestroy() {
    await this.pool.end();
  }

  query<T extends Record<string, unknown> = Record<string, unknown>>(text: string, params?: unknown[]) {
    return this.pool.query<T>(text, params);
  }

  async execute(text: string, params?: unknown[]) {
    await this.pool.query(text, params);
  }

  async withTransaction<T>(fn: (client: PoolClient) => Promise<T>): Promise<T> {
    const client = await this.pool.connect();
    try {
      await client.query("BEGIN");
      const result = await fn(client);
      await client.query("COMMIT");
      return result;
    } catch (error) {
      await client.query("ROLLBACK");
      throw error;
    } finally {
      client.release();
    }
  }
}
