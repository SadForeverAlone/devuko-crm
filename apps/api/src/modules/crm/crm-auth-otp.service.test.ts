import { HttpException, HttpStatus } from "@nestjs/common";
import { beforeEach, describe, expect, it, vi } from "vitest";
import type { PoolClient } from "pg";
import type { DatabaseService } from "../database/database.service";
import type { DatabaseSchemaService } from "../database/database-schema.service";
import type { CrmSessionService } from "./crm-session.service";
import { CrmAuthOtpService } from "./crm-auth-otp.service";
import { hashPassword } from "./password-hash";
import type { CrmAdminService } from "./crm-admin.service";
import type { MailService } from "./mail.service";
import type { PlatformAuditService } from "./platform-audit.service";

type MockClient = {
  query: ReturnType<typeof vi.fn>;
};

function createOtpService() {
  const mockClient: MockClient = {
    query: vi.fn(),
  };

  const db = {
    withTransaction: vi.fn(async <T>(fn: (client: PoolClient) => Promise<T>) =>
      fn(mockClient as unknown as PoolClient)
    ),
    execute: vi.fn().mockResolvedValue(undefined),
    query: vi.fn(),
  } satisfies Partial<DatabaseService>;

  const schema = { ensureSchema: vi.fn().mockResolvedValue(undefined) } satisfies Partial<DatabaseSchemaService>;
  const sessions = { issueForAdmin: vi.fn().mockResolvedValue("jwt-token") } satisfies Partial<CrmSessionService>;
  const mail = { sendLoginCode: vi.fn().mockResolvedValue(undefined) } satisfies Partial<MailService>;
  const audit = { log: vi.fn().mockResolvedValue(undefined) } satisfies Partial<PlatformAuditService>;
  const admins = {
    verifyCredentials: vi.fn(),
  } satisfies Partial<CrmAdminService>;

  const service = new CrmAuthOtpService(
    db as DatabaseService,
    schema as DatabaseSchemaService,
    sessions as CrmSessionService,
    mail as MailService,
    audit as PlatformAuditService,
    admins as CrmAdminService
  );

  return { service, db, mockClient, mail, admins, audit, sessions };
}

const adminRow = {
  id: "admin_1",
  login: "admin",
  email: "admin@devuko.ru",
  firstName: "Platform",
  lastName: "Admin",
  displayName: "Platform Admin",
};

