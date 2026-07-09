import { crmCopy } from "../../model/i18n";
import { getCrmLocaleTag, getStatusClassName, translateCrmStatus } from "../../model/lib";
import type { ContactsSectionProps } from "./sectionTypes";

export function ContactsSection({
  crmLang,
  visibleContacts,
  contactSearch,
  setContactSearch,
  contactDateFrom,
  setContactDateFrom,
  contactDateTo,
  setContactDateTo,
}: ContactsSectionProps) {
  const ui = crmCopy[crmLang];
  const dateLocale = getCrmLocaleTag(crmLang);
  return (
    <section className="crm-stack">
      <article className="crm-panel crm-table-card">
        <div className="crm-section-head">
          <h3>{ui.contactsTitle}</h3>
          <span className="crm-muted">{ui.contactsSubtitle}</span>
        </div>
        <div className="crm-chip-row crm-chip-row--filters">
          <input
            className="spx-input crm-input crm-chip-search"
            placeholder={ui.contactsSearchPlaceholder}
            value={contactSearch}
            onChange={(event) => setContactSearch(event.target.value)}
          />
          <input
            className="spx-input crm-input crm-chip-date"
            type="date"
            value={contactDateFrom}
            onChange={(event) => setContactDateFrom(event.target.value)}
          />
          <input
            className="spx-input crm-input crm-chip-date"
            type="date"
            value={contactDateTo}
            onChange={(event) => setContactDateTo(event.target.value)}
          />
        </div>
        <div className="crm-table-wrap">
          <table className="crm-data-table">
            <thead>
              <tr>
                <th>{ui.tableIndex}</th>
                <th>{ui.contactsColName}</th>
                <th>{ui.contactsColEmail}</th>
                <th>{ui.contactsColMessage}</th>
                <th>{ui.contactsColStatus}</th>
                <th>{ui.contactsColDate}</th>
              </tr>
            </thead>
            <tbody>
              {visibleContacts.map((contact, index) => (
                <tr key={contact.id}>
                  <td>{index + 1}</td>
                  <td>{contact.name}</td>
                  <td>{contact.email}</td>
                  <td>{contact.message}</td>
                  <td>
                    <span className={getStatusClassName(contact.status)}>
                      {translateCrmStatus(contact.status, crmLang)}
                    </span>
                  </td>
                  <td>
                    {new Date(contact.createdAt).toLocaleString(dateLocale)}
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
