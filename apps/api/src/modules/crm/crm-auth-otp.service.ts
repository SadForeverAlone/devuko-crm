import { HttpException, HttpStatus, Injectable, OnModuleInit } from "@nestjs/common";
import { randomInt } from "crypto";
import { advisoryLockKeys } from "../../common/advisory-lock.util";
import { DatabaseSchemaService } from "../database/database-schema.service";
import { DatabaseService } from "../database/database.service";
import { CrmAdminService } from "./crm-admin.service";
import { CrmSessionService } from "./crm-session.service";
import { MailService } from "./mail.service";
import { PlatformAuditService } from "./platform-audit.service";
import { hashPassword, verifyPassword } from "./password-hash";

const OTP_TTL_MS = 10 * 60 * 1000;
const OTP_COOLDOWN_MS = 60 * 1000;
const OTP_MAX_ATTEMPTS = 5;
const OTP_CODE_LENGTH = 6;

function fullName(firstName: string, lastName: string) {
  return [firstName.trim(), lastName.trim()].filter(Boolean).join(" ");
}

function normalizeEmail(email: string) {
  return email.trim().toLowerCase();
}

function isValidEmail(email: string) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

@Injectable()
export class CrmAuthOtpService implements OnModuleInit {
  constructor(
    private readonly db: DatabaseService,
    private readonly schema: DatabaseSchemaService,
    private readonly sessions: CrmSessionService,
    private readonly mail: MailService,
    private readonly audit: PlatformAuditService,
    private readonly admins: CrmAdminService
  ) {}

  async onModuleInit() {
    await this.schema.ensureSchema();
  }

  private generateCode() {
    return String(randomInt(0, 10 ** OTP_CODE_LENGTH)).padStart(OTP_CODE_LENGTH, "0");
  }

  private async issueToken(admin: Record<string, unknown>) {
    return this.sessions.issueForAdmin({
      id: String(admin.id),
      email: String(admin.email),
      firstName: String(admin.firstName ?? ""),
      lastName: String(admin.lastName ?? ""),
      displayName: String(admin.displayName ?? ""),
    });
  }

  async requestOtp(login: string, password: string) {
    const admin = await this.admins.verifyCredentials(login, password);
    if (!admin) {
      return { ok: false as const };
    }

    const email = normalizeEmail(String(admin.email));
    const now = Date.now();
    const echoOtp = process.env.AUTH_OTP_ECHO === "true";

    const { id, code } = await this.db.withTransaction(async (client) => {
      const [lockKey1, lockKey2] = advisoryLockKeys(`crm-otp:${email}`);
      await client.query(`SELECT pg_advisory_xact_lock($1, $2)`, [lockKey1, lockKey2]);

      const { rows: recentRows } = await client.query(
        `SELECT "createdAt" FROM "CrmAuthOtp"
         WHERE lower("email") = $1
         ORDER BY "createdAt" DESC
         LIMIT 1`,
        [email]
      );
      const lastAt = recentRows[0] ? new Date(String(recentRows[0].createdAt)).getTime() : 0;
      if (now - lastAt < OTP_COOLDOWN_MS) {
        throw new HttpException("Please wait before requesting another code", HttpStatus.TOO_MANY_REQUESTS);
      }

      const nextCode = this.generateCode();
      const otpId = `otp_${Date.now()}_${randomInt(0, 1_000_000)}`;
      const expiresAt = new Date(now + OTP_TTL_MS);

      await client.query(
        `UPDATE "CrmAuthOtp" SET "consumedAt" = CURRENT_TIMESTAMP
         WHERE lower("email") = $1 AND "consumedAt" IS NULL`,
        [email]
      );
      await client.query(
        `INSERT INTO "CrmAuthOtp" ("id", "email", "adminId", "codeHash", "expiresAt")
         VALUES ($1, $2, $3, $4, $5)`,
        [otpId, email, String(admin.id), hashPassword(nextCode), expiresAt.toISOString()]
      );

      return { id: otpId, code: nextCode };
    });

    try {
      await this.mail.sendLoginCode(email, code);
    } catch {
      await this.db.execute(`UPDATE "CrmAuthOtp" SET "consumedAt" = CURRENT_TIMESTAMP WHERE "id" = $1`, [id]);
      throw new HttpException("Could not send login code email", HttpStatus.SERVICE_UNAVAILABLE);
    }

    await this.audit.log({
      actorAdminId: String(admin.id),
      actorEmail: email,
      actorName: fullName(String(admin.firstName ?? ""), String(admin.lastName ?? "")) || String(admin.displayName),
      action: "auth.otp_requested",
      target: email,
      ok: true,
    });

    return echoOtp ? ({ ok: true as const, email, debugCode: code } as const) : ({ ok: true as const, email } as const);
  }

