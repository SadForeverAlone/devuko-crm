import { mockFiles } from "../../model/config";
import { crmCopy } from "../../model/i18n";
import { getCrmLocaleTag, getStatusClassName, translateCrmStatus } from "../../model/lib";
import type { FilesSectionProps } from "./sectionTypes";

export function FilesSection({ crmLang }: FilesSectionProps) {
  const ui = crmCopy[crmLang];
  const dateLocale = getCrmLocaleTag(crmLang);
  return (
    <section className="crm-stack">
      <article className="crm-panel crm-table-card">
        <div className="crm-section-head">
          <h3>{ui.filesTitle}</h3>
          <span className="crm-muted">{ui.filesSubtitle}</span>
        </div>
        <div className="crm-table-wrap">
          <table className="crm-data-table">
            <thead>
              <tr>
                <th>{ui.filesColId}</th>
                <th>{ui.filesColTitle}</th>
                <th>{ui.filesColType}</th>
                <th>{ui.filesColOwner}</th>
                <th>{ui.filesColUpdated}</th>
                <th>{ui.filesColStatus}</th>
              </tr>
            </thead>
            <tbody>
              {mockFiles.map((file) => (
                <tr key={file.id}>
                  <td>{file.id}</td>
                  <td>{file.title}</td>
                  <td>{file.type}</td>
                  <td>{file.owner}</td>
                  <td>{new Date(file.updatedAt).toLocaleString(dateLocale)}</td>
                  <td>
                    <span className={getStatusClassName(file.status)}>
                      {translateCrmStatus(file.status, crmLang)}
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
