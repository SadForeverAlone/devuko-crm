import { useCallback, useEffect, useMemo, useState } from "react";
import {
  getStoredCrmWorkspaceId,
  PLATFORM_WORKSPACE_ID,
  setStoredCrmWorkspace,
} from "@/entities/crm";
import { crmCopy } from "./config";
import { resolveWorkspaceDisplay } from "./resolve-workspace-display";
import { useCrmAuth } from "./useCrmAuth";
import { useCrmLogsView } from "./useCrmLogsView";
import { useCrmNavigation } from "./useCrmNavigation";
import { useCrmSession } from "./useCrmSession";
import { useCrmSiteHandlers } from "./useCrmSiteHandlers";
import { useCrmUserAdminHandlers } from "./useCrmUserAdminHandlers";
import { useCrmWorkspaceChrome } from "./useCrmWorkspaceChrome";
import { useCrmWorkspaceData } from "./useCrmWorkspaceData";
import { useCrmWorkspaceDerived } from "./useCrmWorkspaceDerived";
import type { CrmLang } from "./types";
import { crmTabPathMap } from "./crm-routes";

export function useCrmWorkspace() {
  const [crmLang, setCrmLang] = useState<CrmLang>("ru");
  const [contactSearch, setContactSearch] = useState("");
  const [contactDateFrom, setContactDateFrom] = useState("");
  const [contactDateTo, setContactDateTo] = useState("");
  const [logFilter, setLogFilter] = useState("all");
  const [logDateFrom, setLogDateFrom] = useState("");
  const [logDateTo, setLogDateTo] = useState("");
  const [rowLimitInput, setRowLimitInput] = useState("15");
  const [userSearch, setUserSearch] = useState("");
  const [usersOrderBy, setUsersOrderBy] = useState<
    "createdAt" | "email" | "displayName" | "login"
  >("createdAt");
  const [usersOrderDir, setUsersOrderDir] = useState<"asc" | "desc">("desc");
  const [activeWorkspaceId, setActiveWorkspaceId] = useState(() => getStoredCrmWorkspaceId());
  const [workspaceMenuOpen, setWorkspaceMenuOpen] = useState(false);

  const {
    token,
    setToken,
    login,
    setLogin,
    password,
    setPassword,
    loginError,
    handleLogin,
    handleLogout,
  } = useCrmAuth({
    crmLang,
    onAuthenticated: setActiveWorkspaceId,
  });

  const isPlatformWorkspace = activeWorkspaceId === PLATFORM_WORKSPACE_ID;
  const onUnauthorized = useCallback(() => setToken(""), [setToken]);
  const crmSession = useCrmSession(token);

  const {
    data,
    users,
    platformAdmins,
    contacts,
    promises,
    pages,
    reports,
    workspaces,
    sites,
    platformLogs,
    platformMetrics,
    settingsDraft,
    setSettingsDraft,
    load,
  } = useCrmWorkspaceData({
    token,
    activeWorkspaceId,
    isPlatformWorkspace,
    logFilter,
    logDateFrom,
    logDateTo,
    contactSearch,
    contactDateFrom,
    contactDateTo,
    userSearch,
    usersOrderBy,
    usersOrderDir,
    onUnauthorized,
  });

  const {
    navigate,
    route,
    tab,
    isUserCreateRoute,
    usersView,
    promisesView,
    tasksView,
    dashboardPart,
    projectId,
    projectTab,
    infrastructureSection,
    handleSwitchWorkspace: switchWorkspace,
  } = useCrmNavigation({
    token,
    activeWorkspaceId,
    isPlatformWorkspace,
    setActiveWorkspaceId,
    setSettingsDraft,
    setWorkspaceMenuOpen,
  });

  const activeWorkspace = useMemo(
    () => workspaces.find((item) => item.id === activeWorkspaceId) ?? null,
    [workspaces, activeWorkspaceId]
  );

  const handleSwitchWorkspace = useCallback(
    (workspaceId: string) => {
      const platformLabel = crmCopy[crmLang].platformWorkspaceLabel;
      const target = workspaces.find((item) => item.id === workspaceId);
      if (target) {
        setStoredCrmWorkspace(workspaceId, {
          label: target.kind === "platform" ? platformLabel : target.label,
          kind: target.kind === "platform" ? "platform" : "site",
        });
      } else if (workspaceId === PLATFORM_WORKSPACE_ID) {
        setStoredCrmWorkspace(workspaceId, {
          label: platformLabel,
          kind: "platform",
        });
      }
      switchWorkspace(workspaceId);
    },
    [crmLang, switchWorkspace, workspaces]
  );

  const {
    siteForm,
    setSiteForm,
    deploying,
    handleCreateSite,
    handleProvisionSite,
    handleUpdateSite,
    handleDeleteSite,
    handleDeployPlatform,
    handleDeploySite,
  } = useCrmSiteHandlers({
    crmLang,
    sites,
    activeWorkspaceId,
    navigate,
    load,
    handleSwitchWorkspace,
  });

  const {
    selectedPromiseId,
    selectedTaskId,
    adminSearch,
    setAdminSearch,
    userForm,
    setUserForm,
    platformAdminForm,
    setPlatformAdminForm,
    platformAdminPassword,
    setPlatformAdminPassword,
    platformAdminPasswordKey,
    selectedUser,
    selectedPlatformAdmin,
    currentAdminId,
    canDeletePlatformAdmin,
    setUsersViewByRoute,
    setPromisesViewByRoute,
    setTasksViewByRoute,
    setSelectedUserIdByRoute,
    setSelectedPromiseIdByRoute,
    setSelectedTaskIdByRoute,
    handleSaveUser,
    handleDeletePlatformAdmin,
    handleNavigateCreateUser,
  } = useCrmUserAdminHandlers({
    crmLang,
    isPlatformWorkspace,
    route,
    navigate,
    load,
    users,
    platformAdmins,
    crmSession,
    usersView,
    promisesView,
    tasksView,
  });

  const {
    usersWithMeta,
    visibleNavItems,
    visibleShortcutItems,
    visibleWorkspaces,
    genderMetrics,
    countryMetrics,
    promiseRecords,
    selectedPromise,
    ui,
    sidebarAudit,
    visibleContacts,
  } = useCrmWorkspaceDerived({
    crmLang,
    isPlatformWorkspace,
    data,
    users,
    contacts,
    promises,
    workspaces,
    sites,
    contactSearch,
    selectedPromiseId,
  });

  const {
    siteLogs,
    roleOverview,
  } = useCrmLogsView({
    crmLang,
    data,
    usersWithMeta,
  });

  const { handleSaveSettings } = useCrmWorkspaceChrome({
    workspaceMenuOpen,
    setWorkspaceMenuOpen,
    settingsDraft,
    load,
  });

  const activeWorkspaceDisplay = useMemo(
    () =>
      resolveWorkspaceDisplay(
        activeWorkspaceId,
        activeWorkspace,
        ui.platformWorkspaceLabel
      ),
    [activeWorkspace, activeWorkspaceId, ui.platformWorkspaceLabel]
  );

  useEffect(() => {
    if (!activeWorkspace) {
      return;
    }
    setStoredCrmWorkspace(activeWorkspaceId, {
      label:
        activeWorkspace.kind === "platform"
          ? ui.platformWorkspaceLabel
          : activeWorkspace.label,
      kind: activeWorkspace.kind === "platform" ? "platform" : "site",
    });
  }, [activeWorkspace, activeWorkspaceId, ui.platformWorkspaceLabel]);

  return {
    token,
    crmLang,
    setCrmLang,
    login,
    setLogin,
    password,
    setPassword,
    loginError,
    data,
    tab,
    dashboardPart,
    projectId,
    projectTab,
    infrastructureSection,
    platformMetrics,
    deploying,
    isUserCreateRoute,
    usersView,
    promisesView,
    tasksView,
    selectedUser,
    usersWithMeta,
    genderMetrics,
    countryMetrics,
    promiseRecords,
    selectedPromise,
    ui,
    authUi: crmCopy[crmLang],
    sidebarAudit,
    visibleContacts,
    siteLogs,
    roleOverview,
    rowLimitInput,
    setRowLimitInput,
    logDateFrom,
    setLogDateFrom,
    logDateTo,
    setLogDateTo,
    logFilter,
    setLogFilter,
    contactSearch,
    setContactSearch,
    contactDateFrom,
    setContactDateFrom,
    contactDateTo,
    setContactDateTo,
    userSearch,
    setUserSearch,
    usersOrderBy,
    setUsersOrderBy,
    usersOrderDir,
    setUsersOrderDir,
    settingsDraft,
    setSettingsDraft,
    userForm,
    setUserForm,
    platformAdmins,
    adminSearch,
    setAdminSearch,
    platformAdminForm,
    setPlatformAdminForm,
    platformAdminPassword,
    setPlatformAdminPassword,
    platformAdminPasswordKey,
    selectedPlatformAdmin,
    currentAdminId,
    canDeletePlatformAdmin,
    selectedTaskId,
    pages,
    reports,
    crmNavItems: visibleNavItems,
    crmShortcutItems: visibleShortcutItems,
    crmTabPathMap,
    navigate,
    workspaces: visibleWorkspaces,
    sites,
    platformLogs,
    crmSession,
    activeWorkspace,
    activeWorkspaceDisplay,
    activeWorkspaceId,
    isPlatformWorkspace,
    workspaceMenuOpen,
    setWorkspaceMenuOpen,
    handleSwitchWorkspace,
    siteForm,
    setSiteForm,
    handleCreateSite,
    handleProvisionSite,
    handleUpdateSite,
    handleDeleteSite,
    setUsersViewByRoute,
    setPromisesViewByRoute,
    setTasksViewByRoute,
    setSelectedUserIdByRoute,
    setSelectedPromiseIdByRoute,
    setSelectedTaskIdByRoute,
    handleSaveUser,
    handleDeletePlatformAdmin,
    handleSaveSettings,
    handleNavigateCreateUser,
    handleLogin,
    handleLogout,
    handleDeployPlatform,
    handleDeploySite,
  };
}
