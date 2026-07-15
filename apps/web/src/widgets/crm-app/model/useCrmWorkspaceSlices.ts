import { useMemo } from "react";
import { useCrmWorkspaceContext } from "./crm-workspace-context";

export function useCrmWorkspaceNavigation() {
  const ws = useCrmWorkspaceContext();
  return useMemo(
    () => ({
      navigate: ws.navigate,
      tab: ws.tab,
      dashboardPart: ws.dashboardPart,
      projectId: ws.projectId,
      projectTab: ws.projectTab,
      infrastructureSection: ws.infrastructureSection,
      crmNavItems: ws.crmNavItems,
      crmShortcutItems: ws.crmShortcutItems,
      crmTabPathMap: ws.crmTabPathMap,
      handleSwitchWorkspace: ws.handleSwitchWorkspace,
    }),
    [
      ws.navigate,
      ws.tab,
      ws.dashboardPart,
      ws.projectId,
      ws.projectTab,
      ws.infrastructureSection,
      ws.crmNavItems,
      ws.crmShortcutItems,
      ws.crmTabPathMap,
      ws.handleSwitchWorkspace,
    ]
  );
}

export function useCrmWorkspaceChromeState() {
  const ws = useCrmWorkspaceContext();
  return useMemo(
    () => ({
      crmLang: ws.crmLang,
      setCrmLang: ws.setCrmLang,
      crmSession: ws.crmSession,
      ui: ws.ui,
      workspaces: ws.workspaces,
      activeWorkspace: ws.activeWorkspace,
      activeWorkspaceDisplay: ws.activeWorkspaceDisplay,
      activeWorkspaceId: ws.activeWorkspaceId,
      isPlatformWorkspace: ws.isPlatformWorkspace,
      workspaceMenuOpen: ws.workspaceMenuOpen,
      setWorkspaceMenuOpen: ws.setWorkspaceMenuOpen,
      handleLogout: ws.handleLogout,
    }),
    [
      ws.crmLang,
      ws.setCrmLang,
      ws.crmSession,
      ws.ui,
      ws.workspaces,
      ws.activeWorkspace,
      ws.activeWorkspaceDisplay,
      ws.activeWorkspaceId,
      ws.isPlatformWorkspace,
      ws.workspaceMenuOpen,
      ws.setWorkspaceMenuOpen,
      ws.handleLogout,
    ]
  );
}

export function useCrmWorkspaceFilters() {
  const ws = useCrmWorkspaceContext();
  return useMemo(
    () => ({
      rowLimitInput: ws.rowLimitInput,
      setRowLimitInput: ws.setRowLimitInput,
      logDateFrom: ws.logDateFrom,
      setLogDateFrom: ws.setLogDateFrom,
      logDateTo: ws.logDateTo,
      setLogDateTo: ws.setLogDateTo,
      logFilter: ws.logFilter,
      setLogFilter: ws.setLogFilter,
      contactSearch: ws.contactSearch,
      setContactSearch: ws.setContactSearch,
      contactDateFrom: ws.contactDateFrom,
      setContactDateFrom: ws.setContactDateFrom,
      contactDateTo: ws.contactDateTo,
      setContactDateTo: ws.setContactDateTo,
      userSearch: ws.userSearch,
      setUserSearch: ws.setUserSearch,
      usersOrderBy: ws.usersOrderBy,
      setUsersOrderBy: ws.setUsersOrderBy,
      usersOrderDir: ws.usersOrderDir,
      setUsersOrderDir: ws.setUsersOrderDir,
    }),
    [
      ws.rowLimitInput,
      ws.setRowLimitInput,
      ws.logDateFrom,
      ws.setLogDateFrom,
      ws.logDateTo,
      ws.setLogDateTo,
      ws.logFilter,
      ws.setLogFilter,
      ws.contactSearch,
      ws.setContactSearch,
      ws.contactDateFrom,
      ws.setContactDateFrom,
      ws.contactDateTo,
      ws.setContactDateTo,
      ws.userSearch,
      ws.setUserSearch,
      ws.usersOrderBy,
      ws.setUsersOrderBy,
      ws.usersOrderDir,
      ws.setUsersOrderDir,
    ]
  );
}

