import { Injectable, OnModuleInit } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { JwtService } from "@nestjs/jwt";
import { createHash } from "crypto";
import { DatabaseService } from "../database/database.service";

@Injectable()
export class CrmAdminService implements OnModuleInit {
  constructor(
    private readonly db: DatabaseService,
    private readonly config: ConfigService,
    private readonly jwt: JwtService
  ) {}

  private hashPassword(password: string) {
    return createHash("sha256").update(password).digest("hex");
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
    const email = this.config.get<string>("CRM_ADMIN_EMAIL")?.trim().toLowerCase();
    const password = this.config.get<string>("CRM_ADMIN_PASSWORD")?.trim();
    if (!email || !password) return;
    const { rows } = await this.db.query(`SELECT "id" FROM "CrmAdmin" WHERE lower("email") = $1 LIMIT 1`, [email]);
    if (rows[0]) return;
    await this.db.execute(
      `INSERT INTO "CrmAdmin" ("id", "email", "passwordHash", "displayName") VALUES ($1, $2, $3, $4)`,
      [`admin_${Date.now()}`, email, this.hashPassword(password), "Platform Admin"]
    );
  }

  async login(login: string, password: string) {
    const identifier = login.trim().toLowerCase();
    const { rows } = await this.db.query(
      `SELECT "id", "email", "passwordHash", "displayName" FROM "CrmAdmin" WHERE lower("email") = $1 LIMIT 1`,
      [identifier]
    );
    const admin = rows[0];
    if (!admin || admin.passwordHash !== this.hashPassword(password)) {
      return { ok: false as const };
    }
    const token = this.jwt.sign(
      { sub: String(admin.id), email: String(admin.email) },
      { expiresIn: 8 * 3600 }
    );
    return { ok: true as const, token };
  }
}
