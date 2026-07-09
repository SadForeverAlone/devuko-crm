import { apiFetch } from "@/shared/api/http";

const CRM_TOKEN_KEY = "spx-crm-token";
const CRM_WORKSPACE_KEY = "spx-crm-workspace-id";

export const PLATFORM_WORKSPACE_ID = "platform";

export function getStoredCrmWorkspaceId() {
  try {
    return localStorage.getItem(CRM_WORKSPACE_KEY)?.trim() ?? PLATFORM_WORKSPACE_ID;
  } catch {
    return PLATFORM_WORKSPACE_ID;
  }
}

export function setStoredCrmWorkspaceId(workspaceId: string) {
  try {
    localStorage.setItem(CRM_WORKSPACE_KEY, workspaceId.trim());
  } catch {
    /* ignore */
  }
}

export type CrmWorkspace = {
  id: string;
  slug: string;
  label: string;
  kind: "platform" | "site";
  siteId: string | null;
  siteDomain: string | null;
  createdAt: string;
};

export type CrmSite = {
  id: string;
  domain: string;
  slug: string;
  repo: string | null;
  status: string;
  prodPath: string | null;
  apiPort: number | null;
  webPort: number | null;
  extraDomains: string[];
  devConfig: Record<string, unknown> | null;
  provisionLog: Array<{ step: string; ok: boolean; message: string; at: string }>;
  workspaceId: string;
  createdAt: string;
  updatedAt: string;
};

export function getStoredCrmToken() {
  try {
    return localStorage.getItem(CRM_TOKEN_KEY)?.trim() ?? "";
  } catch {
    return "";
  }
}

export function setStoredCrmToken(token: string) {
  try {
    localStorage.setItem(CRM_TOKEN_KEY, token.trim());
  } catch {
    /* ignore */
  }
}

export function clearStoredCrmToken() {
  try {
    localStorage.removeItem(CRM_TOKEN_KEY);
    if (localStorage.getItem(CRM_TOKEN_KEY) !== null) {
      localStorage.setItem(CRM_TOKEN_KEY, "");
      localStorage.removeItem(CRM_TOKEN_KEY);
    }
  } catch {
    /* ignore */
  }
}

