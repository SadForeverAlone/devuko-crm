import { PlatformPage } from "@/shared/ui/platform";
import { crmCopy } from "@/widgets/crm-app/model/i18n";
import { getCrmLocaleTag, getStatusClassName, translateCrmStatus } from "@/widgets/crm-app/model/lib";
import type { ReportsSectionProps } from "@/shared/crm/ui/sectionTypes";

export function ReportsSection({ crmLang, reports }: ReportsSectionProps) {
  const ui = crmCopy[crmLang];
  const dateLocale = getCrmLocaleTag(crmLang);
  return (
    <PlatformPage title={ui.reportsTitle} subtitle={ui.reportsSubtitle}>
      <article className="crm-panel crm-table-card">
        <div className="crm-table-wrap">
          <table className="crm-data-table">
            <thead>
              <tr>
                <th>{ui.reportsColId}</th>
                <th>{ui.reportsColTitle}</th>
                <th>{ui.reportsColSeverity}</th>
                <th>{ui.reportsColChannel}</th>
                <th>{ui.reportsColStatus}</th>
                <th>{ui.reportsColCreated}</th>
              </tr>
            </thead>
            <tbody>
              {reports.map((report) => (
                <tr key={report.id}>
                  <td>{report.id}</td>
                  <td>{report.title}</td>
                  <td>
                    <span className={getStatusClassName(report.severity)}>
                      {translateCrmStatus(report.severity, crmLang)}
                    </span>
                  </td>
                  <td>{translateCrmStatus(report.channel, crmLang)}</td>
                  <td>
                    <span className={getStatusClassName(report.status)}>
                      {translateCrmStatus(report.status, crmLang)}
                    </span>
                  </td>
                  <td>
                    {new Date(report.createdAt).toLocaleString(dateLocale)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <div className="crm-card-grid">
          {reports.map((report) => (
            <article key={report.id} className="crm-detail-card">
              <div className="crm-section-head">
                <h3>{report.title}</h3>
                <span className="crm-muted">{report.id}</span>
              </div>
              <p className="crm-detail-card__text">{report.description}</p>
            </article>
          ))}
        </div>
      </article>
    </PlatformPage>
  );
}
