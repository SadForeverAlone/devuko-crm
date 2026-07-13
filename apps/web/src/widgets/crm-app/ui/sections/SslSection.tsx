import type { CrmPlatformMetrics, CrmSite } from "@/entities/crm";
import {
  PlatformCard,
  PlatformPage,
  PlatformRecordTable,
  StatusPill,
  groupItemsBySiteDomains,
  sitePortsMeta,
} from "@/shared/ui/platform";
import type { CrmLang } from "../../model/types";
import { getCrmLocaleTag } from "../../model/lib";
import { SiteStatusBadge } from "./SiteStatusBadge";

type SslSectionProps = {
  crmLang: CrmLang;
  metrics: CrmPlatformMetrics | null;
  sites: CrmSite[];
};

const sslTemplate = "1.2fr 1fr 0.75fr 0.55fr 0.7fr";

function sslStatusLabel(status: string, crmLang: CrmLang) {
  if (status === "missing") return crmLang === "ru" ? "Не найден" : "Missing";
  if (status === "healthy") return "OK";
  if (status === "warning") return crmLang === "ru" ? "Скоро истечёт" : "Expiring";
  return crmLang === "ru" ? "Критично" : "Critical";
}

function platformGroupTitle(site: CrmSite | null, crmLang: CrmLang) {
  if (site) return site.domain;
  return crmLang === "ru" ? "Платформа" : "Platform";
}

export function SslSection({ crmLang, metrics, sites }: SslSectionProps) {
  const locale = getCrmLocaleTag(crmLang);
  const certificates = metrics?.sslCertificates ?? [];
  const sslGroups = groupItemsBySiteDomains(
    sites,
    certificates,
    (cert) => cert.domain,
    (cert) => cert.domain
  );

  return (
    <PlatformPage
      title="SSL"
      subtitle={crmLang === "ru" ? "Сертификаты и срок действия" : "Certificates and expiration"}
    >
      <PlatformCard title={crmLang === "ru" ? "Сертификаты" : "Certificates"}>
        {certificates.length === 0 ? (
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
                id: "issuer",
                header: crmLang === "ru" ? "Issuer" : "Issuer",
                muted: true,
                truncate: true,
                render: (cert) => cert.issuer,
              },
              {
                id: "expires",
                header: crmLang === "ru" ? "Истекает" : "Expires",
                muted: true,
                render: (cert) =>
                  cert.expiresAt
                    ? new Intl.DateTimeFormat(locale, { dateStyle: "medium" }).format(new Date(cert.expiresAt))
                    : "—",
              },
              {
                id: "days",
                header: crmLang === "ru" ? "Дней" : "Days",
                align: "center",
                render: (cert) => (cert.daysLeft >= 0 ? cert.daysLeft : "—"),
              },
              {
                id: "status",
                header: crmLang === "ru" ? "Статус" : "Status",
                render: (cert) => (
                  <StatusPill
                    label={sslStatusLabel(cert.status, crmLang)}
                    tone={
                      cert.status === "healthy"
                        ? "healthy"
                        : cert.status === "warning"
                          ? "warning"
                          : cert.status === "missing"
                            ? "neutral"
                            : "critical"
                    }
                  />
                ),
              },
            ]}
          />
        )}
      </PlatformCard>
    </PlatformPage>
  );
}
