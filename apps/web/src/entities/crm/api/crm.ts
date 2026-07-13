export {
  clearStoredCrmToken,
  getStoredCrmToken,
  getStoredCrmWorkspaceId,
  getStoredCrmWorkspaceMeta,
  PLATFORM_WORKSPACE_ID,
  setStoredCrmToken,
  setStoredCrmWorkspace,
  setStoredCrmWorkspaceId,
  type CrmWorkspaceKind,
  type StoredCrmWorkspaceMeta,
} from "./storage";

export type {
  CrmAdmin,
  CrmDatabaseInstance,
  CrmDiskMount,
  CrmDockerContainer,
  CrmDockerImage,
  CrmDockerNetwork,
  CrmDockerVolume,
  CrmOverview,
  CrmPlatformLog,
  CrmPlatformMetrics,
  CrmServerInfo,
  CrmSession,
  CrmSite,
  CrmStorageUsage,
  CrmWorkspace,
} from "./types";

export { getCrmSession, getCrmSessionFromToken, loginCrm } from "./auth";
export { deployCrmPlatform, getCrmPlatformLogs, getCrmPlatformMetrics, getCrmPlatformStatus } from "./platform";
export { createCrmAdmin, deleteCrmAdmin, getCrmAdmins, updateCrmAdmin } from "./admins";
export {
  createCrmSite,
  deleteCrmSite,
  deployCrmSite,
  getCrmSites,
  getCrmWorkspaces,
  provisionCrmSite,
  updateCrmSite,
} from "./sites";
export {
  createCrmUser,
  getCrmContacts,
  getCrmOverview,
  getCrmPages,
  getCrmPromises,
  getCrmReports,
  getCrmUsers,
  updateCrmSettings,
  updateCrmUser,
} from "./workspace-data";
