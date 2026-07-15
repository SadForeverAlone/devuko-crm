import { useEffect, useMemo, useState } from "react";
import { crmCopy } from "@/widgets/crm-app/model/i18n";
import { getCrmLocaleTag } from "@/widgets/crm-app/model/lib";
import type { CrmPlatformLog } from "@/entities/crm";
import type { CrmLang } from "@/widgets/crm-app/model/types";
import { platformLogActionLabel, platformLogActionLabels } from "@/features/crm-logs/ui/platform-log-labels.lib";
import { CrmTablePagination, formatCrmPaginationRange } from "@/shared/crm/ui/CrmTablePagination";
import { PlatformLogActionFilter } from "@/features/crm-logs/ui/PlatformLogActionFilter";

const DEFAULT_PAGE_SIZE = 10;

type PlatformLogTableProps = {
  crmLang: CrmLang;
  logs: CrmPlatformLog[];
  showIndex?: boolean;
  searchPlaceholder?: string;
  className?: string;
  pageSize?: number;
  onFilteredCountChange?: (count: number) => void;
};

export function PlatformLogTable({
  crmLang,
  logs,
  showIndex = false,
  searchPlaceholder,
  className = "crm-platform-log",
  pageSize = DEFAULT_PAGE_SIZE,
  onFilteredCountChange,
}: PlatformLogTableProps) {
  const ui = crmCopy[crmLang];
  const locale = getCrmLocaleTag(crmLang);
  const labels = platformLogActionLabels[crmLang];
  const [actionFilter, setActionFilter] = useState("all");
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);

  const actionOptions = useMemo(() => {
    const unique = [...new Set(logs.map((log) => log.action))];
    return unique.sort();
  }, [logs]);

  const visibleLogs = useMemo(() => {
    const query = search.trim().toLowerCase();
    return logs.filter((log) => {
      if (actionFilter !== "all" && log.action !== actionFilter) return false;
      if (!query) return true;
      const haystack = [log.actorName, log.action, log.target, log.detail, labels[log.action]]
        .filter(Boolean)
        .join(" ")
        .toLowerCase();
      return haystack.includes(query);
    });
  }, [logs, actionFilter, search, labels]);

  const pageCount = Math.max(1, Math.ceil(visibleLogs.length / pageSize));

  const paginatedLogs = useMemo(() => {
    const start = (page - 1) * pageSize;
    return visibleLogs.slice(start, start + pageSize);
  }, [visibleLogs, page, pageSize]);

  useEffect(() => {
    setPage(1);
  }, [actionFilter, search, logs, pageSize]);

  useEffect(() => {
    if (page > pageCount) {
      setPage(pageCount);
    }
  }, [page, pageCount]);

  useEffect(() => {
    onFilteredCountChange?.(visibleLogs.length);
  }, [visibleLogs.length, onFilteredCountChange]);

  return (
    <div className={className}>
      <div className="crm-platform-log__toolbar">
        <input
          className="spx-input crm-input crm-platform-log__search"
          value={search}
          onChange={(event) => setSearch(event.target.value)}
          placeholder={searchPlaceholder ?? ui.platformLogsSearch}
        />
        <PlatformLogActionFilter
          label={ui.platformLogsColAction}
          value={actionFilter}
          allLabel={ui.logActionAll}
          options={actionOptions.map((action) => ({
            value: action,
            label: platformLogActionLabel(action, crmLang),
          }))}
          onChange={setActionFilter}
        />
      </div>

      <div className="crm-table-wrap">
        <table className="crm-data-table crm-data-table--compact crm-platform-log__table">
          <colgroup>
            {showIndex ? <col className="crm-platform-log__col-index" /> : null}
            <col className="crm-platform-log__col-time" />
            <col className="crm-platform-log__col-actor" />
            <col className="crm-platform-log__col-action" />
            <col className="crm-platform-log__col-target" />
            <col className="crm-platform-log__col-detail" />
            <col className="crm-platform-log__col-result" />
          </colgroup>
          <thead>
            <tr>
              {showIndex ? <th>{ui.tableIndex}</th> : null}
              <th>{ui.platformLogsColTime}</th>
              <th>{ui.platformLogsColActor}</th>
              <th>{ui.platformLogsColAction}</th>
              <th>{ui.platformLogsColTarget}</th>
              <th>{ui.platformLogsColDetail}</th>
              <th>{ui.platformLogsColResult}</th>
            </tr>
          </thead>
          <tbody>
            {paginatedLogs.length === 0 ? (
              <tr>
                <td colSpan={showIndex ? 7 : 6} className="crm-muted">
                  {ui.sidebarNoAuditActivity}
                </td>
              </tr>
            ) : (
              paginatedLogs.map((log, index) => (
                <tr key={log.id}>
                  {showIndex ? <td>{(page - 1) * pageSize + index + 1}</td> : null}
                  <td className="crm-platform-log__time">
                    {new Intl.DateTimeFormat(locale, {
                      dateStyle: "short",
                      timeStyle: "medium",
                    }).format(new Date(log.createdAt))}
                  </td>
                  <td>{log.actorName ?? "—"}</td>
                  <td>{platformLogActionLabel(log.action, crmLang)}</td>
                  <td>{log.target ?? "—"}</td>
                  <td className="crm-table__cell--wrap">
                    <div
                      className="crm-platform-log__detail"
                      title={log.detail ?? undefined}
                    >
                      {log.detail ?? "—"}
                    </div>
                  </td>
                  <td className="crm-platform-log__result">
                    <span className={`crm-status crm-status--${log.ok ? "ok" : "error"}`}>
                      {log.ok ? ui.platformLogsOk : ui.platformLogsFail}
                    </span>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      <CrmTablePagination
        page={page}
        pageCount={pageCount}
        onPageChange={setPage}
        summary={formatCrmPaginationRange(page, pageSize, visibleLogs.length, crmLang)}
        prevLabel={ui.paginationPrev}
        nextLabel={ui.paginationNext}
      />
    </div>
  );
}
