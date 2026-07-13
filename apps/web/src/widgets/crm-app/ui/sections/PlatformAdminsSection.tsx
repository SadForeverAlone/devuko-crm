import { useEffect, useMemo, useState } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faArrowLeft,
  faAt,
  faCheck,
  faClockRotateLeft,
  faEnvelope,
  faKey,
  faPlus,
  faShieldHalved,
  faTrash,
  faUser,
  faXmark,
} from "@fortawesome/free-solid-svg-icons";
import type { CrmAdmin, CrmPlatformLog } from "@/entities/crm";
import { EmptyState, PlatformPage } from "@/shared/ui/platform";
import { crmCopy } from "../../model/i18n";
import { getCrmLocaleTag } from "../../model/lib";
import type { CrmLang } from "../../model/types";
import {
  filterAdminLoginHistory,
  formatPlatformDate,
  isAdminOnline,
  summarizeLoginHistory,
} from "./platform-admins.lib";
import { CrmTablePagination, formatCrmPaginationRange } from "./CrmTablePagination";

const LOGIN_HISTORY_PAGE_SIZE = 15;

type PlatformAdminsSectionProps = {
  crmLang: CrmLang;
  admins: CrmAdmin[];
  platformLogs: CrmPlatformLog[];
  usersView: "list" | "detail";
  isCreateAdmin: boolean;
  adminSearch: string;
  setAdminSearch: (value: string) => void;
  selectedAdmin: CrmAdmin | null;
  adminForm: { login: string; firstName: string; lastName: string; email: string };
  setAdminForm: React.Dispatch<
    React.SetStateAction<{ login: string; firstName: string; lastName: string; email: string }>
  >;
  adminPassword: string;
  setAdminPassword: (value: string) => void;
  adminPasswordKey: string;
  onNavigateCreateAdmin: () => void;
  onSelectAdmin: (adminId: string) => void;
  onBackToList: () => void;
  onSaveAdmin: () => void;
  onDeleteAdmin: () => void;
  currentAdminId: string | null;
  canDeleteAdmin: boolean;
  sectionTitle?: string;
};

function getAdminInitials(admin: Pick<CrmAdmin, "firstName" | "lastName" | "displayName">) {
  const first = admin.firstName?.trim()?.[0] ?? "";
  const last = admin.lastName?.trim()?.[0] ?? "";
  if (first || last) {
    return `${first}${last}`.toUpperCase();
  }
  return (
    admin.displayName
      .trim()
      .split(/\s+/)
      .map((part) => part[0] ?? "")
      .join("")
      .slice(0, 2)
      .toUpperCase() || "?"
  );
}

function loginEventLabel(action: string, crmLang: CrmLang) {
  if (action === "auth.login") return crmLang === "ru" ? "Успешный вход" : "Successful sign-in";
  if (action === "auth.login_failed") return crmLang === "ru" ? "Неудачная попытка" : "Failed attempt";
  return action;
}

type AdminFormFieldsProps = {
  ui: (typeof crmCopy)["ru"];
  adminForm: PlatformAdminsSectionProps["adminForm"];
  setAdminForm: PlatformAdminsSectionProps["setAdminForm"];
  adminPassword: string;
  setAdminPassword: PlatformAdminsSectionProps["setAdminPassword"];
  adminPasswordKey: string;
  isCreateAdmin: boolean;
};

