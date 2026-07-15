import { apiFetch } from "@/shared/api/http";
import { crmFetch } from "./client";
import type { CrmSession } from "./types";

const authFetchInit: RequestInit = { credentials: "include" };

export async function loginCrm(login: string, password: string) {
  return apiFetch<{ ok: boolean; token?: string }>("/crm-auth/login", {
    ...authFetchInit,
    method: "POST",
    body: JSON.stringify({ login, password }),
  });
}

export async function requestCrmOtp(login: string, password: string) {
  return apiFetch<{ ok: boolean; email?: string }>("/crm-auth/otp/request", {
    ...authFetchInit,
    method: "POST",
    body: JSON.stringify({ login, password }),
  });
}

export async function verifyCrmOtp(email: string, code: string) {
  return apiFetch<{ ok: boolean; token?: string }>("/crm-auth/otp/verify", {
    ...authFetchInit,
    method: "POST",
    body: JSON.stringify({ email, code }),
  });
}

export async function logoutCrm() {
  return apiFetch<{ ok: boolean }>("/crm-auth/logout", {
    ...authFetchInit,
    method: "POST",
  });
}

export async function getCrmSession() {
  return crmFetch<CrmSession>("/admin/crm/session");
}

export function getCrmSessionFromToken() {
  return null;
}
