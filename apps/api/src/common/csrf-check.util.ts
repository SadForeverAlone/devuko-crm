import { CRM_CSRF_COOKIE, CRM_CSRF_HEADER } from "./csrf-cookie.util";
import { CRM_AUTH_COOKIE } from "./auth-cookie.util";

const SAFE_METHODS = new Set(["GET", "HEAD", "OPTIONS"]);

export type CsrfRequestSnapshot = {
  method?: string;
  url?: string;
  cookies?: Record<string, string | undefined>;
  headers?: Record<string, string | string[] | undefined>;
};

function headerValue(raw: string | string[] | undefined): string | undefined {
  if (Array.isArray(raw)) {
    return raw[0]?.trim() || undefined;
  }
  return raw?.trim() || undefined;
}

function requestPath(url: string | undefined): string {
  if (!url) {
    return "";
  }
  const path = url.split("?")[0] ?? "";
  return path.startsWith("/") ? path : `/${path}`;
}

export function isCsrfValid(snapshot: CsrfRequestSnapshot): boolean {
  const method = (snapshot.method ?? "GET").toUpperCase();
  if (SAFE_METHODS.has(method)) {
    return true;
  }

  // Login / OTP / logout must work without a prior CSRF cookie (and with a
  // stale session) so users can sign in again after reload.
  const path = requestPath(snapshot.url);
  if (path === "/crm-auth" || path.startsWith("/crm-auth/")) {
    return true;
  }

  const sessionCookie = snapshot.cookies?.[CRM_AUTH_COOKIE];
  if (!sessionCookie?.trim()) {
    return true;
  }

  const csrfCookie = snapshot.cookies?.[CRM_CSRF_COOKIE]?.trim();
  const csrfHeader = headerValue(snapshot.headers?.[CRM_CSRF_HEADER]);
  return Boolean(csrfCookie && csrfHeader && csrfCookie === csrfHeader);
}
