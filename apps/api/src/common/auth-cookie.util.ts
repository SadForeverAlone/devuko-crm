import type { CookieSerializeOptions } from "@fastify/cookie";
import { resolveJwtExpiresIn } from "./jwt-expires.util";

export const CRM_AUTH_COOKIE = "devuko_crm_session";

export function authCookieOptions(): CookieSerializeOptions {
  const maxAge = resolveJwtExpiresIn();
  return {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge,
  };
}

export function authCookieClearOptions(): CookieSerializeOptions {
  return {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
  };
}
