import { afterEach, describe, expect, it } from "vitest";
import type { NestFastifyApplication } from "@nestjs/platform-fastify";
import { CRM_AUTH_COOKIE } from "../common/auth-cookie.util";
import { CRM_CSRF_COOKIE, CRM_CSRF_HEADER } from "../common/csrf-cookie.util";
import { createIntegrationTestApp } from "./create-test-app";

describe("HTTP integration (CSRF guard chain)", () => {
  let app: NestFastifyApplication | undefined;

  afterEach(async () => {
    await app?.close();
    app = undefined;
  });

  it("POST without session cookie skips CSRF enforcement", async () => {
    app = await createIntegrationTestApp();
    const res = await app.inject({ method: "POST", url: "/integration-probe" });
    expect(res.statusCode).toBe(201);
    expect(res.json()).toEqual({ ok: true });
  });

  it("POST with session cookie requires matching CSRF token", async () => {
    app = await createIntegrationTestApp();
    const blocked = await app.inject({
      method: "POST",
      url: "/integration-probe",
      cookies: { [CRM_AUTH_COOKIE]: "session-jwt" },
    });
    expect(blocked.statusCode).toBe(403);
    expect(blocked.json()).toMatchObject({ message: "Invalid CSRF token" });

    const allowed = await app.inject({
      method: "POST",
      url: "/integration-probe",
      cookies: {
        [CRM_AUTH_COOKIE]: "session-jwt",
        [CRM_CSRF_COOKIE]: "csrf-token",
      },
      headers: { [CRM_CSRF_HEADER]: "csrf-token" },
    });
    expect(allowed.statusCode).toBe(201);
    expect(allowed.json()).toEqual({ ok: true });
  });

  it("POST with session cookie + Bearer still requires matching CSRF (no Bearer bypass)", async () => {
    app = await createIntegrationTestApp();
    const blocked = await app.inject({
      method: "POST",
      url: "/integration-probe",
      cookies: { [CRM_AUTH_COOKIE]: "session-jwt" },
      headers: { authorization: "Bearer legacy-token" },
    });
    expect(blocked.statusCode).toBe(403);
    expect(blocked.json()).toMatchObject({ message: "Invalid CSRF token" });

    const allowed = await app.inject({
      method: "POST",
      url: "/integration-probe",
      cookies: {
        [CRM_AUTH_COOKIE]: "session-jwt",
        [CRM_CSRF_COOKIE]: "csrf-token",
      },
      headers: {
        authorization: "Bearer legacy-token",
        [CRM_CSRF_HEADER]: "csrf-token",
      },
    });
    expect(allowed.statusCode).toBe(201);
    expect(allowed.json()).toEqual({ ok: true });
  });
});
