import { crmCopy } from "../../model/i18n";
import type { PagesSectionProps } from "./sectionTypes";

export function PagesSection({ crmLang, pages }: PagesSectionProps) {
  const ui = crmCopy[crmLang];
  return (
    <section className="crm-stack">
      <article className="crm-panel crm-table-card">
        <div className="crm-section-head">
          <h3>{ui.pagesTitle}</h3>
          <span className="crm-muted">{ui.pagesSubtitle}</span>
        </div>
        <div className="crm-table-wrap">
          <table className="crm-data-table">
            <thead>
              <tr>
                <th>{ui.pagesColHash}</th>
                <th>{ui.pagesColPage}</th>
                <th>{ui.pagesColViews}</th>
                <th>{ui.pagesColUnique}</th>
                <th>{ui.pagesColConversion}</th>
              </tr>
            </thead>
            <tbody>
              {pages.map((page, index) => (
                <tr key={page.id}>
                  <td>{index + 1}</td>
                  <td>{page.page}</td>
                  <td>{page.views}</td>
                  <td>{page.uniqueUsers}</td>
                  <td>{page.conversion}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </article>
    </section>
  );
}