function AdminFormFields({
  ui,
  adminForm,
  setAdminForm,
  adminPassword,
  setAdminPassword,
  adminPasswordKey,
  isCreateAdmin,
}: AdminFormFieldsProps) {
  return (
    <>
      <section className="crm-member-panel">
        <header className="crm-member-panel__head">
          <FontAwesomeIcon icon={faShieldHalved} />
          <div>
            <h3>{ui.platformAdminFormTitle}</h3>
            <p>{isCreateAdmin ? ui.platformAdminCreateSubtitle : ui.platformAdminEditSubtitle}</p>
          </div>
        </header>
        <div className="crm-member-panel__grid crm-member-panel__grid--2">
          <label className="crm-member-field">
            <span>{ui.fieldLogin}</span>
            <div className="crm-member-field__control">
              <FontAwesomeIcon icon={faAt} />
              <input
                className="spx-input crm-input"
                value={adminForm.login}
                onChange={(event) => setAdminForm((prev) => ({ ...prev, login: event.target.value }))}
                autoComplete="username"
              />
            </div>
          </label>
          <label className="crm-member-field">
            <span>{ui.fieldEmail}</span>
            <div className="crm-member-field__control">
              <FontAwesomeIcon icon={faEnvelope} />
              <input
                className="spx-input crm-input"
                type="email"
                value={adminForm.email}
                onChange={(event) => setAdminForm((prev) => ({ ...prev, email: event.target.value }))}
                autoComplete="email"
              />
            </div>
          </label>
          <label className="crm-member-field">
            <span>{ui.fieldName}</span>
            <div className="crm-member-field__control">
              <FontAwesomeIcon icon={faUser} />
              <input
                className="spx-input crm-input"
                value={adminForm.firstName}
                onChange={(event) => setAdminForm((prev) => ({ ...prev, firstName: event.target.value }))}
                autoComplete="given-name"
              />
            </div>
          </label>
          <label className="crm-member-field">
            <span>{ui.fieldSurname}</span>
            <div className="crm-member-field__control">
              <FontAwesomeIcon icon={faUser} />
              <input
                className="spx-input crm-input"
                value={adminForm.lastName}
                onChange={(event) => setAdminForm((prev) => ({ ...prev, lastName: event.target.value }))}
                autoComplete="family-name"
              />
            </div>
          </label>
          <label className="crm-member-field crm-member-field--full">
            <span>{ui.fieldPassword}</span>
            <div className="crm-member-field__control">
              <FontAwesomeIcon icon={faKey} />
              <input
                key={adminPasswordKey}
                className="spx-input crm-input crm-input--secret"
                type="password"
                value={adminPassword}
                onChange={(event) => setAdminPassword(event.target.value)}
                placeholder={isCreateAdmin ? ui.fieldPasswordCreateHint : ui.fieldPasswordHint}
                autoComplete="new-password"
                autoCorrect="off"
                spellCheck={false}
                data-1p-ignore="true"
                data-lpignore="true"
                name={`admin-new-password-${adminPasswordKey}`}
              />
            </div>
          </label>
        </div>
      </section>
    </>
  );
}