async function crmFetch<T>(path: string, init?: RequestInit, workspaceId?: string) {
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

export type CrmOverview = {
  serverDateTime: string;
  serverTimeZone: string;
  lastAuditActivityAt: string | null;
  counters: {
    usersCount: number;
    promisesCount: number;
    activePromisesCount: number;
    proofsCount: number;
  };
  recentLogs: Array<{
    id: string;
    actorUserId: string | null;
    action: string;
    method: string | null;
    path: string | null;
    statusCode: number | null;
    entityType: string | null;
    entityId: string | null;
    createdAt: string;
  }>;
  logCategories: Array<{ action: string; count: number }>;
  contacts: Array<{ id: string; name: string; email: string; message: string; status: string; createdAt: string }>;
  settings: Array<{ key: string; value: string; updatedAt: string }>;
};

export async function getCrmOverview(input?: {
  limit?: number;
  offset?: number;
  action?: string;
  dateFrom?: string;
  dateTo?: string;
  contactSearch?: string;
}) {
  const params = new URLSearchParams();
  params.set("limit", String(input?.limit ?? 100));
  if (input?.offset) params.set("offset", String(input.offset));
  if (input?.action) params.set("action", input.action);
  if (input?.dateFrom) params.set("dateFrom", input.dateFrom);
  if (input?.dateTo) params.set("dateTo", input.dateTo);
  if (input?.contactSearch) params.set("contactSearch", input.contactSearch);
  params.set("workspaceId", getStoredCrmWorkspaceId());
  return crmFetch<CrmOverview>(`/admin/crm/overview?${params.toString()}`);
}

export async function getCrmUsers(input?: {
  limit?: number;
  offset?: number;
  search?: string;
  orderBy?: "createdAt" | "email" | "displayName" | "login";
  orderDir?: "asc" | "desc";
}) {
  const params = new URLSearchParams();
  params.set("limit", String(input?.limit ?? 200));
  if (input?.offset) params.set("offset", String(input.offset));
  if (input?.search) params.set("search", input.search);
  if (input?.orderBy) params.set("orderBy", input.orderBy);
  if (input?.orderDir) params.set("orderDir", input.orderDir);
  return crmFetch<
    Array<{
      id: string;
      login: string | null;
      email: string;
      displayName: string;
      avatarUrl: string | null;
      permissions: number;
      adminNote?: string | null;
      country?: string | null;
      createdAt: string;
    }>
  >(
    `/admin/crm/users?${params.toString()}`
  );
}

export async function updateCrmUser(
  userId: string,
  input: {
    login?: string | null;
    email?: string;
    displayName?: string;
    avatarUrl?: string | null;
    permissions?: number;
    adminNote?: string | null;
    country?: string | null;
    password?: string;
  }
) {
  return crmFetch<{ ok: true }>(`/admin/crm/users/${userId}`, {
    method: "PATCH",
    body: JSON.stringify(input),
  });
}

export async function createCrmUser(input: {
  login: string;
  email: string;
  password: string;
  displayName: string;
  permissions?: number;
  adminNote?: string | null;
  country?: string | null;
  avatarUrl?: string | null;
}) {
  return crmFetch<{ ok: true; user: { id: string | null; login: string; email: string; displayName: string } }>(
    "/admin/crm/users",
    {
      method: "POST",
      body: JSON.stringify(input),
    }
  );
}

export async function updateCrmSettings(
  items: Array<{ key: string; value: string }>,
  workspaceId?: string
) {
  const ws = workspaceId ?? getStoredCrmWorkspaceId();
  return crmFetch<{ ok: true }>(
    `/admin/crm/settings?workspaceId=${encodeURIComponent(ws)}`,
    {
      method: "PATCH",
      body: JSON.stringify({ items, workspaceId: ws }),
    },
    ws
  );
}

export async function getCrmContacts(input?: { limit?: number; offset?: number; search?: string; dateFrom?: string; dateTo?: string }) {
  const params = new URLSearchParams();
  params.set("limit", String(input?.limit ?? 200));
  if (input?.offset) params.set("offset", String(input.offset));
  if (input?.search) params.set("search", input.search);
  if (input?.dateFrom) params.set("dateFrom", input.dateFrom);
  if (input?.dateTo) params.set("dateTo", input.dateTo);
  return crmFetch<Array<{ id: string; name: string; email: string; message: string; status: string; createdAt: string }>>(
    `/admin/crm/contacts?${params.toString()}`
  );
}

export async function getCrmPromises(input?: { limit?: number; offset?: number }) {
  const params = new URLSearchParams();
  params.set("limit", String(input?.limit ?? 100));
  if (input?.offset) params.set("offset", String(input.offset));
  return crmFetch<
    Array<{
      id: string;
      userId: string;
      title: string;
      description: string;
      pledgeAmount: number;
      deadlineAt: string;
      status: string;
      category: string;
      createdAt: string;
      updatedAt: string;
      proofCount: number;
      user: { id: string; email: string; displayName: string };
    }>
  >(`/admin/crm/promises?${params.toString()}`);
}

export async function getCrmPages(input?: { limit?: number; offset?: number }) {
  const params = new URLSearchParams();
  params.set("limit", String(input?.limit ?? 100));
  if (input?.offset) params.set("offset", String(input.offset));
  return crmFetch<
    Array<{
      id: string;
      page: string;
      views: number;
      uniqueUsers: number;
      conversion: string;
    }>
  >(`/admin/crm/pages?${params.toString()}`);
}

export async function getCrmReports(input?: { limit?: number; offset?: number }) {
  const params = new URLSearchParams();
  params.set("limit", String(input?.limit ?? 100));
  if (input?.offset) params.set("offset", String(input.offset));
  return crmFetch<
    Array<{
      id: string;
      title: string;
      severity: "Low" | "Medium" | "High";
      channel: string;
      createdAt: string;
      status: string;
      description: string;
    }>
  >(`/admin/crm/reports?${params.toString()}`);
}

export async function loginCrm(login: string, password: string) {
  return apiFetch<{ ok: boolean; token?: string }>("/crm-auth/login", {
    method: "POST",
    body: JSON.stringify({ login, password }),
  });
}

export async function getCrmWorkspaces() {
  return crmFetch<CrmWorkspace[]>("/admin/crm/workspaces");
}

export async function getCrmSites() {
  return crmFetch<CrmSite[]>("/admin/crm/sites");
}

export async function createCrmSite(input: {
  domain: string;
  repo?: string;
  apiPort?: number;
  webPort?: number;
  extraDomains?: string[];
  provision?: boolean;
}) {
  return crmFetch<CrmSite>("/admin/crm/sites", {
    method: "POST",
    body: JSON.stringify(input),
  });
}

export async function updateCrmSite(
  siteId: string,
  input: { repo?: string; apiPort?: number; webPort?: number; extraDomains?: string[] }
) {
  return crmFetch<CrmSite>(`/admin/crm/sites/${siteId}`, {
    method: "PATCH",
    body: JSON.stringify(input),
  });
}

export async function provisionCrmSite(siteId: string) {
  return crmFetch<CrmSite>(`/admin/crm/sites/${siteId}/provision`, {
    method: "POST",
    body: JSON.stringify({}),
  });
}
