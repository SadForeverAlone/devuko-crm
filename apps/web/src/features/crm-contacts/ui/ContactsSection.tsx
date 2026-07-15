import { useMemo, useState } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faAddressBook, faArrowLeft } from "@fortawesome/free-solid-svg-icons";
import { EmptyState, PlatformPage } from "@/shared/ui/platform";
import { crmCopy } from "@/widgets/crm-app/model/i18n";
import { getCrmLocaleTag, getStatusClassName, translateCrmStatus } from "@/widgets/crm-app/model/lib";
import type { ContactsSectionProps } from "@/shared/crm/ui/sectionTypes";

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
  const [selectedId, setSelectedId] = useState<string | null>(null);

  const selectedContact = useMemo(
    () => visibleContacts.find((contact) => contact.id === selectedId) ?? null,
    [visibleContacts, selectedId]
  );

  const newCount = useMemo(
    () => visibleContacts.filter((contact) => contact.status.toLowerCase() === "new").length,
    [visibleContacts]
  );

  if (selectedContact) {
    return (
      <PlatformPage
        title={selectedContact.name}
        subtitle={selectedContact.email}
        actions={
          <button
            type="button"
            className="crm-btn crm-btn--ghost"
            onClick={() => setSelectedId(null)}
          >
            <FontAwesomeIcon icon={faArrowLeft} />
            {ui.contactsBack}
          </button>
        }
      >
        <article className="crm-entity-detail crm-panel">
          <div className="crm-entity-detail__body">
            <div className="crm-entity-stats">
              <div className="crm-entity-stat">
                <span>{ui.contactsColStatus}</span>
                <b>
                  <span className={getStatusClassName(selectedContact.status)}>
                    {translateCrmStatus(selectedContact.status, crmLang)}
                  </span>
                </b>
              </div>
              <div className="crm-entity-stat">
                <span>{ui.contactsColDate}</span>
                <b>{new Date(selectedContact.createdAt).toLocaleString(dateLocale)}</b>
              </div>
            </div>
            <p className="crm-entity-detail__label">{ui.contactsColMessage}</p>
            <p className="crm-entity-detail__text">{selectedContact.message}</p>
          </div>
        </article>
      </PlatformPage>
    );
  }

  return (
    <PlatformPage
      title={ui.contactsTitle}
      subtitle={`${ui.contactsSubtitle} · ${visibleContacts.length}`}
    >
      <div className="crm-stat-row crm-stat-row--platform">
        <article className="crm-stat-card crm-panel crm-panel--static">
          <p className="crm-stat-card__label">{ui.contactsStatTotal}</p>
          <h3>{visibleContacts.length}</h3>
        </article>
        <article className="crm-stat-card crm-panel crm-panel--static crm-stat-card--accent">
          <p className="crm-stat-card__label">{ui.contactsStatNew}</p>
          <h3>{newCount}</h3>
        </article>
      </div>

      <article className="crm-panel crm-table-card">
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

        {visibleContacts.length === 0 ? (
          <EmptyState
            icon={faAddressBook}
            title={ui.contactsEmpty}
            description={ui.contactsEmptyHint}
          />
        ) : (
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
                  <tr
                    key={contact.id}
                    onClick={() => setSelectedId(contact.id)}
                    className="crm-data-table__row--clickable"
                  >
                    <td>{index + 1}</td>
                    <td>{contact.name}</td>
                    <td>{contact.email}</td>
                    <td className="crm-data-table__cell--truncate">{contact.message}</td>
                    <td>
                      <span className={getStatusClassName(contact.status)}>
                        {translateCrmStatus(contact.status, crmLang)}
                      </span>
                    </td>
                    <td>{new Date(contact.createdAt).toLocaleString(dateLocale)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </article>
    </PlatformPage>
  );
}
