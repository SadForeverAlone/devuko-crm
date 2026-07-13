import type { CrmPlatformMetrics } from "@/entities/crm";
import { EmptyState, PlatformCard, PlatformPage, PlatformRecordTable, StatusPill } from "@/shared/ui/platform";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faRocket } from "@fortawesome/free-solid-svg-icons";
import type { CrmLang } from "../../model/types";
import { getCrmLocaleTag } from "../../model/lib";

type DeploymentsSectionProps = {
  crmLang: CrmLang;
  metrics: CrmPlatformMetrics | null;
  deploying: boolean;
  onDeployPlatform: () => void;
};

const deployTemplate = "1fr 1.1fr 0.75fr 0.65fr 0.95fr";

function humanizeAction(action: string, crmLang: CrmLang) {
  if (action.includes("platform.deploy")) return crmLang === "ru" ? "Деплой платформы" : "Platform deploy";
  if (action.includes("site.deploy")) return crmLang === "ru" ? "Деплой проекта" : "Project deploy";
  if (action.includes("site.provision")) return crmLang === "ru" ? "Провизионинг" : "Provision";
  if (action.includes("site.create")) return crmLang === "ru" ? "Создание проекта" : "Project created";
  return action.replace(/\./g, " · ");
}

function sortDeployments<T extends { createdAt: string }>(items: T[]) {
  return [...items].sort((left, right) => new Date(right.createdAt).getTime() - new Date(left.createdAt).getTime());
}

export function DeploymentsSection({
  crmLang,
  metrics,
  deploying,
  onDeployPlatform,
}: DeploymentsSectionProps) {
  const locale = getCrmLocaleTag(crmLang);
  const deployments = sortDeployments(metrics?.recentDeployments ?? []);
  const successCount = deployments.filter((item) => item.ok).length;
  const failedCount = deployments.length - successCount;
  const lastDeployment = deployments[0];

  return (
    <PlatformPage
      title={crmLang === "ru" ? "Деплои" : "Deployments"}
      subtitle={
        crmLang === "ru" ? "История развёртываний и провизионинга" : "Deployment and provisioning history"
      }
      actions={
        <button type="button" className="crm-btn crm-btn--primary" disabled={deploying} onClick={onDeployPlatform}>
          <FontAwesomeIcon icon={faRocket} />
          {deploying
            ? crmLang === "ru"
              ? "Деплой…"
              : "Deploying…"
            : crmLang === "ru"
              ? "Деплой платформы"
              : "Deploy platform"}
        </button>
      }
    >
      <div className="crm-infra-stats crm-infra-stats--deploy">
        <article className="crm-infra-stat">
          <p>{crmLang === "ru" ? "Сегодня" : "Today"}</p>
          <h4>{metrics?.deploymentsToday ?? 0}</h4>
        </article>
        <article className="crm-infra-stat">
          <p>{crmLang === "ru" ? "Всего" : "Total"}</p>
          <h4>{deployments.length}</h4>
        </article>
        <article className="crm-infra-stat">
          <p>{crmLang === "ru" ? "Успешно" : "Success"}</p>
          <h4>{successCount}</h4>
        </article>
        <article className="crm-infra-stat">
          <p>{crmLang === "ru" ? "Ошибки" : "Failed"}</p>
          <h4>{failedCount}</h4>
        </article>
      </div>

      {lastDeployment ? (
        <PlatformCard
          title={crmLang === "ru" ? "Последний деплой" : "Latest deploy"}
          subtitle={humanizeAction(lastDeployment.action, crmLang)}
        >
          <div className="crm-deploy-latest">
            <div className="crm-deploy-latest__meta">
              <StatusPill
                label={lastDeployment.ok ? (crmLang === "ru" ? "Успех" : "Success") : crmLang === "ru" ? "Ошибка" : "Failed"}
                tone={lastDeployment.ok ? "healthy" : "critical"}
              />
              <span className="crm-muted">
                {new Intl.DateTimeFormat(locale, { dateStyle: "medium", timeStyle: "short" }).format(
                  new Date(lastDeployment.createdAt)
                )}
              </span>
            </div>
            <dl className="crm-infra-spec crm-infra-spec--compact">
              <div className="crm-infra-spec__row">
                <dt>{crmLang === "ru" ? "Цель" : "Target"}</dt>
                <dd>{lastDeployment.target ?? "—"}</dd>
              </div>
              <div className="crm-infra-spec__row">
                <dt>{crmLang === "ru" ? "Автор" : "Author"}</dt>
                <dd>{lastDeployment.actorName ?? "—"}</dd>
              </div>
            </dl>
          </div>
        </PlatformCard>
      ) : null}

      <PlatformCard
        title={crmLang === "ru" ? "История" : "History"}
        subtitle={
          crmLang === "ru"
            ? "Хронология деплоев платформы и проектов"
            : "Platform and project deployment timeline"
        }
      >
        {deployments.length === 0 ? (
          <EmptyState
            icon={faRocket}
            title={crmLang === "ru" ? "Деплои не найдены" : "No deployments found"}
            description={
              crmLang === "ru"
                ? "Запустите деплой платформы или провизионинг проекта."
                : "Run a platform deploy or project provisioning."
            }
          />
        ) : (
          <PlatformRecordTable
            template={deployTemplate}
            rows={deployments}
            rowKey={(item) => item.id}
            columns={[
              {
                id: "target",
                header: crmLang === "ru" ? "Цель" : "Target",
                mono: true,
                render: (item) => item.target ?? "—",
              },
              {
                id: "action",
                header: crmLang === "ru" ? "Действие" : "Action",
                render: (item) => humanizeAction(item.action, crmLang),
              },
              {
                id: "author",
                header: crmLang === "ru" ? "Автор" : "Author",
                muted: true,
                render: (item) => item.actorName ?? "—",
              },
              {
                id: "status",
                header: crmLang === "ru" ? "Статус" : "Status",
                render: (item) => (
                  <StatusPill
                    label={item.ok ? (crmLang === "ru" ? "Успех" : "Success") : crmLang === "ru" ? "Ошибка" : "Failed"}
                    tone={item.ok ? "healthy" : "critical"}
                  />
                ),
              },
              {
                id: "time",
                header: crmLang === "ru" ? "Время" : "Time",
                muted: true,
                render: (item) =>
                  new Intl.DateTimeFormat(locale, { dateStyle: "short", timeStyle: "short" }).format(
                    new Date(item.createdAt)
                  ),
              },
            ]}
          />
        )}
      </PlatformCard>
    </PlatformPage>
  );
}
