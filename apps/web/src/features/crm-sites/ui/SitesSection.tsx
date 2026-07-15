import { useEffect, useMemo, useState } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faChevronDown,
  faEllipsis,
  faFolderTree,
  faPen,
  faPlus,
  faRightToBracket,
  faTrash,
} from "@fortawesome/free-solid-svg-icons";
import type { CrmSite } from "@/entities/crm";
import { crmCopy } from "@/widgets/crm-app/model/i18n";
import type { CrmLang } from "@/widgets/crm-app/model/types";
import { SiteStatusBadge } from "@/features/crm-sites/ui/SiteStatusBadge";
import { ProvisionLogTable } from "@/features/crm-sites/ui/ProvisionLogTable";
import { PlatformPage } from "@/shared/ui/platform";

type SiteEditForm = {
  repo: string;
  apiPort: string;
  webPort: string;
  extraDomains: string;
};

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
  onUpdateSite: (siteId: string, form: SiteEditForm) => void;
  onDeleteSite: (siteId: string) => void;
  onSwitchToSiteWorkspace: (workspaceId: string) => void;
  onOpenProject?: (siteId: string) => void;
  openCreateOnMount?: boolean;
  listTitle?: string;
  listSubtitle?: string;
};

export function SitesSection({
  crmLang,
  sites,
  siteForm,
  setSiteForm,
  onCreateSite,
  onProvisionSite,
  onUpdateSite,
  onDeleteSite,
  onSwitchToSiteWorkspace,
  onOpenProject,
  openCreateOnMount = false,
  listTitle,
  listSubtitle,
}: SitesSectionProps) {
  const ui = crmCopy[crmLang];
  const locale = crmLang === "ru" ? "ru-RU" : "en-US";
  const [showCreate, setShowCreate] = useState(openCreateOnMount);

  useEffect(() => {
    if (openCreateOnMount) {
      setShowCreate(true);
    }
  }, [openCreateOnMount]);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [expandedLogId, setExpandedLogId] = useState<string | null>(null);
  const [editForm, setEditForm] = useState<SiteEditForm>({
    repo: "",
    apiPort: "8080",
    webPort: "8088",
    extraDomains: "",
  });
  const sortedSites = useMemo(
    () => [...sites].sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()),
    [sites]
  );
  const activeCount = sites.filter((s) => s.status === "active").length;

  const startEdit = (site: CrmSite) => {
    setEditingId(site.id);
    setEditForm({
      repo: site.repo ?? "",
      apiPort: String(site.apiPort ?? 8080),
      webPort: String(site.webPort ?? 8088),
      extraDomains: site.extraDomains.join(", "),
    });
  };

  const handleDelete = (site: CrmSite) => {
    if (!window.confirm(ui.sitesDeleteConfirm.replace("{domain}", site.domain))) {
      return;
    }
    void onDeleteSite(site.id);
  };

  return (
    <PlatformPage
      title={listTitle ?? ui.sitesTitle}
      subtitle={listSubtitle ?? ui.sitesSubtitle}
      actions={
        <button
          type="button"
          className={showCreate ? "crm-btn crm-btn--ghost" : "crm-btn crm-btn--primary"}
          onClick={() => setShowCreate((v) => !v)}
        >
          {showCreate ? null : <FontAwesomeIcon icon={faPlus} />}
          {showCreate ? ui.sitesCancelCreate : ui.sitesCreateTitle}
        </button>
      }
    >
      <div className="crm-stat-row crm-stat-row--platform">
        <article className="crm-stat-card crm-panel crm-panel--static crm-stat-card--accent">
          <p className="crm-stat-card__label">{ui.sitesStatTotal}</p>
          <h3>{sites.length}</h3>
        </article>
        <article className="crm-stat-card crm-panel crm-panel--static crm-stat-card--success">
          <p className="crm-stat-card__label">{ui.sitesStatusActive}</p>
          <h3>{activeCount}</h3>
        </article>
        <article className="crm-stat-card crm-panel crm-panel--static crm-stat-card--warn">
          <p className="crm-stat-card__label">{ui.sitesStatPending}</p>
          <h3>{sites.length - activeCount}</h3>
        </article>
      </div>

      {showCreate ? (
        <article className="crm-panel crm-panel--static crm-sites-create">
          <h3>{ui.sitesCreateTitle}</h3>
          <div className="crm-sites-create__grid">
            <label className="crm-field">
              <span>{ui.sitesFieldDomain}</span>
              <input
                className="spx-input crm-input"
                value={siteForm.domain}
                onChange={(e) => setSiteForm((prev) => ({ ...prev, domain: e.target.value }))}
              />
            </label>
            <label className="crm-field crm-sites-create__wide">
              <span>{ui.sitesFieldRepo}</span>
              <input
                className="spx-input crm-input"
                value={siteForm.repo}
                onChange={(e) => setSiteForm((prev) => ({ ...prev, repo: e.target.value }))}
              />
            </label>
            <label className="crm-field">
              <span>{ui.sitesFieldApiPort}</span>
              <input
                className="spx-input crm-input"
                value={siteForm.apiPort}
                onChange={(e) => setSiteForm((prev) => ({ ...prev, apiPort: e.target.value }))}
              />
            </label>
            <label className="crm-field">
              <span>{ui.sitesFieldWebPort}</span>
              <input
                className="spx-input crm-input"
                value={siteForm.webPort}
                onChange={(e) => setSiteForm((prev) => ({ ...prev, webPort: e.target.value }))}
              />
            </label>
            <label className="crm-field crm-sites-create__wide">
              <span>{ui.sitesFieldExtraDomains}</span>
              <input
                className="spx-input crm-input"
                value={siteForm.extraDomains}
                onChange={(e) => setSiteForm((prev) => ({ ...prev, extraDomains: e.target.value }))}
              />
            </label>
            <div className="crm-sites-create__actions crm-sites-create__wide">
              <button type="button" className="crm-btn crm-btn--primary" onClick={() => void onCreateSite()}>
                {ui.sitesCreateTitle}
              </button>
              <button type="button" className="crm-btn crm-btn--ghost" onClick={() => setShowCreate(false)}>
                {ui.sitesCancelCreate}
              </button>
            </div>
          </div>
        </article>
      ) : null}

      {sortedSites.length === 0 ? (
        <article className="crm-panel crm-sites-empty-state crm-sites-empty-state--page">
          <div className="crm-sites-empty-state__icon">
            <FontAwesomeIcon icon={faFolderTree} />
          </div>
          <p>{ui.sitesEmpty}</p>
          <button type="button" className="crm-btn crm-btn--primary" onClick={() => setShowCreate(true)}>
            <FontAwesomeIcon icon={faPlus} />
            {ui.sitesCreateTitle}
          </button>
        </article>
      ) : (
        <div className="crm-sites-list crm-sites-list--page">
          {sortedSites.map((site) => (
            <article key={site.id} className="crm-site-row crm-site-row--page">
              <span className="crm-site-row__icon" aria-hidden>
                <FontAwesomeIcon icon={faFolderTree} />
              </span>
              <div className="crm-site-row__main">
                <div className="crm-site-row__title-line">
                  {onOpenProject ? (
                    <button
                      type="button"
                      className="crm-site-row__domain-btn"
                      onClick={() => onOpenProject(site.id)}
                    >
                      <h3 className="crm-site-row__domain">{site.domain}</h3>
                    </button>
                  ) : (
                    <h3 className="crm-site-row__domain">{site.domain}</h3>
                  )}
                  <SiteStatusBadge status={site.status} lang={crmLang} />
                </div>
                {editingId === site.id ? (
                  <div className="crm-sites-create__grid crm-site-row__edit">
                    <label className="crm-field crm-sites-create__wide">
                      <span>{ui.sitesFieldRepo}</span>
                      <input
                        className="spx-input crm-input"
                        value={editForm.repo}
                        onChange={(e) => setEditForm((prev) => ({ ...prev, repo: e.target.value }))}
                      />
                    </label>
                    <label className="crm-field">
                      <span>{ui.sitesFieldApiPort}</span>
                      <input
                        className="spx-input crm-input"
                        value={editForm.apiPort}
                        onChange={(e) => setEditForm((prev) => ({ ...prev, apiPort: e.target.value }))}
                      />
                    </label>
                    <label className="crm-field">
                      <span>{ui.sitesFieldWebPort}</span>
                      <input
                        className="spx-input crm-input"
                        value={editForm.webPort}
                        onChange={(e) => setEditForm((prev) => ({ ...prev, webPort: e.target.value }))}
                      />
                    </label>
                    <label className="crm-field crm-sites-create__wide">
                      <span>{ui.sitesFieldExtraDomains}</span>
                      <input
                        className="spx-input crm-input"
                        value={editForm.extraDomains}
                        onChange={(e) => setEditForm((prev) => ({ ...prev, extraDomains: e.target.value }))}
                      />
                    </label>
                    <div className="crm-sites-create__actions crm-sites-create__wide">
                      <button
                        type="button"
                        className="crm-btn crm-btn--primary crm-btn--sm"
                        onClick={() => {
                          void onUpdateSite(site.id, editForm);
                          setEditingId(null);
                        }}
                      >
                        {ui.sitesSave}
                      </button>
                      <button
                        type="button"
                        className="crm-btn crm-btn--ghost crm-btn--sm"
                        onClick={() => setEditingId(null)}
                      >
                        {ui.sitesCancelCreate}
                      </button>
                    </div>
                  </div>
                ) : (
                  <div className="crm-site-row__details">
                    <span>
                      {ui.sitesColPorts}: {site.apiPort ?? "—"} / {site.webPort ?? "—"}
                    </span>
                    <span>
                      {ui.sitesColCreated}:{" "}
                      {new Intl.DateTimeFormat(locale, { dateStyle: "medium" }).format(new Date(site.createdAt))}
                    </span>
                  </div>
                )}
              </div>
              <div className="crm-site-row__actions">
                <button
                  type="button"
                  className="crm-btn crm-btn--primary crm-btn--sm"
                  disabled={site.status !== "active"}
                  onClick={() => onSwitchToSiteWorkspace(site.workspaceId)}
                >
                  <FontAwesomeIcon icon={faRightToBracket} />
                  {ui.sitesOpenWorkspace}
                </button>
                {onOpenProject ? (
                  <button
                    type="button"
                    className="crm-btn crm-btn--ghost crm-btn--sm"
                    onClick={() => onOpenProject(site.id)}
                  >
                    <FontAwesomeIcon icon={faEllipsis} />
                    {crmLang === "ru" ? "Детали" : "Details"}
                  </button>
                ) : null}
                <button
                  type="button"
                  className="crm-btn crm-btn--ghost crm-btn--sm"
                  aria-label={ui.sitesEdit}
                  title={ui.sitesEdit}
                  onClick={() => startEdit(site)}
                >
                  <FontAwesomeIcon icon={faPen} />
                </button>
                <button
                  type="button"
                  className="crm-btn crm-btn--ghost crm-btn--sm"
                  onClick={() => void onProvisionSite(site.id)}
                >
                  {ui.sitesProvision}
                </button>
                <button
                  type="button"
                  className="crm-btn crm-btn--ghost crm-btn--sm crm-btn--danger"
                  aria-label={ui.sitesDelete}
                  title={ui.sitesDelete}
                  onClick={() => handleDelete(site)}
                >
                  <FontAwesomeIcon icon={faTrash} />
                </button>
              </div>
              {site.provisionLog.length > 0 ? (
                <div className="crm-site-row__provision">
                  <button
                    type="button"
                    className={`crm-btn crm-btn--ghost crm-btn--sm crm-site-row__provision-toggle${expandedLogId === site.id ? " crm-site-row__provision-toggle--open" : ""}`}
                    aria-expanded={expandedLogId === site.id}
                    onClick={() => setExpandedLogId((id) => (id === site.id ? null : site.id))}
                  >
                    <FontAwesomeIcon icon={faChevronDown} className="crm-site-row__provision-chevron" />
                    {ui.sitesProvisionLog} ({site.provisionLog.length})
                  </button>
                  <div
                    className={`crm-site-row__provision-panel${expandedLogId === site.id ? " crm-site-row__provision-panel--open" : ""}`}
                  >
                    <div className="crm-site-row__provision-panel-inner">
                      <ProvisionLogTable crmLang={crmLang} entries={site.provisionLog} />
                    </div>
                  </div>
                </div>
              ) : null}
            </article>
          ))}
        </div>
      )}
    </PlatformPage>
  );
}
