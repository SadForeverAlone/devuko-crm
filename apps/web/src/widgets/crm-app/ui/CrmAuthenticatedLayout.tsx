import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faChevronDown, faGlobe, faRightFromBracket, faRocket } from "@fortawesome/free-solid-svg-icons";
import { PLATFORM_WORKSPACE_ID } from "@/entities/crm";
import type { useCrmWorkspace } from "../model/useCrmWorkspace";
import { CrmTabContent } from "./CrmTabContent";

type CrmWorkspace = ReturnType<typeof useCrmWorkspace>;

type CrmAuthenticatedLayoutProps = {
  workspace: CrmWorkspace;
};

export function CrmAuthenticatedLayout({ workspace: ws }: CrmAuthenticatedLayoutProps) {
  const {
    crmLang,
    setCrmLang,
    tab,
    ui,
    sidebarAudit,
    navigate,
    crmNavItems,
    crmShortcutItems,
    crmTabPathMap,
    handleLogout,
    workspaces,
    activeWorkspace,
    workspaceMenuOpen,
    setWorkspaceMenuOpen,
    handleSwitchWorkspace,
  } = ws;

  const workspaceLabel =
    activeWorkspace?.kind === "platform"
      ? ui.platformWorkspaceLabel
      : activeWorkspace?.label ?? "Selfpact";

  return (

    <main className="crm-root">
      <aside className="crm-sidebar">
        <div className="crm-sidebar__brand">
          <span className="crm-logo-dot" />
          <span>Devuko</span>
        </div>

        <div className="crm-sidebar__section crm-workspace-picker">
          <p className="crm-sidebar__caption">{ui.workspace}</p>
          <button
            type="button"
            className="crm-sidebar__workspace"
            aria-expanded={workspaceMenuOpen}
            aria-haspopup="listbox"
            onClick={() => setWorkspaceMenuOpen((open) => !open)}
          >
            <span className="crm-sidebar__workspace-icon">
              <FontAwesomeIcon icon={activeWorkspace?.kind === "platform" ? faGlobe : faRocket} />
            </span>
            <span className="crm-sidebar__workspace-label">{workspaceLabel}</span>
            <FontAwesomeIcon icon={faChevronDown} className="crm-sidebar__workspace-caret" />
          </button>
          {workspaceMenuOpen ? (
            <div className="crm-workspace-menu" role="listbox" aria-label={ui.workspaceSwitch}>
              {workspaces.map((item) => (
                <button
                  key={item.id}
                  type="button"
                  role="option"
                  aria-selected={item.id === activeWorkspace?.id}
                  className={
                    item.id === activeWorkspace?.id
                      ? "crm-workspace-menu__item crm-workspace-menu__item--active"
                      : "crm-workspace-menu__item"
                  }
                  onClick={() => handleSwitchWorkspace(item.id)}
                >
                  <span className="crm-workspace-menu__icon">
                    <FontAwesomeIcon icon={item.kind === "platform" ? faGlobe : faRocket} />
                  </span>
                  <span>
                    {item.kind === "platform" ? ui.platformWorkspaceLabel : item.label}
                  </span>
                  {item.id === PLATFORM_WORKSPACE_ID ? (
                    <span className="crm-workspace-menu__badge">CRM</span>
                  ) : null}
                </button>
              ))}
            </div>
          ) : null}
        </div>

        <nav className="crm-nav">
          {crmNavItems.map((item) => (
            <button
              key={item.key}
              type="button"
              className={
                tab === item.key
                  ? "crm-nav__item crm-nav__item--active"
                  : "crm-nav__item"
              }
              onClick={() => navigate(crmTabPathMap[item.key])}
            >
              <span className="crm-nav__icon">
                <FontAwesomeIcon icon={item.icon} />
              </span>
              {item.label[crmLang]}
            </button>
          ))}
        </nav>

        <div className="crm-sidebar__section">
          <p className="crm-sidebar__caption">{ui.sections}</p>
          <div className="crm-shortcuts">
            {crmShortcutItems.map((item) => (
              <button
                key={item.key}
                type="button"
                className={
                  tab === item.key
                    ? "crm-shortcut crm-shortcut--active"
                    : "crm-shortcut"
                }
              onClick={() => navigate(crmTabPathMap[item.key])}
              >
                <span className="crm-shortcut__icon">
                  <FontAwesomeIcon icon={item.icon} />
                </span>
                {item.label[crmLang]}
              </button>
            ))}
          </div>
        </div>

        <div className="crm-sidebar__section">
          <p className="crm-sidebar__caption">{ui.language}</p>
          <div
            className="crm-language-switch"
            role="group"
            aria-label={ui.language}
          >
            <button
              type="button"
              className={
                crmLang === "ru"
                  ? "crm-lang-btn crm-lang-btn--active"
                  : "crm-lang-btn"
              }
              onClick={() => setCrmLang("ru")}
            >
              Русский
            </button>
            <button
              type="button"
              className={
                crmLang === "en"
                  ? "crm-lang-btn crm-lang-btn--active"
                  : "crm-lang-btn"
              }
              onClick={() => setCrmLang("en")}
            >
              English
            </button>
          </div>
        </div>

        <div className="crm-sidebar__footer crm-panel">
          <p className="crm-sidebar__caption">{ui.sidebarUsedSpace}</p>
          <div className="crm-sidebar__footer-top">
            <span>{sidebarAudit.line1}</span>
            <b>72%</b>
          </div>
          <div className="crm-sidebar__progress crm-sidebar__progress--footer">
            <div
              className="crm-sidebar__progress-bar"
              style={{ width: "72%" }}
            />
          </div>
          {sidebarAudit.line2 ? (
            <p className="crm-sidebar__footer-note">{sidebarAudit.line2}</p>
          ) : null}
          <button
            type="button"
            className="crm-btn crm-btn--ghost crm-sidebar__logout"
            onClick={handleLogout}
          >
            <FontAwesomeIcon icon={faRightFromBracket} />
            {ui.logout}
          </button>
        </div>
      </aside>

      <section className="crm-main">
        <CrmTabContent workspace={ws} />
      </section>
    </main>
  );
}
