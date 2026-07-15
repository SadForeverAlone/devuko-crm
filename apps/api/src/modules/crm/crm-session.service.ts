import { Injectable, OnModuleInit } from "@nestjs/common";
import { JwtService } from "@nestjs/jwt";
import { randomInt } from "crypto";
import type { FastifyRequest } from "fastify";
import { CRM_ADMIN_ROLE, type CrmJwtPayload } from "../../common/auth.constants";
import { CRM_AUTH_COOKIE } from "../../common/auth-cookie.util";
import { resolveJwtExpiresIn } from "../../common/jwt-expires.util";
import { resolveJwtSecret } from "../../common/jwt-secret.util";
import { DatabaseService } from "../database/database.service";

type AdminIdentity = {
  id: string;
  email: string;
  firstName?: string;
  lastName?: string;
  displayName?: string;
};

function actorName(admin: AdminIdentity) {
  const first = String(admin.firstName ?? "").trim();
  const last = String(admin.lastName ?? "").trim();
  const combined = [first, last].filter(Boolean).join(" ");
  return combined || String(admin.displayName ?? "").trim() || admin.email;
}

function readSessionCookie(req: FastifyRequest): string | undefined {
  const raw = req.cookies?.[CRM_AUTH_COOKIE];
  if (typeof raw !== "string") {
    return undefined;
  }
  const token = raw.trim();
  return token || undefined;
}

@Injectable()
export class CrmSessionService implements OnModuleInit {
  constructor(
    private readonly db: DatabaseService,
    private readonly jwt: JwtService
  ) {}

  async onModuleInit() {
    void this.purgeStaleRows().catch(() => undefined);
  }

  /** Drop expired sessions and old rate-limit rows (best-effort on boot). */
  async purgeStaleRows(): Promise<void> {
    await this.db.execute(
      `DELETE FROM "CrmAuthSession"
       WHERE "expiresAt" < CURRENT_TIMESTAMP - interval '7 days'`
    );
    await this.db.execute(
      `DELETE FROM "CrmRateLimit"
       WHERE "expiresAt" < $1`,
      [Date.now() - 86_400_000]
    );
  }

  async issueForAdmin(admin: AdminIdentity): Promise<string> {
    const sid = `sess_${Date.now()}_${randomInt(0, 1_000_000_000)}`;
    const expiresIn = resolveJwtExpiresIn();
    const expiresAt = new Date(Date.now() + expiresIn * 1000);

    await this.db.execute(
      `INSERT INTO "CrmAuthSession" ("id", "adminId", "expiresAt")
       VALUES ($1, $2, $3)`,
      [sid, admin.id, expiresAt.toISOString()]
    );

    const payload: CrmJwtPayload = {
      sub: admin.id,
      email: admin.email,
      name: actorName(admin),
      role: CRM_ADMIN_ROLE,
      sid,
    };

    return this.jwt.sign(payload, { expiresIn });
  }

  async isSessionActive(sid: string): Promise<boolean> {
    const { rows } = await this.db.query<{ id: string }>(
      `SELECT "id" FROM "CrmAuthSession"
       WHERE "id" = $1
         AND "revokedAt" IS NULL
         AND "expiresAt" > CURRENT_TIMESTAMP
       LIMIT 1`,
      [sid]
    );
    return Boolean(rows[0]);
  }

  async revokeSession(sid: string): Promise<void> {
    if (!sid.trim()) {
      return;
    }
    await this.db.execute(
      `UPDATE "CrmAuthSession"
       SET "revokedAt" = CURRENT_TIMESTAMP
       WHERE "id" = $1 AND "revokedAt" IS NULL`,
      [sid.trim()]
    );
  }

  async revokeAllForAdmin(adminId: string): Promise<void> {
    if (!adminId.trim()) {
      return;
    }
    await this.db.execute(
      `UPDATE "CrmAuthSession"
       SET "revokedAt" = CURRENT_TIMESTAMP
       WHERE "adminId" = $1 AND "revokedAt" IS NULL`,
      [adminId.trim()]
    );
  }

  /** Revoke current cookie session (ignores JWT expiry so logout still works). */
  async revokeFromRequest(req: FastifyRequest): Promise<void> {
    const sid = this.parseSidFromRequest(req, { ignoreExpiration: true });
    if (sid) {
      await this.revokeSession(sid);
    }
  }

  parseSidFromRequest(req: FastifyRequest, options?: { ignoreExpiration?: boolean }): string | undefined {
    const token = readSessionCookie(req);
    if (!token) {
      return undefined;
    }
    try {
      const payload = this.jwt.verify(token, {
        secret: resolveJwtSecret(),
        algorithms: ["HS256"],
        ignoreExpiration: options?.ignoreExpiration === true,
      }) as CrmJwtPayload;
      return typeof payload.sid === "string" && payload.sid.trim() ? payload.sid.trim() : undefined;
    } catch {
      return undefined;
    }
  }
}
