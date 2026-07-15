import type { CrmSite, CrmStorageUsage } from "@/entities/crm";
import { PlatformPage } from "@/shared/ui/platform";
import { CrmMeterBar } from "@/shared/ui/crm-meter/CrmMeterBar";
import { crmCopy } from "@/widgets/crm-app/model/i18n";
import { formatStoragePathLabel, getCrmLocaleTag } from "@/widgets/crm-app/model/lib";
import type { CrmLang } from "@/widgets/crm-app/model/types";

type PlatformSettingsSectionProps = {
  crmLang: CrmLang;
  sites: CrmSite[];
  storageUsage: CrmStorageUsage | null;
  serverDateTime: string;
  serverTimeZone: string;
};

export function PlatformSettingsSection({
  crmLang,
  sites,
  storageUsage,
  serverDateTime,
  serverTimeZone,
}: PlatformSettingsSectionProps) {
  const ui = crmCopy[crmLang];
  const locale = getCrmLocaleTag(crmLang);
  const activeCount = sites.filter((site) => site.status === "active").length;
  const diskPercent = storageUsage?.usedPercent;
  const diskLabel = diskPercent != null ? `${diskPercent}%` : "—";

  return (
    <PlatformPage title={ui.platformSettingsTitle} subtitle={ui.platformSettingsSubtitle}>
      <div className="crm-stat-row crm-stat-row--platform">
        <article className="crm-stat-card crm-panel crm-panel--static">
          <p className="crm-stat-card__label">{ui.sidebarUsedSpace}</p>
          <h3>{diskLabel}</h3>
          {diskPercent != null ? (
            <div className="crm-stat-card__meter">
              <CrmMeterBar value={diskPercent} className="crm-stat-card__meter-svg" />
            </div>
          ) : null}
          <b className="crm-stat-card__value crm-stat-card__value--muted">
            {formatStoragePathLabel(storageUsage?.path, crmLang)}
          </b>
        </article>
        <article className="crm-stat-card crm-panel crm-panel--static">
          <p className="crm-stat-card__label">{ui.systemTime}</p>
          <h3 className="crm-stat-card__time">
            {new Intl.DateTimeFormat(locale, {
              hour: "2-digit",
              minute: "2-digit",
              second: "2-digit",
            }).format(new Date(serverDateTime))}
          </h3>
          <b className="crm-stat-card__value">{serverTimeZone}</b>
        </article>
        <article className="crm-stat-card crm-panel crm-panel--static crm-stat-card--accent">
          <p className="crm-stat-card__label">{ui.sitesTitle}</p>
          <h3>{sites.length}</h3>
          <b className="crm-stat-card__value">
            {activeCount} {ui.sitesStatusActive.toLowerCase()}
          </b>
        </article>
      </div>

      <article className="crm-panel crm-panel--static crm-platform-server-card">
        <h3>{ui.platformServerInfoTitle}</h3>
        <dl className="crm-platform-server-list">
          <div>
            <dt>{ui.platformServerDisk}</dt>
            <dd>{formatStoragePathLabel(storageUsage?.path, crmLang)}</dd>
          </div>
          <div>
            <dt>{ui.platformServerUsage}</dt>
            <dd>{diskLabel}</dd>
          </div>
          <div>
            <dt>{ui.platformServerTime}</dt>
            <dd>
              {new Intl.DateTimeFormat(locale, {
                dateStyle: "full",
                timeStyle: "medium",
              }).format(new Date(serverDateTime))}
            </dd>
          </div>
          <div>
            <dt>{ui.platformServerSites}</dt>
            <dd>
              {sites.length} ({activeCount} {ui.sitesStatusActive.toLowerCase()})
            </dd>
          </div>
        </dl>
      </article>
    </PlatformPage>
  );
}
