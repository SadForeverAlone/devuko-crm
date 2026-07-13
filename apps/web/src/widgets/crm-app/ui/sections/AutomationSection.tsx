import { EmptyState, PlatformPage } from "@/shared/ui/platform";
import { faWandMagicSparkles } from "@fortawesome/free-solid-svg-icons";
import type { CrmLang } from "../../model/types";

export function AutomationSection({ crmLang }: { crmLang: CrmLang }) {
  return (
    <PlatformPage
      title={crmLang === "ru" ? "Автоматизация" : "Automation"}
      subtitle={
        crmLang === "ru" ? "Cron, pipelines, webhooks и задачи" : "Cron jobs, pipelines, webhooks and tasks"
      }
    >
      <EmptyState
        icon={faWandMagicSparkles}
        title={crmLang === "ru" ? "Автоматизация пока не настроена" : "No automation configured yet"}
        description={
          crmLang === "ru"
            ? "Здесь появятся cron-задачи, pipelines и webhooks."
            : "Cron jobs, pipelines and webhooks will appear here."
        }
      />
    </PlatformPage>
  );
}
