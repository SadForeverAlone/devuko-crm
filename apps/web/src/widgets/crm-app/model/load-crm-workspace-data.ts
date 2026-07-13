import {
  getCrmAdmins,
  getCrmContacts,
  getCrmOverview,
  getCrmPages,
  getCrmPlatformLogs,
  getCrmPlatformMetrics,
  getCrmPlatformStatus,
  getCrmPromises,
  getCrmReports,
  getCrmSites,
  getCrmUsers,
  getCrmWorkspaces,
  PLATFORM_WORKSPACE_ID,
  type CrmAdmin,
  type CrmOverview,
  type CrmPlatformLog,
  type CrmPlatformMetrics,
  type CrmSite,
  type CrmWorkspace,
} from "@/entities/crm";

export type CrmWorkspaceLoadFilters = {
  logFilter: string;
  logDateFrom: string;
  logDateTo: string;
  contactSearch: string;
  contactDateFrom: string;
  contactDateTo: string;
  userSearch: string;
  usersOrderBy: "createdAt" | "email" | "displayName" | "login";
  usersOrderDir: "asc" | "desc";
};

export type CrmWorkspacePlatformLoadResult = {
  kind: "platform";
  workspaces: CrmWorkspace[];
  sites: CrmSite[];
  platformMetrics: CrmPlatformMetrics;
  platformAdmins: CrmAdmin[];
  platformLogs: CrmPlatformLog[];
  data: CrmOverview;
};

export type CrmWorkspaceSiteLoadResult = {
  kind: "site";
  workspaces: CrmWorkspace[];
  sites: CrmSite[];
  data: CrmOverview;
  users: Awaited<ReturnType<typeof getCrmUsers>>;
  contacts: Awaited<ReturnType<typeof getCrmContacts>>;
  promises: Awaited<ReturnType<typeof getCrmPromises>>;
  pages: Awaited<ReturnType<typeof getCrmPages>>;
  reports: Awaited<ReturnType<typeof getCrmReports>>;
};

export type CrmWorkspaceLoadResult = CrmWorkspacePlatformLoadResult | CrmWorkspaceSiteLoadResult;

export async function loadCrmWorkspaceData(
  activeWorkspaceId: string,
  filters: CrmWorkspaceLoadFilters
): Promise<CrmWorkspaceLoadResult> {
  const [workspaces, sites] = await Promise.all([getCrmWorkspaces(), getCrmSites()]);
  const isPlatform = activeWorkspaceId === PLATFORM_WORKSPACE_ID;

  if (isPlatform) {
    const [status, platformMetrics, platformAdmins, platformLogs] = await Promise.all([
      getCrmPlatformStatus(),
      getCrmPlatformMetrics(),
      getCrmAdmins({
        limit: 200,
        orderBy: "createdAt",
        orderDir: "asc",
      }),
      getCrmPlatformLogs({ limit: 200 }),
    ]);

    return {
      kind: "platform",
      workspaces,
      sites,
      platformMetrics,
      platformAdmins,
      platformLogs,
      data: {
        serverDateTime: status.serverDateTime,
        serverTimeZone: status.serverTimeZone,
        lastAuditActivityAt: status.lastAuditActivityAt,
        storageUsage: status.storageUsage,
        counters: {
          usersCount: 0,
          promisesCount: 0,
          activePromisesCount: 0,
          proofsCount: 0,
        },
        recentLogs: [],
        logCategories: [],
        contacts: [],
        settings: [],
      },
    };
  }

  const [data, users, contacts, promises, pages, reports] = await Promise.all([
    getCrmOverview({
      limit: 500,
      action: filters.logFilter,
      dateFrom: filters.logDateFrom || undefined,
      dateTo: filters.logDateTo || undefined,
      contactSearch: filters.contactSearch || undefined,
    }),
    getCrmUsers({
      limit: 200,
      search: filters.userSearch || undefined,
      orderBy: filters.usersOrderBy,
      orderDir: filters.usersOrderDir,
    }),
    getCrmContacts({
      limit: 200,
      search: filters.contactSearch || undefined,
      dateFrom: filters.contactDateFrom || undefined,
      dateTo: filters.contactDateTo || undefined,
    }),
    getCrmPromises({ limit: 100 }),
    getCrmPages({ limit: 100 }),
    getCrmReports({ limit: 100 }),
  ]);

  return {
    kind: "site",
    workspaces,
    sites,
    data,
    users,
    contacts,
    promises,
    pages,
    reports,
  };
}
