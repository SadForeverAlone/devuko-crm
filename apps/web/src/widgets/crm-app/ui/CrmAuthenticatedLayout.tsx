import { Outlet, useLocation } from "react-router-dom";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faBars,
  faChevronDown,
  faFolder,
  faGlobe,
  faRightFromBracket,
  faXmark,
} from "@fortawesome/free-solid-svg-icons";
import { useEffect, useState } from "react";
import {
  useCrmWorkspaceChromeState,
  useCrmWorkspaceNavigation,
} from "../model/useCrmWorkspaceSlices";
import { platformNavItems } from "../model/platform-nav";
import { useCommandPalette } from "../model/useCommandPalette";
import { CommandPalette } from "./CommandPalette";

function accountInitials(session: { firstName?: string; lastName?: string; displayName?: string }) {
  const first = session.firstName?.trim()?.[0] ?? "";
  const last = session.lastName?.trim()?.[0] ?? "";
  if (first || last) {
    return `${first}${last}`.toUpperCase();
  }
  const source = session.displayName?.trim() ?? "";
  const parts = source.split(/\s+/).filter(Boolean);
  if (parts.length >= 2) {
    return `${parts[0][0] ?? ""}${parts[1][0] ?? ""}`.toUpperCase();
  }
  return source.slice(0, 2).toUpperCase() || "?";
}

const navGroupLabels = {
  primary: { ru: "Основное", en: "Core" },
  operations: { ru: "Операции", en: "Operations" },
  system: { ru: "Система", en: "System" },
} as const;

