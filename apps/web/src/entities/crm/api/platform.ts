import { crmFetch, crmQuery } from "./client";
import type { CrmPlatformLog, CrmPlatformMetrics, CrmStorageUsage } from "./types";

export async function getCrmPlatformStatus() {
  return crmFetch<{
    serverDateTime: string;
    serverTimeZone: string;
    lastAuditActivityAt: string | null;
    storageUsage: CrmStorageUsage | null;
  }>("/admin/crm/platform-status");
}

export async function getCrmPlatformMetrics() {
  return crmFetch<CrmPlatformMetrics>("/admin/crm/platform-metrics");
}

export async function deployCrmPlatform() {
  return crmFetch<{ ok: true; output: string }>("/admin/crm/platform-deploy", {
    method: "POST",
    body: JSON.stringify({}),
  });
}

export async function getCrmPlatformLogs(input?: { limit?: number; offset?: number }) {
  const query = crmQuery({ limit: input?.limit ?? 200, offset: input?.offset });
  return crmFetch<CrmPlatformLog[]>(`/admin/crm/platform-logs?${query}`);
}
