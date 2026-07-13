import { PlatformPage } from "@/shared/ui/platform";
import { crmCopy } from "../../model/config";
import { getCrmLocaleTag, translateGender } from "../../model/lib";
import type { DashboardSectionProps } from "./sectionTypes";

function GaugeCard({
  value,
  engagementLabel,
  hint,
}: {
  value: number;
  engagementLabel: string;
  hint: string;
}) {
  const safe = Math.max(0, Math.min(100, value));
  return (
    <div className="crm-gauge">
      <div
        className="crm-gauge__ring"
        style={{
          background: `conic-gradient(#3b82f6 ${safe}%, #252529 ${safe}% 100%)`,
        }}
      >
        <div className="crm-gauge__inner">
          <b>{safe}%</b>
          <span>{engagementLabel}</span>
        </div>
      </div>
      <p className="crm-muted">{hint}</p>
    </div>
  );
}

export function DashboardSection({
  crmLang,
  selectedUserName,
  dashboardSubtitle,
  counters,
  serverDateTime,
  serverTimeZone,
  genderMetrics,
  countryMetrics,
  roleOverview,
  visibleContactsCount,
  onOpenPart,
}: DashboardSectionProps) {
  const ui = crmCopy[crmLang];
  const dateLocale = getCrmLocaleTag(crmLang);
  return (
    <PlatformPage
      title={
        selectedUserName ? `${ui.hello} ${selectedUserName}` : ui.dashboardTitle
      }
      subtitle={dashboardSubtitle}
    >
      <div className="crm-page__block">
      <div className="crm-stat-row">
        <article
          className="crm-stat-card crm-panel crm-dashboard-link"
          onClick={() => onOpenPart("users")}
        >
          <div>
            <p className="crm-stat-card__label">{ui.users}</p>
            <h3>{counters.usersCount}</h3>
          </div>
          <b className="crm-stat-card__value">{ui.activeBase}</b>
        </article>
        <article
          className="crm-stat-card crm-panel crm-dashboard-link"
          onClick={() => onOpenPart("promises")}
        >
          <div>
            <p className="crm-stat-card__label">{ui.promises}</p>
            <h3>{counters.promisesCount}</h3>
          </div>
          <b className="crm-stat-card__value">
            {counters.activePromisesCount} {ui.active}
          </b>
        </article>
        <article
          className="crm-stat-card crm-panel crm-dashboard-link"
          onClick={() => onOpenPart("proofs")}
        >
          <div>
            <p className="crm-stat-card__label">{ui.proofs}</p>
            <h3>{counters.proofsCount}</h3>
          </div>
          <b className="crm-stat-card__value">{ui.proofsPendingReview}</b>
        </article>
      </div>
      </div>
      <div className="crm-page__block">
      <div className="crm-dashboard-grid">
        <article
          className="crm-side-card crm-panel crm-dashboard-link"
          onClick={() => onOpenPart("system-time")}
        >
          <div className="crm-section-head">
            <h3>{ui.systemTime}</h3>
            <span className="crm-muted">{ui.live}</span>
          </div>
          <p className="crm-big-number">
            {new Date(serverDateTime).toLocaleString(dateLocale)}
          </p>
          <p className="crm-muted">{serverTimeZone}</p>
        </article>
        <article
          className="crm-side-card crm-panel crm-segmentation-card crm-dashboard-link"
          onClick={() => onOpenPart("segmentation")}
        >
          <div className="crm-section-head">
            <h3>{ui.segmentation}</h3>
            <span className="crm-muted">{ui.segmentationAllUsers}</span>
          </div>
          <div className="crm-segmentation-card__body">
            <div className="crm-segmentation-card__list">
              {genderMetrics.map((item) => (
                <div key={item.label} className="crm-segmentation-card__row">
                  <span className="crm-segmentation-card__dot" />
                  <span>{translateGender(item.label, crmLang)}</span>
                </div>
              ))}
            </div>
            <div className="crm-segmentation-card__values">
              {genderMetrics.map((item) => (
                <div key={item.label} className="crm-segmentation-card__value">
                  <b>{item.count}</b>
                  <span />
                </div>
              ))}
            </div>
            <div className="crm-segmentation-card__visual">
              <div className="crm-segmentation-card__stack">
                {genderMetrics.map((item, index) => (
                  <div
                    key={item.label}
                    className={`crm-segmentation-card__segment crm-segmentation-card__segment--${index + 1}`}
                    style={{ height: `${Math.max(12, item.percent)}%` }}
                  />
                ))}
              </div>
            </div>
          </div>
        </article>
        <article
          className="crm-side-card crm-panel crm-dashboard-link"
          onClick={() => onOpenPart("countries")}
        >
          <div className="crm-section-head">
            <h3>{ui.countries}</h3>
            <span className="crm-muted">{ui.registrations}</span>
          </div>
          <ul className="crm-country-list">
            {countryMetrics.map((country, index) => (
              <li key={country.label}>
                <span>
                  {index + 1}. {country.label}
                </span>
                <b>{country.count}</b>
              </li>
            ))}
          </ul>
        </article>
        <article
          className="crm-side-card crm-panel crm-dashboard-link"
          onClick={() => onOpenPart("logs-by-role")}
        >
          <div className="crm-section-head">
            <h3>{ui.logsByRole}</h3>
          </div>
          <ul className="crm-simple-list">
            {roleOverview.map((row, index) => (
              <li key={row.code}>
                <span>
                  {index + 1}. {row.label}
                </span>
                <b>{row.value}</b>
              </li>
            ))}
          </ul>
        </article>
        <article
          className="crm-side-card crm-panel crm-dashboard-link"
          onClick={() => onOpenPart("contacts")}
        >
          <div className="crm-section-head">
            <h3>{ui.contactRequests}</h3>
          </div>
          <GaugeCard
            value={Math.min(100, Math.max(18, visibleContactsCount * 8))}
            engagementLabel={ui.engagement}
            hint={ui.engagementHint}
          />
        </article>
      </div>
      </div>
    </PlatformPage>
  );
}
