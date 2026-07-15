import type { Dispatch, SetStateAction } from "react";
import { useCallback, useEffect, useMemo, useRef } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import type { NavigateOptions, To } from "react-router-dom";
import { setStoredCrmWorkspaceId } from "@/entities/crm";
import { PLATFORM_ONLY_TABS, PLATFORM_TABS, parseCrmRoute } from "./crm-routes";
import {
  getWorkspaceIdFromLocationState,
  withWorkspaceNavigationState,
} from "./crm-navigation";

type UseCrmNavigationInput = {
  token: string;
  activeWorkspaceId: string;
  isPlatformWorkspace: boolean;
  setActiveWorkspaceId: Dispatch<SetStateAction<string>>;
  setSettingsDraft: Dispatch<SetStateAction<Record<string, string>>>;
  setWorkspaceMenuOpen: Dispatch<SetStateAction<boolean>>;
};

export type CrmNavigate = (to: To | number, options?: NavigateOptions) => void;

export function useCrmNavigation({
  token,
  activeWorkspaceId,
  isPlatformWorkspace,
  setActiveWorkspaceId,
  setSettingsDraft,
  setWorkspaceMenuOpen,
}: UseCrmNavigationInput) {
  const location = useLocation();
  const navigateRaw = useNavigate();
  const bootstrappedHistoryRef = useRef(false);

  const navigate = useCallback<CrmNavigate>(
    (to, options) => {
      if (typeof to === "number") {
        navigateRaw(to);
        return;
      }
      navigateRaw(to, withWorkspaceNavigationState(activeWorkspaceId, options));
    },
    [navigateRaw, activeWorkspaceId]
  );

  const route = useMemo(() => parseCrmRoute(location.pathname), [location.pathname]);
  const tab = route.tab;
  const isUserCreateRoute = route.userId === "new";
  const usersView: "list" | "detail" = route.userId ? "detail" : "list";
  const promisesView: "list" | "detail" = route.promiseId ? "detail" : "list";
  const tasksView: "list" | "detail" = route.taskId ? "detail" : "list";
  const dashboardPart = route.dashboardPart;
  const projectId = route.projectId;
  const projectTab = route.projectTab;
  const infrastructureSection = route.infrastructureSection;

  useEffect(() => {
    const historyWorkspaceId = getWorkspaceIdFromLocationState(location.state);
    if (!historyWorkspaceId || historyWorkspaceId === activeWorkspaceId) {
      return;
    }
    setStoredCrmWorkspaceId(historyWorkspaceId);
    setActiveWorkspaceId(historyWorkspaceId);
  }, [location.key, location.state, activeWorkspaceId, setActiveWorkspaceId]);

  useEffect(() => {
    if (!token || bootstrappedHistoryRef.current) {
      return;
    }
    bootstrappedHistoryRef.current = true;
    if (getWorkspaceIdFromLocationState(location.state)) {
      return;
    }
    navigateRaw(`${location.pathname}${location.search}`, {
      replace: true,
      state: withWorkspaceNavigationState(activeWorkspaceId).state,
    });
  }, [token, activeWorkspaceId, location.pathname, location.search, location.state, navigateRaw]);

  useEffect(() => {
    if (!isPlatformWorkspace && PLATFORM_ONLY_TABS.includes(tab)) {
      navigate("/crm", { replace: true });
      return;
    }
    if (!isPlatformWorkspace && (tab === "sites" || tab === "projects")) {
      navigate("/crm", { replace: true });
      return;
    }
    if (isPlatformWorkspace && !PLATFORM_TABS.includes(tab)) {
      navigate("/crm", { replace: true });
      return;
    }
  }, [isPlatformWorkspace, tab, navigate, location.pathname, activeWorkspaceId]);

  useEffect(() => {
    const label = tab.charAt(0).toUpperCase() + tab.slice(1);
    document.title = `Devuko CRM · ${label}`;
  }, [tab]);

  const handleSwitchWorkspace = useCallback(
    (workspaceId: string) => {
      setStoredCrmWorkspaceId(workspaceId);
      setActiveWorkspaceId(workspaceId);
      setSettingsDraft({});
      setWorkspaceMenuOpen(false);
      navigateRaw("/crm", withWorkspaceNavigationState(workspaceId));
    },
    [navigateRaw, setActiveWorkspaceId, setSettingsDraft, setWorkspaceMenuOpen]
  );

  return {
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
    handleSwitchWorkspace,
  };
}
