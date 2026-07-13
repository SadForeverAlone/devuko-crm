import { useCallback, useState } from "react";
import { ApiError } from "@/shared/api/http";
import {
  createCrmSite,
  deleteCrmSite,
  deployCrmPlatform,
  deployCrmSite,
  PLATFORM_WORKSPACE_ID,
  provisionCrmSite,
  updateCrmSite,
  type CrmSite,
} from "@/entities/crm";
import { emitAppNotification } from "@/shared/lib/notify";
import { crmCopy } from "./config";
import type { CrmLang } from "./types";
import type { CrmNavigate } from "./useCrmNavigation";

type UseCrmSiteHandlersInput = {
  crmLang: CrmLang;
  sites: CrmSite[];
  activeWorkspaceId: string;
  navigate: CrmNavigate;
  load: () => Promise<void>;
  handleSwitchWorkspace: (workspaceId: string) => void;
};

export function useCrmSiteHandlers({
  crmLang,
  sites,
  activeWorkspaceId,
  navigate,
  load,
  handleSwitchWorkspace,
}: UseCrmSiteHandlersInput) {
  const [siteForm, setSiteForm] = useState({
    domain: "",
    repo: "",
    apiPort: "8080",
    webPort: "8088",
    extraDomains: "",
  });
  const [deploying, setDeploying] = useState(false);

  const handleCreateSite = useCallback(async () => {
    const loc = crmCopy[crmLang];
    const domain = siteForm.domain.trim().toLowerCase();
    if (!/^[a-z0-9]([a-z0-9-]*[a-z0-9])?(\.[a-z0-9]([a-z0-9-]*[a-z0-9])?)+$/.test(domain)) {
      emitAppNotification(loc.sitesValidationDomain);
      return;
    }
    const created = await createCrmSite({
      domain,
      repo: siteForm.repo.trim() || undefined,
      apiPort: Number(siteForm.apiPort) || 8080,
      webPort: Number(siteForm.webPort) || 8088,
      extraDomains: siteForm.extraDomains
        .split(",")
        .map((item) => item.trim().toLowerCase())
        .filter(Boolean),
      provision: true,
    });
    emitAppNotification(loc.sitesCreatedToast);
    setSiteForm({ domain: "", repo: "", apiPort: "8080", webPort: "8088", extraDomains: "" });
    await load();
    if (created.workspaceId) {
      handleSwitchWorkspace(created.workspaceId);
    }
  }, [crmLang, handleSwitchWorkspace, load, siteForm]);

  const handleProvisionSite = useCallback(
    async (siteId: string) => {
      await provisionCrmSite(siteId);
      emitAppNotification(crmCopy[crmLang].sitesProvisionToast);
      await load();
    },
    [crmLang, load]
  );

  const handleUpdateSite = useCallback(
    async (
      siteId: string,
      form: { repo: string; apiPort: string; webPort: string; extraDomains: string }
    ) => {
      await updateCrmSite(siteId, {
        repo: form.repo.trim() || undefined,
        apiPort: Number(form.apiPort) || 8080,
        webPort: Number(form.webPort) || 8088,
        extraDomains: form.extraDomains
          .split(",")
          .map((item) => item.trim().toLowerCase())
          .filter(Boolean),
      });
      emitAppNotification(crmCopy[crmLang].sitesUpdatedToast);
      await load();
    },
    [crmLang, load]
  );

  const handleDeleteSite = useCallback(
    async (siteId: string) => {
      const site = sites.find((item) => item.id === siteId);
      await deleteCrmSite(siteId);
      emitAppNotification(crmCopy[crmLang].sitesDeletedToast);
      if (site && activeWorkspaceId === site.workspaceId) {
        handleSwitchWorkspace(PLATFORM_WORKSPACE_ID);
        navigate("/crm/sites");
      }
      await load();
    },
    [activeWorkspaceId, crmLang, handleSwitchWorkspace, load, navigate, sites]
  );

  const handleDeployPlatform = useCallback(async () => {
    if (deploying) return;
    setDeploying(true);
    try {
      await deployCrmPlatform();
      emitAppNotification(crmLang === "ru" ? "Деплой платформы завершён" : "Platform deploy finished");
      await load();
    } catch (error) {
      const message = error instanceof ApiError ? error.message : (error as Error).message;
      emitAppNotification(message);
    } finally {
      setDeploying(false);
    }
  }, [crmLang, deploying, load]);

  const handleDeploySite = useCallback(
    async (siteId: string) => {
      if (deploying) return;
      setDeploying(true);
      try {
        await deployCrmSite(siteId);
        emitAppNotification(crmLang === "ru" ? "Деплой проекта завершён" : "Project deploy finished");
        await load();
      } catch (error) {
        const message = error instanceof ApiError ? error.message : (error as Error).message;
        emitAppNotification(message);
      } finally {
        setDeploying(false);
      }
    },
    [crmLang, deploying, load]
  );

  return {
    siteForm,
    setSiteForm,
    deploying,
    handleCreateSite,
    handleProvisionSite,
    handleUpdateSite,
    handleDeleteSite,
    handleDeployPlatform,
    handleDeploySite,
  };
}
