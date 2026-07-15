import type { ThrottlerStorage } from "@nestjs/throttler";
import type { DatabaseService } from "../modules/database/database.service";

type ThrottlerHitRecord = Awaited<ReturnType<ThrottlerStorage["increment"]>>;

/** Postgres-backed rate-limit store (shared across replicas). */
export class PostgresThrottlerStorage implements ThrottlerStorage {
  private ready: Promise<void> | null = null;

  constructor(private readonly db: DatabaseService) {}

  private ensureTable() {
    if (!this.ready) {
      this.ready = this.db
        .execute(`
          CREATE TABLE IF NOT EXISTS "CrmRateLimit" (
            "key" TEXT PRIMARY KEY,
            "hits" INTEGER NOT NULL DEFAULT 0,
            "expiresAt" BIGINT NOT NULL,
            "isBlocked" BOOLEAN NOT NULL DEFAULT FALSE,
            "blockExpiresAt" BIGINT NOT NULL DEFAULT 0
          )
        `)
        .then(() => undefined);
    }
    return this.ready;
  }

  async increment(
    key: string,
    ttl: number,
    limit: number,
    blockDuration: number,
    _throttlerName: string
  ): Promise<ThrottlerHitRecord> {
    await this.ensureTable();
    const now = Date.now();
    const ttlMs = Math.max(1, ttl);
    const blockMs = Math.max(0, blockDuration);

    return this.db.withTransaction(async (client) => {
      const { rows } = await client.query<{
        key: string;
        hits: number;
        expiresAt: string;
        isBlocked: boolean;
        blockExpiresAt: string;
      }>(`SELECT "key", "hits", "expiresAt", "isBlocked", "blockExpiresAt"
          FROM "CrmRateLimit" WHERE "key" = $1 FOR UPDATE`, [key]);

      let hits = 0;
      let expiresAt = now + ttlMs;
      let isBlocked = false;
      let blockExpiresAt = 0;

      const existing = rows[0];
      if (existing) {
        hits = Number(existing.hits);
        expiresAt = Number(existing.expiresAt);
        isBlocked = Boolean(existing.isBlocked);
        blockExpiresAt = Number(existing.blockExpiresAt);
      }

      if (isBlocked && blockExpiresAt <= now) {
        isBlocked = false;
        blockExpiresAt = 0;
        hits = 0;
        expiresAt = now + ttlMs;
      }

      if (expiresAt <= now) {
        hits = 0;
        expiresAt = now + ttlMs;
      }

      if (!isBlocked) {
        hits += 1;
      }

      if (hits > limit && !isBlocked) {
        isBlocked = true;
        blockExpiresAt = now + blockMs;
      }

      await client.query(
        `INSERT INTO "CrmRateLimit" ("key", "hits", "expiresAt", "isBlocked", "blockExpiresAt")
         VALUES ($1, $2, $3, $4, $5)
         ON CONFLICT ("key") DO UPDATE SET
           "hits" = EXCLUDED."hits",
           "expiresAt" = EXCLUDED."expiresAt",
           "isBlocked" = EXCLUDED."isBlocked",
           "blockExpiresAt" = EXCLUDED."blockExpiresAt"`,
        [key, hits, expiresAt, isBlocked, blockExpiresAt]
      );

      return {
        totalHits: hits,
        timeToExpire: Math.max(0, Math.ceil((expiresAt - now) / 1000)),
        isBlocked,
        timeToBlockExpire: Math.max(0, Math.ceil((blockExpiresAt - now) / 1000)),
      };
    });
  }
}