describe("CrmAuthOtpService.requestOtp", () => {
  beforeEach(() => {
    vi.useRealTimers();
  });

  it("returns ok:false when credentials are invalid", async () => {
    const { service, admins, db, mail } = createOtpService();
    admins.verifyCredentials!.mockResolvedValue(null);

    const result = await service.requestOtp("admin", "wrong");

    expect(result).toEqual({ ok: false });
    expect(db.withTransaction).not.toHaveBeenCalled();
    expect(mail.sendLoginCode).not.toHaveBeenCalled();
  });

  it("throws 429 when cooldown has not elapsed", async () => {
    const { service, admins, mockClient } = createOtpService();
    admins.verifyCredentials!.mockResolvedValue(adminRow);
    mockClient.query
      .mockResolvedValueOnce({ rows: [] }) // advisory lock
      .mockResolvedValueOnce({
        rows: [{ createdAt: new Date().toISOString() }],
      });

    await expect(service.requestOtp("admin", "secret")).rejects.toMatchObject({
      status: HttpStatus.TOO_MANY_REQUESTS,
    });
  });

  it("creates OTP and sends mail on success", async () => {
    const { service, admins, mockClient, mail, audit } = createOtpService();
    admins.verifyCredentials!.mockResolvedValue(adminRow);
    mockClient.query
      .mockResolvedValueOnce({ rows: [] }) // advisory lock
      .mockResolvedValueOnce({ rows: [] }) // recent otp
      .mockResolvedValueOnce({ rows: [] }) // consume
      .mockResolvedValueOnce({ rows: [] }); // insert

    const result = await service.requestOtp("admin", "secret");

    expect(result).toEqual({ ok: true, email: "admin@devuko.ru" });
    expect(mail.sendLoginCode).toHaveBeenCalledWith("admin@devuko.ru", expect.stringMatching(/^\d{6}$/));
    expect(audit.log).toHaveBeenCalledWith(
      expect.objectContaining({ action: "auth.otp_requested", ok: true })
    );
  });

  it("returns debugCode when AUTH_OTP_ECHO is enabled", async () => {
    vi.stubEnv("AUTH_OTP_ECHO", "true");
    const { service, admins, mockClient } = createOtpService();
    admins.verifyCredentials!.mockResolvedValue(adminRow);
    mockClient.query
      .mockResolvedValueOnce({ rows: [] })
      .mockResolvedValueOnce({ rows: [] })
      .mockResolvedValueOnce({ rows: [] })
      .mockResolvedValueOnce({ rows: [] });

    const result = await service.requestOtp("admin", "secret");

    expect(result.ok).toBe(true);
    expect("debugCode" in result && result.debugCode).toMatch(/^\d{6}$/);
    vi.unstubAllEnvs();
  });

  it("consumes OTP row when mail delivery fails", async () => {
    const { service, admins, mockClient, mail, db } = createOtpService();
    admins.verifyCredentials!.mockResolvedValue(adminRow);
    mockClient.query
      .mockResolvedValueOnce({ rows: [] }) // advisory lock
      .mockResolvedValueOnce({ rows: [] })
      .mockResolvedValueOnce({ rows: [] })
      .mockResolvedValueOnce({ rows: [] });
    mail.sendLoginCode!.mockRejectedValue(new Error("smtp down"));

    await expect(service.requestOtp("admin", "secret")).rejects.toBeInstanceOf(HttpException);
    expect(db.execute).toHaveBeenCalledWith(
      expect.stringContaining(`UPDATE "CrmAuthOtp"`),
      expect.arrayContaining([expect.stringMatching(/^otp_/)]),
    );
  });
});

describe("CrmAuthOtpService.verifyOtp", () => {
  it("rejects invalid email or code shape", async () => {
    const { service, db } = createOtpService();

    await expect(service.verifyOtp("not-an-email", "123456")).resolves.toEqual({ ok: false });
    await expect(service.verifyOtp("admin@devuko.ru", "abc")).resolves.toEqual({ ok: false });
    expect(db.withTransaction).not.toHaveBeenCalled();
  });

  it("returns token when code matches unconsumed OTP", async () => {
    const { service, mockClient, sessions, audit } = createOtpService();
    const code = "123456";
    mockClient.query
      .mockResolvedValueOnce({
        rows: [
          {
            id: "otp_1",
            adminId: adminRow.id,
            codeHash: hashPassword(code),
            expiresAt: new Date(Date.now() + 60_000).toISOString(),
            attempts: 0,
            consumedAt: null,
          },
        ],
      })
      .mockResolvedValueOnce({ rows: [adminRow] })
      .mockResolvedValueOnce({ rows: [] });

    const result = await service.verifyOtp("admin@devuko.ru", code);

    expect(result).toEqual({ ok: true, token: "jwt-token" });
    expect(sessions.issueForAdmin).toHaveBeenCalled();
    expect(audit.log).toHaveBeenCalledWith(
      expect.objectContaining({ action: "auth.otp_login", ok: true })
    );
  });

  it("returns ok:false when OTP row is missing", async () => {
    const { service, mockClient, audit } = createOtpService();
    mockClient.query.mockResolvedValueOnce({ rows: [] });

    await expect(service.verifyOtp("admin@devuko.ru", "123456")).resolves.toEqual({ ok: false });
    expect(audit.log).toHaveBeenCalledWith(
      expect.objectContaining({ action: "auth.otp_failed", ok: false })
    );
  });
});
