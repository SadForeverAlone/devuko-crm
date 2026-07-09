import { mockTasks } from "../../model/config";
import { crmCopy } from "../../model/i18n";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faArrowLeft } from "@fortawesome/free-solid-svg-icons";
import { getCrmLocaleTag, getStatusClassName, translateCrmStatus } from "../../model/lib";
import type { TasksSectionProps } from "./sectionTypes";

export function TasksSection({
  crmLang,
  tasksView,
  selectedTaskId,
  setSelectedTaskId,
  setTasksView,
}: TasksSectionProps) {
  const ui = crmCopy[crmLang];
  const dateLocale = getCrmLocaleTag(crmLang);
  const selectedTask =
    mockTasks.find((task) => task.id === selectedTaskId) ?? mockTasks[0];

  if (tasksView === "list") {
    return (
      <section className="crm-stack">
        <article className="crm-panel crm-table-card">
          <div className="crm-section-head">
            <h3>{ui.tasks}</h3>
            <span className="crm-muted">{ui.tasksTableHint}</span>
          </div>
          <div className="crm-table-wrap">
            <table className="crm-data-table">
              <thead>
                <tr>
                  <th>{ui.taskColId}</th>
                  <th>{ui.taskColTitle}</th>
                  <th>{ui.taskColDescription}</th>
                  <th>{ui.taskColStatus}</th>
                  <th>{ui.taskColCreated}</th>
                </tr>
              </thead>
              <tbody>
                {mockTasks.map((task) => (
                  <tr
                    key={task.id}
                    onClick={() => {
                      setSelectedTaskId(task.id);
                      setTasksView("detail");
                    }}
                  >
                    <td>{task.id}</td>
                    <td>{task.title}</td>
                    <td>{task.description}</td>
                    <td>
                      <span className={getStatusClassName(task.status)}>
                        {translateCrmStatus(task.status, crmLang)}
                      </span>
                    </td>
                    <td>
                      {new Date(task.createdAt).toLocaleString(dateLocale)}
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

  return (
    <section className="crm-stack">
      <article className="crm-entity-detail crm-panel">
        <div className="crm-entity-detail__hero">
          <div className="crm-section-head">
            <button
              type="button"
              className="crm-btn crm-btn--ghost"
              onClick={() => setTasksView("list")}
            >
              <FontAwesomeIcon icon={faArrowLeft} />
              {ui.backToTasks}
            </button>
          </div>
          <p className="crm-entity-detail__id">{selectedTask.id}</p>
          <h2 className="crm-entity-detail__title">{selectedTask.title}</h2>
        </div>
        <div className="crm-entity-detail__body">
          <p className="crm-entity-detail__text">{selectedTask.description}</p>
          <div className="crm-entity-stats">
            <div className="crm-entity-stat">
              <span>{ui.taskColStatus}</span>
              <b>{translateCrmStatus(selectedTask.status, crmLang)}</b>
            </div>
            <div className="crm-entity-stat">
              <span>{ui.taskDetailOwner}</span>
              <b>{selectedTask.owner}</b>
            </div>
            <div className="crm-entity-stat">
              <span>{ui.taskColCreated}</span>
              <b>
                {new Date(selectedTask.createdAt).toLocaleString(dateLocale)}
              </b>
            </div>
          </div>
        </div>
      </article>
    </section>
  );
}
