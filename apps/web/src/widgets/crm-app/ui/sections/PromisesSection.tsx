import { PlatformPage } from "@/shared/ui/platform";
import { crmCopy } from "../../model/i18n";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faArrowLeft } from "@fortawesome/free-solid-svg-icons";
import { getCrmLocaleTag, getStatusClassName, translateCrmStatus } from "../../model/lib";
import type { PromisesSectionProps } from "./sectionTypes";

export function PromisesSection({
  crmLang,
  promisesView,
  promiseRecords,
  selectedPromise,
  setSelectedPromiseId,
  setPromisesView,
}: PromisesSectionProps) {
  const ui = crmCopy[crmLang];
  const dateLocale = getCrmLocaleTag(crmLang);

  if (promisesView === "list") {
    return (
      <PlatformPage title={ui.promisesTableTitle} subtitle={ui.promisesTableHint}>
        <article className="crm-panel crm-table-card">
          <div className="crm-table-wrap">
            <table className="crm-data-table">
              <thead>
                <tr>
                  <th>{ui.promiseColId}</th>
                  <th>{ui.promiseColTitle}</th>
                  <th>{ui.promiseColOwner}</th>
                  <th>{ui.promiseColStatus}</th>
                  <th>{ui.promiseColProofs}</th>
                  <th>{ui.promiseColDeadline}</th>
                </tr>
              </thead>
              <tbody>
                {promiseRecords.map((item) => (
                  <tr
                    key={item.id}
                    onClick={() => {
                      setSelectedPromiseId(item.id);
                      setPromisesView("detail");
                    }}
                  >
                    <td>{item.id}</td>
                    <td>{item.title}</td>
                    <td>{item.owner}</td>
                    <td>
                      <span className={getStatusClassName(item.status)}>
                        {translateCrmStatus(item.status, crmLang)}
                      </span>
                    </td>
                    <td>
                      <span
                        className={
                          item.proofAdded
                            ? "crm-status crm-status--ok"
                            : "crm-status crm-status--pending"
                        }
                      >
                        {item.proofStatus}
                      </span>
                    </td>
                    <td>{item.deadline}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </article>
      </PlatformPage>
    );
  }

  if (!selectedPromise) {
    return null;
  }

  return (
    <PlatformPage
      title={selectedPromise.title}
      subtitle={selectedPromise.id}
      actions={
        <button
          type="button"
          className="crm-btn crm-btn--ghost"
          onClick={() => setPromisesView("list")}
        >
          <FontAwesomeIcon icon={faArrowLeft} />
          {ui.backToPromises}
        </button>
      }
    >
      <article className="crm-entity-detail crm-panel">
        <div className="crm-entity-detail__body">
          <p className="crm-entity-detail__text">{selectedPromise.description}</p>
          <div className="crm-entity-stats">
            <div className="crm-entity-stat">
              <span>{ui.promiseDetailCategory}</span>
              <b>{selectedPromise.category}</b>
            </div>
            <div className="crm-entity-stat">
              <span>{ui.promiseDetailOwner}</span>
              <b>{selectedPromise.owner}</b>
            </div>
            <div className="crm-entity-stat">
              <span>{ui.promiseDetailUserEmail}</span>
              <b>{selectedPromise.userEmail}</b>
            </div>
            <div className="crm-entity-stat">
              <span>{ui.promiseDetailStatus}</span>
              <b>{translateCrmStatus(selectedPromise.status, crmLang)}</b>
            </div>
            <div className="crm-entity-stat">
              <span>{ui.promiseDetailProofs}</span>
              <b>{selectedPromise.proofStatus}</b>
            </div>
            <div className="crm-entity-stat">
              <span>{ui.promiseDetailPledge}</span>
              <b>{selectedPromise.pledgeAmount.toLocaleString(dateLocale)}</b>
            </div>
            <div className="crm-entity-stat">
              <span>{ui.promiseColDeadline}</span>
              <b>
                {new Date(selectedPromise.deadlineAt).toLocaleString(dateLocale)}
              </b>
            </div>
            <div className="crm-entity-stat">
              <span>{ui.promiseDetailCreated}</span>
              <b>
                {new Date(selectedPromise.createdAt).toLocaleString(dateLocale)}
              </b>
            </div>
            <div className="crm-entity-stat">
              <span>{ui.promiseDetailUpdated}</span>
              <b>
                {new Date(selectedPromise.updatedAt).toLocaleString(dateLocale)}
              </b>
            </div>
          </div>
        </div>
      </article>
    </PlatformPage>
  );
}
