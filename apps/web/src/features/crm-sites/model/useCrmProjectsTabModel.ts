import { useMemo } from "react";
import type { Dispatch, SetStateAction } from "react";
import { useLocation } from "react-router-dom";
import type { CrmPlatformLog, CrmPlatformMetrics, CrmSite } from "@/entities/crm";
import type { ProjectDetailTab } from "@/widgets/crm-app/model/platform-nav";
import type { CrmLang } from "@/widgets/crm-app/model/types";
import type { CrmNavigate } from "@/widgets/crm-app/model/useCrmNavigation";

type SiteFormState = {
  domain: string;
  repo: string;
  apiPort: string;
  webPort: string;
  extraDomains: string;
};

type SiteEditForm = {
  repo: string;
  apiPort: string;
  webPort: string;
  extraDomains: string;
};

type SiteOpsSlice = {
  sites: CrmSite[];
  siteForm: SiteFormState;
  setSiteForm: Dispatch<SetStateAction<SiteFormState>>;
  handleCreateSite: () => Promise<void>;
  handleProvisionSite: (siteId: string) => Promise<void>;
  handleUpdateSite: (siteId: string, form: SiteEditForm) => Promise<void>;
  handleDeleteSite: (siteId: string) => Promise<void>;
  deploying: boolean;
  handleDeploySite: (siteId: string) => Promise<void>;
};

type ProjectsTabModelInput = {
  crmLang: CrmLang;
  projectId: string | undefined;
  projectTab: string | undefined;
  navigate: CrmNavigate;
  handleSwitchWorkspace: (workspaceId: string) => void;
  platformMetrics: CrmPlatformMetrics | null;
  platformLogs: CrmPlatformLog[];
  siteOps: SiteOpsSlice;
};

export function useCrmProjectsTabModel({
  crmLang,
  projectId,
  projectTab,
  navigate,
  handleSwitchWorkspace,
  platformMetrics,
  platformLogs,
  siteOps,
}: ProjectsTabModelInput) {
  const location = useLocation();
  const openProjectCreate = useMemo(
    () => new URLSearchParams(location.search).get("create") === "1",
    [location.search]
  );
  const selectedProject = useMemo(
    () => siteOps.sites.find((site) => site.id === projectId) ?? null,
    [siteOps.sites, projectId]
  );

  const listCopy = useMemo(
    () => ({
      listTitle: crmLang === "ru" ? "Проекты" : "Projects",
      listSubtitle:
        crmLang === "ru"
          ? "Управление проектами и workspace"
          : "Manage projects and workspaces",
    }),
    [crmLang]
  );

  return {
    openProjectCreate,
    selectedProject,
    projectTab: (projectTab || "overview") as ProjectDetailTab,
    platformMetrics,
    platformLogs,
    listCopy,
    onOpenProject: (id: string) => navigate(`/crm/projects/${id}`),
    onBackToList: () => navigate("/crm/projects"),
    onNavigateProjectTab: (nextTab: ProjectDetailTab) =>
      navigate(`/crm/projects/${projectId}/${nextTab}`),
    onSwitchToSiteWorkspace: (workspaceId: string) => {
      handleSwitchWorkspace(workspaceId);
    },
    siteOps,
  };
}