  async verifyOtp(emailInput: string, codeInput: string) {
    const email = normalizeEmail(emailInput);
    const code = codeInput.trim();
    if (!isValidEmail(email) || !/^\d{6}$/.test(code)) {
      return { ok: false as const };
    }

    return this.db.withTransaction(async (client) => {
      const { rows } = await client.query(
        `SELECT "id", "adminId", "codeHash", "expiresAt", "attempts", "consumedAt"
         FROM "CrmAuthOtp"
         WHERE lower("email") = $1 AND "consumedAt" IS NULL
         ORDER BY "createdAt" DESC
         LIMIT 1
         FOR UPDATE`,
        [email]
      );
      const otp = rows[0];
      if (!otp) {
        await this.audit.log({
          actorEmail: email,
          action: "auth.otp_failed",
          target: email,
          ok: false,
        });
        return { ok: false as const };
      }

      const attempts = Number(otp.attempts ?? 0);
      if (attempts >= OTP_MAX_ATTEMPTS) {
        await client.query(`UPDATE "CrmAuthOtp" SET "consumedAt" = CURRENT_TIMESTAMP WHERE "id" = $1`, [
          String(otp.id),
        ]);
        return { ok: false as const };
      }

      const expired = new Date(String(otp.expiresAt)).getTime() < Date.now();
      const valid = !expired && verifyPassword(code, String(otp.codeHash));

      if (!valid) {
        await client.query(
          `UPDATE "CrmAuthOtp"
           SET "attempts" = "attempts" + 1,
               "consumedAt" = CASE WHEN "attempts" + 1 >= $2 THEN CURRENT_TIMESTAMP ELSE "consumedAt" END
           WHERE "id" = $1`,
          [String(otp.id), OTP_MAX_ATTEMPTS]
        );
        await this.audit.log({
          actorEmail: email,
          action: "auth.otp_failed",
          target: email,
          ok: false,
        });
        return { ok: false as const };
      }

      const adminId = String(otp.adminId ?? "");
      const { rows: adminRows } = await client.query(
        `SELECT "id", "login", "email", "firstName", "lastName", "displayName"
         FROM "CrmAdmin"
         WHERE "id" = $1
         LIMIT 1`,
        [adminId]
      );
      const admin = adminRows[0];
      if (!admin || normalizeEmail(String(admin.email)) !== email) {
        return { ok: false as const };
      }

      await client.query(`UPDATE "CrmAuthOtp" SET "consumedAt" = CURRENT_TIMESTAMP WHERE "id" = $1`, [
        String(otp.id),
      ]);

      const actorName =
        fullName(String(admin.firstName ?? ""), String(admin.lastName ?? "")) ||
        String(admin.displayName ?? "");
      const token = await this.issueToken(admin);

      await this.audit.log({
        actorAdminId: String(admin.id),
        actorEmail: String(admin.email),
        actorName,
        action: "auth.otp_login",
        target: actorName,
        ok: true,
      });

      return { ok: true as const, token };
    });
  }
}
