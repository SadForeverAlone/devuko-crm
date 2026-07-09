import type { CrmTab } from "./types";
import type { DashboardPart } from "../ui/sections/sectionTypes";

export const crmTabPathMap: Record<CrmTab, string> = {
  dashboard: "/crm",
  logs: "/crm/logs",
  users: "/crm/users",
  promises: "/crm/promises",
  pages: "/crm/pages",
  files: "/crm/files",
  tasks: "/crm/tasks",
  reports: "/crm/reports",
  "call-tracker": "/crm/call-tracker",
  settings: "/crm/settings",
  contacts: "/crm/contacts",
  sites: "/crm/sites",
};

export function resolveCrmTabFromPath(pathname: string): CrmTab {
  const normalized = pathname.replace(/\/+$/, "") || "/crm";
  const entries = Object.entries(crmTabPathMap) as [CrmTab, string][];
  const sorted = [...entries].sort((a, b) => b[1].length - a[1].length);
  for (const [tab, path] of sorted) {
    if (path === "/crm") {
      if (normalized === "/crm" || normalized.startsWith("/crm/dashboard")) {
        return "dashboard";
      }
      continue;
    }
    if (normalized === path || normalized.startsWith(`${path}/`)) {
      return tab;
    }
  }
  return "dashboard";
}

export function parseCrmRoute(pathname: string): {
  tab: CrmTab;
  dashboardPart: DashboardPart | "";
  userId: string;
  promiseId: string;
  taskId: string;
} {
  const normalized = pathname.replace(/\/+$/, "") || "/crm";
  const tab = resolveCrmTabFromPath(normalized);
  if (normalized.startsWith("/crm/dashboard/")) {
    const part = normalized.slice("/crm/dashboard/".length) as DashboardPart;
    return {
      tab: "dashboard",
      dashboardPart: part,
      userId: "",
      promiseId: "",
      taskId: "",
    };
  }
  if (normalized.startsWith("/crm/users/")) {
    return {
      tab: "users",
      dashboardPart: "",
      userId: normalized.slice("/crm/users/".length),
      promiseId: "",
      taskId: "",
    };
  }
  if (normalized.startsWith("/crm/promises/")) {
    return {
      tab: "promises",
      dashboardPart: "",
      userId: "",
      promiseId: normalized.slice("/crm/promises/".length),
      taskId: "",
    };
  }
  if (normalized.startsWith("/crm/tasks/")) {
    return {
      tab: "tasks",
      dashboardPart: "",
      userId: "",
      promiseId: "",
      taskId: normalized.slice("/crm/tasks/".length),
    };
  }
  return { tab, dashboardPart: "", userId: "", promiseId: "", taskId: "" };
}
