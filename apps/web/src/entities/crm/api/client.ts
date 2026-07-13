import { apiFetch } from "@/shared/api/http";
import { getStoredCrmToken, getStoredCrmWorkspaceId } from "./storage";

export async function crmFetch<T>(path: string, init?: RequestInit, workspaceId?: string) {
  const headers = new Headers(init?.headers);
  const token = getStoredCrmToken();
  if (token) {
    headers.set("Authorization", `Bearer ${token}`);
  }
  const ws = workspaceId ?? getStoredCrmWorkspaceId();
  if (ws) {
    headers.set("X-Crm-Workspace-Id", ws);
  }
  return apiFetch<T>(path, { ...init, headers });
}
