import { getCrmLocaleTag } from "@/widgets/crm-app/model/lib";
import { crmCopy } from "@/widgets/crm-app/model/i18n";
import type { CrmLang } from "@/widgets/crm-app/model/types";

type ProvisionEntry = {
  step: string;
  ok: boolean;
  message: string;
  at: string;
};

type ProvisionLogTableProps = {
  crmLang: CrmLang;
  entries: ProvisionEntry[];
};

export function ProvisionLogTable({ crmLang, entries }: ProvisionLogTableProps) {
  const ui = crmCopy[crmLang];
  const locale = getCrmLocaleTag(crmLang);

  return (
    <div className="crm-provision-log">
      <div className="crm-table-wrap">
        <table className="crm-data-table crm-data-table--compact crm-provision-log__table">
          <colgroup>
            <col className="crm-provision-log__col-index" />
            <col className="crm-provision-log__col-step" />
            <col className="crm-provision-log__col-message" />
            <col className="crm-provision-log__col-time" />
            <col className="crm-provision-log__col-result" />
          </colgroup>
          <thead>
            <tr>
              <th>#</th>
              <th>{ui.sitesProvisionColStep}</th>
              <th>{ui.sitesProvisionColMessage}</th>
              <th>{ui.sitesProvisionColTime}</th>
              <th>{ui.platformLogsColResult}</th>
            </tr>
          </thead>
          <tbody>
            {entries.map((entry, index) => (
              <tr key={`${entry.at}-${index}`}>
                <td>{index + 1}</td>
                <td>
                  <code className="crm-code">{entry.step}</code>
                </td>
                <td className="crm-table__cell--wrap">{entry.message}</td>
                <td className="crm-provision-log__time">
                  {new Intl.DateTimeFormat(locale, {
                    dateStyle: "short",
                    timeStyle: "medium",
                  }).format(new Date(entry.at))}
                </td>
                <td className="crm-provision-log__result">
                  <span className={`crm-status crm-status--${entry.ok ? "ok" : "error"}`}>
                    {entry.ok ? ui.platformLogsOk : ui.platformLogsFail}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
