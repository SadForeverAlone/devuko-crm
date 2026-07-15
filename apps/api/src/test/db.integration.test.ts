import { afterAll, beforeAll, beforeEach, describe, expect, it } from "vitest";
import type { NestFastifyApplication } from "@nestjs/platform-fastify";
import { CRM_AUTH_COOKIE } from "../common/auth-cookie.util";
import { CRM_CSRF_COOKIE, CRM_CSRF_HEADER } from "../common/csrf-cookie.util";
import { DatabaseService } from "../modules/database/database.service";
import {
  createDbIntegrationApp,
  isDbIntegrationEnabled,
  parseSetCookie,
} from "./create-db-app";

const describeDb = isDbIntegrationEnabled() ? describe : describe.skip;

async function loginViaOtp(
  app: NestFastifyApplication,
  login: string,
  password: string
) {
  const requestRes = await app.inject({
    method: "POST",
    url: "/crm-auth/otp/request",
    payload: { login, password },
  });
  expect(requestRes.statusCode).toBe(201);
  const requestBody = requestRes.json() as {
    ok?: boolean;
    email?: string;
    debugCode?: string;
  };
  expect(requestBody.ok).toBe(true);
  expect(requestBody.email).toBeTruthy();
  expect(requestBody.debugCode).toMatch(/^\d{6}$/);

  const verifyRes = await app.inject({
    method: "POST",
    url: "/crm-auth/otp/verify",
    payload: { email: requestBody.email, code: requestBody.debugCode },
  });
  expect(verifyRes.statusCode).toBe(201);
  expect(verifyRes.json()).toMatchObject({ ok: true });

  const setCookies = verifyRes.headers["set-cookie"];
  const cookieHeaders = Array.isArray(setCookies) ? setCookies : setCookies ? [setCookies] : [];
  const cookieMap = parseSetCookie(cookieHeaders);
  expect(cookieMap[CRM_AUTH_COOKIE]).toBeTruthy();
  expect(cookieMap[CRM_CSRF_COOKIE]).toBeTruthy();

  const cookieHeader = Object.entries(cookieMap)
    .map(([name, value]) => `${name}=${value}`)
    .join("; ");

  return { cookieMap, cookieHeader };
}

describeDb("API DB integration", () => {
  let app: NestFastifyApplication;
  const login = process.env.CRM_ADMIN_EMAIL?.trim() || "ci-admin@devuko.test";
  const password = process.env.CRM_ADMIN_PASSWORD?.trim() || "CiAdminPassw0rd!";

  beforeAll(async () => {
    app = await createDbIntegrationApp();
  }, 60_000);

  beforeEach(async () => {
    const db = app.get(DatabaseService);
    await db.execute(`
      CREATE TABLE IF NOT EXISTS "CrmRateLimit" (
        "key" TEXT PRIMARY KEY,
        "hits" INTEGER NOT NULL DEFAULT 0,
        "expiresAt" BIGINT NOT NULL,
        "isBlocked" BOOLEAN NOT NULL DEFAULT FALSE,
        "blockExpiresAt" BIGINT NOT NULL DEFAULT 0
      )
    `);
    await db.execute(`TRUNCATE TABLE "CrmRateLimit"`);
    await db.execute(`DELETE FROM "CrmAuthOtp" WHERE lower("email") = lower($1)`, [login]);
  });

  afterAll(async () => {
    await app?.close();
  });

  it("GET /health reports database up", async () => {
    const res = await app.inject({ method: "GET", url: "/health" });
    expect(res.statusCode).toBe(200);
    expect(res.json()).toEqual({ ok: true, db: "up" });
  });

  it("OTP login, CSRF on admin routes, logout revokes session", async () => {
    const { cookieMap, cookieHeader } = await loginViaOtp(app, login, password);

    const sessionRes = await app.inject({
      method: "GET",
      url: "/admin/crm/session",
      headers: { cookie: cookieHeader },
    });
    expect(sessionRes.statusCode).toBe(200);
    expect(sessionRes.json()).toMatchObject({ email: expect.any(String) });

    const blocked = await app.inject({
      method: "POST",
      url: "/admin/crm/admins",
      headers: { cookie: cookieHeader },
      payload: {
        login: "csrfprobe",
        email: "csrf-probe@devuko.test",
        password: "ProbePassw0rd!",
        firstName: "Csrf",
        lastName: "Probe",
      },
    });
    expect(blocked.statusCode).toBe(403);

    const allowed = await app.inject({
      method: "POST",
      url: "/admin/crm/admins",
      headers: {
        cookie: cookieHeader,
        [CRM_CSRF_HEADER]: cookieMap[CRM_CSRF_COOKIE],
      },
      payload: {
        login: "csrfprobe",
        email: "csrf-probe@devuko.test",
        password: "ProbePassw0rd!",
        firstName: "Csrf",
        lastName: "Probe",
      },
    });
    expect([201, 409, 400]).toContain(allowed.statusCode);

    const logoutRes = await app.inject({
      method: "POST",
      url: "/crm-auth/logout",
      headers: {
        cookie: cookieHeader,
        [CRM_CSRF_HEADER]: cookieMap[CRM_CSRF_COOKIE],
      },
    });
    expect(logoutRes.statusCode).toBe(201);

    const afterLogout = await app.inject({
      method: "GET",
      url: "/admin/crm/session",
      headers: { cookie: cookieHeader },
    });
    expect(afterLogout.statusCode).toBe(401);
  });
});
