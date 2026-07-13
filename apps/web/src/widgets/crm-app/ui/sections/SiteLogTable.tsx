import { useEffect, useMemo, useState } from "react";
import { crmCopy } from "../../model/i18n";
import { clampNumber, getCrmLocaleTag } from "../../model/lib";
import type { UserRoleCode } from "../../model/i18n";
import type { CrmLang } from "../../model/types";
import type { VisibleLogRecord } from "./sectionTypes";
import { CrmTablePagination, formatCrmPaginationRange } from "./CrmTablePagination";
import { PlatformLogActionFilter } from "./PlatformLogActionFilter";

const DEFAULT_PAGE_SIZE = 15;

type SiteLogTableProps = {
  crmLang: CrmLang;
  logs: VisibleLogRecord[];
  pageSize?: number;
  onFilteredCountChange?: (count: number) => void;
};

export function SiteLogTable({
  crmLang,
  logs,
  pageSize: pageSizeInput = DEFAULT_PAGE_SIZE,
  onFilteredCountChange,
}: SiteLogTableProps) {
  const ui = crmCopy[crmLang];
  const locale = getCrmLocaleTag(crmLang);
  const pageSize = clampNumber(pageSizeInput, 10, 200, DEFAULT_PAGE_SIZE);
  const [search, setSearch] = useState("");
  const [roleFilter, setRoleFilter] = useState<"all" | UserRoleCode>("all");
  const [page, setPage] = useState(1);

  const roleOptions = useMemo(
    () =>
      ([
        "all",
        "admin",
        "manager",
        "support",
        "user",
        "system",
      ] as const).map((value) => ({
        value,
        label:
          value === "all"
            ? ui.logRoleFilterAll
            : ui.userRoles[value],
      })),
    [ui.logRoleFilterAll, ui.userRoles]
  );

  const visibleLogs = useMemo(() => {
    const query = search.trim().toLowerCase();
    return logs.filter((log) => {
      if (roleFilter !== "all" && log.role !== roleFilter) return false;
      if (!query) return true;
      const haystack = [
        log.actorName,
        log.readableAction,
        log.readablePath,
        log.result,
        ui.userRoles[log.role],
      ]
        .join(" ")
        .toLowerCase();
      return haystack.includes(query);
    });
  }, [logs, roleFilter, search, ui.userRoles]);

  const pageCount = Math.max(1, Math.ceil(visibleLogs.length / pageSize));

  const paginatedLogs = useMemo(() => {
    const start = (page - 1) * pageSize;
    return visibleLogs.slice(start, start + pageSize);
  }, [visibleLogs, page, pageSize]);

  useEffect(() => {
    setPage(1);
  }, [search, roleFilter, logs, pageSize]);

  useEffect(() => {
    if (page > pageCount) {
      setPage(pageCount);
    }
  }, [page, pageCount]);

  useEffect(() => {
    onFilteredCountChange?.(visibleLogs.length);
  }, [visibleLogs.length, onFilteredCountChange]);

  return (
    <div className="crm-platform-log crm-site-log">
      <div className="crm-platform-log__toolbar">
        <input
          className="spx-input crm-input crm-platform-log__search"
          value={search}
          onChange={(event) => setSearch(event.target.value)}
          placeholder={ui.siteLogsSearch}
        />
        <PlatformLogActionFilter
          label={ui.logColRole}
          value={roleFilter}
          allLabel={ui.logRoleFilterAll}
          options={roleOptions
            .filter((option) => option.value !== "all")
            .map((option) => ({
              value: option.value,
              label: option.label,
            }))}
          onChange={(value) => setRoleFilter(value as "all" | UserRoleCode)}
        />
      </div>

      <div className="crm-table-wrap">
        <table className="crm-data-table crm-data-table--compact crm-platform-log__table">
          <thead>
            <tr>
              <th>{ui.tableIndex}</th>
              <th>{ui.logColTime}</th>
              <th>{ui.logColRole}</th>
              <th>{ui.logColActor}</th>
              <th>{ui.logColAction}</th>
              <th>{ui.logColPath}</th>
              <th>{ui.logColResult}</th>
            </tr>
          </thead>
          <tbody>
            {paginatedLogs.length === 0 ? (
              <tr>
                <td colSpan={7} className="crm-muted crm-site-log__empty">
                  {ui.logsEmpty}
                </td>
              </tr>
            ) : (
              paginatedLogs.map((log, index) => (
                <tr key={log.id}>
                  <td>{(page - 1) * pageSize + index + 1}</td>
                  <td>{new Date(log.createdAt).toLocaleString(locale)}</td>
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
