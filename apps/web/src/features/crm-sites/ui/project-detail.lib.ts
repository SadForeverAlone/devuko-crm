import type { CrmDockerContainer, CrmPlatformLog, CrmPlatformMetrics, CrmSite } from "@/entities/crm";
import { buildMonitorAlerts, type MonitorAlert } from "@/features/crm-platform-ops/ui/monitoring.lib";

export type SecretEntry = {
  key: string;
  value: string;
  sensitive: boolean;
};

export function projectContainerHint(site: CrmSite) {
  const slug = site.slug.trim().toLowerCase();
  if (slug.includes("selfpact")) return "selfpact";
  if (slug.includes("devuko") || slug.includes("crm")) return "devuko-crm";
  return slug.split("-")[0] ?? slug;
}

export function filterProjectContainers(site: CrmSite, containers: CrmDockerContainer[]) {
  const hint = projectContainerHint(site);
  return containers.filter((container) => container.name.toLowerCase().includes(hint));
}

export function projectHealthTone(site: CrmSite): "healthy" | "warning" | "critical" {
  if (site.status === "active") return "healthy";
  if (site.status === "error") return "critical";
  return "warning";
}

export function projectDomains(site: CrmSite) {
  return new Set([site.domain, ...site.extraDomains]);
}

export function matchesProjectTarget(site: CrmSite, target: string | null | undefined) {
  if (!target?.trim()) return false;
  const value = target.trim().toLowerCase();
  const slug = site.slug.toLowerCase();
  const domainToken = site.domain.split(".")[0]?.toLowerCase() ?? "";

  if (value === site.id.toLowerCase()) return true;
  if (value === site.domain.toLowerCase()) return true;
  if (value === slug) return true;
  if (slug.length > 2 && value.includes(slug)) return true;
  if (domainToken.length > 2 && value.includes(domainToken)) return true;
  if (value.includes(site.domain.toLowerCase())) return true;
  return site.extraDomains.some((domain) => value.includes(domain.toLowerCase()));
}

export function matchesProjectResourceName(site: CrmSite, name: string) {
  const slug = site.slug.toLowerCase();
  const domainToken = site.domain.split(".")[0]?.toLowerCase() ?? "";
  const normalized = name.toLowerCase();
  return (
    (slug.length > 2 && normalized.includes(slug)) ||
    (domainToken.length > 2 && normalized.includes(domainToken)) ||
    normalized.includes(site.domain.toLowerCase())
  );
}

export function filterProjectSslCertificates(
  site: CrmSite,
  certificates: CrmPlatformMetrics["sslCertificates"]
) {
  const domains = projectDomains(site);
  return certificates.filter((cert) => domains.has(cert.domain));
}

export function filterProjectVolumes<T extends { name: string }>(site: CrmSite, volumes: T[]) {
  return volumes.filter((volume) => matchesProjectResourceName(site, volume.name));
}

export function filterProjectDatabaseInstances(
  site: CrmSite,
  instances: CrmPlatformMetrics["databaseInstances"]
) {
  return instances.filter((instance) => matchesProjectResourceName(site, instance.name));
}

export function filterProjectStorageMounts(site: CrmSite, mounts: CrmPlatformMetrics["storageMounts"]) {
  const prodPath = site.prodPath?.toLowerCase() ?? "";
  return mounts.filter((mount) => {
    const mountPath = mount.mount.toLowerCase();
    if (prodPath && prodPath.startsWith(mountPath)) return true;
    if (prodPath && mountPath.startsWith(prodPath)) return true;
    return matchesProjectResourceName(site, mount.mount);
  });
}

export function filterProjectPlatformLogs(site: CrmSite, logs: CrmPlatformLog[]) {
  return logs.filter(
    (log) =>
      matchesProjectTarget(site, log.target) ||
      matchesProjectTarget(site, log.detail) ||
      (log.action.startsWith("site.") && matchesProjectTarget(site, log.target))
  );
}

