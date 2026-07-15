import { useEffect, useState } from "react";
import { ApiError } from "@/shared/api/http";
import { useDebouncedValue } from "@/shared/lib/useDebouncedValue";
import { emitAppNotification } from "@/shared/lib/notify";
import { clearStoredCrmToken } from "@/entities/crm";
import {
  isPlatformWorkspaceId,
  useCrmCatalogQuery,
  useCrmContactsQuery,
  useCrmInvalidateAll,
  useCrmPagesQuery,
  useCrmPlatformAdminsQuery,
  useCrmPlatformLogsQuery,
  useCrmPlatformMetricsQuery,
  useCrmPlatformStatusQuery,
  useCrmPromisesQuery,
  useCrmReportsQuery,
  useCrmSiteOverviewQuery,
  useCrmUsersQuery,
} from "@/shared/crm/model";
import type { CrmTab } from "@/shared/crm/model/types";
import { settingsBlueprint } from "./config";

type UseCrmWorkspaceDataInput = {
  token: string;
  activeWorkspaceId: string;
  isPlatformWorkspace: boolean;
  tab: CrmTab;
  logFilter: string;
  logDateFrom: string;
  logDateTo: string;
  contactSearch: string;
  contactDateFrom: string;
  contactDateTo: string;
  userSearch: string;
  usersOrderBy: "createdAt" | "email" | "displayName" | "login";
  usersOrderDir: "asc" | "desc";
  onUnauthorized: () => void;
};

function handleQueryError(error: unknown, onUnauthorized: () => void) {
  if (error instanceof ApiError && (error.status === 401 || error.status === 403)) {
    clearStoredCrmToken();
    onUnauthorized();
    return;
  }
  const message =
    error instanceof ApiError
      ? error.message
      : error instanceof Error
        ? error.message
        : "Failed to load workspace data";
  emitAppNotification(message);
}

export function useCrmWorkspaceData({
  token,
  activeWorkspaceId,
  isPlatformWorkspace,
  tab,
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
}: UseCrmWorkspaceDataInput) {
  const [settingsDraft, setSettingsDraft] = useState<Record<string, string>>({});
  const [loadError, setLoadError] = useState<string | null>(null);

  const debouncedLogFilter = useDebouncedValue(logFilter, 300);
  const debouncedContactSearch = useDebouncedValue(contactSearch, 300);
  const debouncedUserSearch = useDebouncedValue(userSearch, 300);

  const enabled = Boolean(token);
  const platform = isPlatformWorkspace || isPlatformWorkspaceId(activeWorkspaceId);
  const siteEnabled = enabled && !platform;

  const catalogQuery = useCrmCatalogQuery({ enabled });
  const platformStatusQuery = useCrmPlatformStatusQuery({ enabled: enabled && platform });
  const metricsQuery = useCrmPlatformMetricsQuery({ enabled: enabled && platform, tab });
  const adminsQuery = useCrmPlatformAdminsQuery({ enabled: enabled && platform, tab });
  const platformLogsQuery = useCrmPlatformLogsQuery({ enabled: enabled && platform, tab });

  const overviewFilters = {
    logFilter: debouncedLogFilter,
    logDateFrom,
    logDateTo,
    contactSearch: debouncedContactSearch,
  };
  const overviewQuery = useCrmSiteOverviewQuery({
    enabled: siteEnabled,
    workspaceId: activeWorkspaceId,
    tab,
    filters: overviewFilters,
  });

  const usersFilters = {
    userSearch: debouncedUserSearch,
    usersOrderBy,
    usersOrderDir,
  };
  const usersQuery = useCrmUsersQuery({
    enabled: siteEnabled,
    workspaceId: activeWorkspaceId,
    tab,
    filters: usersFilters,
  });

  const contactsFilters = {
    contactSearch: debouncedContactSearch,
    contactDateFrom,
    contactDateTo,
  };
  const contactsQuery = useCrmContactsQuery({
    enabled: siteEnabled,
    workspaceId: activeWorkspaceId,
    tab,
    filters: contactsFilters,
  });

  const promisesQuery = useCrmPromisesQuery({
    enabled: siteEnabled,
    workspaceId: activeWorkspaceId,
    tab,
  });
  const pagesQuery = useCrmPagesQuery({
    enabled: siteEnabled,
    workspaceId: activeWorkspaceId,
    tab,
  });
  const reportsQuery = useCrmReportsQuery({
    enabled: siteEnabled,
    workspaceId: activeWorkspaceId,
    tab,
  });

  const load = useCrmInvalidateAll();

  useEffect(() => {
    const errors = [
      catalogQuery.error,
      platformStatusQuery.error,
      metricsQuery.error,
      adminsQuery.error,
      platformLogsQuery.error,
      overviewQuery.error,
      usersQuery.error,
      contactsQuery.error,
      promisesQuery.error,
      pagesQuery.error,
      reportsQuery.error,
    ].filter(Boolean);

    if (errors.length === 0) {
      setLoadError(null);
      return;
    }
    const error = errors[0];
    handleQueryError(error, onUnauthorized);
    setLoadError(error instanceof Error ? error.message : "Failed to load workspace data");
  }, [
    catalogQuery.error,
    platformStatusQuery.error,
    metricsQuery.error,
    adminsQuery.error,
    platformLogsQuery.error,
    overviewQuery.error,
    usersQuery.error,
    contactsQuery.error,
    promisesQuery.error,
    pagesQuery.error,
    reportsQuery.error,
    onUnauthorized,
  ]);

  useEffect(() => {
    if (platform) {
      setSettingsDraft({});
      return;
    }
    const settings = overviewQuery.data?.settings;
    if (!settings) return;
    setSettingsDraft((prev) => {
      const fromApi = Object.fromEntries(settings.map((item) => [item.key, item.value]));
      return Object.fromEntries(
        settingsBlueprint.map((item) => [item.key, fromApi[item.key] ?? prev[item.key] ?? ""])
      );
    });
  }, [platform, overviewQuery.data?.settings]);

  const data = platform ? (platformStatusQuery.data ?? null) : (overviewQuery.data ?? null);

  return {
    data,
    users: usersQuery.data ?? [],
    platformAdmins: adminsQuery.data ?? [],
    contacts: contactsQuery.data ?? [],
    promises: promisesQuery.data ?? [],
    pages: pagesQuery.data ?? [],
    reports: reportsQuery.data ?? [],
    workspaces: catalogQuery.data?.workspaces ?? [],
    sites: catalogQuery.data?.sites ?? [],
    platformLogs: platformLogsQuery.data ?? [],
    platformMetrics: metricsQuery.data ?? null,
    settingsDraft,
    setSettingsDraft,
    loadError,
    load,
  };
}
