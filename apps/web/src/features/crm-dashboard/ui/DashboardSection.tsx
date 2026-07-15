import { PlatformPage } from "@/shared/ui/platform";
import { DashboardLinkCard } from "@/shared/crm/ui/DashboardLinkCard";
import { crmCopy } from "@/widgets/crm-app/model/config";
import { getCrmLocaleTag, translateGender } from "@/widgets/crm-app/model/lib";
import type { DashboardSectionProps } from "@/shared/crm/ui/sectionTypes";

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
  const radius = 42;
  const circumference = 2 * Math.PI * radius;
  const dash = (safe / 100) * circumference;
  return (
    <div className="crm-gauge">
      <div className="crm-gauge__ring">
        <svg className="crm-gauge__svg" viewBox="0 0 100 100" aria-hidden>
          <circle className="crm-gauge__track" cx="50" cy="50" r={radius} fill="none" strokeWidth="10" />
          <circle
            className="crm-gauge__fill"
            cx="50"
            cy="50"
            r={radius}
            fill="none"
            strokeWidth="10"
            strokeDasharray={`${dash} ${circumference}`}
            transform="rotate(-90 50 50)"
          />
        </svg>
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
          <DashboardLinkCard
            className="crm-stat-card crm-panel crm-dashboard-link"
            onActivate={() => onOpenPart("users")}
          >
            <div>
              <p className="crm-stat-card__label">{ui.users}</p>
              <h3>{counters.usersCount}</h3>
            </div>
            <b className="crm-stat-card__value">{ui.activeBase}</b>
          </DashboardLinkCard>
          <DashboardLinkCard
            className="crm-stat-card crm-panel crm-dashboard-link"
            onActivate={() => onOpenPart("promises")}
          >
            <div>
              <p className="crm-stat-card__label">{ui.promises}</p>
              <h3>{counters.promisesCount}</h3>
            </div>
            <b className="crm-stat-card__value">
              {counters.activePromisesCount} {ui.active}
            </b>
          </DashboardLinkCard>
          <DashboardLinkCard
            className="crm-stat-card crm-panel crm-dashboard-link"
            onActivate={() => onOpenPart("proofs")}
          >
            <div>
              <p className="crm-stat-card__label">{ui.proofs}</p>
              <h3>{counters.proofsCount}</h3>
            </div>
            <b className="crm-stat-card__value">{ui.proofsPendingReview}</b>
          </DashboardLinkCard>
        </div>
      </div>
      <div className="crm-page__block">
        <div className="crm-dashboard-grid">
          <DashboardLinkCard
            className="crm-side-card crm-panel crm-dashboard-link"
            onActivate={() => onOpenPart("system-time")}
          >
            <div className="crm-section-head">
              <h3>{ui.systemTime}</h3>
              <span className="crm-muted">{ui.live}</span>
            </div>
            <p className="crm-big-number">
              {new Date(serverDateTime).toLocaleString(dateLocale)}
            </p>
            <p className="crm-muted">{serverTimeZone}</p>
          </DashboardLinkCard>
          <DashboardLinkCard
            className="crm-side-card crm-panel crm-segmentation-card crm-dashboard-link"
            onActivate={() => onOpenPart("segmentation")}
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
                  <svg
                    className="crm-segmentation-card__stack-svg"
                    viewBox="0 0 100 100"
                    preserveAspectRatio="none"
                    aria-hidden
                  >
                    {genderMetrics.map((item, index) => {
                      const h = Math.max(8, Math.min(100, item.percent));
                      const columns = Math.max(1, genderMetrics.length);
                      const slot = 100 / columns;
                      const gap = columns > 1 ? 4 : 0;
                      return (
                        <rect
                          key={item.label}
                          className={`crm-segmentation-card__segment crm-segmentation-card__segment--${(index % 5) + 1}`}
                          x={index * slot + gap / 2}
                          y={100 - h}
                          width={Math.max(8, slot - gap)}
                          height={h}
                          rx={columns === 1 ? 8 : 4}
                        />
                      );
                    })}
                  </svg>
                </div>
              </div>
            </div>
          </DashboardLinkCard>
          <DashboardLinkCard
            className="crm-side-card crm-panel crm-dashboard-link"
            onActivate={() => onOpenPart("countries")}
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
          </DashboardLinkCard>
          <DashboardLinkCard
            className="crm-side-card crm-panel crm-dashboard-link"
            onActivate={() => onOpenPart("logs-by-role")}
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
          </DashboardLinkCard>
          <DashboardLinkCard
            className="crm-side-card crm-panel crm-dashboard-link"
            onActivate={() => onOpenPart("contacts")}
          >
            <div className="crm-section-head">
              <h3>{ui.contactRequests}</h3>
            </div>
            <GaugeCard
              value={Math.min(100, Math.max(18, visibleContactsCount * 8))}
              engagementLabel={ui.engagement}
              hint={ui.engagementHint}
            />
          </DashboardLinkCard>
        </div>
      </div>
    </PlatformPage>
  );
}
