import type { CrmTab } from "./types";
import type { DashboardPart } from "../ui/sections/sectionTypes";
import type { InfrastructureSection, ProjectDetailTab } from "./platform-nav";

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
  projects: "/crm/projects",
  infrastructure: "/crm/infrastructure",
  deployments: "/crm/deployments",
  monitoring: "/crm/monitoring",
  automation: "/crm/automation",
  team: "/crm/team",
  notifications: "/crm/notifications",
};

export const PLATFORM_TABS: CrmTab[] = [
  "dashboard",
  "projects",
  "sites",
  "infrastructure",
  "deployments",
  "monitoring",
  "automation",
  "team",
  "notifications",
  "settings",
  "logs",
  "users",
];

export const PLATFORM_ONLY_TABS: CrmTab[] = [
  "projects",
  "sites",
  "infrastructure",
  "deployments",
  "monitoring",
  "automation",
  "notifications",
];

export function resolveCrmTabFromPath(pathname: string): CrmTab {
  const normalized = pathname.replace(/\/+$/, "") || "/crm";

  if (normalized === "/crm/sites" || normalized.startsWith("/crm/sites/")) {
    return "projects";
  }
  if (normalized === "/crm/projects" || normalized.startsWith("/crm/projects/")) {
    return "projects";
  }
  if (normalized === "/crm/infrastructure" || normalized.startsWith("/crm/infrastructure/")) {
    return "infrastructure";
  }
  if (normalized === "/crm/team" || normalized.startsWith("/crm/team/")) {
    return "team";
  }

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

export function normalizeInfrastructureSection(section: string): InfrastructureSection {
  if (section === "docker") return "containers";
  return section as InfrastructureSection;
}

export function parseCrmRoute(pathname: string): {
  tab: CrmTab;
  dashboardPart: DashboardPart | "";
  userId: string;
  promiseId: string;
  taskId: string;
  projectId: string;
  projectTab: ProjectDetailTab | "";
  infrastructureSection: InfrastructureSection | "";
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
      projectId: "",
      projectTab: "",
      infrastructureSection: "",
    };
  }

  if (normalized.startsWith("/crm/projects/")) {
    const rest = normalized.slice("/crm/projects/".length);
    const [projectId, projectTab = "overview"] = rest.split("/");
    return {
      tab: "projects",
      dashboardPart: "",
      userId: "",
      promiseId: "",
      taskId: "",
      projectId,
      projectTab: (projectTab as ProjectDetailTab) || "overview",
      infrastructureSection: "",
    };
  }

  if (normalized.startsWith("/crm/infrastructure/")) {
    const section = normalizeInfrastructureSection(normalized.slice("/crm/infrastructure/".length));
    return {
      tab: "infrastructure",
      dashboardPart: "",
      userId: "",
      promiseId: "",
      taskId: "",
      projectId: "",
      projectTab: "",
      infrastructureSection: section || "overview",
    };
  }

  if (normalized.startsWith("/crm/users/")) {
    return {
      tab: tab === "team" ? "team" : "users",
      dashboardPart: "",
      userId: normalized.slice("/crm/users/".length),
      promiseId: "",
      taskId: "",
      projectId: "",
      projectTab: "",
      infrastructureSection: "",
    };
  }

  if (normalized.startsWith("/crm/team/")) {
    return {
      tab: "team",
      dashboardPart: "",
      userId: normalized.slice("/crm/team/".length),
      promiseId: "",
      taskId: "",
      projectId: "",
      projectTab: "",
      infrastructureSection: "",
    };
  }

  if (normalized.startsWith("/crm/promises/")) {
    return {
      tab: "promises",
      dashboardPart: "",
      userId: "",
      promiseId: normalized.slice("/crm/promises/".length),
      taskId: "",
      projectId: "",
      projectTab: "",
      infrastructureSection: "",
    };
  }

  if (normalized.startsWith("/crm/tasks/")) {
    return {
      tab: "tasks",
      dashboardPart: "",
      userId: "",
      promiseId: "",
      taskId: normalized.slice("/crm/tasks/".length),
      projectId: "",
      projectTab: "",
      infrastructureSection: "",
    };
  }

  return {
    tab,
    dashboardPart: "",
    userId: "",
    promiseId: "",
    taskId: "",
    projectId: "",
    projectTab: "",
    infrastructureSection: normalized === "/crm/infrastructure" ? "overview" : "",
  };
}
