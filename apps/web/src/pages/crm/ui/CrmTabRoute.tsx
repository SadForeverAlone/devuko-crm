import { useOptionalCrmWorkspaceContext } from "@/widgets/crm-app/model/crm-workspace-context";
import { CrmTabContent } from "@/widgets/crm-app/ui/CrmTabContent";

export function CrmTabRoute() {
  const workspace = useOptionalCrmWorkspaceContext();
  if (!workspace) {
    return null;
  }
  return <CrmTabContent />;
}
