import { BadRequestException, Injectable, NotFoundException, OnModuleInit } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { JwtService } from "@nestjs/jwt";
import { DatabaseService } from "../database/database.service";
import { PlatformAuditService } from "./platform-audit.service";
import { hashPassword, shouldRehash, verifyPassword } from "./password-hash";

type AuditActor = { id?: string; email?: string; name?: string };

const LOGIN_RE = /^[a-zA-Z0-9._-]{3,32}$/;

function fullName(firstName: string, lastName: string) {
  return [firstName.trim(), lastName.trim()].filter(Boolean).join(" ");
}

@Injectable()
export class CrmAdminService implements OnModuleInit {
  constructor(
    private readonly db: DatabaseService,
    private readonly config: ConfigService,
    private readonly jwt: JwtService,
    private readonly audit: PlatformAuditService
  ) {}

  private async ensureAdminColumns() {
    await this.db.execute(`ALTER TABLE "CrmAdmin" ADD COLUMN IF NOT EXISTS "login" TEXT`);
    await this.db.execute(`ALTER TABLE "CrmAdmin" ADD COLUMN IF NOT EXISTS "firstName" TEXT`);
    await this.db.execute(`ALTER TABLE "CrmAdmin" ADD COLUMN IF NOT EXISTS "lastName" TEXT`);
    await this.db.execute(`
      UPDATE "CrmAdmin"
      SET
        "firstName" = COALESCE(NULLIF(TRIM("firstName"), ''), NULLIF(split_part(TRIM("displayName"), ' ', 1), ''), 'Admin'),
        "lastName" = COALESCE(
          NULLIF(TRIM("lastName"), ''),
          NULLIF(TRIM(substring(TRIM("displayName") from position(' ' in TRIM("displayName") || ' '))), ''),
          ''
        ),
        "login" = COALESCE(NULLIF(TRIM("login"), ''), split_part(lower("email"), '@', 1))
      WHERE "firstName" IS NULL OR TRIM("firstName") = ''
         OR "login" IS NULL OR TRIM("login") = ''
    `);
    await this.db.execute(`
      UPDATE "CrmAdmin"
      SET "displayName" = TRIM(CONCAT("firstName", ' ', "lastName"))
      WHERE TRIM("displayName") = '' OR "displayName" IS NULL
    `);
    await this.db.execute(`
      CREATE UNIQUE INDEX IF NOT EXISTS "CrmAdmin_login_lower_idx"
      ON "CrmAdmin" (lower("login"))
    `);
  }

  private mapAdminRow(row: Record<string, unknown>) {
    const firstName = String(row.firstName ?? "").trim();
    const lastName = String(row.lastName ?? "").trim();
    const displayName = fullName(firstName, lastName) || String(row.displayName ?? "").trim();
    return {
      id: String(row.id),
      login: String(row.login ?? ""),
      email: String(row.email),
      firstName,
      lastName,
      displayName,
      createdAt: new Date(row.createdAt as string | Date).toISOString(),
    };
  }

  private validateLogin(login: string) {
    if (!login || !LOGIN_RE.test(login)) {
      throw new BadRequestException("Invalid login");
    }
  }

