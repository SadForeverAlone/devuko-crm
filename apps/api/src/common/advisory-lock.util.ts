import { createHash } from "crypto";
import { DatabaseService } from "../modules/database/database.service";

/** Stable signed 32-bit keys for pg_advisory_lock from a namespace string. */
export function advisoryLockKeys(name: string): [number, number] {
  const digest = createHash("sha256").update(name).digest();
  const key1 = digest.readInt32BE(0);
  const key2 = digest.readInt32BE(4);
  return [key1, key2];
}

/** Session-level advisory lock (not xact) — avoids holding a SQL txn for long deploys. */
export async function withAdvisoryLock<T>(
  db: DatabaseService,
  lockName: string,
  fn: () => Promise<T>
): Promise<T> {
  const [key1, key2] = advisoryLockKeys(lockName);
  const client = await db.pool.connect();
  try {
    const { rows } = await client.query<{ locked: boolean }>(
      `SELECT pg_try_advisory_lock($1, $2) AS locked`,
      [key1, key2]
    );
    if (!rows[0]?.locked) {
      throw new Error("LOCK_BUSY");
    }
    try {
      return await fn();
    } finally {
      await client.query(`SELECT pg_advisory_unlock($1, $2)`, [key1, key2]);
    }
  } finally {
    client.release();
  }
}
