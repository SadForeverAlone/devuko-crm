import { expect, test } from "@playwright/test";

const apiBase = process.env.PLAYWRIGHT_API_URL || "http://127.0.0.1:8095";
const login = process.env.PLAYWRIGHT_CRM_LOGIN?.trim();
const password = process.env.PLAYWRIGHT_CRM_PASSWORD?.trim();
const otpEcho = process.env.PLAYWRIGHT_OTP_ECHO === "true";

function parseSetCookie(headers: string[]): Record<string, string> {
  const cookies: Record<string, string> = {};
  for (const header of headers) {
    const part = header.split(";")[0]?.trim();
    if (!part) continue;
    const eq = part.indexOf("=");
    if (eq <= 0) continue;
    cookies[part.slice(0, eq)] = part.slice(eq + 1);
  }
  return cookies;
}

test.describe("CRM auth flow", () => {
  test.skip(!login || !password || !otpEcho, "Set PLAYWRIGHT_CRM_LOGIN, PLAYWRIGHT_CRM_PASSWORD, PLAYWRIGHT_OTP_ECHO=true and AUTH_OTP_ECHO=true on API");

  test("OTP login, session access, logout revokes session", async ({ request }) => {
    const requestRes = await request.post(`${apiBase}/crm-auth/otp/request`, {
      data: { login, password },
    });
    expect(requestRes.ok()).toBeTruthy();
    const requestBody = (await requestRes.json()) as {
      ok?: boolean;
      email?: string;
      debugCode?: string;
    };
    expect(requestBody.ok).toBe(true);
    expect(requestBody.email).toBeTruthy();
    expect(requestBody.debugCode).toMatch(/^\d{6}$/);

    const verifyRes = await request.post(`${apiBase}/crm-auth/otp/verify`, {
      data: { email: requestBody.email, code: requestBody.debugCode },
    });
    expect(verifyRes.ok()).toBeTruthy();
    const verifyBody = (await verifyRes.json()) as { ok?: boolean };
    expect(verifyBody.ok).toBe(true);

    const setCookies = verifyRes.headersArray().filter((h) => h.name.toLowerCase() === "set-cookie");
    const cookieMap = parseSetCookie(setCookies.map((h) => h.value));
    expect(cookieMap.devuko_crm_session).toBeTruthy();
    expect(cookieMap.devuko_crm_csrf).toBeTruthy();

    const cookieHeader = Object.entries(cookieMap)
      .map(([name, value]) => `${name}=${value}`)
      .join("; ");

    const sessionRes = await request.get(`${apiBase}/admin/crm/session`, {
      headers: { cookie: cookieHeader },
    });
    expect(sessionRes.ok()).toBeTruthy();
    const sessionBody = (await sessionRes.json()) as { email?: string };
    expect(sessionBody.email).toBeTruthy();

    const logoutRes = await request.post(`${apiBase}/crm-auth/logout`, {
      headers: {
        cookie: cookieHeader,
        "x-csrf-token": cookieMap.devuko_crm_csrf,
      },
    });
    expect(logoutRes.ok()).toBeTruthy();

    const afterLogout = await request.get(`${apiBase}/admin/crm/session`, {
      headers: { cookie: cookieHeader },
    });
    expect(afterLogout.status()).toBe(401);
  });
});
