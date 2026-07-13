import { crmFetch } from "./client";
import type { CrmSite, CrmWorkspace } from "./types";

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

export async function deleteCrmSite(siteId: string) {
  return crmFetch<{ ok: true }>(`/admin/crm/sites/${siteId}`, {
    method: "DELETE",
  });
}

export async function deployCrmSite(siteId: string) {
  return crmFetch<{ ok: true; output: string }>(`/admin/crm/sites/${siteId}/deploy`, {
    method: "POST",
    body: JSON.stringify({}),
  });
}
