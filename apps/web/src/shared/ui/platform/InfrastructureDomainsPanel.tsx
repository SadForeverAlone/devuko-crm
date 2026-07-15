import { faGlobe } from "@fortawesome/free-solid-svg-icons";
import type { CrmSite } from "@/entities/crm";
import type { CrmLang } from "@/widgets/crm-app/model/types";
import { SiteStatusBadge } from "@/features/crm-sites/ui/SiteStatusBadge";
import { PlatformCard } from "./PlatformCard";
import { PlatformRecordTable } from "./PlatformRecordTable";
import { sitePortsMeta } from "./platform-records.lib";

type DomainRegistration = {
  domain: string;
  expiresAt: string;
  daysLeft: number;
  status: "healthy" | "warning" | "critical" | "unknown";
};

type DomainRow = {
  domain: string;
  kind: "primary" | "alias";
};

type InfrastructureDomainsPanelProps = {
  crmLang: CrmLang;
  sites: CrmSite[];
  domainRegistrations?: DomainRegistration[];
};

function countDomains(sites: CrmSite[]) {
  return sites.reduce((total, site) => total + 1 + site.extraDomains.length, 0);
}

function projectWord(count: number, crmLang: CrmLang) {
  if (crmLang !== "ru") return count === 1 ? "project" : "projects";

  const mod10 = count % 10;
  const mod100 = count % 100;
  if (mod10 === 1 && mod100 !== 11) return "проекте";
  if (mod10 >= 2 && mod10 <= 4 && (mod100 < 10 || mod100 >= 20)) return "проектах";
  return "проектах";
}

function domainWord(count: number, crmLang: CrmLang) {
  if (crmLang !== "ru") return count === 1 ? "domain" : "domains";

  const mod10 = count % 10;
  const mod100 = count % 100;
  if (mod10 === 1 && mod100 !== 11) return "домен";
  if (mod10 >= 2 && mod10 <= 4 && (mod100 < 10 || mod100 >= 20)) return "домена";
  return "доменов";
}

function registrationMap(registrations: DomainRegistration[] | undefined) {
  return new Map((registrations ?? []).map((item) => [item.domain, item]));
}

function siteDomainRows(site: CrmSite): DomainRow[] {
  return [
    { domain: site.domain, kind: "primary" },
    ...site.extraDomains.map((domain) => ({ domain, kind: "alias" as const })),
  ];
}

function formatRenewal(
  registration: DomainRegistration | undefined,
  crmLang: CrmLang,
  locale: string
) {
  if (!registration || registration.status === "unknown" || registration.daysLeft < 0) {
    return crmLang === "ru" ? "Неизвестно" : "Unknown";
  }

  const dateLabel = registration.expiresAt
    ? new Intl.DateTimeFormat(locale, { dateStyle: "medium" }).format(new Date(registration.expiresAt))
    : "—";

  const daysLabel =
    crmLang === "ru"
      ? `${registration.daysLeft} ${registration.daysLeft === 1 ? "день" : registration.daysLeft < 5 ? "дня" : "дней"}`
      : `${registration.daysLeft} ${registration.daysLeft === 1 ? "day" : "days"}`;

  return `${daysLabel} · ${dateLabel}`;
}

function renewalTone(registration: DomainRegistration | undefined) {
  if (!registration || registration.status === "unknown" || registration.daysLeft < 0) return "neutral";
  return registration.status;
}

const domainTemplate = "1.2fr 0.5fr 1fr";

export function InfrastructureDomainsPanel({
  crmLang,
  sites,
  domainRegistrations,
}: InfrastructureDomainsPanelProps) {
  const locale = crmLang === "ru" ? "ru-RU" : "en-US";
  const registrations = registrationMap(domainRegistrations);
  const domainCount = countDomains(sites);
  const title = crmLang === "ru" ? "Домены проектов" : "Project domains";
  const subtitle =
    crmLang === "ru"
      ? `${domainCount} ${domainWord(domainCount, crmLang)} на ${sites.length} ${projectWord(sites.length, crmLang)}`
      : `${domainCount} domains across ${sites.length} projects`;

  return (
    <PlatformCard icon={faGlobe} title={title} subtitle={subtitle}>
      {sites.length === 0 ? (
        <p className="crm-muted">{crmLang === "ru" ? "Проекты не найдены" : "No projects found"}</p>
      ) : (
        <PlatformRecordTable
        template={domainTemplate}
        groups={sites.map((site) => ({
          id: site.id,
          title: site.domain,
          meta: sitePortsMeta(site),
          action: <SiteStatusBadge status={site.status} lang={crmLang} />,
          rows: siteDomainRows(site),
        }))}
        rowKey={(row) => row.domain}
        columns={[
          {
            id: "domain",
            header: crmLang === "ru" ? "Домен" : "Domain",
            mono: true,
            render: (row) => row.domain,
          },
          {
            id: "kind",
            header: crmLang === "ru" ? "Тип" : "Type",
            muted: true,
            render: (row) =>
              row.kind === "primary"
                ? crmLang === "ru"
                  ? "Primary"
                  : "Primary"
                : crmLang === "ru"
                  ? "Alias"
                  : "Alias",
          },
          {
            id: "renewal",
            header: crmLang === "ru" ? "Оплата домена" : "Domain renewal",
            className: "crm-domain-renewal-cell",
            render: (row) => {
              const registration = registrations.get(row.domain);
              return (
                <span className={`crm-domain-renewal crm-domain-renewal--${renewalTone(registration)}`}>
                  {formatRenewal(registration, crmLang, locale)}
                </span>
              );
            },
          },
        ]}
      />
      )}
    </PlatformCard>
  );
}
