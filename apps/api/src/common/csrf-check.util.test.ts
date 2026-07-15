import { describe, expect, it } from "vitest";
import { CRM_AUTH_COOKIE } from "./auth-cookie.util";
import { isCsrfValid } from "./csrf-check.util";
import { CRM_CSRF_COOKIE, CRM_CSRF_HEADER } from "./csrf-cookie.util";

describe("isCsrfValid", () => {
  it("allows safe methods without cookies", () => {
    expect(isCsrfValid({ method: "GET" })).toBe(true);
    expect(isCsrfValid({ method: "HEAD" })).toBe(true);
    expect(isCsrfValid({ method: "OPTIONS" })).toBe(true);
  });

  it("allows mutating requests without a session cookie", () => {
    expect(isCsrfValid({ method: "POST" })).toBe(true);
  });

  it("allows crm-auth routes even with a session cookie", () => {
    expect(
      isCsrfValid({
        method: "POST",
        url: "/crm-auth/otp/request",
        cookies: { [CRM_AUTH_COOKIE]: "session-token" },
      })
    ).toBe(true);
  });

  it("requires matching CSRF pair for cookie sessions", () => {
    expect(
      isCsrfValid({
        method: "POST",
        cookies: { [CRM_AUTH_COOKIE]: "session-token" },
        headers: {
          [CRM_CSRF_HEADER]: "abc",
        },
      })
    ).toBe(false);

    expect(
      isCsrfValid({
        method: "POST",
        cookies: {
          [CRM_AUTH_COOKIE]: "session-token",
          [CRM_CSRF_COOKIE]: "abc",
        },
        headers: {
          [CRM_CSRF_HEADER]: "abc",
        },
      })
    ).toBe(true);
  });

  it("does not bypass CSRF when Authorization Bearer is also sent", () => {
    expect(
      isCsrfValid({
        method: "POST",
        cookies: { [CRM_AUTH_COOKIE]: "session-token" },
        headers: {
          authorization: "Bearer legacy-token",
          [CRM_CSRF_HEADER]: "abc",
        },
      })
    ).toBe(false);
  });
});
