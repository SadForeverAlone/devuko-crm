import { useState } from "react";
import { crmCopy } from "../../model/i18n";
import type { CrmPlatformLog } from "@/entities/crm";
import { PlatformPage } from "@/shared/ui/platform";
import type { CrmLang } from "../../model/types";
import { PlatformLogTable } from "./PlatformLogTable";

type PlatformLogsSectionProps = {
  crmLang: CrmLang;
  logs: CrmPlatformLog[];
};

export function PlatformLogsSection({ crmLang, logs }: PlatformLogsSectionProps) {
  const ui = crmCopy[crmLang];
  const [filteredCount, setFilteredCount] = useState(logs.length);

  return (
    <PlatformPage title={ui.platformLogsTitle} subtitle={ui.platformLogsSubtitle}>
      <article className="crm-panel crm-table-card crm-panel--static crm-logs-panel">
        <div className="crm-section-head">
          <h3>{ui.logs}</h3>
          <span className="crm-muted">{filteredCount}</span>
        </div>
        <PlatformLogTable
          crmLang={crmLang}
          logs={logs}
          showIndex
          onFilteredCountChange={setFilteredCount}
        />
      </article>
    </PlatformPage>
  );
}
