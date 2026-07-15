import type { ReactNode } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faArrowLeft } from "@fortawesome/free-solid-svg-icons";
import { PlatformPage } from "@/shared/ui/platform";
import { crmCopy } from "@/widgets/crm-app/model/config";
import { getCrmLocaleTag, translateGender } from "@/widgets/crm-app/model/lib";
import type { UserRoleCode } from "@/widgets/crm-app/model/i18n";
import type { CrmLang } from "@/widgets/crm-app/model/types";
import type { DashboardPart } from "@/shared/crm/ui/sectionTypes";

type Props = {
  crmLang: CrmLang;
  part: DashboardPart;
  counters: {
    usersCount: number;
    promisesCount: number;
    activePromisesCount: number;
    proofsCount: number;
  };
  serverDateTime: string;
  serverTimeZone: string;
  genderMetrics: Array<{ label: string; count: number; percent: number }>;
  countryMetrics: Array<{ label: string; count: number }>;
  roleOverview: Array<{ code: UserRoleCode; label: string; value: string }>;
  visibleContactsCount: number;
  onBack: () => void;
};

export function DashboardDetailSection({
  crmLang,
  part,
  counters,
  serverDateTime,
  serverTimeZone,
  genderMetrics,
  countryMetrics,
  roleOverview,
  visibleContactsCount,
  onBack,
}: Props) {
  const ui = crmCopy[crmLang];
  const dateLocale = getCrmLocaleTag(crmLang);

  const contentByPart: Record<DashboardPart, { title: string; body: ReactNode }> = {
    users: { title: ui.users, body: <p className="crm-big-number">{counters.usersCount}</p> },
    promises: {
      title: ui.promises,
      body: (
        <div>
          <p className="crm-big-number">{counters.promisesCount}</p>
          <p className="crm-muted">
            {counters.activePromisesCount} {ui.active}
          </p>
        </div>
      ),
    },
    proofs: { title: ui.proofs, body: <p className="crm-big-number">{counters.proofsCount}</p> },
    "system-time": {
      title: ui.systemTime,
      body: (
        <div>
          <p className="crm-big-number">
            {new Date(serverDateTime).toLocaleString(dateLocale)}
          </p>
          <p className="crm-muted">{serverTimeZone}</p>
        </div>
      ),
    },
    segmentation: {
      title: ui.segmentation,
      body: (
        <ul className="crm-simple-list">
          {genderMetrics.map((item) => (
            <li key={item.label}>
              <span>{translateGender(item.label, crmLang)}</span>
              <b>
                {item.count} ({item.percent}%)
              </b>
            </li>
          ))}
        </ul>
      ),
    },
    countries: {
      title: ui.countries,
      body: (
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
      ),
    },
    "logs-by-role": {
      title: ui.logsByRole,
      body: (
        <ul className="crm-simple-list">
          {roleOverview.map((item, index) => (
            <li key={item.code}>
              <span>
                {index + 1}. {item.label}
              </span>
              <b>{item.value}</b>
            </li>
          ))}
        </ul>
      ),
    },
    contacts: {
      title: ui.contactRequests,
      body: (
        <p className="crm-big-number">
          {visibleContactsCount}
        </p>
      ),
    },
  };

  const content = contentByPart[part];

  return (
    <PlatformPage
      title={content.title}
      actions={
        <button type="button" className="crm-btn crm-btn--ghost" onClick={onBack}>
          <FontAwesomeIcon icon={faArrowLeft} />
          {ui.dashboardBack}
        </button>
      }
    >
      <article className="crm-panel crm-table-card">{content.body}</article>
    </PlatformPage>
  );
}