export function PlatformAdminsSection({
  crmLang,
  admins,
  platformLogs,
  usersView,
  isCreateAdmin,
  adminSearch,
  setAdminSearch,
  selectedAdmin,
  adminForm,
  setAdminForm,
  adminPassword,
  setAdminPassword,
  adminPasswordKey,
  onNavigateCreateAdmin,
  onSelectAdmin,
  onBackToList,
  onSaveAdmin,
  onDeleteAdmin,
  currentAdminId,
  canDeleteAdmin,
  sectionTitle,
}: PlatformAdminsSectionProps) {
  const ui = crmCopy[crmLang];
  const dateLocale = getCrmLocaleTag(crmLang);
  const filteredAdmins = admins.filter((admin) =>
    `${admin.login} ${admin.email} ${admin.firstName} ${admin.lastName} ${admin.displayName}`
      .toLowerCase()
      .includes(adminSearch.trim().toLowerCase())
  );

  const displayAdmins = useMemo(() => {
    return [...filteredAdmins].sort(
      (left, right) => new Date(left.createdAt).getTime() - new Date(right.createdAt).getTime(),
    );
  }, [filteredAdmins]);

  const adminCreationIndex = useMemo(() => {
    const sorted = [...admins].sort(
      (left, right) => new Date(left.createdAt).getTime() - new Date(right.createdAt).getTime(),
    );
    return new Map(sorted.map((admin, index) => [admin.id, index + 1]));
  }, [admins]);

  const loginHistory = useMemo(() => {
    if (!selectedAdmin) return [];
    return filterAdminLoginHistory(platformLogs, selectedAdmin);
  }, [platformLogs, selectedAdmin]);

  const [loginHistoryPage, setLoginHistoryPage] = useState(1);

  useEffect(() => {
    setLoginHistoryPage(1);
  }, [selectedAdmin?.id, loginHistory.length]);

  const loginHistoryPageCount = Math.max(
    1,
    Math.ceil(loginHistory.length / LOGIN_HISTORY_PAGE_SIZE),
  );

  const paginatedLoginHistory = useMemo(() => {
    const start = (loginHistoryPage - 1) * LOGIN_HISTORY_PAGE_SIZE;
    return loginHistory.slice(start, start + LOGIN_HISTORY_PAGE_SIZE);
  }, [loginHistory, loginHistoryPage]);

  useEffect(() => {
    if (loginHistoryPage > loginHistoryPageCount) {
      setLoginHistoryPage(loginHistoryPageCount);
    }
  }, [loginHistoryPage, loginHistoryPageCount]);

  const loginStats = useMemo(() => summarizeLoginHistory(loginHistory), [loginHistory]);

  if (usersView === "list") {
    return (
      <PlatformPage
        title={sectionTitle ?? ui.platformUsersTitle}
        subtitle={ui.platformUsersSubtitle}
        actions={
          <button type="button" className="crm-btn crm-btn--primary" onClick={onNavigateCreateAdmin}>
            <FontAwesomeIcon icon={faPlus} />
            {ui.platformAdminAdd}
          </button>
        }
      >
        <article className="crm-panel crm-table-card crm-member-directory">
          <div className="crm-member-directory__toolbar">
            <input
              className="spx-input crm-input crm-member-directory__search"
              placeholder={ui.platformAdminSearchPlaceholder}
              value={adminSearch}
              onChange={(event) => setAdminSearch(event.target.value)}
            />
          </div>

          <div className="crm-table-wrap">
            <table className="crm-data-table crm-data-table--compact crm-member-table">
              <thead>
                <tr>
                  <th>{ui.tableIndex}</th>
                  <th>{ui.tableName}</th>
                  <th>{ui.tableLogin}</th>
                  <th>{ui.tableEmail}</th>
                  <th>{ui.promiseColStatus}</th>
                  <th>{ui.tableCreated}</th>
                </tr>
              </thead>
              <tbody>
                {displayAdmins.map((admin) => {
                  const adminHistory = filterAdminLoginHistory(platformLogs, admin);
                  const adminStats = summarizeLoginHistory(adminHistory);
                  const online = isAdminOnline(admin.id, currentAdminId, adminStats.lastSuccess);
                  return (
                    <tr key={admin.id} onClick={() => onSelectAdmin(admin.id)}>
                      <td>{adminCreationIndex.get(admin.id) ?? "—"}</td>
                      <td className="crm-member-table__name">
                        <span
                          className={`crm-member-table__avatar${online ? " crm-member-table__avatar--online" : ""}`}
                        >
                          {getAdminInitials(admin)}
                        </span>
                        <span>{admin.displayName}</span>
                      </td>
                      <td>{admin.login}</td>
                      <td>{admin.email}</td>
                      <td>
                        <span className={`crm-member-status crm-member-status--${online ? "online" : "offline"}`}>
                          {online ? ui.platformAdminStatusOnline : ui.platformAdminStatusOffline}
                        </span>
                      </td>
                      <td>
                        {formatPlatformDate(admin.createdAt, dateLocale, { dateStyle: "medium" })}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </article>
      </PlatformPage>
    );
  }

  const previewName =
    [adminForm.firstName, adminForm.lastName].filter(Boolean).join(" ").trim() || ui.platformAdminCreateTitle;
  const previewLogin = adminForm.login.trim() || "—";
  const isSelf = selectedAdmin?.id === currentAdminId;
  const isOnline = selectedAdmin
    ? isAdminOnline(selectedAdmin.id, currentAdminId, loginStats.lastSuccess)
    : false;

  return (
    <div className="crm-member-page">
      <header className="crm-member-toolbar">
        <button type="button" className="crm-member-toolbar__back" onClick={onBackToList}>
          <FontAwesomeIcon icon={faArrowLeft} />
          {ui.platformAdminBack}
        </button>
        <div className="crm-member-toolbar__actions">
          {!isCreateAdmin && selectedAdmin && canDeleteAdmin ? (
            <button
              type="button"
              className="crm-btn crm-btn--ghost crm-btn--danger crm-btn--sm"
              onClick={() => void onDeleteAdmin()}
              disabled={isSelf}
              title={isSelf ? ui.platformAdminDeleteSelfBlocked : undefined}
            >
              <FontAwesomeIcon icon={faTrash} />
              {ui.platformAdminDelete}
            </button>
          ) : null}
          <button type="button" className="crm-btn crm-btn--primary crm-btn--sm" onClick={() => void onSaveAdmin()}>
            {isCreateAdmin ? ui.createUser : ui.saveUser}
          </button>
        </div>
      </header>

      {isCreateAdmin ? (
        <div className="crm-member-create">
          <div className="crm-member-create__intro">
            <span className="crm-member-create__avatar">+</span>
            <div>
              <p className="crm-member-create__eyebrow">{ui.platformAdminCreateTitle}</p>
              <h1>{previewName}</h1>
            </div>
          </div>
          <AdminFormFields
            ui={ui}
            adminForm={adminForm}
            setAdminForm={setAdminForm}
            adminPassword={adminPassword}
            setAdminPassword={setAdminPassword}
            adminPasswordKey={adminPasswordKey}
            isCreateAdmin
          />
        </div>
      ) : (
        <>
          <header className="crm-member-header">
            <span className={`crm-member-header__avatar${isOnline ? " crm-member-header__avatar--online" : ""}`}>
              {getAdminInitials({
                firstName: adminForm.firstName,
                lastName: adminForm.lastName,
                displayName: previewName,
              })}
            </span>
            <div className="crm-member-header__identity">
              <div className="crm-member-header__title-row">
                <h1>{previewName}</h1>
                {isSelf ? <span className="crm-member-header__you">{crmLang === "ru" ? "Вы" : "You"}</span> : null}
                <span className={`crm-member-status crm-member-status--${isOnline ? "online" : "offline"}`}>
                  <i aria-hidden />
                  {isOnline ? ui.platformAdminStatusOnline : ui.platformAdminStatusOffline}
                </span>
              </div>
              <p>
                @{previewLogin} · {adminForm.email.trim() || "—"}
              </p>
              {!isOnline && loginStats.lastSuccess ? (
                <p className="crm-member-header__seen">
                  {ui.platformAdminLastSeen}:{" "}
                  {formatPlatformDate(loginStats.lastSuccess.createdAt, dateLocale, {
                    dateStyle: "medium",
                    timeStyle: "short",
                  })}
                </p>
              ) : null}
            </div>
            <dl className="crm-member-header__stats">
              <div>
                <dt>{ui.tableCreated}</dt>
                <dd>
                  {selectedAdmin
                    ? formatPlatformDate(selectedAdmin.createdAt, dateLocale, { dateStyle: "medium" })
                    : "—"}
                </dd>
              </div>
              <div>
                <dt>{ui.platformAdminStatLogins}</dt>
                <dd>{loginStats.successful}</dd>
              </div>
              <div>
                <dt>{ui.platformAdminStatFailed}</dt>
                <dd>{loginStats.failed}</dd>
              </div>
              <div>
                <dt>{ui.platformAdminStatLastLogin}</dt>
                <dd>
                  {loginStats.lastSuccess
                    ? formatPlatformDate(loginStats.lastSuccess.createdAt, dateLocale, {
                        dateStyle: "medium",
                        timeStyle: "short",
                      })
                    : "—"}
                </dd>
              </div>
            </dl>
          </header>

          <div className="crm-member-workspace">
            <AdminFormFields
              ui={ui}
              adminForm={adminForm}
              setAdminForm={setAdminForm}
              adminPassword={adminPassword}
              setAdminPassword={setAdminPassword}
              adminPasswordKey={adminPasswordKey}
              isCreateAdmin={false}
            />

            <section className="crm-member-panel">
              <header className="crm-member-panel__head">
                <FontAwesomeIcon icon={faClockRotateLeft} />
                <div>
                  <h3>{ui.platformAdminLoginHistoryTitle}</h3>
                  <p>{ui.platformAdminLoginHistorySubtitle}</p>
                </div>
              </header>

              {loginHistory.length === 0 ? (
                <EmptyState
                  icon={faClockRotateLeft}
                  title={ui.platformAdminLoginHistoryTitle}
                  description={ui.platformAdminLoginHistoryEmpty}
                />
              ) : (
                <>
                <ol className="crm-member-timeline">
                  {paginatedLoginHistory.map((entry) => (
                    <li
                      key={entry.id}
                      className={
                        entry.ok
                          ? "crm-member-timeline__item crm-member-timeline__item--ok"
                          : "crm-member-timeline__item crm-member-timeline__item--fail"
                      }
                    >
                      <span className="crm-member-timeline__dot" aria-hidden>
                        <FontAwesomeIcon icon={entry.ok ? faCheck : faXmark} />
                      </span>
                      <div className="crm-member-timeline__content">
                        <div className="crm-member-timeline__top">
                          <strong>{loginEventLabel(entry.action, crmLang)}</strong>
                          <time>
                            {formatPlatformDate(entry.createdAt, dateLocale, {
                              dateStyle: "medium",
                              timeStyle: "short",
                            })}
                          </time>
                        </div>
                        {(entry.detail || entry.target) && (
                          <p>{entry.detail || entry.target}</p>
                        )}
                      </div>
                    </li>
                  ))}
                </ol>
                <div className="crm-member-panel__footer">
                  <CrmTablePagination
                    page={loginHistoryPage}
                    pageCount={loginHistoryPageCount}
                    onPageChange={setLoginHistoryPage}
                    summary={formatCrmPaginationRange(
                      loginHistoryPage,
                      LOGIN_HISTORY_PAGE_SIZE,
                      loginHistory.length,
                      crmLang,
                    )}
                    prevLabel={ui.paginationPrev}
                    nextLabel={ui.paginationNext}
                  />
                </div>
                </>
              )}
            </section>
          </div>
        </>
      )}
    </div>
  );
}
