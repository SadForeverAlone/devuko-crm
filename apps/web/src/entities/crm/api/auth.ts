import { apiFetch } from "@/shared/api/http";
import { getStoredCrmToken } from "./storage";
import { crmFetch } from "./client";
import type { CrmSession } from "./types";

export async function loginCrm(login: string, password: string) {
  return apiFetch<{ ok: boolean; token?: string }>("/crm-auth/login", {
    method: "POST",
    body: JSON.stringify({ login, password }),
  });
}

export async function getCrmSession() {
  return crmFetch<CrmSession>("/admin/crm/session");
}

export function getCrmSessionFromToken() {
  const token = getStoredCrmToken();
  if (!token) {
    return null;
  }
  try {
    const payload = JSON.parse(atob(token.split(".")[1] ?? "")) as {
      sub?: string;
      email?: string;
    };
    if (!payload.sub) {
      return null;
    }
    return { id: String(payload.sub), email: String(payload.email ?? "") };
  } catch {
    return null;
  }
}
