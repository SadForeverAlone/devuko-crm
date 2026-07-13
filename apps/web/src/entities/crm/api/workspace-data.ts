import { crmFetch } from "./client";
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
  >(`/admin/crm/users?${params.toString()}`);
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
