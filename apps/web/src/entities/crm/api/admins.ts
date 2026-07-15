import { crmFetch, crmQuery } from "./client";
import type { CrmAdmin } from "./types";

export async function getCrmAdmins(input?: {
  limit?: number;
  offset?: number;
  search?: string;
  orderBy?: "createdAt" | "email" | "displayName" | "login" | "firstName";
  orderDir?: "asc" | "desc";
}) {
  const query = crmQuery({ limit: input?.limit ?? 200, ...input });
  return crmFetch<CrmAdmin[]>(`/admin/crm/admins?${query}`);
}

export async function createCrmAdmin(input: {
  login: string;
  email: string;
  password: string;
  firstName: string;
  lastName: string;
}) {
  return crmFetch<{
    ok: true;
    admin: { id: string; login: string; email: string; firstName: string; lastName: string; displayName: string };
  }>("/admin/crm/admins", {
    method: "POST",
    body: JSON.stringify(input),
  });
}

export async function updateCrmAdmin(
  adminId: string,
  input: { login?: string; email?: string; password?: string; firstName?: string; lastName?: string }
) {
  return crmFetch<{ ok: true }>(`/admin/crm/admins/${adminId}`, {
    method: "PATCH",
    body: JSON.stringify(input),
  });
}

export async function deleteCrmAdmin(adminId: string) {
  return crmFetch<{ ok: true }>(`/admin/crm/admins/${adminId}`, {
    method: "DELETE",
  });
}