export function CrmAuthenticatedLayout() {
  const nav = useCrmWorkspaceNavigation();
  const chrome = useCrmWorkspaceChromeState();
  const location = useLocation();
  const commandPalette = useCommandPalette();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const {
    crmLang,
    setCrmLang,
    crmSession,
    ui,
    workspaces,
    activeWorkspace,
    activeWorkspaceDisplay,
    workspaceMenuOpen,
    setWorkspaceMenuOpen,
    handleLogout,
    activeWorkspaceId,
    isPlatformWorkspace,
  } = chrome;
  const {
    tab,
    navigate,
    crmNavItems,
    crmShortcutItems,
    crmTabPathMap,
    handleSwitchWorkspace,
  } = nav;

  const workspaceLabel = activeWorkspaceDisplay.label;
  const isPlatformActive = activeWorkspaceDisplay.kind === "platform";

  const platformWorkspaces = workspaces.filter((item) => item.kind === "platform");
  const siteWorkspaces = workspaces.filter((item) => item.kind === "site");
  const pageKey = `${activeWorkspaceId}:${location.pathname}`;
  const menuLabel = crmLang === "ru" ? "Меню" : "Menu";

  useEffect(() => {
    setSidebarOpen(false);
  }, [location.pathname, activeWorkspaceId]);

  const navGroups = isPlatformWorkspace
    ? (["primary", "operations", "system"] as const).map((group) => ({
        group,
        label: navGroupLabels[group][crmLang],
        items: platformNavItems.filter((item) => item.group === group),
      }))
    : [{ group: "primary" as const, label: "", items: crmNavItems }];

  return (
    <main className={sidebarOpen ? "crm-root crm-root--sidebar-open" : "crm-root"}>
      {sidebarOpen ? (
        <div
          className="crm-sidebar-backdrop"
          role="presentation"
          onClick={() => setSidebarOpen(false)}
          onKeyDown={(event) => {
            if (event.key === "Escape") setSidebarOpen(false);
          }}
        />
      ) : null}
      <aside className="crm-sidebar">
        <div className="crm-sidebar__body">
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
                <FontAwesomeIcon icon={isPlatformActive ? faGlobe : faFolder} />
              </span>
              <span className="crm-sidebar__workspace-label">{workspaceLabel}</span>
              <FontAwesomeIcon
                icon={faChevronDown}
                className={
                  workspaceMenuOpen
                    ? "crm-sidebar__workspace-caret crm-sidebar__workspace-caret--open"
                    : "crm-sidebar__workspace-caret"
                }
              />
            </button>
            {workspaceMenuOpen ? (
              <div className="crm-workspace-menu" role="listbox" aria-label={ui.workspaceSwitch}>
                <p className="crm-workspace-menu__group">{ui.workspaceMenuPlatform}</p>
                {platformWorkspaces.map((item) => (
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
                      <FontAwesomeIcon icon={faGlobe} />
                    </span>
                    <span className="crm-workspace-menu__text">
                      <span className="crm-workspace-menu__title">{ui.platformWorkspaceLabel}</span>
                      <span className="crm-workspace-menu__subtitle">{ui.workspaceMenuPlatform}</span>
                    </span>
                    <span className="crm-workspace-menu__badge">OS</span>
                  </button>
                ))}
                {siteWorkspaces.length > 0 ? (
                  <p className="crm-workspace-menu__group">{ui.workspaceMenuSites}</p>
                ) : null}
                {siteWorkspaces.map((item) => (
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
                    <span className="crm-workspace-menu__icon crm-workspace-menu__icon--site">
                      <FontAwesomeIcon icon={faFolder} />
                    </span>
                    <span className="crm-workspace-menu__text">
                      <span className="crm-workspace-menu__title">{item.label}</span>
                      <span className="crm-workspace-menu__subtitle">
                        {item.siteDomain ?? item.slug}
                      </span>
                    </span>
                  </button>
                ))}
              </div>
            ) : null}
          </div>

          {navGroups.map(({ group, label, items }) => (
            <div key={group} className="crm-sidebar__section">
              {label ? <p className="crm-sidebar__caption">{label}</p> : null}
              <nav className="crm-nav" aria-label={label || "Navigation"}>
                {items.map((item) => (
                  <button
                    key={item.key}
                    type="button"
                    className={
                      tab === item.key || (item.key === "projects" && tab === "sites")
                        ? "crm-nav__item crm-nav__item--active"
                        : "crm-nav__item"
                    }
                    aria-current={
                      tab === item.key || (item.key === "projects" && tab === "sites") ? "page" : undefined
                    }
                    onClick={() => {
                      navigate(crmTabPathMap[item.key === "sites" ? "projects" : item.key]);
                      setSidebarOpen(false);
                    }}
                  >
                    <span className="crm-nav__icon">
                      <FontAwesomeIcon icon={item.icon} />
                    </span>
                    {item.label[crmLang]}
                  </button>
                ))}
              </nav>
            </div>
          ))}

          {!isPlatformWorkspace && crmShortcutItems.length > 0 ? (
            <div className="crm-sidebar__section">
              <p className="crm-sidebar__caption">{ui.sections}</p>
              <div className="crm-shortcuts">
                {crmShortcutItems.map((item) => (
                  <button
                    key={item.key}
                    type="button"
                    className={
                      tab === item.key ? "crm-shortcut crm-shortcut--active" : "crm-shortcut"
                    }
                    aria-current={tab === item.key ? "page" : undefined}
                    onClick={() => {
                      navigate(crmTabPathMap[item.key]);
                      setSidebarOpen(false);
                    }}
                  >
                    <span className="crm-shortcut__icon">
                      <FontAwesomeIcon icon={item.icon} />
                    </span>
                    {item.label[crmLang]}
                  </button>
                ))}
              </div>
            </div>
          ) : null}

          <div className="crm-sidebar__section crm-sidebar__section--bottom">
            <p className="crm-sidebar__caption">{ui.language}</p>
            <div className="crm-language-switch" role="group" aria-label={ui.language}>
              <button
                type="button"
                className={crmLang === "ru" ? "crm-lang-btn crm-lang-btn--active" : "crm-lang-btn"}
                aria-pressed={crmLang === "ru"}
                onClick={() => setCrmLang("ru")}
              >
                Русский
              </button>
              <button
                type="button"
                className={crmLang === "en" ? "crm-lang-btn crm-lang-btn--active" : "crm-lang-btn"}
                aria-pressed={crmLang === "en"}
                onClick={() => setCrmLang("en")}
              >
                English
              </button>
            </div>
          </div>
        </div>

        <div className="crm-sidebar__account">
          <div className="crm-sidebar__user">
            <span className="crm-sidebar__avatar" aria-hidden>
              {crmSession ? accountInitials(crmSession) : "?"}
            </span>
            <div className="crm-sidebar__user-meta">
              <strong>{crmSession?.displayName ?? ui.platformWorkspaceLabel}</strong>
              <p>{crmSession?.login ? `@${crmSession.login}` : crmSession?.email ?? "—"}</p>
            </div>
          </div>
          <button
            type="button"
            className="crm-sidebar__account-logout"
            onClick={handleLogout}
            title={ui.logout}
            aria-label={ui.logout}
          >
            <FontAwesomeIcon icon={faRightFromBracket} />
          </button>
        </div>
      </aside>

      <section className="crm-main">
        <button
          type="button"
          className="crm-mobile-nav-toggle"
          aria-expanded={sidebarOpen}
          aria-label={menuLabel}
          onClick={() => setSidebarOpen((open) => !open)}
        >
          <FontAwesomeIcon icon={sidebarOpen ? faXmark : faBars} />
        </button>
        <Outlet key={pageKey} />
      </section>

      <CommandPalette
        open={commandPalette.open}
        onClose={() => commandPalette.setOpen(false)}
        onNavigate={navigate}
        crmLang={crmLang}
        isPlatformWorkspace={isPlatformWorkspace}
      />
    </main>
  );
}
