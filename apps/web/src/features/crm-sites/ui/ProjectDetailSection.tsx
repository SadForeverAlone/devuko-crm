import { useMemo, useState } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faArrowLeft,
  faBell,
  faDatabase,
  faGlobe,
  faHardDrive,
  faLock,
  faServer,
} from "@fortawesome/free-solid-svg-icons";
import type { CrmPlatformLog, CrmPlatformMetrics, CrmSite } from "@/entities/crm";
import { EmptyState, PlatformCard, PlatformPage, PlatformRecordTable, StatusPill } from "@/shared/ui/platform";
import { CrmMeterBar } from "@/shared/ui/crm-meter/CrmMeterBar";
import type { ProjectDetailTab } from "@/widgets/crm-app/model/platform-nav";
import { projectDetailTabLabel } from "@/widgets/crm-app/model/platform-nav";
import { getCrmLocaleTag } from "@/widgets/crm-app/model/lib";
import type { CrmLang } from "@/widgets/crm-app/model/types";
import { SiteStatusBadge } from "@/features/crm-sites/ui/SiteStatusBadge";
import { ProvisionLogTable } from "@/features/crm-sites/ui/ProvisionLogTable";
import { PlatformLogTable } from "@/features/crm-logs/ui/PlatformLogTable";
import { ProjectSectionPicker } from "@/features/crm-sites/ui/ProjectSectionPicker";
import {
  extractDevConfigEntries,
  filterProjectAlerts,
  filterProjectContainers,
  filterProjectDatabaseInstances,
  filterProjectDeployments,
  filterProjectPlatformLogs,
  filterProjectSslCertificates,
  filterProjectStorageMounts,
  filterProjectVolumes,
  maskSecretValue,
  projectHealthTone,
  sslStatusLabel,
  sslStatusTone,
} from "@/features/crm-sites/ui/project-detail.lib";
import { computeMonitorHealth } from "@/features/crm-platform-ops/ui/monitoring.lib";

type ProjectDetailSectionProps = {
  crmLang: CrmLang;
  site: CrmSite | null;
  tab: ProjectDetailTab;
  metrics: CrmPlatformMetrics | null;
  platformLogs: CrmPlatformLog[];
  onBack: () => void;
  onNavigateTab: (tab: ProjectDetailTab) => void;
  onSwitchToWorkspace: (workspaceId: string) => void;
  onProvision: (siteId: string) => void;
  onDeploy: (siteId: string) => void;
  deploying: boolean;
};

function InfoRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="dv-info-row">
      <span className="dv-info-row__label">{label}</span>
      <code className="dv-info-row__value">{value}</code>
    </div>
  );
}

function StorageMeter({ value }: { value: number }) {
  return (
    <div className="crm-infra-meter">
      <div className="crm-infra-meter__track">
        <CrmMeterBar value={value} />
      </div>
      <span>{value}%</span>
    </div>
  );
}

