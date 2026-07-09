import { mockCalls } from "../../model/config";
import { crmCopy } from "../../model/i18n";
import { getStatusClassName, translateCrmStatus } from "../../model/lib";
import type { CallTrackerSectionProps } from "./sectionTypes";

export function CallTrackerSection({ crmLang }: CallTrackerSectionProps) {
  const ui = crmCopy[crmLang];
  return (
    <section className="crm-stack">
      <article className="crm-panel crm-table-card">
        <div className="crm-section-head">
          <h3>{ui.callTrackerTitle}</h3>
          <span className="crm-muted">{ui.callTrackerSubtitle}</span>
        </div>
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
    </section>
  );
}
