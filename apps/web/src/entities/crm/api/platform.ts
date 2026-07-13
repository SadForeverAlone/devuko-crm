import { crmFetch } from "./client";
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
  const params = new URLSearchParams();
  params.set("limit", String(input?.limit ?? 200));
  if (input?.offset) params.set("offset", String(input.offset));
  return crmFetch<CrmPlatformLog[]>(`/admin/crm/platform-logs?${params.toString()}`);
}
