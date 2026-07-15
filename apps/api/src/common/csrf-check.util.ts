import { CRM_CSRF_COOKIE, CRM_CSRF_HEADER } from "./csrf-cookie.util";
import { CRM_AUTH_COOKIE } from "./auth-cookie.util";

const SAFE_METHODS = new Set(["GET", "HEAD", "OPTIONS"]);

export type CsrfRequestSnapshot = {
  method?: string;
  cookies?: Record<string, string | undefined>;
  headers?: Record<string, string | string[] | undefined>;
};

function headerValue(raw: string | string[] | undefined): string | undefined {
  if (Array.isArray(raw)) {
    return raw[0]?.trim() || undefined;
  }
  return raw?.trim() || undefined;
}

export function isCsrfValid(snapshot: CsrfRequestSnapshot): boolean {
  const method = (snapshot.method ?? "GET").toUpperCase();
  if (SAFE_METHODS.has(method)) {
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
