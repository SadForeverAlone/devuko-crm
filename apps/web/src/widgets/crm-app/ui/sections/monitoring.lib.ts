import type { CrmPlatformMetrics, CrmSite } from "@/entities/crm";

export type MonitorAlertSeverity = "critical" | "warning" | "info";

export type MonitorAlert = {
  id: string;
  severity: MonitorAlertSeverity;
  category: string;
  message: string;
  detail?: string;
};

export type MonitorHealth = "healthy" | "degraded" | "critical";

const severityRank: Record<MonitorAlertSeverity, number> = {
  critical: 0,
  warning: 1,
  info: 2,
};

export function resourceTone(value: number | null | undefined): "healthy" | "warning" | "critical" | "neutral" {
  if (value == null) return "neutral";
  if (value >= 90) return "critical";
  if (value >= 80) return "warning";
  return "healthy";
}

export function sortAlerts(alerts: MonitorAlert[]) {
  return [...alerts].sort((left, right) => {
    const bySeverity = severityRank[left.severity] - severityRank[right.severity];
    if (bySeverity !== 0) return bySeverity;
    return left.message.localeCompare(right.message);
  });
}

export function computeMonitorHealth(alerts: MonitorAlert[]): MonitorHealth {
  if (alerts.some((alert) => alert.severity === "critical")) return "critical";
  if (alerts.some((alert) => alert.severity === "warning")) return "degraded";
  return "healthy";
}

