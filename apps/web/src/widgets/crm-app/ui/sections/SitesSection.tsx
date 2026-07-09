import { useMemo } from "react";
import type { CrmSite } from "@/entities/crm";
import { crmCopy } from "../../model/i18n";
import type { CrmLang } from "../../model/types";

type SitesSectionProps = {
  crmLang: CrmLang;
  sites: CrmSite[];
  siteForm: {
    domain: string;
    repo: string;
    apiPort: string;
    webPort: string;
    extraDomains: string;
  };
  setSiteForm: React.Dispatch<
    React.SetStateAction<{
      domain: string;
      repo: string;
      apiPort: string;
      webPort: string;
      extraDomains: string;
    }>
  >;
  onCreateSite: () => void;
  onProvisionSite: (siteId: string) => void;
  onSwitchToSiteWorkspace: (workspaceId: string) => void;
};

function statusLabel(status: string, lang: CrmLang) {
  const ui = crmCopy[lang];
  if (status === "active") return ui.sitesStatusActive;
  if (status === "provisioning") return ui.sitesStatusProvisioning;
  if (status === "error") return ui.sitesStatusError;
  return ui.sitesStatusPending;
}

export function SitesSection({
  crmLang,
  sites,
  siteForm,
  setSiteForm,
  onCreateSite,
  onProvisionSite,
  onSwitchToSiteWorkspace,
}: SitesSectionProps) {
  const ui = crmCopy[crmLang];
  const locale = crmLang === "ru" ? "ru-RU" : "en-US";
  const sortedSites = useMemo(
    () => [...sites].sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()),
    [sites]
  );

  return (
    <div className="crm-grid crm-grid--two">
      <article className="crm-panel crm-table-card">
        <div className="crm-section-head">
          <h3>{ui.sitesCreateTitle}</h3>
          <span className="crm-muted">{ui.sitesSubtitle}</span>
        </div>
        <div className="crm-settings-list">
          <label className="crm-settings-item">
            <div>
              <h4>{ui.sitesFieldDomain}</h4>
            </div>
            <input
              className="spx-input crm-input crm-input--editor"
              value={siteForm.domain}
              onChange={(e) => setSiteForm((prev) => ({ ...prev, domain: e.target.value }))}
              placeholder="blog.example.com"
            />
          </label>
          <label className="crm-settings-item">
            <div>
              <h4>{ui.sitesFieldRepo}</h4>
            </div>
            <input
              className="spx-input crm-input crm-input--editor"
              value={siteForm.repo}
              onChange={(e) => setSiteForm((prev) => ({ ...prev, repo: e.target.value }))}
              placeholder="git@github.com:org/repo.git"
            />
          </label>
          <label className="crm-settings-item">
            <div>
              <h4>{ui.sitesFieldApiPort}</h4>
            </div>
            <input
              className="spx-input crm-input crm-input--editor"
              value={siteForm.apiPort}
              onChange={(e) => setSiteForm((prev) => ({ ...prev, apiPort: e.target.value }))}
            />
          </label>
          <label className="crm-settings-item">
            <div>
              <h4>{ui.sitesFieldWebPort}</h4>
            </div>
            <input
              className="spx-input crm-input crm-input--editor"
              value={siteForm.webPort}
              onChange={(e) => setSiteForm((prev) => ({ ...prev, webPort: e.target.value }))}
            />
          </label>
          <label className="crm-settings-item">
            <div>
              <h4>{ui.sitesFieldExtraDomains}</h4>
            </div>
            <input
              className="spx-input crm-input crm-input--editor"
              value={siteForm.extraDomains}
              onChange={(e) => setSiteForm((prev) => ({ ...prev, extraDomains: e.target.value }))}
              placeholder="www.example.com, example.online"
            />
          </label>
        </div>
        <button type="button" className="crm-btn crm-btn--primary" onClick={() => void onCreateSite()}>
          {ui.sitesCreateSubmit}
        </button>
      </article>

      <article className="crm-panel crm-table-card">
        <div className="crm-section-head">
          <h3>{ui.sitesTitle}</h3>
        </div>
        <div className="crm-table-wrap">
          <table className="crm-table">
            <thead>
              <tr>
                <th>{ui.sitesColDomain}</th>
                <th>{ui.sitesColStatus}</th>
                <th>{ui.sitesColPorts}</th>
                <th>{ui.sitesColCreated}</th>
                <th />
              </tr>
            </thead>
            <tbody>
              {sortedSites.map((site) => (
                <tr key={site.id}>
                  <td>
                    <button
                      type="button"
                      className="crm-link-btn"
                      onClick={() => onSwitchToSiteWorkspace(site.workspaceId)}
                    >
                      {site.domain}
                    </button>
                  </td>
                  <td>
                    <span className={`crm-site-status crm-site-status--${site.status}`}>
                      {statusLabel(site.status, crmLang)}
                    </span>
                  </td>
                  <td>
                    {site.apiPort ?? "—"} / {site.webPort ?? "—"}
                  </td>
                  <td>{new Intl.DateTimeFormat(locale, { dateStyle: "medium" }).format(new Date(site.createdAt))}</td>
                  <td>
                    <button
                      type="button"
                      className="crm-btn crm-btn--ghost crm-btn--sm"
                      onClick={() => void onProvisionSite(site.id)}
                    >
                      {ui.sitesProvision}
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </article>
    </div>
  );
}
