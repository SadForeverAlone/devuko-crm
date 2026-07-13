import { Injectable, OnModuleInit } from "@nestjs/common";
import { createHash, randomBytes } from "crypto";
import { DatabaseService } from "../database/database.service";

export type PlatformAuditRow = {
  id: string;
  actorAdminId: string | null;
  actorName: string | null;
  action: string;
  target: string | null;
  detail: string | null;
  ok: boolean;
  createdAt: string;
};

@Injectable()
export class PlatformAuditService implements OnModuleInit {
  private ready = false;

  constructor(private readonly db: DatabaseService) {}

  private id() {
    return `plog_${createHash("sha256").update(randomBytes(12)).digest("hex").slice(0, 16)}`;
  }

  async onModuleInit() {
    await this.ensureTable();
  }

  async ensureTable() {
    if (this.ready) return;
    await this.db.execute(`
      CREATE TABLE IF NOT EXISTS "CrmPlatformAudit" (
        "id" TEXT PRIMARY KEY,
        "actorAdminId" TEXT NULL,
        "actorEmail" TEXT NULL,
        "action" TEXT NOT NULL,
        "target" TEXT NULL,
        "detail" TEXT NULL,
        "ok" BOOLEAN NOT NULL DEFAULT TRUE,
        "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP
      )
    `);
    await this.db.execute(`ALTER TABLE "CrmPlatformAudit" ADD COLUMN IF NOT EXISTS "actorName" TEXT NULL`);
    await this.db.execute(`
      CREATE INDEX IF NOT EXISTS "CrmPlatformAudit_createdAt_idx"
      ON "CrmPlatformAudit" ("createdAt" DESC)
    `);
    this.ready = true;
  }

  async log(input: {
    actorAdminId?: string | null;
    actorEmail?: string | null;
    actorName?: string | null;
    action: string;
    target?: string | null;
    detail?: string | null;
    ok?: boolean;
  }) {
    await this.ensureTable();
    await this.db.execute(
      `INSERT INTO "CrmPlatformAudit" ("id", "actorAdminId", "actorEmail", "actorName", "action", "target", "detail", "ok")
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8)`,
      [
        this.id(),
        input.actorAdminId ?? null,
        input.actorEmail ?? null,
        input.actorName?.trim() || null,
        input.action,
        input.target ?? null,
        input.detail?.slice(0, 2000) ?? null,
        input.ok !== false,
      ]
    );
  }

  async list(input?: { limit?: number; offset?: number }) {
    await this.ensureTable();
    const limit = Math.min(Math.max(input?.limit ?? 200, 1), 500);
    const offset = Math.max(input?.offset ?? 0, 0);
    const { rows } = await this.db.query(
      `SELECT a."id", a."actorAdminId",
              COALESCE(
                NULLIF(a."actorName", ''),
                NULLIF(TRIM(CONCAT(adm."firstName", ' ', adm."lastName")), ''),
                NULLIF(adm."displayName", '')
              ) AS "actorName",
              a."action", a."target", a."detail", a."ok", a."createdAt"
       FROM "CrmPlatformAudit" a
       LEFT JOIN "CrmAdmin" adm ON adm."id" = a."actorAdminId"
       ORDER BY a."createdAt" DESC
       LIMIT $1 OFFSET $2`,
      [limit, offset]
    );
    return rows.map((row) => ({
      id: String(row.id),
      actorAdminId: row.actorAdminId ? String(row.actorAdminId) : null,
      actorName: row.actorName ? String(row.actorName) : null,
      action: String(row.action),
      target: row.target ? String(row.target) : null,
      detail: row.detail ? String(row.detail) : null,
      ok: Boolean(row.ok),
      createdAt: new Date(row.createdAt as string | Date).toISOString(),
    })) satisfies PlatformAuditRow[];
  }

  async lastActivityAt() {
    await this.ensureTable();
    const { rows } = await this.db.query(
      `SELECT "createdAt" FROM "CrmPlatformAudit" ORDER BY "createdAt" DESC LIMIT 1`
    );
    if (!rows[0]) return null;
    return new Date(rows[0].createdAt as string | Date).toISOString();
  }
}
