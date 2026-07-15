import { getApiBaseUrl } from "../lib/env";

const CRM_CSRF_COOKIE = "devuko_crm_csrf";
const CRM_CSRF_HEADER = "x-csrf-token";
const MUTATING_METHODS = new Set(["POST", "PUT", "PATCH", "DELETE"]);

function readCsrfToken(): string {
  if (typeof document === "undefined") {
    return "";
  }
  const match = document.cookie.match(new RegExp(`(?:^|;\\s*)${CRM_CSRF_COOKIE}=([^;]+)`));
  return match ? decodeURIComponent(match[1]) : "";
}

export class ApiError extends Error {
  constructor(
    readonly status: number,
    message: string
  ) {
    super(message);
    this.name = "ApiError";
  }
}

export async function apiFetch<T>(path: string, init?: RequestInit): Promise<T> {
  const base = getApiBaseUrl();
  const url = `${base}${path.startsWith("/") ? path : `/${path}`}`;
  const headers = new Headers(init?.headers);
  if (init?.body && !headers.has("Content-Type")) {
    headers.set("Content-Type", "application/json");
  }
  const method = (init?.method ?? "GET").toUpperCase();
  // Attach CSRF when the cookie exists (set after OTP/login). Do not block
  // unauthenticated POSTs like /crm-auth/otp/* — the API only enforces CSRF
  // when the session cookie is present.
  if (MUTATING_METHODS.has(method) && !headers.has(CRM_CSRF_HEADER)) {
    const csrfToken = readCsrfToken();
    if (csrfToken) {
      headers.set(CRM_CSRF_HEADER, csrfToken);
    }
  }
  const res = await fetch(url, { credentials: "include", ...init, headers });
  if (!res.ok) {
    let message = res.statusText || "Request failed";
    try {
      const body = (await res.json()) as { message?: string | string[] };
      if (body.message) {
        message = Array.isArray(body.message) ? body.message.join(", ") : String(body.message);
      }
    } catch {
      /* ignore */
    }
    throw new ApiError(res.status, message);
  }
  if (res.status === 204) {
    return undefined as T;
  }
  const text = await res.text();
  if (!text) {
    return undefined as T;
  }
  return JSON.parse(text) as T;
}
