import { crmFetch, crmQuery } from "./client";
import { getStoredCrmWorkspaceId } from "./storage";
import type { CrmOverview } from "./types";

export async function getCrmOverview(input?: {
  limit?: number;
  offset?: number;
  action?: string;
  dateFrom?: string;
  dateTo?: string;
  contactSearch?: string;
}) {
  const query = crmQuery({
    limit: input?.limit ?? 100,
    offset: input?.offset,
    action: input?.action,
    dateFrom: input?.dateFrom,
    dateTo: input?.dateTo,
    contactSearch: input?.contactSearch,
    workspaceId: getStoredCrmWorkspaceId(),
  });
  return crmFetch<CrmOverview>(`/admin/crm/overview?${query}`);
}

export async function getCrmUsers(input?: {
  limit?: number;
  offset?: number;
  search?: string;
  orderBy?: "createdAt" | "email" | "displayName" | "login";
  orderDir?: "asc" | "desc";
}) {
  const query = crmQuery({ limit: input?.limit ?? 200, ...input });
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
  >(`/admin/crm/users?${query}`);
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

export async function getCrmContacts(input?: {
  limit?: number;
  offset?: number;
  search?: string;
  dateFrom?: string;
  dateTo?: string;
}) {
  const query = crmQuery({ limit: input?.limit ?? 200, ...input });
  return crmFetch<Array<{ id: string; name: string; email: string; message: string; status: string; createdAt: string }>>(
    `/admin/crm/contacts?${query}`
  );
}

export async function getCrmPromises(input?: { limit?: number; offset?: number }) {
  const query = crmQuery({ limit: input?.limit ?? 100, ...input });
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
  >(`/admin/crm/promises?${query}`);
}

export async function getCrmPages(input?: { limit?: number; offset?: number }) {
  const query = crmQuery({ limit: input?.limit ?? 100, ...input });
  return crmFetch<
    Array<{
      id: string;
      page: string;
      views: number;
      uniqueUsers: number;
      conversion: string;
    }>
  >(`/admin/crm/pages?${query}`);
}

export async function getCrmReports(input?: { limit?: number; offset?: number }) {
  const query = crmQuery({ limit: input?.limit ?? 100, ...input });
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
  >(`/admin/crm/reports?${query}`);
}
