import { useEffect, useMemo, useState } from "react";
import { faBell, faGaugeHigh, faServer } from "@fortawesome/free-solid-svg-icons";
import { getCrmPlatformMetrics, type CrmPlatformMetrics, type CrmSite } from "@/entities/crm";
import {
  EmptyState,
  PlatformCard,
  PlatformMetricChart,
  PlatformMetricTile,
  PlatformPage,
  PlatformRecordTable,
  StatusPill,
  formatUptime,
  groupContainersBySite,
} from "@/shared/ui/platform";
import { CrmMeterBar } from "@/shared/ui/crm-meter/CrmMeterBar";
import type { CrmLang } from "@/widgets/crm-app/model/types";
import { crmCopy } from "@/widgets/crm-app/model/i18n";
import { formatStoragePathLabel, getCrmLocaleTag } from "@/widgets/crm-app/model/lib";
import {
  buildMonitorAlerts,
  computeMonitorHealth,
  platformGroupTitle,
  resourceTone,
  type MonitorAlert,
} from "@/features/crm-platform-ops/ui/monitoring.lib";
import { chartSeries, chartTimeLabels, seriesMaxValue, useMetricHistory } from "@/features/crm-platform-ops/ui/useMetricHistory";
import { PlatformSectionPicker } from "./PlatformSectionPicker";

type MonitoringSectionProps = {
  crmLang: CrmLang;
  metrics: CrmPlatformMetrics | null;
  sites: CrmSite[];
};

type MonitoringTab = "overview" | "alerts" | "infrastructure";

const monitoringTabs: Array<{ key: MonitoringTab; label: Record<CrmLang, string> }> = [
  { key: "overview", label: { ru: "Обзор", en: "Overview" } },
  { key: "alerts", label: { ru: "Алерты", en: "Alerts" } },
  { key: "infrastructure", label: { ru: "Инфраструктура", en: "Infrastructure" } },
];

const monitoringTabGroups: Array<{ id: string; label: Record<CrmLang, string>; tabs: MonitoringTab[] }> = [
  { id: "main", label: { ru: "Разделы", en: "Sections" }, tabs: ["overview", "alerts", "infrastructure"] },
];

const monitoringTabIcons = {
  overview: faGaugeHigh,
  alerts: faBell,
  infrastructure: faServer,
} as const;

const alertTemplate = "minmax(0, 0.65fr) minmax(0, 0.75fr) minmax(0, 1.2fr) minmax(0, 1fr)";
const mountTemplate = "minmax(0, 0.9fr) minmax(0, 1fr) minmax(0, 0.55fr) minmax(0, 0.55fr) minmax(0, 0.75fr)";
const containerTemplate = "minmax(0, 1.15fr) minmax(0, 1.45fr) minmax(0, 0.8fr) minmax(0, 1fr)";

function alertSeverityLabel(severity: MonitorAlert["severity"], crmLang: CrmLang) {
  if (severity === "critical") return crmLang === "ru" ? "Критично" : "Critical";
  if (severity === "warning") return crmLang === "ru" ? "Предупр." : "Warning";
  return crmLang === "ru" ? "Инфо" : "Info";
}

function alertSeverityTone(severity: MonitorAlert["severity"]) {
  if (severity === "critical") return "critical" as const;
  if (severity === "warning") return "warning" as const;
  return "neutral" as const;
}

function healthLabel(health: ReturnType<typeof computeMonitorHealth>, crmLang: CrmLang) {
  if (health === "critical") return crmLang === "ru" ? "Критично" : "Critical";
  if (health === "degraded") return crmLang === "ru" ? "Есть риски" : "Degraded";
  return crmLang === "ru" ? "Норма" : "Healthy";
}

function ResourceMeter({ value }: { value: number | null | undefined }) {
  const tone = resourceTone(value);
  const width = value != null ? Math.min(100, Math.max(0, value)) : 0;

  return (
    <div className="crm-infra-meter">
      <div className="crm-infra-meter__track">
        <CrmMeterBar value={width} toneClassName={`crm-infra-meter__bar-rect--${tone}`} />
      </div>
      <span>{value != null ? `${value}%` : "—"}</span>
    </div>
  );
}

