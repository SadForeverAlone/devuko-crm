import { apiFetch } from "@/shared/api/http";
import { getStoredCrmWorkspaceId } from "./storage";

export function crmQuery(params: Record<string, string | number | undefined | null>) {
  const qs = new URLSearchParams();
  for (const [key, value] of Object.entries(params)) {
    if (value !== undefined && value !== null && value !== "") {
      qs.set(key, String(value));
    }
  }
  return qs.toString();
}

export async function crmFetch<T>(path: string, init?: RequestInit, workspaceId?: string) {
  const headers = new Headers(init?.headers);
  const ws = workspaceId ?? getStoredCrmWorkspaceId();
  if (ws) {
    headers.set("X-Crm-Workspace-Id", ws);
  }
  return apiFetch<T>(path, { credentials: "include", ...init, headers });
}
