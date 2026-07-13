import { useState } from "react";
import { PlatformPage } from "@/shared/ui/platform";
import { crmCopy } from "../../model/i18n";
import type { LogsSectionProps } from "./sectionTypes";
import { SiteLogTable } from "./SiteLogTable";

export function LogsSection({
  crmLang,
  logs,
  logCategories,
  rowLimitInput,
  setRowLimitInput,
  logDateFrom,
  setLogDateFrom,
  logDateTo,
  setLogDateTo,
  logFilter,
  setLogFilter,
}: LogsSectionProps) {
  const ui = crmCopy[crmLang];
  const [filteredCount, setFilteredCount] = useState(logs.length);

  return (
    <PlatformPage title={ui.logs} subtitle={ui.logsSubtitle}>
      <article className="crm-panel crm-table-card crm-panel--static crm-logs-panel">
        <div className="crm-section-head">
          <h3>{ui.logs}</h3>
          <span className="crm-muted">{filteredCount}</span>
        </div>

        <div className="crm-site-log__server-bar">
          <label className="crm-limit-input">
            <span className="crm-muted">{ui.rowsPerPage}</span>
            <input
              className="spx-input crm-input"
              inputMode="numeric"
              value={rowLimitInput}
              onChange={(event) =>
                setRowLimitInput(event.target.value.replace(/[^\d]/g, ""))
              }
            />
          </label>
          <input
            className="spx-input crm-input crm-chip-date"
            type="datetime-local"
            value={logDateFrom}
            onChange={(event) => setLogDateFrom(event.target.value)}
            aria-label={ui.logDateFrom}
          />
          <input
            className="spx-input crm-input crm-chip-date"
            type="datetime-local"
            value={logDateTo}
            onChange={(event) => setLogDateTo(event.target.value)}
            aria-label={ui.logDateTo}
          />
        </div>

        <div className="crm-chip-row crm-chip-row--filters crm-site-log__categories">
          <button
            type="button"
            className={logFilter === "all" ? "crm-chip crm-chip--active" : "crm-chip"}
            onClick={() => setLogFilter("all")}
          >
            {ui.logActionAll}
          </button>
          {logCategories.slice(0, 6).map((category) => (
            <button
              key={category.action}
              type="button"
              className={
                logFilter === category.action ? "crm-chip crm-chip--active" : "crm-chip"
              }
              onClick={() => setLogFilter(category.action)}
            >
              {category.action
                .replace(/_/g, " ")
                .replace(/\b\w/g, (letter) => letter.toUpperCase())}
              <span className="crm-chip__count">{category.count}</span>
            </button>
          ))}
        </div>

        <SiteLogTable
          crmLang={crmLang}
          logs={logs}
          pageSize={Number(rowLimitInput) || 15}
          onFilteredCountChange={setFilteredCount}
        />
      </article>
    </PlatformPage>
  );
}
