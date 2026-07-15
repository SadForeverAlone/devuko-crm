import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faArrowRight,
  faBox,
  faClock,
  faFolderTree,
  faPlus,
  faRocket,
} from "@fortawesome/free-solid-svg-icons";
import type { CrmPlatformMetrics, CrmSite } from "@/entities/crm";
import {
  DashboardWidget,
  DashboardWidgetFeedItem,
  DashboardWidgetRow,
  PlatformPage,
  StatusPill,
} from "@/shared/ui/platform";
import { CrmMeterBar } from "@/shared/ui/crm-meter/CrmMeterBar";
import { crmCopy } from "@/widgets/crm-app/model/i18n";
import { getCrmLocaleTag, formatStoragePathLabel } from "@/widgets/crm-app/model/lib";
import type { CrmLang } from "@/widgets/crm-app/model/types";
import { SiteStatusBadge } from "@/features/crm-sites/ui/SiteStatusBadge";

type PlatformDashboardV2Props = {
  crmLang: CrmLang;
  sites: CrmSite[];
  metrics: CrmPlatformMetrics | null;
  onOpenProjects: () => void;
  onOpenInfrastructure: () => void;
  onOpenDeployments: () => void;
  onOpenMonitoring: () => void;
  onOpenTeam: () => void;
  onSwitchToSite: (workspaceId: string) => void;
  onOpenProject: (projectId: string) => void;
};

function humanizeDeployAction(action: string, crmLang: CrmLang) {
  if (action.includes("platform.deploy")) return crmLang === "ru" ? "Деплой платформы" : "Platform deploy";
  if (action.includes("site.deploy")) return crmLang === "ru" ? "Деплой проекта" : "Project deploy";
  if (action.includes("site.provision")) return crmLang === "ru" ? "Провизионинг" : "Provision";
  if (action.includes("site.create")) return crmLang === "ru" ? "Создание проекта" : "Project created";
  return action.replace(/\./g, " · ");
}

function deployStatusLabel(ok: boolean, crmLang: CrmLang) {
  if (ok) return crmLang === "ru" ? "Успех" : "Success";
  return crmLang === "ru" ? "Ошибка" : "Failed";
}

