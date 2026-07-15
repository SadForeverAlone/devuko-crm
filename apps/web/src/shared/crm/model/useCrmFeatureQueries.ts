import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useCallback } from "react";
import {
  crmQueryKeys,
  loadCrmCatalog,
  loadPlatformAdmins,
  loadPlatformLogs,
  loadPlatformMetrics,
  loadPlatformOverview,
  loadSiteContacts,
  loadSiteOverview,
  loadSitePages,
  loadSitePromises,
  loadSiteReports,
  loadSiteUsers,
  needsPlatformAdmins,
  needsPlatformLogs,
  needsPlatformMetrics,
  needsSiteContacts,
  needsSiteOverview,
  needsSitePages,
  needsSitePromises,
  needsSiteReports,
  needsSiteUsers,
  type CrmWorkspaceLoadFilters,
} from "./crm-queries";
import type { CrmTab } from "./types";

export function useCrmInvalidateAll() {
  const queryClient = useQueryClient();
  return useCallback(async () => {
    await queryClient.invalidateQueries({ queryKey: ["crm"] });
  }, [queryClient]);
}

type AuthGate = { enabled: boolean };

export function useCrmCatalogQuery({ enabled }: AuthGate) {
  return useQuery({
    queryKey: crmQueryKeys.catalog,
    queryFn: loadCrmCatalog,
    enabled,
    staleTime: 30_000,
    refetchInterval: 120_000,
    refetchIntervalInBackground: false,
  });
}

export function useCrmPlatformStatusQuery({ enabled }: AuthGate) {
  return useQuery({
    queryKey: crmQueryKeys.platformStatus,
    queryFn: loadPlatformOverview,
    enabled,
    staleTime: 30_000,
    refetchInterval: 60_000,
    refetchIntervalInBackground: false,
  });
}

export function useCrmPlatformMetricsQuery({ enabled, tab }: AuthGate & { tab: CrmTab }) {
  return useQuery({
    queryKey: crmQueryKeys.platformMetrics,
    queryFn: loadPlatformMetrics,
    enabled: enabled && needsPlatformMetrics(tab),
    staleTime: 20_000,
    refetchInterval: 60_000,
    refetchIntervalInBackground: false,
  });
}

export function useCrmPlatformAdminsQuery({ enabled, tab }: AuthGate & { tab: CrmTab }) {
  return useQuery({
    queryKey: crmQueryKeys.platformAdmins,
    queryFn: loadPlatformAdmins,
    enabled: enabled && needsPlatformAdmins(tab),
    staleTime: 30_000,
  });
}

export function useCrmPlatformLogsQuery({ enabled, tab }: AuthGate & { tab: CrmTab }) {
  return useQuery({
    queryKey: crmQueryKeys.platformLogs,
    queryFn: loadPlatformLogs,
    enabled: enabled && needsPlatformLogs(tab),
    staleTime: 20_000,
    refetchInterval: 60_000,
    refetchIntervalInBackground: false,
  });
}

type WorkspaceGate = AuthGate & { workspaceId: string; tab: CrmTab };

export function useCrmSiteOverviewQuery({
  enabled,
  workspaceId,
  tab,
  filters,
}: WorkspaceGate & {
  filters: Pick<CrmWorkspaceLoadFilters, "logFilter" | "logDateFrom" | "logDateTo" | "contactSearch">;
}) {
  return useQuery({
    queryKey: crmQueryKeys.overview(workspaceId, filters),
    queryFn: () => loadSiteOverview(filters),
    enabled: enabled && needsSiteOverview(tab),
    staleTime: 15_000,
    refetchInterval: 120_000,
    refetchIntervalInBackground: false,
  });
}

export function useCrmUsersQuery({
  enabled,
  workspaceId,
  tab,
  filters,
}: WorkspaceGate & {
  filters: Pick<CrmWorkspaceLoadFilters, "userSearch" | "usersOrderBy" | "usersOrderDir">;
}) {
  return useQuery({
    queryKey: crmQueryKeys.users(workspaceId, filters),
    queryFn: () => loadSiteUsers(filters),
    enabled: enabled && needsSiteUsers(tab),
    staleTime: 15_000,
  });
}

export function useCrmContactsQuery({
  enabled,
  workspaceId,
  tab,
  filters,
}: WorkspaceGate & {
  filters: Pick<CrmWorkspaceLoadFilters, "contactSearch" | "contactDateFrom" | "contactDateTo">;
}) {
  return useQuery({
    queryKey: crmQueryKeys.contacts(workspaceId, filters),
    queryFn: () => loadSiteContacts(filters),
    enabled: enabled && needsSiteContacts(tab),
    staleTime: 15_000,
  });
}

export function useCrmPromisesQuery({ enabled, workspaceId, tab }: WorkspaceGate) {
  return useQuery({
    queryKey: crmQueryKeys.promises(workspaceId),
    queryFn: loadSitePromises,
    enabled: enabled && needsSitePromises(tab),
    staleTime: 30_000,
  });
}

export function useCrmPagesQuery({ enabled, workspaceId, tab }: WorkspaceGate) {
  return useQuery({
    queryKey: crmQueryKeys.pages(workspaceId),
    queryFn: loadSitePages,
    enabled: enabled && needsSitePages(tab),
    staleTime: 60_000,
  });
}

export function useCrmReportsQuery({ enabled, workspaceId, tab }: WorkspaceGate) {
  return useQuery({
    queryKey: crmQueryKeys.reports(workspaceId),
    queryFn: loadSiteReports,
    enabled: enabled && needsSiteReports(tab),
    staleTime: 60_000,
  });
}
