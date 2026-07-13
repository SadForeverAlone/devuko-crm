import { useCallback, useEffect, useState } from "react";
import { ApiError } from "@/shared/api/http";
import {
  clearStoredCrmToken,
  getCrmUsers,
  type CrmAdmin,
  type CrmOverview,
  type CrmPlatformLog,
  type CrmPlatformMetrics,
  type CrmSite,
  type CrmWorkspace,
} from "@/entities/crm";
import { settingsBlueprint } from "./config";
import {
  loadCrmWorkspaceData,
} from "./load-crm-workspace-data";

type CrmUserList = Awaited<ReturnType<typeof getCrmUsers>>;

type UseCrmWorkspaceDataInput = {
  token: string;
  activeWorkspaceId: string;
  isPlatformWorkspace: boolean;
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

export function useCrmWorkspaceData({
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
}: UseCrmWorkspaceDataInput) {
  const [data, setData] = useState<CrmOverview | null>(null);
  const [users, setUsers] = useState<CrmUserList>([]);
  const [platformAdmins, setPlatformAdmins] = useState<CrmAdmin[]>([]);
  const [contacts, setContacts] = useState<Awaited<ReturnType<typeof import("@/entities/crm").getCrmContacts>>>([]);
  const [promises, setPromises] = useState<Awaited<ReturnType<typeof import("@/entities/crm").getCrmPromises>>>([]);
  const [pages, setPages] = useState<Awaited<ReturnType<typeof import("@/entities/crm").getCrmPages>>>([]);
  const [reports, setReports] = useState<Awaited<ReturnType<typeof import("@/entities/crm").getCrmReports>>>([]);
  const [workspaces, setWorkspaces] = useState<CrmWorkspace[]>([]);
  const [sites, setSites] = useState<CrmSite[]>([]);
  const [platformLogs, setPlatformLogs] = useState<CrmPlatformLog[]>([]);
  const [platformMetrics, setPlatformMetrics] = useState<CrmPlatformMetrics | null>(null);
  const [settingsDraft, setSettingsDraft] = useState<Record<string, string>>({});

  const applyLoadResult = useCallback((result: Awaited<ReturnType<typeof loadCrmWorkspaceData>>) => {
    setWorkspaces(result.workspaces);
    setSites(result.sites);

    if (result.kind === "platform") {
      setPlatformMetrics(result.platformMetrics);
      setPlatformAdmins(result.platformAdmins);
      setPlatformLogs(result.platformLogs);
      setData(result.data);
      setUsers([]);
      setContacts([]);
      setPromises([]);
      setPages([]);
      setReports([]);
      setSettingsDraft({});
      return;
    }

    setData(result.data);
    setUsers(result.users);
    setContacts(result.contacts);
    setPromises(result.promises);
    setPages(result.pages);
    setReports(result.reports);
    setSettingsDraft((prev) => {
      const fromApi = Object.fromEntries((result.data.settings ?? []).map((item) => [item.key, item.value]));
      return Object.fromEntries(
        settingsBlueprint.map((item) => [item.key, fromApi[item.key] ?? prev[item.key] ?? ""])
      );
    });
  }, []);

  const load = useCallback(async () => {
    const result = await loadCrmWorkspaceData(activeWorkspaceId, {
      logFilter,
      logDateFrom,
      logDateTo,
      contactSearch,
      contactDateFrom,
      contactDateTo,
      userSearch,
      usersOrderBy,
      usersOrderDir,
    });
    applyLoadResult(result);
  }, [
    activeWorkspaceId,
    applyLoadResult,
    logFilter,
    logDateFrom,
    logDateTo,
    contactSearch,
    contactDateFrom,
    contactDateTo,
    userSearch,
    usersOrderBy,
    usersOrderDir,
  ]);

  useEffect(() => {
    if (!token) {
      return;
    }
    let cancelled = false;
    const run = async () => {
      try {
        const result = await loadCrmWorkspaceData(activeWorkspaceId, {
          logFilter,
          logDateFrom,
          logDateTo,
          contactSearch,
          contactDateFrom,
          contactDateTo,
          userSearch,
          usersOrderBy,
          usersOrderDir,
        });
        if (!cancelled) {
          applyLoadResult(result);
        }
      } catch (error) {
        if (cancelled) return;
        if (error instanceof ApiError && (error.status === 401 || error.status === 403)) {
          clearStoredCrmToken();
          onUnauthorized();
        }
      }
    };
    void run();
    const pollMs = isPlatformWorkspace ? 60_000 : 120_000;
    const poll = window.setInterval(() => {
      if (!cancelled) {
        void run();
      }
    }, pollMs);
    return () => {
      cancelled = true;
      window.clearInterval(poll);
    };
  }, [
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
    applyLoadResult,
    onUnauthorized,
  ]);

  return {
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
  };
}