export function MonitoringSection({ crmLang, metrics, sites }: MonitoringSectionProps) {
  const ui = crmCopy[crmLang];
  const [tab, setTab] = useState<MonitoringTab>("overview");
  const [liveMetrics, setLiveMetrics] = useState(metrics);
  const locale = getCrmLocaleTag(crmLang);

  useEffect(() => {
    setLiveMetrics(metrics);
  }, [metrics]);

  useEffect(() => {
    let cancelled = false;
    const tick = async () => {
      try {
        const next = await getCrmPlatformMetrics();
        if (!cancelled) setLiveMetrics(next);
      } catch {
        /* keep last snapshot */
      }
    };
    void tick();
    const poll = window.setInterval(() => void tick(), 15_000);
    return () => {
      cancelled = true;
      window.clearInterval(poll);
    };
  }, []);

  const snapshot = liveMetrics ?? metrics;
  const history = useMetricHistory(snapshot);
  const labels = chartTimeLabels(history, locale);
  const cpuSeries = chartSeries(history, "cpu", snapshot?.cpuUsage?.usedPercent ?? null);
  const ramSeries = chartSeries(history, "ram", snapshot?.memoryUsage?.usedPercent ?? null);
  const diskSeries = chartSeries(history, "disk", snapshot?.storageUsage?.usedPercent ?? null);
  const containerSeries = chartSeries(history, "containers", snapshot?.docker?.runningCount ?? null);
  const containerMax = seriesMaxValue(containerSeries, 4);
  const alerts = useMemo(() => buildMonitorAlerts(snapshot, crmLang), [snapshot, crmLang]);
  const health = computeMonitorHealth(alerts);
  const docker = snapshot?.docker;
  const stoppedContainers = (docker?.containers ?? []).filter((container) => container.state !== "running");
  const containerGroups =
    docker?.available && stoppedContainers.length > 0
      ? groupContainersBySite(sites, stoppedContainers)
      : [];
  const collecting = crmLang === "ru" ? "Сбор данных…" : "Collecting data…";

  const currentTab = monitoringTabs.find((item) => item.key === tab);

  return (
    <PlatformPage
      className="crm-page--monitor"
      title={crmLang === "ru" ? "Мониторинг" : "Monitoring"}
      subtitle={
        <span className="crm-project-page__meta">
          <span className="crm-project-page__meta-path">
            {crmLang === "ru"
              ? "Нагрузка, алерты и состояние сервисов"
              : "Load, alerts and service health"}
          </span>
          <span className="crm-project-page__meta-section">{currentTab?.label[crmLang] ?? tab}</span>
        </span>
      }
      actions={
        <div className="crm-project-page__actions">
          <PlatformSectionPicker
            crmLang={crmLang}
            value={tab}
            onChange={setTab}
            groups={monitoringTabGroups}
            options={monitoringTabs.map((item) => ({
              key: item.key,
              label: item.label,
              icon: monitoringTabIcons[item.key],
              badge: item.key === "alerts" ? alerts.length : undefined,
            }))}
            panelAriaLabel={{ ru: "Раздел мониторинга", en: "Monitoring section" }}
          />
          <div className="crm-monitor-actions">
            <span className="crm-monitor-actions__time">
              {new Intl.DateTimeFormat(locale, { dateStyle: "medium", timeStyle: "short" }).format(
                new Date(snapshot?.serverDateTime ?? Date.now())
              )}
              <span className="crm-muted"> · {snapshot?.serverTimeZone ?? "UTC"}</span>
            </span>
            <span className="crm-live-badge">
              <span className="crm-live-dot" aria-hidden />
              {ui.platformAdminStatusOnline}
            </span>
          </div>
        </div>
      }
    >
      <section className={`crm-monitor-status crm-monitor-status--${health}`}>
        <div className="crm-monitor-status__lead">
          <span className="crm-monitor-status__dot" aria-hidden />
          <div>
            <strong>{healthLabel(health, crmLang)}</strong>
            <p>
              {alerts.length > 0
                ? crmLang === "ru"
                  ? `${alerts.length} активных сигналов`
                  : `${alerts.length} active signals`
                : crmLang === "ru"
                  ? "Активных проблем нет"
                  : "No active issues"}
            </p>
          </div>
        </div>
        <div className="crm-monitor-status__meta">
          <span>{snapshot?.serverInfo.hostname ?? "—"}</span>
          <span>{snapshot ? formatUptime(snapshot.serverInfo.uptimeSeconds, crmLang) : "—"}</span>
        </div>
      </section>

      {tab === "overview" ? (
        <section className="crm-monitor-board">
          <PlatformMetricTile
            label="CPU"
            value={snapshot?.cpuUsage?.usedPercent != null ? `${snapshot.cpuUsage.usedPercent}%` : "—"}
            detail={crmLang === "ru" ? "Загрузка процессора" : "Processor load"}
            tone={resourceTone(snapshot?.cpuUsage?.usedPercent)}
            values={cpuSeries}
            color="#a78bfa"
          />
          <PlatformMetricTile
            label="RAM"
            value={snapshot?.memoryUsage?.usedPercent != null ? `${snapshot.memoryUsage.usedPercent}%` : "—"}
            detail={
              snapshot?.memoryUsage
                ? `${snapshot.memoryUsage.usedMb} / ${snapshot.memoryUsage.totalMb} MB`
                : undefined
            }
            tone={resourceTone(snapshot?.memoryUsage?.usedPercent)}
            values={ramSeries}
            color="#60a5fa"
          />
          <PlatformMetricTile
            label={crmLang === "ru" ? "Диск" : "Disk"}
            value={snapshot?.storageUsage?.usedPercent != null ? `${snapshot.storageUsage.usedPercent}%` : "—"}
            detail={formatStoragePathLabel(snapshot?.storageUsage?.path, crmLang)}
            tone={resourceTone(snapshot?.storageUsage?.usedPercent)}
            values={diskSeries}
            color="#fbbf24"
          />
          <PlatformMetricTile
            label={crmLang === "ru" ? "Контейнеры" : "Containers"}
            value={String(docker?.runningCount ?? 0)}
            detail={
              docker
                ? `${docker.stoppedCount} ${crmLang === "ru" ? "остановлено" : "stopped"}`
                : undefined
            }
            tone={docker?.available ? "healthy" : "critical"}
            values={containerSeries}
            color="#4ade80"
            maxValue={containerMax}
          />
        </section>
      ) : null}

      {tab === "overview" ? (
        <div className="crm-monitor-layout">
          <PlatformCard
            className="crm-monitor-layout__charts"
            title={crmLang === "ru" ? "Динамика" : "Trends"}
            subtitle={
              crmLang === "ru"
                ? `История сессии · ${history.length} точек`
                : `Session history · ${history.length} points`
            }
          >
            <div className="crm-monitor-series-grid">
              <PlatformMetricChart title="CPU" values={cpuSeries} labels={labels} color="#a78bfa" emptyLabel={collecting} />
              <PlatformMetricChart
                title="RAM"
                values={ramSeries}
                labels={labels}
                color="#60a5fa"
                emptyLabel={collecting}
              />
              <PlatformMetricChart
                title={crmLang === "ru" ? "Диск" : "Disk"}
                values={diskSeries}
                labels={labels}
                color="#fbbf24"
                emptyLabel={collecting}
              />
              <PlatformMetricChart
                title={crmLang === "ru" ? "Контейнеры" : "Containers"}
                values={containerSeries}
                labels={labels}
                color="#4ade80"
                maxValue={containerMax}
                unit=""
                emptyLabel={collecting}
              />
            </div>
          </PlatformCard>

          <PlatformCard
            className="crm-monitor-layout__alerts"
            title={crmLang === "ru" ? "Алерты" : "Alerts"}
            subtitle={
              alerts.length > 0
                ? crmLang === "ru"
                  ? "Требуют внимания"
                  : "Needs attention"
                : crmLang === "ru"
                  ? "Всё в порядке"
                  : "All clear"
            }
          >
            {alerts.length === 0 ? (
              <EmptyState
                icon={faBell}
                title={crmLang === "ru" ? "Алертов нет" : "No alerts"}
                description={
                  crmLang === "ru" ? "Проверки прошли успешно." : "All checks passed."
                }
              />
            ) : (
              <PlatformRecordTable
                template={alertTemplate}
                rows={alerts.slice(0, 8)}
                rowKey={(item) => item.id}
                columns={[
                  {
                    id: "severity",
                    header: crmLang === "ru" ? "Уровень" : "Level",
                    render: (item) => (
                      <StatusPill
                        label={alertSeverityLabel(item.severity, crmLang)}
                        tone={alertSeverityTone(item.severity)}
                      />
                    ),
                  },
                  {
                    id: "category",
                    header: crmLang === "ru" ? "Категория" : "Category",
                    muted: true,
                    render: (item) => item.category,
                  },
                  {
                    id: "message",
                    header: crmLang === "ru" ? "Сообщение" : "Message",
                    truncate: true,
                    render: (item) => item.message,
                  },
                  {
                    id: "detail",
                    header: crmLang === "ru" ? "Детали" : "Details",
                    mono: true,
                    muted: true,
                    render: (item) => item.detail ?? "—",
                  },
                ]}
              />
            )}
          </PlatformCard>
        </div>
      ) : null}

      {tab === "alerts" ? (
        <div className="crm-monitor-panel">
          <PlatformCard
            className="crm-monitor-panel__card"
            title={crmLang === "ru" ? "Все алерты" : "All alerts"}
          subtitle={
            crmLang === "ru"
              ? "SSL, домены, контейнеры, ресурсы и деплои"
              : "SSL, domains, containers, resources and deploys"
          }
        >
          {alerts.length === 0 ? (
            <EmptyState
              icon={faBell}
              title={crmLang === "ru" ? "Алертов нет" : "No alerts"}
              description={
                crmLang === "ru" ? "Мониторинг не обнаружил проблем." : "Monitoring did not detect any issues."
              }
            />
          ) : (
            <PlatformRecordTable
              template={alertTemplate}
              rows={alerts}
              rowKey={(item) => item.id}
              columns={[
                {
                  id: "severity",
                  header: crmLang === "ru" ? "Уровень" : "Level",
                  render: (item) => (
                    <StatusPill
                      label={alertSeverityLabel(item.severity, crmLang)}
                      tone={alertSeverityTone(item.severity)}
                    />
                  ),
                },
                {
                  id: "category",
                  header: crmLang === "ru" ? "Категория" : "Category",
                  muted: true,
                  render: (item) => item.category,
                },
                {
                  id: "message",
                  header: crmLang === "ru" ? "Сообщение" : "Message",
                  truncate: true,
                  render: (item) => item.message,
                },
                {
                  id: "detail",
                  header: crmLang === "ru" ? "Детали" : "Details",
                  mono: true,
                  muted: true,
                  truncate: true,
                  render: (item) => item.detail ?? "—",
                },
              ]}
            />
          )}
        </PlatformCard>
        </div>
      ) : null}

      {tab === "infrastructure" ? (
        <div className="crm-monitor-panel">
          <div className="crm-monitor-panel__stack">
          <PlatformCard
            className="crm-monitor-panel__card"
            title={crmLang === "ru" ? "Сервер" : "Server"}
            subtitle={snapshot?.serverInfo.hostname ?? "—"}
          >
            {snapshot ? (
              <dl className="crm-infra-spec crm-infra-spec--compact">
                <div className="crm-infra-spec__row">
                  <dt>{crmLang === "ru" ? "ОС" : "OS"}</dt>
                  <dd>
                    {snapshot.serverInfo.platform} · {snapshot.serverInfo.arch}
                  </dd>
                </div>
                <div className="crm-infra-spec__row">
                  <dt>Docker</dt>
                  <dd>
                    <StatusPill
                      label={docker?.available ? ui.platformAdminStatusOnline : ui.platformAdminStatusOffline}
                      tone={docker?.available ? "healthy" : "critical"}
                    />
                  </dd>
                </div>
                <div className="crm-infra-spec__row">
                  <dt>{crmLang === "ru" ? "CRM DB" : "CRM DB"}</dt>
                  <dd>
                    <StatusPill
                      label={
                        snapshot.platformDatabase.available
                          ? snapshot.platformDatabase.engine
                          : crmLang === "ru"
                            ? "Недоступна"
                            : "Unavailable"
                      }
                      tone={snapshot.platformDatabase.available ? "healthy" : "critical"}
                    />
                  </dd>
                </div>
              </dl>
            ) : null}
          </PlatformCard>

          <PlatformCard
            className="crm-monitor-panel__card"
            title={crmLang === "ru" ? "Точки монтирования" : "Mount points"}
            subtitle={crmLang === "ru" ? "Диски и файловые системы" : "Disks and filesystems"}
          >
            {(snapshot?.storageMounts ?? []).length === 0 ? (
              <EmptyState
                icon={faServer}
                title={crmLang === "ru" ? "Нет данных" : "No data"}
                description={
                  crmLang === "ru"
                    ? "Информация о дисках недоступна."
                    : "Disk information is unavailable."
                }
              />
            ) : (
              <PlatformRecordTable
                template={mountTemplate}
                rows={snapshot?.storageMounts ?? []}
                rowKey={(item) => item.mount}
                columns={[
                  {
                    id: "mount",
                    header: crmLang === "ru" ? "Точка" : "Mount",
                    mono: true,
                    truncate: true,
                    render: (item) => item.mount,
                  },
                  {
                    id: "filesystem",
                    header: crmLang === "ru" ? "ФС" : "FS",
                    muted: true,
                    truncate: true,
                    render: (item) => item.filesystem,
                  },
                  {
                    id: "used",
                    header: crmLang === "ru" ? "Занято" : "Used",
                    render: (item) => `${item.usedGb} GB`,
                  },
                  {
                    id: "total",
                    header: crmLang === "ru" ? "Всего" : "Total",
                    muted: true,
                    render: (item) => `${item.totalGb} GB`,
                  },
                  {
                    id: "meter",
                    header: crmLang === "ru" ? "Загрузка" : "Load",
                    render: (item) => <ResourceMeter value={item.usedPercent} />,
                  },
                ]}
              />
            )}
          </PlatformCard>

          <PlatformCard
            className="crm-monitor-panel__card"
            title={crmLang === "ru" ? "Docker" : "Docker"}
            subtitle={
              docker?.available
                ? `${docker.runningCount} running · ${docker.stoppedCount} stopped`
                : crmLang === "ru"
                  ? "Недоступен"
                  : "Unavailable"
            }
          >
            {!docker?.available ? (
              <EmptyState
                icon={faServer}
                title={crmLang === "ru" ? "Docker недоступен" : "Docker unavailable"}
                description={
                  crmLang === "ru"
                    ? "API не может подключиться к Docker."
                    : "API cannot connect to Docker."
                }
              />
            ) : stoppedContainers.length === 0 ? (
              <EmptyState
                icon={faServer}
                title={crmLang === "ru" ? "Все контейнеры запущены" : "All containers running"}
                description={
                  crmLang === "ru"
                    ? "Остановленных контейнеров нет."
                    : "No stopped containers."
                }
              />
            ) : (
              <PlatformRecordTable
                template={containerTemplate}
                groups={containerGroups.map((group) => ({
                  id: group.site?.id ?? "platform",
                  title: platformGroupTitle(group.site, crmLang),
                  rows: group.rows,
                }))}
                rowKey={(item) => item.id}
                columns={[
                  {
                    id: "name",
                    header: crmLang === "ru" ? "Контейнер" : "Container",
                    mono: true,
                    render: (item) => item.name,
                  },
                  {
                    id: "image",
                    header: "Image",
                    muted: true,
                    render: (item) => item.image,
                  },
                  {
                    id: "state",
                    header: crmLang === "ru" ? "Состояние" : "State",
                    render: (item) => (
                      <StatusPill
                        label={item.state}
                        tone={item.state === "running" ? "healthy" : "warning"}
                      />
                    ),
                  },
                  {
                    id: "ports",
                    header: "Ports",
                    mono: true,
                    muted: true,
                    render: (item) => item.ports || "—",
                  },
                ]}
              />
            )}
          </PlatformCard>
          </div>
        </div>
      ) : null}
    </PlatformPage>
  );
}