export function buildMonitorAlerts(metrics: CrmPlatformMetrics | null, crmLang: "ru" | "en"): MonitorAlert[] {
  if (!metrics) return [];

  const alerts: MonitorAlert[] = [];
  const ru = crmLang === "ru";

  if (!metrics.docker.available) {
    alerts.push({
      id: "docker-offline",
      severity: "critical",
      category: "Docker",
      message: ru ? "Docker недоступен" : "Docker unavailable",
      detail: ru ? "API не может подключиться к Docker daemon" : "API cannot reach the Docker daemon",
    });
  }

  if (!metrics.platformDatabase.available) {
    alerts.push({
      id: "crm-db-offline",
      severity: "critical",
      category: ru ? "База CRM" : "CRM database",
      message: ru ? "PostgreSQL CRM недоступен" : "CRM PostgreSQL unavailable",
    });
  }

  if (metrics.sites.error > 0) {
    alerts.push({
      id: "sites-error",
      severity: "critical",
      category: ru ? "Проекты" : "Projects",
      message: ru
        ? `${metrics.sites.error} проект(ов) с ошибкой`
        : `${metrics.sites.error} project(s) in error state`,
    });
  }

  for (const cert of metrics.sslCertificates) {
    if (cert.status === "critical" || cert.status === "missing") {
      alerts.push({
        id: `ssl-${cert.domain}`,
        severity: cert.status === "missing" ? "warning" : "critical",
        category: "SSL",
        message: `${cert.domain}: ${cert.status === "missing" ? (ru ? "сертификат не найден" : "certificate missing") : ru ? "истёк или скоро истечёт" : "expired or expiring"}`,
        detail: cert.daysLeft != null ? `${cert.daysLeft}d` : undefined,
      });
    } else if (cert.status === "warning") {
      alerts.push({
        id: `ssl-${cert.domain}`,
        severity: "warning",
        category: "SSL",
        message: `${cert.domain}: ${ru ? "истекает через" : "expires in"} ${cert.daysLeft}d`,
      });
    }
  }

  for (const domain of metrics.domainRegistrations) {
    if (domain.status === "critical") {
      alerts.push({
        id: `domain-${domain.domain}`,
        severity: "critical",
        category: ru ? "Домен" : "Domain",
        message: `${domain.domain}: ${ru ? "регистрация истекает" : "registration expiring"}`,
        detail: `${domain.daysLeft}d`,
      });
    } else if (domain.status === "warning") {
      alerts.push({
        id: `domain-${domain.domain}`,
        severity: "warning",
        category: ru ? "Домен" : "Domain",
        message: `${domain.domain}: ${ru ? "скоро продление" : "renewal soon"}`,
        detail: `${domain.daysLeft}d`,
      });
    }
  }

  const stoppedContainers = metrics.docker.containers.filter((container) => container.state !== "running");
  if (metrics.docker.available && stoppedContainers.length > 0) {
    alerts.push({
      id: "containers-stopped",
      severity: "warning",
      category: ru ? "Контейнеры" : "Containers",
      message: ru
        ? `${stoppedContainers.length} контейнер(ов) остановлено`
        : `${stoppedContainers.length} container(s) stopped`,
      detail: stoppedContainers
        .slice(0, 4)
        .map((container) => container.name)
        .join(", "),
    });
  }

  for (const instance of metrics.databaseInstances) {
    if (instance.state !== "running") {
      alerts.push({
        id: `db-${instance.id}`,
        severity: "warning",
        category: ru ? "Базы данных" : "Databases",
        message: `${instance.name}: ${ru ? "не запущена" : "not running"}`,
      });
    }
  }

  const cpu = metrics.cpuUsage?.usedPercent;
  if (cpu != null && cpu >= 85) {
    alerts.push({
      id: "cpu-high",
      severity: cpu >= 95 ? "critical" : "warning",
      category: "CPU",
      message: `${cpu}%`,
      detail: ru ? "Высокая загрузка процессора" : "High CPU load",
    });
  }

  const ram = metrics.memoryUsage?.usedPercent;
  if (ram != null && ram >= 85) {
    alerts.push({
      id: "ram-high",
      severity: ram >= 95 ? "critical" : "warning",
      category: "RAM",
      message: `${ram}%`,
      detail: metrics.memoryUsage
        ? `${metrics.memoryUsage.usedMb} / ${metrics.memoryUsage.totalMb} MB`
        : undefined,
    });
  }

  const disk = metrics.storageUsage?.usedPercent;
  if (disk != null && disk >= 85) {
    alerts.push({
      id: "disk-high",
      severity: disk >= 95 ? "critical" : "warning",
      category: ru ? "Диск" : "Disk",
      message: `${disk}%`,
      detail: metrics.storageUsage?.path,
    });
  }

  for (const mount of metrics.storageMounts) {
    if (mount.usedPercent >= 90 && mount.mount !== metrics.storageUsage?.path) {
      alerts.push({
        id: `mount-${mount.mount}`,
        severity: mount.usedPercent >= 95 ? "critical" : "warning",
        category: ru ? "Хранилище" : "Storage",
        message: `${mount.mount}: ${mount.usedPercent}%`,
        detail: `${mount.usedGb} / ${mount.totalGb} GB`,
      });
    }
  }

  const failedDeploys = metrics.recentDeployments.filter((item) => !item.ok).slice(0, 3);
  for (const deploy of failedDeploys) {
    alerts.push({
      id: `deploy-${deploy.id}`,
      severity: "warning",
      category: ru ? "Деплой" : "Deploy",
      message: deploy.target ?? (ru ? "Неизвестная цель" : "Unknown target"),
      detail: deploy.action,
    });
  }

  if (metrics.sites.pending > 0) {
    alerts.push({
      id: "sites-pending",
      severity: "info",
      category: ru ? "Проекты" : "Projects",
      message: ru
        ? `${metrics.sites.pending} проект(ов) ожидают провизионинг`
        : `${metrics.sites.pending} project(s) pending provisioning`,
    });
  }

  return sortAlerts(alerts);
}

export function countAlertsBySeverity(alerts: MonitorAlert[]) {
  return {
    critical: alerts.filter((alert) => alert.severity === "critical").length,
    warning: alerts.filter((alert) => alert.severity === "warning").length,
    info: alerts.filter((alert) => alert.severity === "info").length,
  };
}

export function platformGroupTitle(site: CrmSite | null, crmLang: "ru" | "en") {
  if (site) return site.domain;
  return crmLang === "ru" ? "Платформа" : "Platform";
}
