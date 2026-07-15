import { PlatformPage } from "@/shared/ui/platform";
import { mockCalls } from "@/widgets/crm-app/model/config";
import { crmCopy } from "@/widgets/crm-app/model/i18n";
import { getStatusClassName, translateCrmStatus } from "@/widgets/crm-app/model/lib";
import type { CallTrackerSectionProps } from "@/shared/crm/ui/sectionTypes";

export function CallTrackerSection({ crmLang }: CallTrackerSectionProps) {
  const ui = crmCopy[crmLang];
  return (
    <PlatformPage title={ui.callTrackerTitle} subtitle={ui.callTrackerSubtitle}>
      <article className="crm-panel crm-table-card">
        <div className="crm-table-wrap">
          <table className="crm-data-table">
            <thead>
              <tr>
                <th>{ui.callTrackerColId}</th>
                <th>{ui.callTrackerColManager}</th>
                <th>{ui.callTrackerColQueue}</th>
                <th>{ui.callTrackerColHandled}</th>
                <th>{ui.callTrackerColMissed}</th>
                <th>{ui.callTrackerColAvg}</th>
                <th>{ui.callTrackerColStatus}</th>
              </tr>
            </thead>
            <tbody>
              {mockCalls.map((call) => (
                <tr key={call.id}>
                  <td>{call.id}</td>
                  <td>{call.manager}</td>
                  <td>{call.queue}</td>
                  <td>{call.handled}</td>
                  <td>{call.missed}</td>
                  <td>{call.avgTime}</td>
                  <td>
                    <span className={getStatusClassName(call.status)}>
                      {translateCrmStatus(call.status, crmLang)}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </article>
    </PlatformPage>
  );
}
