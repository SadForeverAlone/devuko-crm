import { Injectable, Logger, OnModuleInit } from "@nestjs/common";
import { readdirSync, readFileSync } from "fs";
import { join } from "path";
import { withAdvisoryLock } from "../../common/advisory-lock.util";
import { DatabaseService } from "./database.service";

const SCHEMA_LOCK_NAME = "devuko-crm-schema";

@Injectable()
export class DatabaseSchemaService implements OnModuleInit {
  private readonly logger = new Logger(DatabaseSchemaService.name);
  private ready = false;

  constructor(private readonly db: DatabaseService) {}

  async onModuleInit() {
    await this.ensureSchema();
  }

  async ensureSchema() {
    if (this.ready) return;

    try {
      await withAdvisoryLock(this.db, SCHEMA_LOCK_NAME, async () => {
        if (this.ready) return;
        await this.applyPendingMigrations();
        this.ready = true;
      });
    } catch (error) {
      if (error instanceof Error && error.message === "LOCK_BUSY") {
        await this.waitForPeerMigrations();
        this.ready = true;
        return;
      }
      throw error;
    }
  }

  private async applyPendingMigrations() {
    await this.db.execute(`
      CREATE TABLE IF NOT EXISTS "CrmSchemaMeta" (
        "id" TEXT PRIMARY KEY,
        "appliedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP
      )
    `);

    const migrationsDir = join(process.cwd(), "migrations");
    const migrationIds = readdirSync(migrationsDir)
      .filter((name) => name.endsWith(".sql"))
      .map((name) => name.replace(/\.sql$/, ""))
      .sort();

    for (const migrationId of migrationIds) {
      const { rows } = await this.db.query<{ id: string }>(
        `SELECT "id" FROM "CrmSchemaMeta" WHERE "id" = $1 LIMIT 1`,
        [migrationId]
      );
      if (rows[0]) {
        continue;
      }

      const sqlPath = join(migrationsDir, `${migrationId}.sql`);
      const sql = readFileSync(sqlPath, "utf8");
      await this.db.withTransaction(async (client) => {
        await client.query(sql);
        await client.query(`INSERT INTO "CrmSchemaMeta" ("id") VALUES ($1)`, [migrationId]);
      });
      this.logger.log(`Applied schema migration ${migrationId}`);
    }
  }

  private async waitForPeerMigrations(maxAttempts = 30) {
    const migrationsDir = join(process.cwd(), "migrations");
    const migrationIds = readdirSync(migrationsDir)
      .filter((name) => name.endsWith(".sql"))
      .map((name) => name.replace(/\.sql$/, ""))
      .sort();

    for (let attempt = 0; attempt < maxAttempts; attempt += 1) {
      const { rows } = await this.db.query<{ id: string }>(
        `SELECT "id" FROM "CrmSchemaMeta" WHERE "id" = ANY($1::text[])`,
        [migrationIds]
      );
      if (rows.length >= migrationIds.length) {
        this.logger.log("Schema ready (applied by peer instance)");
        return;
      }
      await new Promise((resolve) => setTimeout(resolve, 1_000));
    }

    throw new Error("Timed out waiting for schema migrations");
  }
}