  private validateNamePart(value: string, label: string) {
    const trimmed = value.trim();
    if (!trimmed || trimmed.length < 2 || trimmed.length > 40) {
      throw new BadRequestException(`${label} is required`);
    }
    if (!/^[\p{L}\s'-]+$/u.test(trimmed)) {
      throw new BadRequestException(`Invalid ${label.toLowerCase()}`);
    }
  }

  async onModuleInit() {
    await this.db.execute(`
      CREATE TABLE IF NOT EXISTS "CrmAdmin" (
        "id" TEXT PRIMARY KEY,
        "email" TEXT UNIQUE NOT NULL,
        "passwordHash" TEXT NOT NULL,
        "displayName" TEXT NOT NULL,
        "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP
      )
    `);
    await this.ensureAdminColumns();
    const email = this.config.get<string>("CRM_ADMIN_EMAIL")?.trim().toLowerCase();
    const password = this.config.get<string>("CRM_ADMIN_PASSWORD")?.trim();
    if (!email || !password) return;
    const { rows } = await this.db.query(`SELECT "id" FROM "CrmAdmin" WHERE lower("email") = $1 LIMIT 1`, [email]);
    if (rows[0]) return;
    const login = email.split("@")[0] ?? "admin";
    await this.db.execute(
      `INSERT INTO "CrmAdmin" ("id", "login", "email", "passwordHash", "firstName", "lastName", "displayName")
       VALUES ($1, $2, $3, $4, $5, $6, $7)`,
      [`admin_${Date.now()}`, login, email, hashPassword(password), "Platform", "Admin", "Platform Admin"]
    );
  }

  async login(login: string, password: string) {
    const identifier = login.trim().toLowerCase();
    const { rows } = await this.db.query(
      `SELECT "id", "login", "email", "passwordHash", "firstName", "lastName", "displayName"
       FROM "CrmAdmin"
       WHERE lower("login") = $1 OR lower("email") = $1
       LIMIT 1`,
      [identifier]
    );
    const admin = rows[0];
    if (!admin || !verifyPassword(password, String(admin.passwordHash))) {
      await this.audit.log({
        actorEmail: identifier || null,
        action: "auth.login_failed",
        target: identifier || null,
        ok: false,
      });
      return { ok: false as const };
    }
    if (shouldRehash(String(admin.passwordHash))) {
      await this.db.execute(`UPDATE "CrmAdmin" SET "passwordHash" = $1 WHERE "id" = $2`, [
        hashPassword(password),
        String(admin.id),
      ]);
    }
    const actorName = fullName(String(admin.firstName ?? ""), String(admin.lastName ?? "")) || String(admin.displayName);
    const token = this.jwt.sign(
      { sub: String(admin.id), email: String(admin.email), name: actorName },
      { expiresIn: 8 * 3600 }
    );
    await this.audit.log({
      actorAdminId: String(admin.id),
      actorEmail: String(admin.email),
      actorName,
      action: "auth.login",
      target: actorName,
      ok: true,
    });
    return { ok: true as const, token };
  }

  async getSession(adminId: string) {
    if (!adminId) {
      throw new NotFoundException("Session not found");
    }
    const { rows } = await this.db.query(
      `SELECT "id", "login", "email", "firstName", "lastName", "displayName", "createdAt"
       FROM "CrmAdmin" WHERE "id" = $1 LIMIT 1`,
      [adminId]
    );
    const admin = rows[0];
    if (!admin) {
      throw new NotFoundException("Session not found");
    }
    return this.mapAdminRow(admin);
  }

  async listAdmins(input?: {
    search?: string;
    orderBy?: "createdAt" | "email" | "displayName" | "login" | "firstName";
    orderDir?: "asc" | "desc";
    limit?: number;
    offset?: number;
  }) {
    const limit = Math.min(Math.max(input?.limit ?? 200, 1), 500);
    const offset = Math.max(input?.offset ?? 0, 0);
    const orderBy = input?.orderBy ?? "createdAt";
    const orderDir = input?.orderDir === "asc" ? "ASC" : "DESC";
    const orderColumn =
      orderBy === "email"
        ? "email"
        : orderBy === "login"
          ? "login"
          : orderBy === "firstName"
            ? "firstName"
            : orderBy === "displayName"
              ? "displayName"
              : "createdAt";
    const search = input?.search?.trim().toLowerCase();
    const params: unknown[] = [];
    let where = "";
    if (search) {
      params.push(`%${search}%`);
      where = `WHERE lower("email") LIKE $1
        OR lower("login") LIKE $1
        OR lower("firstName") LIKE $1
        OR lower("lastName") LIKE $1
        OR lower("displayName") LIKE $1`;
    }
    params.push(limit, offset);
    const limitIdx = params.length - 1;
    const offsetIdx = params.length;
    const { rows } = await this.db.query(
      `SELECT "id", "login", "email", "firstName", "lastName", "displayName", "createdAt"
       FROM "CrmAdmin"
       ${where}
       ORDER BY "${orderColumn}" ${orderDir}
       LIMIT $${limitIdx} OFFSET $${offsetIdx}`,
      params
    );
    return rows.map((row) => this.mapAdminRow(row));
  }

  async countAdmins() {
    const { rows } = await this.db.query(`SELECT COUNT(*)::int AS count FROM "CrmAdmin"`);
    return Number(rows[0]?.count ?? 0);
  }

  async createAdmin(
    input: { login: string; email: string; password: string; firstName: string; lastName: string },
    actor?: AuditActor
  ) {
    const login = input.login.trim().toLowerCase();
    const email = input.email.trim().toLowerCase();
    const firstName = input.firstName.trim();
    const lastName = input.lastName.trim();
    const displayName = fullName(firstName, lastName);
    const password = input.password;
    this.validateLogin(login);
    if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      throw new BadRequestException("Invalid email");
    }
    this.validateNamePart(firstName, "First name");
    this.validateNamePart(lastName, "Last name");
    if (!password || password.length < 8) {
      throw new BadRequestException("Password must be at least 8 characters");
    }
    const { rows: existingEmail } = await this.db.query(
      `SELECT "id" FROM "CrmAdmin" WHERE lower("email") = $1 LIMIT 1`,
      [email]
    );
    if (existingEmail[0]) {
      throw new BadRequestException("Email already exists");
    }
    const { rows: existingLogin } = await this.db.query(
      `SELECT "id" FROM "CrmAdmin" WHERE lower("login") = $1 LIMIT 1`,
      [login]
    );
    if (existingLogin[0]) {
      throw new BadRequestException("Login already exists");
    }
    const id = `admin_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;
    await this.db.execute(
      `INSERT INTO "CrmAdmin" ("id", "login", "email", "passwordHash", "firstName", "lastName", "displayName")
       VALUES ($1, $2, $3, $4, $5, $6, $7)`,
      [id, login, email, hashPassword(password), firstName, lastName, displayName]
    );
    await this.audit.log({
      actorAdminId: actor?.id ?? null,
      actorEmail: actor?.email ?? null,
      actorName: actor?.name ?? null,
      action: "admin.create",
      target: displayName,
      detail: login,
      ok: true,
    });
    return { ok: true as const, admin: { id, login, email, firstName, lastName, displayName } };
  }

  async updateAdmin(
    id: string,
    input: { login?: string; email?: string; password?: string; firstName?: string; lastName?: string },
    actor?: AuditActor
  ) {
    const { rows } = await this.db.query(
      `SELECT "id", "login", "email", "firstName", "lastName", "displayName" FROM "CrmAdmin" WHERE "id" = $1 LIMIT 1`,
      [id]
    );
    const admin = rows[0];
    if (!admin) {
      throw new NotFoundException("Admin not found");
    }
    const login = (input.login?.trim().toLowerCase() ?? String(admin.login)).trim();
    const email = input.email?.trim().toLowerCase() ?? String(admin.email);
    const firstName = input.firstName?.trim() ?? String(admin.firstName ?? "");
    const lastName = input.lastName?.trim() ?? String(admin.lastName ?? "");
    const displayName = fullName(firstName, lastName);
    this.validateLogin(login);
    if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      throw new BadRequestException("Invalid email");
    }
    this.validateNamePart(firstName, "First name");
    this.validateNamePart(lastName, "Last name");
    if (login !== String(admin.login).toLowerCase()) {
      const { rows: existingLogin } = await this.db.query(
        `SELECT "id" FROM "CrmAdmin" WHERE lower("login") = $1 AND "id" <> $2 LIMIT 1`,
        [login, id]
      );
      if (existingLogin[0]) {
        throw new BadRequestException("Login already exists");
      }
    }
    if (email !== String(admin.email).toLowerCase()) {
      const { rows: existing } = await this.db.query(
        `SELECT "id" FROM "CrmAdmin" WHERE lower("email") = $1 AND "id" <> $2 LIMIT 1`,
        [email, id]
      );
      if (existing[0]) {
        throw new BadRequestException("Email already exists");
      }
    }
    const password = input.password?.trim();
    if (password) {
      if (password.length < 8) {
        throw new BadRequestException("Password must be at least 8 characters");
      }
      await this.db.execute(
        `UPDATE "CrmAdmin"
         SET "login" = $1, "email" = $2, "firstName" = $3, "lastName" = $4, "displayName" = $5, "passwordHash" = $6
         WHERE "id" = $7`,
        [login, email, firstName, lastName, displayName, hashPassword(password), id]
      );
    } else {
      await this.db.execute(
        `UPDATE "CrmAdmin"
         SET "login" = $1, "email" = $2, "firstName" = $3, "lastName" = $4, "displayName" = $5
         WHERE "id" = $6`,
        [login, email, firstName, lastName, displayName, id]
      );
    }
    await this.audit.log({
      actorAdminId: actor?.id ?? null,
      actorEmail: actor?.email ?? null,
      actorName: actor?.name ?? null,
      action: "admin.update",
      target: displayName,
      detail: password ? "password changed" : login,
      ok: true,
    });
    return { ok: true as const };
  }

  async deleteAdmin(id: string, actorId: string, actorEmail?: string, actorName?: string) {
    if (id === actorId) {
      throw new BadRequestException("Cannot delete your own account");
    }
    const { rows } = await this.db.query(
      `SELECT "id", "email", "firstName", "lastName", "displayName" FROM "CrmAdmin" WHERE "id" = $1 LIMIT 1`,
      [id]
    );
    const admin = rows[0];
    if (!admin) {
      throw new NotFoundException("Admin not found");
    }
    const { rows: countRows } = await this.db.query(`SELECT COUNT(*)::int AS count FROM "CrmAdmin"`);
    const total = Number(countRows[0]?.count ?? 0);
    if (total <= 1) {
      throw new BadRequestException("Cannot delete the last admin");
    }
    const label = fullName(String(admin.firstName ?? ""), String(admin.lastName ?? "")) || String(admin.displayName);
    await this.db.execute(`DELETE FROM "CrmAdmin" WHERE "id" = $1`, [id]);
    await this.audit.log({
      actorAdminId: actorId,
      actorEmail: actorEmail ?? null,
      actorName: actorName ?? null,
      action: "admin.delete",
      target: label,
      ok: true,
    });
    return { ok: true as const };
  }
}
