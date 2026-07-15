import { randomBytes } from "node:crypto";
import type { CookieSerializeOptions } from "@fastify/cookie";
import { resolveJwtExpiresIn } from "./jwt-expires.util";

export const CRM_CSRF_COOKIE = "devuko_crm_csrf";
export const CRM_CSRF_HEADER = "x-csrf-token";

export function createCsrfToken(): string {
  return randomBytes(32).toString("hex");
}

export function csrfCookieOptions(): CookieSerializeOptions {
  return {
    httpOnly: false,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: resolveJwtExpiresIn(),
  };
}

export function csrfCookieClearOptions(): CookieSerializeOptions {
  return {
    httpOnly: false,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
  };
}