export function filterProjectDeployments(
  site: CrmSite,
  deployments: CrmPlatformMetrics["recentDeployments"]
) {
  return deployments.filter((item) => matchesProjectTarget(site, item.target));
}

export function filterProjectAlerts(
  site: CrmSite,
  metrics: CrmPlatformMetrics | null,
  crmLang: "ru" | "en"
): MonitorAlert[] {
  if (!metrics) return [];

  const domains = projectDomains(site);
  const projectContainers = filterProjectContainers(site, metrics.docker.containers);
  const projectContainerNames = new Set(projectContainers.map((container) => container.name));
  const projectDatabases = filterProjectDatabaseInstances(site, metrics.databaseInstances);
  const projectDatabaseNames = new Set(projectDatabases.map((instance) => instance.name));

  return buildMonitorAlerts(metrics, crmLang).filter((alert) => {
    if (alert.id.startsWith("ssl-")) {
      const domain = alert.id.slice(4);
      return domains.has(domain);
    }

    if (alert.id.startsWith("domain-")) {
      const domain = alert.id.slice(7);
      return domains.has(domain);
    }

    if (alert.id.startsWith("db-")) {
      const db = projectDatabases.find((instance) => alert.id === `db-${instance.id}`);
      return Boolean(db);
    }

    if (alert.id.startsWith("deploy-")) {
      const deploy = metrics.recentDeployments.find((item) => alert.id === `deploy-${item.id}`);
      return deploy ? matchesProjectTarget(site, deploy.target) : false;
    }

    if (alert.id === "containers-stopped" && alert.detail) {
      return alert.detail
        .split(", ")
        .some((name) => projectContainerNames.has(name) || matchesProjectResourceName(site, name));
    }

    if (alert.id === "sites-error" || alert.id === "sites-pending") {
      if (site.status === "error" && alert.id === "sites-error") return true;
      if (site.status === "pending" && alert.id === "sites-pending") return true;
      return false;
    }

    if (alert.category === (crmLang === "ru" ? "Базы данных" : "Databases")) {
      return projectDatabaseNames.has(alert.message.split(":")[0]?.trim() ?? "");
    }

    return false;
  });
}

function isSensitiveKey(key: string) {
  return /password|secret|token|private|credential|api[_-]?key|auth|database_url|connection|passwd|jwt|smtp/i.test(
    key
  );
}

export function extractDevConfigEntries(
  config: Record<string, unknown> | null,
  prefix = ""
): SecretEntry[] {
  if (!config) return [];

  const entries: SecretEntry[] = [];
  for (const [key, raw] of Object.entries(config)) {
    const fullKey = prefix ? `${prefix}.${key}` : key;
    if (raw != null && typeof raw === "object" && !Array.isArray(raw)) {
      entries.push(...extractDevConfigEntries(raw as Record<string, unknown>, fullKey));
      continue;
    }

    const value = raw == null ? "" : Array.isArray(raw) ? raw.join(", ") : String(raw);
    entries.push({ key: fullKey, value, sensitive: isSensitiveKey(fullKey) });
  }

  return entries.sort((left, right) => left.key.localeCompare(right.key));
}

export function maskSecretValue(_value: string) {
  return "••••••••";
}

export function sslStatusLabel(status: string, crmLang: "ru" | "en") {
  if (status === "missing") return crmLang === "ru" ? "Не найден" : "Missing";
  if (status === "healthy") return "OK";
  if (status === "warning") return crmLang === "ru" ? "Скоро истечёт" : "Expiring";
  return crmLang === "ru" ? "Критично" : "Critical";
}

export function sslStatusTone(status: string): "healthy" | "warning" | "critical" | "neutral" {
  if (status === "healthy") return "healthy";
  if (status === "warning") return "warning";
  if (status === "missing") return "neutral";
  return "critical";
}