export function useCrmWorkspaceSiteOps() {
  const ws = useCrmWorkspaceContext();
  return useMemo(
    () => ({
      sites: ws.sites,
      siteForm: ws.siteForm,
      setSiteForm: ws.setSiteForm,
      handleCreateSite: ws.handleCreateSite,
      handleProvisionSite: ws.handleProvisionSite,
      handleUpdateSite: ws.handleUpdateSite,
      handleDeleteSite: ws.handleDeleteSite,
      deploying: ws.deploying,
      handleDeployPlatform: ws.handleDeployPlatform,
      handleDeploySite: ws.handleDeploySite,
    }),
    [
      ws.sites,
      ws.siteForm,
      ws.setSiteForm,
      ws.handleCreateSite,
      ws.handleProvisionSite,
      ws.handleUpdateSite,
      ws.handleDeleteSite,
      ws.deploying,
      ws.handleDeployPlatform,
      ws.handleDeploySite,
    ]
  );
}

export function useCrmWorkspaceAdminOps() {
  const ws = useCrmWorkspaceContext();
  return useMemo(
    () => ({
      usersView: ws.usersView,
      isUserCreateRoute: ws.isUserCreateRoute,
      usersWithMeta: ws.usersWithMeta,
      selectedUser: ws.selectedUser,
      userForm: ws.userForm,
      setUserForm: ws.setUserForm,
      setSelectedUserIdByRoute: ws.setSelectedUserIdByRoute,
      setUsersViewByRoute: ws.setUsersViewByRoute,
      handleSaveUser: ws.handleSaveUser,
      handleNavigateCreateUser: ws.handleNavigateCreateUser,
      platformAdmins: ws.platformAdmins,
      adminSearch: ws.adminSearch,
      setAdminSearch: ws.setAdminSearch,
      platformAdminForm: ws.platformAdminForm,
      setPlatformAdminForm: ws.setPlatformAdminForm,
      platformAdminPassword: ws.platformAdminPassword,
      setPlatformAdminPassword: ws.setPlatformAdminPassword,
      platformAdminPasswordKey: ws.platformAdminPasswordKey,
      selectedPlatformAdmin: ws.selectedPlatformAdmin,
      currentAdminId: ws.currentAdminId,
      canDeletePlatformAdmin: ws.canDeletePlatformAdmin,
      handleDeletePlatformAdmin: ws.handleDeletePlatformAdmin,
    }),
    [
      ws.usersView,
      ws.isUserCreateRoute,
      ws.usersWithMeta,
      ws.selectedUser,
      ws.userForm,
      ws.setUserForm,
      ws.setSelectedUserIdByRoute,
      ws.setUsersViewByRoute,
      ws.handleSaveUser,
      ws.handleNavigateCreateUser,
      ws.platformAdmins,
      ws.adminSearch,
      ws.setAdminSearch,
      ws.platformAdminForm,
      ws.setPlatformAdminForm,
      ws.platformAdminPassword,
      ws.setPlatformAdminPassword,
      ws.platformAdminPasswordKey,
      ws.selectedPlatformAdmin,
      ws.currentAdminId,
      ws.canDeletePlatformAdmin,
      ws.handleDeletePlatformAdmin,
    ]
  );
}

export function useCrmWorkspaceDataView() {
  const ws = useCrmWorkspaceContext();
  return useMemo(
    () => ({
      data: ws.data,
      platformMetrics: ws.platformMetrics,
      genderMetrics: ws.genderMetrics,
      countryMetrics: ws.countryMetrics,
      roleOverview: ws.roleOverview,
      visibleContacts: ws.visibleContacts,
      siteLogs: ws.siteLogs,
      promisesView: ws.promisesView,
      promiseRecords: ws.promiseRecords,
      selectedPromise: ws.selectedPromise,
      setSelectedPromiseIdByRoute: ws.setSelectedPromiseIdByRoute,
      setPromisesViewByRoute: ws.setPromisesViewByRoute,
      pages: ws.pages,
      reports: ws.reports,
      settingsDraft: ws.settingsDraft,
      setSettingsDraft: ws.setSettingsDraft,
      handleSaveSettings: ws.handleSaveSettings,
      platformLogs: ws.platformLogs,
    }),
    [
      ws.data,
      ws.platformMetrics,
      ws.genderMetrics,
      ws.countryMetrics,
      ws.roleOverview,
      ws.visibleContacts,
      ws.siteLogs,
      ws.promisesView,
      ws.promiseRecords,
      ws.selectedPromise,
      ws.setSelectedPromiseIdByRoute,
      ws.setPromisesViewByRoute,
      ws.pages,
      ws.reports,
      ws.settingsDraft,
      ws.setSettingsDraft,
      ws.handleSaveSettings,
      ws.platformLogs,
    ]
  );
}
