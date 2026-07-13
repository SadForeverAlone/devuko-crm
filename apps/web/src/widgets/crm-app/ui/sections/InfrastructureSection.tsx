import {
  faBox,
  faDatabase,
  faGaugeHigh,
  faGlobe,
  faHardDrive,
  faLayerGroup,
  faLock,
  faNetworkWired,
  faServer,
} from "@fortawesome/free-solid-svg-icons";
import type { CrmPlatformMetrics, CrmSite } from "@/entities/crm";
import {
  EmptyState,
  InfrastructureDomainsPanel,
  PlatformCard,
  PlatformPage,
  PlatformRecordTable,
  StatusPill,
  formatUptime,
  groupContainersBySite,
  groupItemsBySiteDomains,
  groupResourcesBySiteName,
  sitePortsMeta,
} from "@/shared/ui/platform";
import type { InfrastructureSection } from "../../model/platform-nav";
import {
  infrastructureSectionGroups,
  infrastructureSectionLabel,
  infrastructureSections,
} from "../../model/platform-nav";
import type { CrmLang } from "../../model/types";
import { formatStoragePathLabel } from "../../model/lib";
import { SiteStatusBadge } from "./SiteStatusBadge";
import { PlatformSectionPicker } from "./PlatformSectionPicker";

type InfrastructureSectionProps = {
  crmLang: CrmLang;
  section: InfrastructureSection;
  metrics: CrmPlatformMetrics | null;
  sites: CrmSite[];
  onNavigateSection: (section: InfrastructureSection) => void;
};

const dockerTemplate = "1.15fr 1.45fr 0.8fr 1fr";
const sslTemplate = "1.2fr 0.55fr 1fr 0.75fr";
const volumeTemplate = "1.1fr 0.55fr 1.45fr";
const networkTemplate = "0.7fr 1.1fr 0.55fr 0.55fr";
const imageTemplate = "1.1fr 0.55fr 0.55fr 0.75fr";
const storageTemplate = "0.9fr 1fr 0.55fr 0.55fr 0.75fr";
const databaseTemplate = "1fr 0.75fr 0.55fr 1fr";

const infrastructureSectionIcons = {
  overview: faGaugeHigh,
  servers: faServer,
  containers: faBox,
  volumes: faHardDrive,
  networks: faNetworkWired,
  images: faLayerGroup,
  storage: faHardDrive,
  databases: faDatabase,
  domains: faGlobe,
  ssl: faLock,
} as const;

function sslStatusLabel(status: string, crmLang: CrmLang) {
  if (status === "missing") return crmLang === "ru" ? "Не найден" : "Missing";
  if (status === "healthy") return "OK";
  if (status === "warning") return crmLang === "ru" ? "Скоро истечёт" : "Expiring";
  return crmLang === "ru" ? "Критично" : "Critical";
}

function sslStatusTone(status: string) {
  if (status === "healthy") return "healthy" as const;
  if (status === "warning") return "warning" as const;
  if (status === "missing") return "neutral" as const;
  return "critical" as const;
}

function platformGroupTitle(site: CrmSite | null, crmLang: CrmLang) {
  if (site) return site.domain;
  return crmLang === "ru" ? "Платформа" : "Platform";
}

function containerStateTone(state: string) {
  if (state === "running") return "healthy" as const;
  if (state === "stopped") return "warning" as const;
  return "neutral" as const;
}

function StorageMeter({ value }: { value: number }) {
  return (
    <div className="crm-infra-meter">
      <div className="crm-infra-meter__track">
        <div className="crm-infra-meter__bar" style={{ width: `${Math.min(100, Math.max(0, value))}%` }} />
      </div>
      <span>{value}%</span>
    </div>
  );
}

function DockerUnavailable({ crmLang }: { crmLang: CrmLang }) {
  return (
    <EmptyState
      icon={faServer}
      title={crmLang === "ru" ? "Docker недоступен" : "Docker unavailable"}
      description={
        crmLang === "ru"
          ? "API не может подключиться к Docker на этом сервере."
          : "API cannot connect to Docker on this server."
      }
    />
  );
}