export function PlatformDashboardV2Section({
  crmLang,
  sites,
  metrics,
  onOpenProjects,
  onOpenInfrastructure,
  onOpenDeployments,
  onOpenMonitoring,
  onOpenTeam,
  onSwitchToSite,
  onOpenProject,
}: PlatformDashboardV2Props) {
  const ui = crmCopy[crmLang];
  const locale = getCrmLocaleTag(crmLang);
  const storage = metrics?.storageUsage;
  const diskPercent = storage?.usedPercent;
  const docker = metrics?.docker;
  const activeCount = metrics?.sites.active ?? sites.filter((s) => s.status === "active").length;

  return (
    <PlatformPage
      title={ui.platformDashboardTitle}
      subtitle={ui.platformDashboardSubtitle}
      actions={
        <span className="crm-live-badge">
          <span className="crm-live-dot" aria-hidden />
          {ui.platformAdminStatusOnline}
        </span>
      }
    >
      <section className="crm-page__block">
      <article className="crm-panel crm-panel--static crm-platform-metrics">
        <div className="crm-platform-metrics__grid">
          <div className="crm-platform-metrics__cell">
            <p className="crm-stat-card__label">{crmLang === "ru" ? "Проекты" : "Projects"}</p>
            <h3>{metrics?.sites.total ?? sites.length}</h3>
            <b className="crm-stat-card__value">
              {activeCount} {ui.sitesStatusActive.toLowerCase()}
            </b>
          </div>
          <div className="crm-platform-metrics__cell">
            <p className="crm-stat-card__label">{crmLang === "ru" ? "Деплои сегодня" : "Deployments today"}</p>
            <h3>{metrics?.deploymentsToday ?? 0}</h3>
            <b className="crm-stat-card__value crm-stat-card__value--muted">
              {crmLang === "ru" ? "за 24 часа" : "last 24 hours"}
            </b>
          </div>
          <div className="crm-platform-metrics__cell">
            <p className="crm-stat-card__label">{crmLang === "ru" ? "Контейнеры" : "Containers"}</p>
            <h3>{docker?.runningCount ?? 0}</h3>
            <b className="crm-stat-card__value">
              {docker?.stoppedCount ?? 0} {crmLang === "ru" ? "остановлено" : "stopped"}
            </b>
          </div>
          <div className="crm-platform-metrics__cell">
            <p className="crm-stat-card__label">{crmLang === "ru" ? "Команда" : "Team"}</p>
            <h3>{metrics?.adminsCount ?? 0}</h3>
            <b className="crm-stat-card__value crm-stat-card__value--muted">
              {crmLang === "ru" ? "администраторов" : "administrators"}
            </b>
          </div>
          <div className="crm-platform-metrics__cell">
            <p className="crm-stat-card__label">CPU</p>
            <h3>{metrics?.cpuUsage?.usedPercent != null ? `${metrics.cpuUsage.usedPercent}%` : "—"}</h3>
          </div>
          <div className="crm-platform-metrics__cell">
            <p className="crm-stat-card__label">RAM</p>
            <h3>{metrics?.memoryUsage?.usedPercent != null ? `${metrics.memoryUsage.usedPercent}%` : "—"}</h3>
            <b className="crm-stat-card__value crm-stat-card__value--muted">
              {metrics?.memoryUsage ? `${metrics.memoryUsage.usedMb} / ${metrics.memoryUsage.totalMb} MB` : "—"}
            </b>
          </div>
          <div className="crm-platform-metrics__cell">
            <p className="crm-stat-card__label">{ui.sidebarUsedSpace}</p>
            <h3>{diskPercent != null ? `${diskPercent}%` : "—"}</h3>
            {diskPercent != null ? (
              <div className="crm-stat-card__meter">
                <CrmMeterBar value={diskPercent} className="crm-stat-card__meter-svg" />
              </div>
            ) : null}
            <b className="crm-stat-card__value crm-stat-card__value--muted">
              {formatStoragePathLabel(storage?.path, crmLang)}
            </b>
          </div>
          <div className="crm-platform-metrics__cell">
            <p className="crm-stat-card__label">{ui.systemTime}</p>
            <h3 className="crm-stat-card__time">
              {new Intl.DateTimeFormat(locale, { hour: "2-digit", minute: "2-digit" }).format(
                new Date(metrics?.serverDateTime ?? Date.now())
              )}
            </h3>
            <b className="crm-stat-card__value">{metrics?.serverTimeZone ?? "UTC"}</b>
          </div>
        </div>
      </article>
      </section>

      <section className="crm-page__block">
      <article className="crm-panel crm-panel--static crm-platform-sites-preview">
        <div className="crm-platform-sites-preview__head">
          <div>
            <h3>{crmLang === "ru" ? "Проекты" : "Projects"}</h3>
            <p className="crm-muted">
              {crmLang === "ru"
                ? `${activeCount} из ${sites.length} активны`
                : `${activeCount} of ${sites.length} active`}
            </p>
          </div>
          <button type="button" className="crm-btn crm-btn--ghost crm-btn--sm" onClick={onOpenProjects}>
            {crmLang === "ru" ? "Все проекты" : "All projects"}
            <FontAwesomeIcon icon={faArrowRight} />
          </button>
        </div>

        {sites.length === 0 ? (
          <div className="crm-sites-empty-state">
            <div className="crm-sites-empty-state__icon">
              <FontAwesomeIcon icon={faFolderTree} />
            </div>
            <p>{ui.sitesEmpty}</p>
            <button type="button" className="crm-btn crm-btn--primary crm-btn--sm" onClick={onOpenProjects}>
              <FontAwesomeIcon icon={faPlus} />
              {crmLang === "ru" ? "Создать проект" : "Create project"}
            </button>
          </div>
        ) : (
          <div className="crm-sites-list crm-sites-list--dashboard">
            {sites.slice(0, 6).map((site) => (
              <article key={site.id} className="crm-site-row crm-site-row--page">
                <span className="crm-site-row__icon" aria-hidden>
                  <FontAwesomeIcon icon={faFolderTree} />
                </span>
                <div className="crm-site-row__main">
                  <div className="crm-site-row__title-line">
                    <button type="button" className="crm-site-row__domain-btn" onClick={() => onOpenProject(site.id)}>
                      <h3 className="crm-site-row__domain">{site.domain}</h3>
                    </button>
                    <SiteStatusBadge status={site.status} lang={crmLang} />
                  </div>
                  <div className="crm-site-row__details">
                    <span>
                      {ui.sitesColPorts}: {site.apiPort ?? "—"} / {site.webPort ?? "—"}
                    </span>
                  </div>
                </div>
                <div className="crm-site-row__actions">
                  <button
                    type="button"
                    className="crm-site-row__action"
                    disabled={site.status !== "active"}
                    onClick={() => {
                      if (site.status === "active") onSwitchToSite(site.workspaceId);
                    }}
                  >
                    {ui.sitesOpenWorkspace}
                    <FontAwesomeIcon icon={faArrowRight} />
                  </button>
                </div>
              </article>
            ))}
          </div>
        )}
      </article>
      </section>

      <section className="crm-page__block">
        <div className="crm-dashboard-widgets">
          <DashboardWidget
            title={crmLang === "ru" ? "Инфраструктура" : "Infrastructure"}
            icon={faBox}
            onOpen={onOpenInfrastructure}
            openLabel={crmLang === "ru" ? "Открыть" : "Open"}
          >
            <ul className="crm-dashboard-widget__rows">
              <DashboardWidgetRow
                label="Docker"
                value={
                  <StatusPill
                    label={docker?.available ? `${docker.runningCount} running` : "N/A"}
                    tone={docker?.available ? "healthy" : "warning"}
                  />
                }
              />
              <DashboardWidgetRow
                label={crmLang === "ru" ? "Образы" : "Images"}
                value={docker?.imageCount ?? 0}
              />
              <DashboardWidgetRow
                label={crmLang === "ru" ? "Админы" : "Admins"}
                value={
                  <button type="button" className="crm-link-btn" onClick={onOpenTeam}>
                    {metrics?.adminsCount ?? 0}
                  </button>
                }
              />
            </ul>
          </DashboardWidget>

          <DashboardWidget
            className="crm-dashboard-widget--wide"
            title={crmLang === "ru" ? "Последние деплои" : "Latest deployments"}
            icon={faRocket}
            onOpen={onOpenDeployments}
            openLabel={crmLang === "ru" ? "Все" : "All"}
          >
            {(metrics?.recentDeployments ?? []).length === 0 ? (
              <p className="crm-dashboard-widget__empty">
                {crmLang === "ru" ? "Пока нет деплоев" : "No deployments yet"}
              </p>
            ) : (
              <ul className="crm-dashboard-widget__feed">
                {(metrics?.recentDeployments ?? []).slice(0, 4).map((item) => (
                  <DashboardWidgetFeedItem
                    key={item.id}
                    title={item.target ?? humanizeDeployAction(item.action, crmLang)}
                    meta={item.actorName ?? "—"}
                    tone={item.ok ? "ok" : "fail"}
                    trailing={
                      <StatusPill
                        label={deployStatusLabel(item.ok, crmLang)}
                        tone={item.ok ? "healthy" : "critical"}
                      />
                    }
                  />
                ))}
              </ul>
            )}
          </DashboardWidget>

          <DashboardWidget
            title={crmLang === "ru" ? "Мониторинг" : "Monitoring"}
            icon={faClock}
            onOpen={onOpenMonitoring}
            openLabel={crmLang === "ru" ? "Открыть" : "Open"}
          >
            <ul className="crm-dashboard-widget__rows">
              <DashboardWidgetRow
                label={crmLang === "ru" ? "Последняя активность" : "Last activity"}
                value={
                  <span className="crm-dashboard-widget__mono">
                    {metrics?.lastAuditActivityAt
                      ? new Intl.DateTimeFormat(locale, { dateStyle: "short", timeStyle: "short" }).format(
                          new Date(metrics.lastAuditActivityAt)
                        )
                      : "—"}
                  </span>
                }
              />
              <DashboardWidgetRow
                label={crmLang === "ru" ? "Ошибки проектов" : "Project errors"}
                value={
                  <StatusPill
                    label={String(metrics?.sites.error ?? 0)}
                    tone={(metrics?.sites.error ?? 0) > 0 ? "critical" : "healthy"}
                  />
                }
              />
              <DashboardWidgetRow
                label="RAM"
                value={
                  metrics?.memoryUsage?.usedPercent != null ? `${metrics.memoryUsage.usedPercent}%` : "—"
                }
              />
            </ul>
          </DashboardWidget>
        </div>
      </section>
    </PlatformPage>
  );
}
