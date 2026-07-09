import { crmCopy } from "../../model/i18n";
import { getCrmLocaleTag, renderLogFilterHeader } from "../../model/lib";
import type { UserRoleCode } from "../../model/i18n";
import type { LogsSectionProps } from "./sectionTypes";

export function LogsSection({
  crmLang,
  rowLimitInput,
  setRowLimitInput,
  logDateFrom,
  setLogDateFrom,
  logDateTo,
  setLogDateTo,
  logRoleFilter,
  setLogRoleFilter,
  logFilter,
  setLogFilter,
  logCategories,
  activeLogFilterMenu,
  setActiveLogFilterMenu,
  logColumnFilters,
  setLogColumnFilters,
  paginatedLogs,
  logPageCount,
  logPage,
  setLogPage,
  logRowsPerPage,
}: LogsSectionProps) {
  const ui = crmCopy[crmLang];
  const dateLocale = getCrmLocaleTag(crmLang);
  const logRoleSelect: Array<{ value: "all" | UserRoleCode; label: string }> = [
    { value: "all", label: ui.logRoleFilterAll },
    { value: "admin", label: ui.logRoleFilterAdmin },
    { value: "manager", label: ui.logRoleFilterManager },
    { value: "support", label: ui.logRoleFilterSupport },
    { value: "user", label: ui.logRoleFilterUser },
    { value: "system", label: ui.logRoleFilterSystem },
  ];
  return (
    <section className="crm-stack">
      <article className="crm-panel crm-table-card">
        <div className="crm-section-head">
          <h3>{ui.logs}</h3>
          <label className="crm-limit-input">
            <span className="crm-muted">{ui.rowsLimit}</span>
            <input
              className="spx-input crm-input"
              inputMode="numeric"
              value={rowLimitInput}
              onChange={(event) =>
                setRowLimitInput(event.target.value.replace(/[^\d]/g, ""))
              }
            />
          </label>
        </div>
        <div className="crm-chip-row crm-chip-row--filters">
          <input
            className="spx-input crm-input crm-chip-date"
            type="datetime-local"
            value={logDateFrom}
            onChange={(event) => setLogDateFrom(event.target.value)}
          />
          <input
            className="spx-input crm-input crm-chip-date"
            type="datetime-local"
            value={logDateTo}
            onChange={(event) => setLogDateTo(event.target.value)}
          />
          <select
            className="spx-input crm-input crm-select"
            value={logRoleFilter}
            onChange={(event) =>
              setLogRoleFilter(event.target.value as "all" | UserRoleCode)
            }
          >
            {logRoleSelect.map((opt) => (
              <option key={opt.value} value={opt.value}>
                {opt.label}
              </option>
            ))}
          </select>
          <button
            type="button"
            className={
              logFilter === "all" ? "crm-chip crm-chip--active" : "crm-chip"
            }
            onClick={() => setLogFilter("all")}
          >
            {ui.logActionAll}
          </button>
          {logCategories.slice(0, 6).map((category) => (
            <button
              key={category.action}
              type="button"
              className={
                logFilter === category.action
                  ? "crm-chip crm-chip--active"
                  : "crm-chip"
              }
              onClick={() => setLogFilter(category.action)}
            >
              {category.action
                .replace(/_/g, " ")
                .replace(/\b\w/g, (letter) => letter.toUpperCase())}
            </button>
          ))}
        </div>
        <div className="crm-table-wrap">
          <table className="crm-data-table">
            <thead>
              <tr>
                <th>{ui.tableIndex}</th>
                <th>
                  {renderLogFilterHeader(
                    ui.logColTime,
                    "time",
                    activeLogFilterMenu,
                    setActiveLogFilterMenu,
                    logColumnFilters.time,
                    (value) =>
                      setLogColumnFilters((prev) => ({ ...prev, time: value })),
                    ui.filterReset,
                  )}
                </th>
                <th>
                  {renderLogFilterHeader(
                    ui.logColRole,
                    "role",
                    activeLogFilterMenu,
                    setActiveLogFilterMenu,
                    logColumnFilters.role,
                    (value) =>
                      setLogColumnFilters((prev) => ({ ...prev, role: value })),
                    ui.filterReset,
                  )}
                </th>
                <th>
                  {renderLogFilterHeader(
                    ui.logColActor,
                    "actor",
                    activeLogFilterMenu,
                    setActiveLogFilterMenu,
                    logColumnFilters.actor,
                    (value) =>
                      setLogColumnFilters((prev) => ({
                        ...prev,
                        actor: value,
                      })),
                    ui.filterReset,
                  )}
                </th>
                <th>
                  {renderLogFilterHeader(
                    ui.logColAction,
                    "action",
                    activeLogFilterMenu,
                    setActiveLogFilterMenu,
                    logColumnFilters.action,
                    (value) =>
                      setLogColumnFilters((prev) => ({
                        ...prev,
                        action: value,
                      })),
                    ui.filterReset,
                  )}
                </th>
                <th>
                  {renderLogFilterHeader(
                    ui.logColPath,
                    "path",
                    activeLogFilterMenu,
                    setActiveLogFilterMenu,
                    logColumnFilters.path,
                    (value) =>
                      setLogColumnFilters((prev) => ({ ...prev, path: value })),
                    ui.filterReset,
                  )}
                </th>
                <th>
                  {renderLogFilterHeader(
                    ui.logColResult,
                    "result",
                    activeLogFilterMenu,
                    setActiveLogFilterMenu,
                    logColumnFilters.result,
                    (value) =>
                      setLogColumnFilters((prev) => ({
                        ...prev,
                        result: value,
                      })),
                    ui.filterReset,
                  )}
                </th>
              </tr>
            </thead>
            <tbody>
              {paginatedLogs.map((log, index) => (
                <tr key={log.id}>
                  <td>{(logPage - 1) * logRowsPerPage + index + 1}</td>
                  <td>
                    {new Date(log.createdAt).toLocaleString(dateLocale)}
                  </td>
                  <td>{ui.userRoles[log.role]}</td>
                  <td>{log.actorName}</td>
                  <td>{log.readableAction}</td>
                  <td>{log.readablePath}</td>
                  <td>
                    <span
                      className={
                        log.statusCode && log.statusCode >= 400
                          ? "crm-status crm-status--error"
                          : "crm-status crm-status--ok"
                      }
                    >
                      {log.result}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <div className="crm-pagination crm-pagination--pages">
          {Array.from({ length: logPageCount }, (_, index) => index + 1)
            .slice(0, 8)
            .map((page) => (
              <button
                key={page}
                type="button"
                className={
                  page === logPage ? "crm-chip crm-chip--active" : "crm-chip"
                }
                onClick={() => setLogPage(page)}
              >
                {page}
              </button>
            ))}
        </div>
      </article>
    </section>
  );
}
