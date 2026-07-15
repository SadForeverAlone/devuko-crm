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
  type CrmOverview,
} from "@/entities/crm";
import type { CrmTab } from "./types";

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

export const crmQueryKeys = {
  catalog: ["crm", "catalog"] as const,
  platformStatus: ["crm", "platform-status"] as const,
  platformMetrics: ["crm", "platform-metrics"] as const,
  platformAdmins: ["crm", "platform-admins"] as const,
  platformLogs: ["crm", "platform-logs"] as const,
  overview: (workspaceId: string, filters: Pick<CrmWorkspaceLoadFilters, "logFilter" | "logDateFrom" | "logDateTo" | "contactSearch">) =>
    ["crm", "overview", workspaceId, filters] as const,
  users: (
    workspaceId: string,
    filters: Pick<CrmWorkspaceLoadFilters, "userSearch" | "usersOrderBy" | "usersOrderDir">
  ) => ["crm", "users", workspaceId, filters] as const,
  contacts: (
    workspaceId: string,
    filters: Pick<CrmWorkspaceLoadFilters, "contactSearch" | "contactDateFrom" | "contactDateTo">
  ) => ["crm", "contacts", workspaceId, filters] as const,
  promises: (workspaceId: string) => ["crm", "promises", workspaceId] as const,
  pages: (workspaceId: string) => ["crm", "pages", workspaceId] as const,
  reports: (workspaceId: string) => ["crm", "reports", workspaceId] as const,
};

const PLATFORM_METRICS_TABS = new Set<CrmTab>([
  "dashboard",
  "projects",
  "infrastructure",
  "deployments",
  "monitoring",
  "notifications",
]);
const PLATFORM_ADMIN_TABS = new Set<CrmTab>(["team", "users"]);
const PLATFORM_LOG_TABS = new Set<CrmTab>(["logs", "projects", "dashboard"]);
const SITE_OVERVIEW_TABS = new Set<CrmTab>(["dashboard", "logs", "settings"]);
const SITE_USERS_TABS = new Set<CrmTab>(["users", "dashboard"]);
const SITE_CONTACTS_TABS = new Set<CrmTab>(["contacts", "dashboard"]);
const SITE_PROMISES_TABS = new Set<CrmTab>(["promises", "dashboard"]);
const SITE_PAGES_TABS = new Set<CrmTab>(["pages"]);
const SITE_REPORTS_TABS = new Set<CrmTab>(["reports"]);

export function needsPlatformMetrics(tab: CrmTab) {
  return PLATFORM_METRICS_TABS.has(tab);
}
export function needsPlatformAdmins(tab: CrmTab) {
  return PLATFORM_ADMIN_TABS.has(tab);
}
export function needsPlatformLogs(tab: CrmTab) {
  return PLATFORM_LOG_TABS.has(tab);
}
export function needsSiteOverview(tab: CrmTab) {
  return SITE_OVERVIEW_TABS.has(tab);
}
export function needsSiteUsers(tab: CrmTab) {
  return SITE_USERS_TABS.has(tab);
}
export function needsSiteContacts(tab: CrmTab) {
  return SITE_CONTACTS_TABS.has(tab);
}
export function needsSitePromises(tab: CrmTab) {
  return SITE_PROMISES_TABS.has(tab);
}
export function needsSitePages(tab: CrmTab) {
  return SITE_PAGES_TABS.has(tab);
}
export function needsSiteReports(tab: CrmTab) {
  return SITE_REPORTS_TABS.has(tab);
}

export async function loadCrmCatalog() {
  const [workspaces, sites] = await Promise.all([getCrmWorkspaces(), getCrmSites()]);
  return { workspaces, sites };
}

export async function loadPlatformOverview(): Promise<CrmOverview> {
  const status = await getCrmPlatformStatus();
  return {
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
  };
}

export function isPlatformWorkspaceId(workspaceId: string) {
  return workspaceId === PLATFORM_WORKSPACE_ID;
}

export async function loadSiteOverview(
  filters: Pick<CrmWorkspaceLoadFilters, "logFilter" | "logDateFrom" | "logDateTo" | "contactSearch">
) {
  return getCrmOverview({
    limit: 500,
    action: filters.logFilter,
    dateFrom: filters.logDateFrom || undefined,
    dateTo: filters.logDateTo || undefined,
    contactSearch: filters.contactSearch || undefined,
  });
}

export async function loadSiteUsers(
  filters: Pick<CrmWorkspaceLoadFilters, "userSearch" | "usersOrderBy" | "usersOrderDir">
) {
  return getCrmUsers({
    limit: 200,
    search: filters.userSearch || undefined,
    orderBy: filters.usersOrderBy,
    orderDir: filters.usersOrderDir,
  });
}

export async function loadSiteContacts(
  filters: Pick<CrmWorkspaceLoadFilters, "contactSearch" | "contactDateFrom" | "contactDateTo">
) {
  return getCrmContacts({
    limit: 200,
    search: filters.contactSearch || undefined,
    dateFrom: filters.contactDateFrom || undefined,
    dateTo: filters.contactDateTo || undefined,
  });
}

export const loadPlatformMetrics = getCrmPlatformMetrics;
export const loadPlatformAdmins = () =>
  getCrmAdmins({ limit: 200, orderBy: "createdAt", orderDir: "asc" });
export const loadPlatformLogs = () => getCrmPlatformLogs({ limit: 200 });
export const loadSitePromises = () => getCrmPromises({ limit: 100 });
export const loadSitePages = () => getCrmPages({ limit: 100 });
export const loadSiteReports = () => getCrmReports({ limit: 100 });