export function InfrastructureSectionView({
  crmLang,
  section,
  metrics,
  sites,
  onNavigateSection,
}: InfrastructureSectionProps) {
  const title = crmLang === "ru" ? "Инфраструктура" : "Infrastructure";
  const docker = metrics?.docker;
  const containerGroups = docker?.available ? groupContainersBySite(sites, docker.containers) : [];
  const sslGroups = groupItemsBySiteDomains(
    sites,
    metrics?.sslCertificates ?? [],
    (cert) => cert.domain,
    (cert) => cert.domain
  );
  const volumeGroups = docker?.available
    ? groupResourcesBySiteName(sites, docker.volumes ?? [], (volume) => volume.name, (volume) => volume.name)
    : [];
  const networkGroups = docker?.available
    ? groupResourcesBySiteName(sites, docker.networks ?? [], (network) => network.name, (network) => network.id)
    : [];
  const imageGroups = docker?.available
    ? groupResourcesBySiteName(
        sites,
        docker.images ?? [],
        (image) => `${image.repository}:${image.tag}`,
        (image) => image.id
      )
    : [];
  const databaseGroups = docker?.available
    ? groupResourcesBySiteName(
        sites,
        metrics?.databaseInstances ?? [],
        (instance) => instance.name,
        (instance) => instance.id
      )
    : [];

  return (
    <PlatformPage
      title={title}
      subtitle={
        <span className="crm-project-page__meta">
          <span className="crm-project-page__meta-path">
            {crmLang === "ru"
              ? "Серверы, Docker, контейнеры и ресурсы"
              : "Servers, Docker, containers and resources"}
          </span>
          <span className="crm-project-page__meta-section">{infrastructureSectionLabel(section, crmLang)}</span>
        </span>
      }
      actions={
        <div className="crm-project-page__actions">
          <PlatformSectionPicker
            crmLang={crmLang}
            value={section}
            onChange={onNavigateSection}
            groups={infrastructureSectionGroups}
            options={infrastructureSections.map((item) => ({
              key: item.key,
              label: item.label,
              icon: infrastructureSectionIcons[item.key],
            }))}
            panelAriaLabel={{ ru: "Раздел инфраструктуры", en: "Infrastructure section" }}
          />
        </div>
      }
    >
      {(section === "overview" || section === "servers") && metrics ? (
        <PlatformCard
          icon={faServer}
          title={crmLang === "ru" ? "Сервер платформы" : "Platform server"}
          subtitle={metrics.serverInfo.hostname}
        >
          <dl className="crm-infra-spec">
            <div className="crm-infra-spec__row">
              <dt>{crmLang === "ru" ? "ОС" : "OS"}</dt>
              <dd>{metrics.serverInfo.platform}</dd>
            </div>
            <div className="crm-infra-spec__row">
              <dt>{crmLang === "ru" ? "Архитектура" : "Architecture"}</dt>
              <dd>{metrics.serverInfo.arch}</dd>
            </div>
            <div className="crm-infra-spec__row">
              <dt>{crmLang === "ru" ? "Uptime" : "Uptime"}</dt>
              <dd>{formatUptime(metrics.serverInfo.uptimeSeconds, crmLang)}</dd>
            </div>
            <div className="crm-infra-spec__row">
              <dt>{crmLang === "ru" ? "Timezone" : "Timezone"}</dt>
              <dd>{metrics.serverTimeZone}</dd>
            </div>
          </dl>

          <div className="crm-infra-stats">
            <article className="crm-infra-stat">
              <p>CPU</p>
              <h4>{metrics.cpuUsage?.usedPercent != null ? `${metrics.cpuUsage.usedPercent}%` : "—"}</h4>
            </article>
            <article className="crm-infra-stat">
              <p>RAM</p>
              <h4>{metrics.memoryUsage?.usedPercent != null ? `${metrics.memoryUsage.usedPercent}%` : "—"}</h4>
              <span>
                {metrics.memoryUsage
                  ? `${metrics.memoryUsage.usedMb} / ${metrics.memoryUsage.totalMb} MB`
                  : "—"}
              </span>
            </article>
            <article className="crm-infra-stat">
              <p>{crmLang === "ru" ? "Диск /srv" : "Disk /srv"}</p>
              <h4>{metrics.storageUsage?.usedPercent != null ? `${metrics.storageUsage.usedPercent}%` : "—"}</h4>
              <span>{formatStoragePathLabel(metrics.storageUsage?.path, crmLang)}</span>
            </article>
            <article className="crm-infra-stat">
              <p>Docker</p>
              <h4>{docker?.available ? crmLang === "ru" ? "Online" : "Online" : crmLang === "ru" ? "Offline" : "Offline"}</h4>
              <span>
                {docker?.available
                  ? `${docker.runningCount} running · ${docker.stoppedCount} stopped`
                  : "—"}
              </span>
            </article>
          </div>
        </PlatformCard>
      ) : null}

      {(section === "overview" || section === "containers") && docker?.available ? (
        <PlatformCard
          icon={faBox}
          title={crmLang === "ru" ? "Контейнеры Docker" : "Docker containers"}
          subtitle={`${docker.runningCount} running · ${docker.stoppedCount} stopped`}
        >
          {docker.containers.length === 0 ? (
            <EmptyState
              icon={faServer}
              title={crmLang === "ru" ? "Контейнеры не найдены" : "No containers found"}
            />
          ) : (
            <PlatformRecordTable
              template={dockerTemplate}
              groups={containerGroups.map(({ site, rows }) => ({
                id: site?.id ?? "platform",
                title: platformGroupTitle(site, crmLang),
                meta: site ? sitePortsMeta(site) : crmLang === "ru" ? "Системные сервисы CRM" : "CRM system services",
                action: site ? <SiteStatusBadge status={site.status} lang={crmLang} /> : null,
                rows,
              }))}
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
                    <StatusPill label={container.state} tone={containerStateTone(container.state)} />
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
      ) : null}

      {section === "containers" && !docker?.available ? <DockerUnavailable crmLang={crmLang} /> : null}

      {(section === "overview" || section === "domains") && (
        <InfrastructureDomainsPanel
          crmLang={crmLang}
          sites={sites}
          domainRegistrations={metrics?.domainRegistrations}
        />
      )}

      {section === "ssl" && metrics ? (
        <PlatformCard
          icon={faLock}
          title="SSL"
          subtitle={
            crmLang === "ru"
              ? "Сертификаты nginx / Let's Encrypt"
              : "nginx / Let's Encrypt certificates"
          }
        >
          {(metrics.sslCertificates ?? []).length === 0 ? (
            <p className="crm-muted">{crmLang === "ru" ? "Сертификаты не найдены" : "No certificates found"}</p>
          ) : (
            <PlatformRecordTable
              template={sslTemplate}
              groups={sslGroups.map(({ site, rows }) => ({
                id: site?.id ?? "platform",
                title: platformGroupTitle(site, crmLang),
                meta: site ? sitePortsMeta(site) : crmLang === "ru" ? "CRM и прочие домены" : "CRM and other domains",
                action: site ? <SiteStatusBadge status={site.status} lang={crmLang} /> : null,
                rows,
              }))}
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
      ) : null}

      {section === "volumes" && docker?.available ? (
        <PlatformCard
          icon={faHardDrive}
          title={crmLang === "ru" ? "Тома Docker" : "Docker volumes"}
          subtitle={`${docker.volumes?.length ?? 0} ${crmLang === "ru" ? "томов" : "volumes"}`}
        >
          {(docker.volumes ?? []).length === 0 ? (
            <EmptyState
              icon={faDatabase}
              title={crmLang === "ru" ? "Тома не найдены" : "No volumes found"}
            />
          ) : (
            <PlatformRecordTable
              template={volumeTemplate}
              groups={volumeGroups.map(({ site, rows }) => ({
                id: site?.id ?? "platform",
                title: platformGroupTitle(site, crmLang),
                meta: site ? sitePortsMeta(site) : crmLang === "ru" ? "Общие тома" : "Shared volumes",
                action: site ? <SiteStatusBadge status={site.status} lang={crmLang} /> : null,
                rows,
              }))}
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
                  header: crmLang === "ru" ? "Driver" : "Driver",
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
      ) : null}

      {section === "volumes" && !docker?.available ? <DockerUnavailable crmLang={crmLang} /> : null}

      {section === "networks" && docker?.available ? (
        <PlatformCard
          icon={faNetworkWired}
          title={crmLang === "ru" ? "Сети Docker" : "Docker networks"}
          subtitle={`${docker.networks?.length ?? 0} ${crmLang === "ru" ? "сетей" : "networks"}`}
        >
          {(docker.networks ?? []).length === 0 ? (
            <EmptyState icon={faServer} title={crmLang === "ru" ? "Сети не найдены" : "No networks found"} />
          ) : (
            <PlatformRecordTable
              template={networkTemplate}
              groups={networkGroups.map(({ site, rows }) => ({
                id: site?.id ?? "platform",
                title: platformGroupTitle(site, crmLang),
                meta: site ? sitePortsMeta(site) : crmLang === "ru" ? "Системные сети" : "System networks",
                action: site ? <SiteStatusBadge status={site.status} lang={crmLang} /> : null,
                rows,
              }))}
              rowKey={(network) => network.id}
              columns={[
                {
                  id: "name",
                  header: crmLang === "ru" ? "Имя" : "Name",
                  mono: true,
                  render: (network) => network.name,
                },
                {
                  id: "driver",
                  header: "Driver",
                  muted: true,
                  render: (network) => network.driver,
                },
                {
                  id: "scope",
                  header: "Scope",
                  muted: true,
                  render: (network) => network.scope,
                },
                {
                  id: "id",
                  header: "ID",
                  mono: true,
                  truncate: true,
                  render: (network) => network.id.slice(0, 12),
                },
              ]}
            />
          )}
        </PlatformCard>
      ) : null}

      {section === "networks" && !docker?.available ? <DockerUnavailable crmLang={crmLang} /> : null}

      {section === "images" && docker?.available ? (
        <PlatformCard
          icon={faLayerGroup}
          title={crmLang === "ru" ? "Образы Docker" : "Docker images"}
          subtitle={`${docker.images?.length ?? 0} ${crmLang === "ru" ? "образов" : "images"}`}
        >
          {(docker.images ?? []).length === 0 ? (
            <EmptyState icon={faServer} title={crmLang === "ru" ? "Образы не найдены" : "No images found"} />
          ) : (
            <PlatformRecordTable
              template={imageTemplate}
              groups={imageGroups.map(({ site, rows }) => ({
                id: site?.id ?? "platform",
                title: platformGroupTitle(site, crmLang),
                meta: site ? sitePortsMeta(site) : crmLang === "ru" ? "Базовые образы" : "Base images",
                action: site ? <SiteStatusBadge status={site.status} lang={crmLang} /> : null,
                rows,
              }))}
              rowKey={(image) => image.id}
              columns={[
                {
                  id: "repository",
                  header: crmLang === "ru" ? "Repository" : "Repository",
                  mono: true,
                  truncate: true,
                  render: (image) => image.repository,
                },
                {
                  id: "tag",
                  header: "Tag",
                  muted: true,
                  render: (image) => image.tag,
                },
                {
                  id: "size",
                  header: crmLang === "ru" ? "Размер" : "Size",
                  render: (image) => image.size,
                },
                {
                  id: "created",
                  header: crmLang === "ru" ? "Создан" : "Created",
                  muted: true,
                  render: (image) => image.createdSince,
                },
              ]}
            />
          )}
        </PlatformCard>
      ) : null}

      {section === "images" && !docker?.available ? <DockerUnavailable crmLang={crmLang} /> : null}

      {section === "storage" && metrics ? (
        <PlatformCard
          icon={faHardDrive}
          title={crmLang === "ru" ? "Хранилище" : "Storage"}
          subtitle={
            crmLang === "ru"
              ? "Дисковые разделы и использование"
              : "Disk mounts and usage"
          }
        >
          {(metrics.storageMounts ?? []).length === 0 ? (
            <EmptyState
              icon={faDatabase}
              title={crmLang === "ru" ? "Разделы не найдены" : "No mounts found"}
            />
          ) : (
            <PlatformRecordTable
              template={storageTemplate}
              rows={metrics.storageMounts}
              rowKey={(mount) => mount.mount}
              columns={[
                {
                  id: "mount",
                  header: crmLang === "ru" ? "Mount" : "Mount",
                  mono: true,
                  render: (mount) => mount.mount,
                },
                {
                  id: "filesystem",
                  header: crmLang === "ru" ? "FS" : "FS",
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
      ) : null}

      {section === "databases" && metrics ? (
        <>
          <PlatformCard
            icon={faDatabase}
            title={crmLang === "ru" ? "CRM PostgreSQL" : "CRM PostgreSQL"}
            subtitle={
              metrics.platformDatabase.available
                ? metrics.platformDatabase.version
                : crmLang === "ru"
                  ? "Недоступно"
                  : "Unavailable"
            }
          >
            {metrics.platformDatabase.available ? (
              <dl className="crm-infra-spec">
                <div className="crm-infra-spec__row">
                  <dt>{crmLang === "ru" ? "База" : "Database"}</dt>
                  <dd>{metrics.platformDatabase.database}</dd>
                </div>
                <div className="crm-infra-spec__row">
                  <dt>{crmLang === "ru" ? "Размер" : "Size"}</dt>
                  <dd>{metrics.platformDatabase.sizeMb} MB</dd>
                </div>
                <div className="crm-infra-spec__row">
                  <dt>{crmLang === "ru" ? "Подключения" : "Connections"}</dt>
                  <dd>{metrics.platformDatabase.connections}</dd>
                </div>
                <div className="crm-infra-spec__row">
                  <dt>{crmLang === "ru" ? "Движок" : "Engine"}</dt>
                  <dd>{metrics.platformDatabase.engine}</dd>
                </div>
              </dl>
            ) : (
              <p className="crm-muted">
                {crmLang === "ru"
                  ? "Не удалось получить статистику CRM PostgreSQL."
                  : "Could not read CRM PostgreSQL statistics."}
              </p>
            )}
          </PlatformCard>

          <PlatformCard
            icon={faDatabase}
            title={crmLang === "ru" ? "DB-контейнеры" : "DB containers"}
            subtitle={`${metrics.databaseInstances.length} ${crmLang === "ru" ? "инстансов" : "instances"}`}
          >
            {metrics.databaseInstances.length === 0 ? (
              <EmptyState
                icon={faDatabase}
                title={crmLang === "ru" ? "Контейнеры БД не найдены" : "No database containers found"}
              />
            ) : (
              <PlatformRecordTable
                template={databaseTemplate}
                groups={databaseGroups.map(({ site, rows }) => ({
                  id: site?.id ?? "platform",
                  title: platformGroupTitle(site, crmLang),
                  meta: site ? sitePortsMeta(site) : crmLang === "ru" ? "Платформенные БД" : "Platform databases",
                  action: site ? <SiteStatusBadge status={site.status} lang={crmLang} /> : null,
                  rows,
                }))}
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
                      <StatusPill label={instance.state} tone={containerStateTone(instance.state)} />
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
        </>
      ) : null}
    </PlatformPage>
  );
}
