import { crmCopy } from "../../model/i18n";
import type { CrmLang } from "../../model/types";

export function siteStatusLabel(status: string, lang: CrmLang) {
  const ui = crmCopy[lang];
  if (status === "active") return ui.sitesStatusActive;
  if (status === "provisioning") return ui.sitesStatusProvisioning;
  if (status === "error") return ui.sitesStatusError;
  return ui.sitesStatusPending;
}

type SiteStatusBadgeProps = {
  status: string;
  lang: CrmLang;
};

export function SiteStatusBadge({ status, lang }: SiteStatusBadgeProps) {
  return (
    <span className={`crm-site-status crm-site-status--${status}`}>{siteStatusLabel(status, lang)}</span>
  );
}
