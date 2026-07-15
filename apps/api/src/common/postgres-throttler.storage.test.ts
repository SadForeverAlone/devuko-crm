import { describe, expect, it, vi } from "vitest";
import { PostgresThrottlerStorage } from "./postgres-throttler.storage";
import type { DatabaseService } from "../modules/database/database.service";

type Row = {
  key: string;
  hits: number;
  expiresAt: number;
  isBlocked: boolean;
  blockExpiresAt: number;
};

function createFakeDb(seed?: Row) {
  let row: Row | undefined = seed;
  const client = {
    query: vi.fn(async (sql: string, params?: unknown[]) => {
      if (sql.includes("FOR UPDATE")) {
        return { rows: row ? [row] : [] };
      }
      if (sql.includes("INSERT INTO")) {
        row = {
          key: String(params?.[0]),
          hits: Number(params?.[1]),
          expiresAt: Number(params?.[2]),
          isBlocked: Boolean(params?.[3]),
          blockExpiresAt: Number(params?.[4]),
        };
        return { rows: [] };
      }
      return { rows: [] };
    }),
  };

  const db = {
    execute: vi.fn().mockResolvedValue(undefined),
    withTransaction: vi.fn(async <T>(fn: (c: typeof client) => Promise<T>) => fn(client)),
  } satisfies Partial<DatabaseService>;

  return { db: db as DatabaseService, getRow: () => row };
}

describe("PostgresThrottlerStorage", () => {
  it("increments hits within the TTL window", async () => {
    const { db } = createFakeDb();
    const storage = new PostgresThrottlerStorage(db);

    const first = await storage.increment("ip:1", 60_000, 3, 60_000, "auth");
    const second = await storage.increment("ip:1", 60_000, 3, 60_000, "auth");

    expect(first.totalHits).toBe(1);
    expect(first.isBlocked).toBe(false);
    expect(second.totalHits).toBe(2);
  });

  it("blocks after exceeding limit", async () => {
    const { db } = createFakeDb();
    const storage = new PostgresThrottlerStorage(db);

    await storage.increment("ip:2", 60_000, 2, 30_000, "auth");
    await storage.increment("ip:2", 60_000, 2, 30_000, "auth");
    const blocked = await storage.increment("ip:2", 60_000, 2, 30_000, "auth");

    expect(blocked.totalHits).toBe(3);
    expect(blocked.isBlocked).toBe(true);
    expect(blocked.timeToBlockExpire).toBeGreaterThan(0);
  });
});