export function ProjectDetailSection({
  crmLang,
  site,
  tab,
  metrics,
  platformLogs,
  onBack,
  onNavigateTab,
  onSwitchToWorkspace,
  onProvision,
  onDeploy,
  deploying,
}: ProjectDetailSectionProps) {
  const locale = getCrmLocaleTag(crmLang);
  const [revealedSecrets, setRevealedSecrets] = useState<Set<string>>(new Set());

  const projectData = useMemo(() => {
    if (!site) return null;

    const projectContainers = filterProjectContainers(site, metrics?.docker.containers ?? []);
    const sslCertificates = filterProjectSslCertificates(site, metrics?.sslCertificates ?? []);
    const volumes = filterProjectVolumes(site, metrics?.docker.volumes ?? []);
    const storageMounts = filterProjectStorageMounts(site, metrics?.storageMounts ?? []);
    const databaseInstances = filterProjectDatabaseInstances(site, metrics?.databaseInstances ?? []);
    const logs = filterProjectPlatformLogs(site, platformLogs);
    const alerts = filterProjectAlerts(site, metrics, crmLang);
    const deployments = filterProjectDeployments(site, metrics?.recentDeployments ?? []);
    const secrets = extractDevConfigEntries(site.devConfig);
    const backupVolumes = volumes.filter((volume) => /data|postgres|backup|storage|db/i.test(volume.name));

    return {
      projectContainers,
      sslCertificates,
      volumes,
      storageMounts,
      databaseInstances,
      logs,
      alerts,
      deployments,
      secrets,
      backupVolumes,
      monitorHealth: computeMonitorHealth(alerts),
      runningContainers: projectContainers.filter((container) => container.state === "running").length,
    };
  }, [site, metrics, platformLogs, crmLang]);

  if (!site) {
    return (
      <EmptyState
        icon={faGlobe}
        title={crmLang === "ru" ? "Проект не найден" : "Project not found"}
        action={
          <button type="button" className="crm-btn crm-btn--ghost" onClick={onBack}>
            <FontAwesomeIcon icon={faArrowLeft} />
            {crmLang === "ru" ? "Назад" : "Back"}
          </button>
        }
      />
    );
  }

  const projectContainers = projectData!.projectContainers;
  const runningContainers = projectData!.runningContainers;
  const healthTone = projectHealthTone(site);
  const createdLabel = new Intl.DateTimeFormat(locale, { dateStyle: "medium", timeStyle: "short" }).format(
    new Date(site.createdAt)
  );

  function toggleSecretReveal(key: string) {
    setRevealedSecrets((current) => {
      const next = new Set(current);
      if (next.has(key)) next.delete(key);
      else next.add(key);
      return next;
    });
  }

  function monitorHealthLabel(health: ReturnType<typeof computeMonitorHealth>) {
    if (health === "critical") return crmLang === "ru" ? "Критично" : "Critical";
    if (health === "degraded") return crmLang === "ru" ? "Есть риски" : "Degraded";
    return crmLang === "ru" ? "Норма" : "Healthy";
  }

  function alertSeverityLabel(severity: "critical" | "warning" | "info") {
    if (severity === "critical") return crmLang === "ru" ? "Критично" : "Critical";
    if (severity === "warning") return crmLang === "ru" ? "Предупр." : "Warning";
    return crmLang === "ru" ? "Инфо" : "Info";
  }

  const connectedTabs = new Set([
    "overview",
    "services",
    "containers",
    "deployments",
    "domains",
    "ssl",
    "environment",
    "settings",
    "secrets",
    "storage",
    "database",
    "logs",
    "monitoring",
    "backups",
  ]);

  return (
    <PlatformPage
      className="crm-project-page dv-dashboard"
      title={
        <span className="crm-project-page__title">
          <button type="button" className="crm-project-page__back" onClick={onBack} aria-label={crmLang === "ru" ? "Назад" : "Back"}>
            <FontAwesomeIcon icon={faArrowLeft} />
          </button>
          <span className="crm-project-page__domain">{site.domain}</span>
          <SiteStatusBadge status={site.status} lang={crmLang} />
          <StatusPill label="Health" tone={healthTone} />
        </span>
      }
      subtitle={
        <span className="crm-project-page__meta">
          {site.repo ?? site.prodPath ? (
            <span className="crm-project-page__meta-path">{site.repo ?? site.prodPath}</span>
          ) : null}
          <span className="crm-project-page__meta-section">{projectDetailTabLabel(tab, crmLang)}</span>
        </span>
      }
      actions={
        <div className="crm-project-page__actions">
          <ProjectSectionPicker crmLang={crmLang} tab={tab} onNavigateTab={onNavigateTab} />
          {site.status === "active" ? (
            <>
              <button
                type="button"
                className="crm-btn crm-btn--ghost crm-btn--sm"
                disabled={deploying}
                onClick={() => onDeploy(site.id)}
              >
                {deploying ? (crmLang === "ru" ? "Деплой…" : "Deploying…") : crmLang === "ru" ? "Деплой" : "Deploy"}
              </button>
              <button
                type="button"
                className="crm-btn crm-btn--primary crm-btn--sm"
                onClick={() => onSwitchToWorkspace(site.workspaceId)}
              >
                {crmLang === "ru" ? "Открыть workspace" : "Open workspace"}
              </button>
            </>
          ) : (
            <button type="button" className="crm-btn crm-btn--primary crm-btn--sm" onClick={() => onProvision(site.id)}>
              {crmLang === "ru" ? "Провизионинг" : "Provision"}
            </button>
          )}
        </div>
      }
    >
      {tab === "overview" && (
        <div className="crm-project-page__overview">
          <section className="crm-page__block">
            <div className="dv-stat-strip crm-project-page__stats">
              <div className="dv-stat-strip__cell">
                <span className="dv-stat-strip__label">{crmLang === "ru" ? "API порт" : "API port"}</span>
                <strong className="dv-stat-strip__value dv-stat-strip__value--mono">{site.apiPort ?? "—"}</strong>
              </div>
              <div className="dv-stat-strip__cell">
                <span className="dv-stat-strip__label">{crmLang === "ru" ? "Web порт" : "Web port"}</span>
                <strong className="dv-stat-strip__value dv-stat-strip__value--mono">{site.webPort ?? "—"}</strong>
              </div>
              <div className="dv-stat-strip__cell">
                <span className="dv-stat-strip__label">{crmLang === "ru" ? "Контейнеры" : "Containers"}</span>
                <strong className="dv-stat-strip__value">{projectContainers.length}</strong>
                <span className="dv-stat-strip__hint">
                  {runningContainers} {crmLang === "ru" ? "running" : "running"}
                </span>
              </div>
              <div className="dv-stat-strip__cell">
                <span className="dv-stat-strip__label">{crmLang === "ru" ? "Создан" : "Created"}</span>
                <strong className="dv-stat-strip__value dv-stat-strip__value--sm">{createdLabel}</strong>
              </div>
            </div>
          </section>

          <section className="crm-page__block">
            <article className="crm-panel crm-panel--static crm-project-page__spec">
              <dl className="crm-infra-spec crm-infra-spec--compact">
                <div className="crm-infra-spec__row">
                  <dt>Slug</dt>
                  <dd>{site.slug}</dd>
                </div>
                <div className="crm-infra-spec__row">
                  <dt>Workspace</dt>
                  <dd>{site.workspaceId}</dd>
                </div>
                {site.prodPath ? (
                  <div className="crm-infra-spec__row">
                    <dt>{crmLang === "ru" ? "Prod path" : "Prod path"}</dt>
                    <dd>{site.prodPath}</dd>
                  </div>
                ) : null}
                {site.extraDomains.length > 0 ? (
                  <div className="crm-infra-spec__row">
                    <dt>{crmLang === "ru" ? "Доп. домены" : "Extra domains"}</dt>
                    <dd>{site.extraDomains.join(", ")}</dd>
                  </div>
                ) : null}
              </dl>
            </article>
          </section>

          <section className="crm-page__block">
            <article className="crm-panel crm-panel--static crm-project-page__log">
              <header className="crm-section-head">
                <div>
                  <h3>{crmLang === "ru" ? "Журнал настройки" : "Provision log"}</h3>
                  <p className="crm-muted">
                    {site.provisionLog.length}{" "}
                    {crmLang === "ru" ? "записей" : site.provisionLog.length === 1 ? "entry" : "entries"}
                  </p>
                </div>
              </header>
              {site.provisionLog.length === 0 ? (
                <p className="crm-muted crm-project-page__log-empty">
                  {crmLang === "ru" ? "Лог пуст" : "Log is empty"}
                </p>
              ) : (
                <ProvisionLogTable crmLang={crmLang} entries={site.provisionLog} />
              )}
            </article>
          </section>
        </div>
      )}

      {tab === "services" && (
        <section className="crm-page__block">
          <div className="dv-service-grid">
            <PlatformCard title="API" subtitle={crmLang === "ru" ? "Backend сервис" : "Backend service"}>
              <InfoRow
                label="URL"
                value={
                  "apiBaseUrl" in site && typeof site.apiBaseUrl === "string"
                    ? site.apiBaseUrl
                    : `http://127.0.0.1:${site.apiPort ?? "—"}`
                }
              />
              <InfoRow label={crmLang === "ru" ? "Порт" : "Port"} value={String(site.apiPort ?? "—")} />
            </PlatformCard>
            <PlatformCard title="Web" subtitle={crmLang === "ru" ? "Frontend / static" : "Frontend / static"}>
              <InfoRow label={crmLang === "ru" ? "Порт" : "Port"} value={String(site.webPort ?? "—")} />
              <InfoRow label={crmLang === "ru" ? "Prod path" : "Prod path"} value={site.prodPath ?? "—"} />
            </PlatformCard>
          </div>
        </section>
      )}

      {tab === "containers" && (
        <section className="crm-page__block">
          <PlatformCard title={crmLang === "ru" ? "Контейнеры проекта" : "Project containers"}>
            {!metrics?.docker.available ? (
              <EmptyState icon={faServer} title={crmLang === "ru" ? "Docker недоступен" : "Docker unavailable"} />
            ) : projectContainers.length === 0 ? (
              <EmptyState
                icon={faServer}
                title={crmLang === "ru" ? "Контейнеры не найдены" : "No containers found"}
                description={
                  crmLang === "ru"
                    ? "Контейнеры с именем, содержащим slug проекта, не обнаружены."
                    : "No containers matching the project slug were found."
                }
              />
            ) : (
              <PlatformRecordTable
                template="1.15fr 1.45fr 0.8fr 1fr"
                rows={projectContainers}
                rowKey={(container) => container.id}
                columns={[
                  {
                    id: "name",
                    header: crmLang === "ru" ? "Имя" : "Name",
                    mono: true,
                    render: (container) => container.name,
                  },
                  {
                    id: "image",
                    header: crmLang === "ru" ? "Образ" : "Image",
                    muted: true,
                    truncate: true,
                    render: (container) => container.image,
                  },
                  {
                    id: "status",
                    header: crmLang === "ru" ? "Статус" : "Status",
                    render: (container) => (
                      <StatusPill
                        label={container.state}
                        tone={
                          container.state === "running" ? "healthy" : container.state === "stopped" ? "warning" : "neutral"
                        }
                      />
                    ),
                  },
                  {
                    id: "ports",
                    header: crmLang === "ru" ? "Порты" : "Ports",
                    muted: true,
                    mono: true,
                    truncate: true,
                    render: (container) => container.ports || "—",
                  },
                ]}
              />
            )}
          </PlatformCard>
        </section>
      )}

      {tab === "deployments" && (
        <section className="crm-page__block">
          <PlatformCard title={crmLang === "ru" ? "История деплоев" : "Deployment history"}>
            {site.provisionLog.length === 0 ? (
              <EmptyState icon={faServer} title={crmLang === "ru" ? "Деплои не найдены" : "No deployments found"} />
            ) : (
              <PlatformRecordTable
                template="1fr 0.75fr 1.45fr 0.95fr"
                rows={site.provisionLog.map((entry, index) => ({ ...entry, _index: index }))}
                rowKey={(entry) => `${entry.step}-${entry.at}-${entry._index}`}
                columns={[
                  {
                    id: "step",
                    header: crmLang === "ru" ? "Шаг" : "Step",
                    mono: true,
                    render: (entry) => entry.step,
                  },
                  {
                    id: "status",
                    header: crmLang === "ru" ? "Статус" : "Status",
                    render: (entry) => (
                      <StatusPill label={entry.ok ? "OK" : "Error"} tone={entry.ok ? "healthy" : "critical"} />
                    ),
                  },
                  {
                    id: "message",
                    header: crmLang === "ru" ? "Сообщение" : "Message",
                    muted: true,
                    truncate: true,
                    render: (entry) => entry.message,
                  },
                  {
                    id: "time",
                    header: crmLang === "ru" ? "Время" : "Time",
                    muted: true,
                    render: (entry) =>
                      new Intl.DateTimeFormat(locale, { dateStyle: "short", timeStyle: "short" }).format(new Date(entry.at)),
                  },
                ]}
              />
            )}
          </PlatformCard>
        </section>
      )}

      {tab === "domains" && (
        <section className="crm-page__block">
          <PlatformCard title={crmLang === "ru" ? "Домены" : "Domains"}>
            <ul className="dv-domain-list">
              <li>
                <strong>{site.domain}</strong>
                <StatusPill label={crmLang === "ru" ? "Primary" : "Primary"} tone="info" />
              </li>
              {site.extraDomains.map((domain) => (
                <li key={domain}>{domain}</li>
              ))}
            </ul>
          </PlatformCard>
        </section>
      )}

      {tab === "ssl" && (
        <section className="crm-page__block">
          <PlatformCard
            icon={faLock}
            title="SSL"
            subtitle={
              crmLang === "ru"
                ? "Сертификаты nginx / Let's Encrypt"
                : "nginx / Let's Encrypt certificates"
            }
          >
            {projectData!.sslCertificates.length === 0 ? (
              <EmptyState
                icon={faLock}
                title={crmLang === "ru" ? "Сертификаты не найдены" : "No certificates found"}
                description={
                  crmLang === "ru"
                    ? "Для доменов проекта сертификаты не обнаружены."
                    : "No certificates were found for the project domains."
                }
              />
            ) : (
              <PlatformRecordTable
                template="1.2fr 0.55fr 1fr 0.75fr"
                rows={projectData!.sslCertificates}
                rowKey={(cert) => cert.domain}
                columns={[
                  {
                    id: "domain",
                    header: crmLang === "ru" ? "Домен" : "Domain",
                    mono: true,
                    render: (cert) => cert.domain,
                  },
                  {
                    id: "days",
                    header: crmLang === "ru" ? "Дней" : "Days",
                    align: "center",
                    render: (cert) => (cert.daysLeft >= 0 ? cert.daysLeft : "—"),
                  },
                  {
                    id: "issuer",
                    header: crmLang === "ru" ? "Издатель" : "Issuer",
                    muted: true,
                    truncate: true,
                    render: (cert) => (cert.issuer !== "—" ? cert.issuer : "—"),
                  },
                  {
                    id: "status",
                    header: crmLang === "ru" ? "Статус" : "Status",
                    render: (cert) => (
                      <StatusPill
                        label={sslStatusLabel(cert.status, crmLang)}
                        tone={sslStatusTone(cert.status)}
                      />
                    ),
                  },
                ]}
              />
            )}
          </PlatformCard>
        </section>
      )}

      {tab === "environment" && (
        <section className="crm-page__block">
          <PlatformCard title={crmLang === "ru" ? "Окружение" : "Environment"}>
            <InfoRow
              label="API_BASE_URL"
              value={
                "apiBaseUrl" in site && typeof site.apiBaseUrl === "string"
                  ? site.apiBaseUrl
                  : `http://127.0.0.1:${site.apiPort ?? "—"}`
              }
            />
            <InfoRow label="PROD_PATH" value={site.prodPath ?? "—"} />
            <InfoRow label="API_PORT" value={String(site.apiPort ?? "—")} />
            <InfoRow label="WEB_PORT" value={String(site.webPort ?? "—")} />
            <InfoRow label="WORKSPACE_ID" value={site.workspaceId} />
          </PlatformCard>
        </section>
      )}

      {tab === "settings" && (
        <section className="crm-page__block">
          <PlatformCard title={crmLang === "ru" ? "Настройки проекта" : "Project settings"}>
            <InfoRow label={crmLang === "ru" ? "Домен" : "Domain"} value={site.domain} />
            <InfoRow label="Slug" value={site.slug} />
            <InfoRow label="Repo" value={site.repo ?? "—"} />
            <InfoRow
              label={crmLang === "ru" ? "Обновлено" : "Updated"}
              value={new Intl.DateTimeFormat(locale, { dateStyle: "medium", timeStyle: "short" }).format(
                new Date(site.updatedAt)
              )}
            />
          </PlatformCard>
        </section>
      )}

      {tab === "secrets" && (
        <section className="crm-page__block">
          <PlatformCard
            title={crmLang === "ru" ? "Секреты и devConfig" : "Secrets and devConfig"}
            subtitle={
              crmLang === "ru"
                ? "Значения из devConfig проекта (чувствительные скрыты)"
                : "Project devConfig values (sensitive keys masked)"
            }
          >
            {projectData!.secrets.length === 0 ? (
              <EmptyState
                icon={faLock}
                title={crmLang === "ru" ? "Секреты не заданы" : "No secrets configured"}
                description={
                  crmLang === "ru"
                    ? "devConfig для этого проекта пуст или не содержит ключей."
                    : "devConfig for this project is empty or has no keys."
                }
              />
            ) : (
              <PlatformRecordTable
                template="1fr 1.45fr 0.55fr"
                rows={projectData!.secrets}
                rowKey={(entry) => entry.key}
                columns={[
                  {
                    id: "key",
                    header: crmLang === "ru" ? "Ключ" : "Key",
                    mono: true,
                    render: (entry) => entry.key,
                  },
                  {
                    id: "value",
                    header: crmLang === "ru" ? "Значение" : "Value",
                    muted: true,
                    truncate: true,
                    render: (entry) =>
                      entry.sensitive && !revealedSecrets.has(entry.key)
                        ? maskSecretValue(entry.value)
                        : entry.value || "—",
                  },
                  {
                    id: "action",
                    header: "",
                    align: "end",
                    render: (entry) =>
                      entry.sensitive ? (
                        <button
                          type="button"
                          className="crm-btn crm-btn--ghost crm-btn--sm"
                          onClick={() => toggleSecretReveal(entry.key)}
                        >
                          {revealedSecrets.has(entry.key)
                            ? crmLang === "ru"
                              ? "Скрыть"
                              : "Hide"
                            : crmLang === "ru"
                              ? "Показать"
                              : "Reveal"}
                        </button>
                      ) : (
                        "—"
                      ),
                  },
                ]}
              />
            )}
          </PlatformCard>
        </section>
      )}

      {tab === "storage" && (
        <section className="crm-page__block crm-project-page__stack">
          <PlatformCard
            icon={faHardDrive}
            title={crmLang === "ru" ? "Тома Docker" : "Docker volumes"}
            subtitle={`${projectData!.volumes.length} ${crmLang === "ru" ? "томов" : "volumes"}`}
          >
            {!metrics?.docker.available ? (
              <EmptyState icon={faServer} title={crmLang === "ru" ? "Docker недоступен" : "Docker unavailable"} />
            ) : projectData!.volumes.length === 0 ? (
              <EmptyState
                icon={faHardDrive}
                title={crmLang === "ru" ? "Тома не найдены" : "No volumes found"}
                description={
                  crmLang === "ru"
                    ? "Docker-тома с именем, связанным с проектом, не обнаружены."
                    : "No Docker volumes linked to this project were found."
                }
              />
            ) : (
              <PlatformRecordTable
                template="1.1fr 0.55fr 1.45fr"
                rows={projectData!.volumes}
                rowKey={(volume) => volume.name}
                columns={[
                  {
                    id: "name",
                    header: crmLang === "ru" ? "Имя" : "Name",
                    mono: true,
                    render: (volume) => volume.name,
                  },
                  {
                    id: "driver",
                    header: "Driver",
                    muted: true,
                    render: (volume) => volume.driver,
                  },
                  {
                    id: "mountpoint",
                    header: crmLang === "ru" ? "Mountpoint" : "Mountpoint",
                    muted: true,
                    truncate: true,
                    render: (volume) => volume.mountpoint || "—",
                  },
                ]}
              />
            )}
          </PlatformCard>

          <PlatformCard
            icon={faHardDrive}
            title={crmLang === "ru" ? "Дисковые разделы" : "Disk mounts"}
            subtitle={
              crmLang === "ru"
                ? "Разделы, связанные с prod path проекта"
                : "Mounts related to the project prod path"
            }
          >
            {projectData!.storageMounts.length === 0 ? (
              <EmptyState
                icon={faHardDrive}
                title={crmLang === "ru" ? "Разделы не найдены" : "No mounts found"}
              />
            ) : (
              <PlatformRecordTable
                template="0.9fr 1fr 0.55fr 0.55fr 0.75fr"
                rows={projectData!.storageMounts}
                rowKey={(mount) => mount.mount}
                columns={[
                  {
                    id: "mount",
                    header: "Mount",
                    mono: true,
                    render: (mount) => mount.mount,
                  },
                  {
                    id: "filesystem",
                    header: "FS",
                    muted: true,
                    truncate: true,
                    render: (mount) => mount.filesystem,
                  },
                  {
                    id: "used",
                    header: crmLang === "ru" ? "Использовано" : "Used",
                    render: (mount) => `${mount.usedGb} GB`,
                  },
                  {
                    id: "total",
                    header: crmLang === "ru" ? "Всего" : "Total",
                    muted: true,
                    render: (mount) => `${mount.totalGb} GB`,
                  },
                  {
                    id: "percent",
                    header: crmLang === "ru" ? "Заполнено" : "Used %",
                    render: (mount) => <StorageMeter value={mount.usedPercent} />,
                  },
                ]}
              />
            )}
          </PlatformCard>
        </section>
      )}

      {tab === "database" && (
        <section className="crm-page__block">
          <PlatformCard
            icon={faDatabase}
            title={crmLang === "ru" ? "Базы данных проекта" : "Project databases"}
            subtitle={`${projectData!.databaseInstances.length} ${crmLang === "ru" ? "инстансов" : "instances"}`}
          >
            {!metrics?.docker.available ? (
              <EmptyState icon={faServer} title={crmLang === "ru" ? "Docker недоступен" : "Docker unavailable"} />
            ) : projectData!.databaseInstances.length === 0 ? (
              <EmptyState
                icon={faDatabase}
                title={crmLang === "ru" ? "Контейнеры БД не найдены" : "No database containers found"}
                description={
                  crmLang === "ru"
                    ? "DB-контейнеры с именем, связанным с проектом, не обнаружены."
                    : "No DB containers linked to this project were found."
                }
              />
            ) : (
              <PlatformRecordTable
                template="1fr 0.75fr 0.55fr 1fr"
                rows={projectData!.databaseInstances}
                rowKey={(instance) => instance.id}
                columns={[
                  {
                    id: "name",
                    header: crmLang === "ru" ? "Контейнер" : "Container",
                    mono: true,
                    render: (instance) => instance.name,
                  },
                  {
                    id: "engine",
                    header: crmLang === "ru" ? "Движок" : "Engine",
                    render: (instance) => instance.engine,
                  },
                  {
                    id: "status",
                    header: crmLang === "ru" ? "Статус" : "Status",
                    render: (instance) => (
                      <StatusPill
                        label={instance.state}
                        tone={
                          instance.state === "running" ? "healthy" : instance.state === "stopped" ? "warning" : "neutral"
                        }
                      />
                    ),
                  },
                  {
                    id: "ports",
                    header: crmLang === "ru" ? "Порты" : "Ports",
                    muted: true,
                    mono: true,
                    truncate: true,
                    render: (instance) => instance.ports || "—",
                  },
                ]}
              />
            )}
          </PlatformCard>
        </section>
      )}

      {tab === "logs" && (
        <section className="crm-page__block">
          <article className="crm-panel crm-panel--static crm-project-page__log crm-logs-panel">
            <header className="crm-section-head">
              <div>
                <h3>{crmLang === "ru" ? "Логи проекта" : "Project logs"}</h3>
                <p className="crm-muted">
                  {projectData!.logs.length} {crmLang === "ru" ? "записей" : "entries"}
                </p>
              </div>
            </header>
            <PlatformLogTable
              crmLang={crmLang}
              logs={projectData!.logs}
              className="crm-platform-log crm-project-log"
              searchPlaceholder={crmLang === "ru" ? "Поиск по логам…" : "Search logs…"}
            />
          </article>
        </section>
      )}

      {tab === "monitoring" && (
        <section className="crm-page__block crm-project-page__stack">
          <div className="dv-stat-strip crm-project-page__stats">
            <div className="dv-stat-strip__cell">
              <span className="dv-stat-strip__label">{crmLang === "ru" ? "Состояние" : "Health"}</span>
              <strong className="dv-stat-strip__value">{monitorHealthLabel(projectData!.monitorHealth)}</strong>
              <StatusPill
                label={monitorHealthLabel(projectData!.monitorHealth)}
                tone={
                  projectData!.monitorHealth === "healthy"
                    ? "healthy"
                    : projectData!.monitorHealth === "degraded"
                      ? "warning"
                      : "critical"
                }
              />
            </div>
            <div className="dv-stat-strip__cell">
              <span className="dv-stat-strip__label">{crmLang === "ru" ? "Алерты" : "Alerts"}</span>
              <strong className="dv-stat-strip__value">{projectData!.alerts.length}</strong>
            </div>
            <div className="dv-stat-strip__cell">
              <span className="dv-stat-strip__label">{crmLang === "ru" ? "Контейнеры" : "Containers"}</span>
              <strong className="dv-stat-strip__value">
                {runningContainers}/{projectContainers.length}
              </strong>
              <span className="dv-stat-strip__hint">running</span>
            </div>
            <div className="dv-stat-strip__cell">
              <span className="dv-stat-strip__label">SSL</span>
              <strong className="dv-stat-strip__value">{projectData!.sslCertificates.length}</strong>
            </div>
          </div>

          <PlatformCard icon={faBell} title={crmLang === "ru" ? "Алерты проекта" : "Project alerts"}>
            {projectData!.alerts.length === 0 ? (
              <EmptyState
                icon={faBell}
                title={crmLang === "ru" ? "Алертов нет" : "No alerts"}
                description={
                  crmLang === "ru"
                    ? "По доменам, контейнерам и БД проекта проблем не обнаружено."
                    : "No issues detected for this project's domains, containers, or databases."
                }
              />
            ) : (
              <PlatformRecordTable
                template="0.65fr 0.75fr 1.2fr 1fr"
                rows={projectData!.alerts}
                rowKey={(alert) => alert.id}
                columns={[
                  {
                    id: "severity",
                    header: crmLang === "ru" ? "Уровень" : "Severity",
                    render: (alert) => (
                      <StatusPill
                        label={alertSeverityLabel(alert.severity)}
                        tone={
                          alert.severity === "critical"
                            ? "critical"
                            : alert.severity === "warning"
                              ? "warning"
                              : "neutral"
                        }
                      />
                    ),
                  },
                  {
                    id: "category",
                    header: crmLang === "ru" ? "Категория" : "Category",
                    muted: true,
                    render: (alert) => alert.category,
                  },
                  {
                    id: "message",
                    header: crmLang === "ru" ? "Сообщение" : "Message",
                    render: (alert) => alert.message,
                  },
                  {
                    id: "detail",
                    header: crmLang === "ru" ? "Детали" : "Detail",
                    muted: true,
                    truncate: true,
                    render: (alert) => alert.detail ?? "—",
                  },
                ]}
              />
            )}
          </PlatformCard>

          <PlatformCard title={crmLang === "ru" ? "Контейнеры" : "Containers"}>
            {projectContainers.length === 0 ? (
              <EmptyState icon={faServer} title={crmLang === "ru" ? "Контейнеры не найдены" : "No containers found"} />
            ) : (
              <PlatformRecordTable
                template="1.15fr 1.45fr 0.8fr"
                rows={projectContainers}
                rowKey={(container) => container.id}
                columns={[
                  {
                    id: "name",
                    header: crmLang === "ru" ? "Имя" : "Name",
                    mono: true,
                    render: (container) => container.name,
                  },
                  {
                    id: "image",
                    header: crmLang === "ru" ? "Образ" : "Image",
                    muted: true,
                    truncate: true,
                    render: (container) => container.image,
                  },
                  {
                    id: "status",
                    header: crmLang === "ru" ? "Статус" : "Status",
                    render: (container) => (
                      <StatusPill
                        label={container.state}
                        tone={
                          container.state === "running" ? "healthy" : container.state === "stopped" ? "warning" : "neutral"
                        }
                      />
                    ),
                  },
                ]}
              />
            )}
          </PlatformCard>
        </section>
      )}

      {tab === "backups" && (
        <section className="crm-page__block crm-project-page__stack">
          <PlatformCard
            title={crmLang === "ru" ? "Точки восстановления" : "Recovery points"}
            subtitle={
              crmLang === "ru"
                ? "Тома данных и недавние деплои проекта"
                : "Data volumes and recent project deploys"
            }
          >
            {site.prodPath ? <InfoRow label={crmLang === "ru" ? "Prod path" : "Prod path"} value={site.prodPath} /> : null}
            {projectData!.backupVolumes.length === 0 && projectData!.deployments.length === 0 ? (
              <EmptyState
                icon={faHardDrive}
                title={crmLang === "ru" ? "Бэкапы не найдены" : "No backups found"}
                description={
                  crmLang === "ru"
                    ? "Нет связанных томов данных или записей деплоя для этого проекта."
                    : "No linked data volumes or deploy records for this project."
                }
              />
            ) : null}
          </PlatformCard>

          {projectData!.backupVolumes.length > 0 ? (
            <PlatformCard title={crmLang === "ru" ? "Тома данных" : "Data volumes"}>
              <PlatformRecordTable
                template="1.1fr 0.55fr 1.45fr"
                rows={projectData!.backupVolumes}
                rowKey={(volume) => volume.name}
                columns={[
                  {
                    id: "name",
                    header: crmLang === "ru" ? "Том" : "Volume",
                    mono: true,
                    render: (volume) => volume.name,
                  },
                  {
                    id: "driver",
                    header: "Driver",
                    muted: true,
                    render: (volume) => volume.driver,
                  },
                  {
                    id: "mountpoint",
                    header: crmLang === "ru" ? "Mountpoint" : "Mountpoint",
                    muted: true,
                    truncate: true,
                    render: (volume) => volume.mountpoint || "—",
                  },
                ]}
              />
            </PlatformCard>
          ) : null}

          {projectData!.deployments.length > 0 ? (
            <PlatformCard title={crmLang === "ru" ? "Недавние деплои" : "Recent deploys"}>
              <PlatformRecordTable
                template="0.75fr 1fr 0.55fr 0.95fr 0.95fr"
                rows={projectData!.deployments}
                rowKey={(item) => item.id}
                columns={[
                  {
                    id: "action",
                    header: crmLang === "ru" ? "Действие" : "Action",
                    mono: true,
                    render: (item) => item.action,
                  },
                  {
                    id: "target",
                    header: crmLang === "ru" ? "Цель" : "Target",
                    render: (item) => item.target ?? "—",
                  },
                  {
                    id: "status",
                    header: crmLang === "ru" ? "Статус" : "Status",
                    render: (item) => (
                      <StatusPill label={item.ok ? "OK" : "Error"} tone={item.ok ? "healthy" : "critical"} />
                    ),
                  },
                  {
                    id: "actor",
                    header: crmLang === "ru" ? "Оператор" : "Actor",
                    muted: true,
                    render: (item) => item.actorName ?? "—",
                  },
                  {
                    id: "time",
                    header: crmLang === "ru" ? "Время" : "Time",
                    muted: true,
                    render: (item) =>
                      new Intl.DateTimeFormat(locale, { dateStyle: "short", timeStyle: "short" }).format(
                        new Date(item.createdAt)
                      ),
                  },
                ]}
              />
            </PlatformCard>
          ) : null}
        </section>
      )}

      {!connectedTabs.has(tab) && (
        <section className="crm-page__block">
          <EmptyState
            icon={faGlobe}
            title={crmLang === "ru" ? "Скоро" : "Coming soon"}
            description={
              crmLang === "ru"
                ? `Раздел «${projectDetailTabLabel(tab, crmLang)}» будет подключён к API проекта.`
                : `The "${projectDetailTabLabel(tab, crmLang)}" section will connect to the project API.`
            }
          />
        </section>
      )}
    </PlatformPage>
  );
}
