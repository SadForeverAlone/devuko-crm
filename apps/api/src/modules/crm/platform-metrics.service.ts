import { Injectable } from "@nestjs/common";
import { DatabaseService } from "../database/database.service";
import { CrmAdminService } from "./crm-admin.service";
import { readCpuUsage } from "./cpu-usage";
import { discoverDatabaseInstances, readPlatformDatabaseStats } from "./database-metrics";
import { readDiskMounts, readDiskUsage } from "./disk-usage";
import { readDockerMetrics } from "./docker-metrics";
import { readMemoryUsage } from "./memory-usage";
import { readDomainRegistrations, type DomainRegistration } from "./domain-registration";
import { readSslCertificates, type SslCertificate } from "./ssl-status";
import { readServerInfo, type ServerInfo } from "./server-info";
import { PlatformAuditService } from "./platform-audit.service";
import { PlatformService } from "./platform.service";

export type PlatformMetrics = {
  serverDateTime: string;
  serverTimeZone: string;
  serverInfo: ServerInfo;
  lastAuditActivityAt: string | null;
  storageUsage: Awaited<ReturnType<typeof readDiskUsage>>;
  storageMounts: Awaited<ReturnType<typeof readDiskMounts>>;
  memoryUsage: Awaited<ReturnType<typeof readMemoryUsage>>;
  cpuUsage: Awaited<ReturnType<typeof readCpuUsage>>;
  docker: Awaited<ReturnType<typeof readDockerMetrics>>;
  platformDatabase: Awaited<ReturnType<typeof readPlatformDatabaseStats>>;
  databaseInstances: ReturnType<typeof discoverDatabaseInstances>;
  sslCertificates: SslCertificate[];
  domainRegistrations: DomainRegistration[];
  sites: {
    total: number;
    active: number;
    pending: number;
    error: number;
  };
  deploymentsToday: number;
  recentDeployments: Array<{
    id: string;
    action: string;
    target: string | null;
    ok: boolean;
    createdAt: string;
    actorName: string | null;
  }>;
  adminsCount: number;
};

@Injectable()
export class PlatformMetricsService {
  constructor(
    private readonly platform: PlatformService,
    private readonly audit: PlatformAuditService,
    private readonly admins: CrmAdminService,
    private readonly database: DatabaseService
  ) {}

  async getMetrics(): Promise<PlatformMetrics> {
    const [
      storageUsage,
      storageMounts,
      memoryUsage,
      cpuUsage,
      docker,
      serverInfo,
      platformDatabase,
      sites,
      lastAuditActivityAt,
      recentLogs,
      adminsCount,
    ] = await Promise.all([
      readDiskUsage("/srv"),
      readDiskMounts(["/", "/srv", "/var/lib/docker"]),
      readMemoryUsage(),
      readCpuUsage(),
      readDockerMetrics(),
      readServerInfo(),
      readPlatformDatabaseStats(this.database),
      this.platform.listSites(),
      this.audit.lastActivityAt(),
      this.audit.list({ limit: 50 }),
      this.admins.countAdmins(),
    ]);

    const sslDomains = sites.flatMap((site) => [site.domain, ...site.extraDomains]);
    sslDomains.push("crm.devuko.ru");
    const registrationDomains = [...sslDomains];
    const [sslCertificates, domainRegistrations] = await Promise.all([
      readSslCertificates(sslDomains),
      readDomainRegistrations(registrationDomains),
    ]);

    const todayStart = new Date();
    todayStart.setHours(0, 0, 0, 0);

    const deploymentLogs = recentLogs.filter(
      (log) =>
        log.action.includes("provision") ||
        log.action.includes("deploy") ||
        log.action.includes("site.create")
    );

    const deploymentsToday = deploymentLogs.filter(
      (log) => new Date(log.createdAt).getTime() >= todayStart.getTime()
    ).length;

    return {
      serverDateTime: new Date().toISOString(),
      serverTimeZone: Intl.DateTimeFormat().resolvedOptions().timeZone,
      serverInfo,
      lastAuditActivityAt,
      storageUsage,
      storageMounts,
      memoryUsage,
      cpuUsage,
      docker,
      platformDatabase,
      databaseInstances: discoverDatabaseInstances(docker.containers),
      sslCertificates,
      domainRegistrations,
      sites: {
        total: sites.length,
        active: sites.filter((site) => site.status === "active").length,
        pending: sites.filter((site) => site.status === "pending" || site.status === "provisioning").length,
        error: sites.filter((site) => site.status === "error").length,
      },
      deploymentsToday,
      recentDeployments: deploymentLogs.slice(0, 50).map((log) => ({
        id: log.id,
        action: log.action,
        target: log.target,
        ok: log.ok,
        createdAt: log.createdAt,
        actorName: log.actorName,
      })),
      adminsCount,
    };
  }
}
