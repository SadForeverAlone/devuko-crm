import { lazy } from "react";

export const LazyPlatformDashboardV2Section = lazy(() =>
  import("./PlatformDashboardV2Section").then((module) => ({ default: module.PlatformDashboardV2Section }))
);
export const LazyProjectDetailSection = lazy(() =>
  import("./ProjectDetailSection").then((module) => ({ default: module.ProjectDetailSection }))
);
export const LazySitesSection = lazy(() =>
  import("./SitesSection").then((module) => ({ default: module.SitesSection }))
);
export const LazyInfrastructureSectionView = lazy(() =>
  import("./InfrastructureSection").then((module) => ({ default: module.InfrastructureSectionView }))
);
export const LazyDeploymentsSection = lazy(() =>
  import("./DeploymentsSection").then((module) => ({ default: module.DeploymentsSection }))
);
export const LazyMonitoringSection = lazy(() =>
  import("./MonitoringSection").then((module) => ({ default: module.MonitoringSection }))
);
export const LazyAutomationSection = lazy(() =>
  import("./AutomationSection").then((module) => ({ default: module.AutomationSection }))
);
export const LazyNotificationsSection = lazy(() =>
  import("./NotificationsSection").then((module) => ({ default: module.NotificationsSection }))
);
export const LazyPlatformLogsSection = lazy(() =>
  import("./PlatformLogsSection").then((module) => ({ default: module.PlatformLogsSection }))
);
export const LazyPlatformAdminsSection = lazy(() =>
  import("./PlatformAdminsSection").then((module) => ({ default: module.PlatformAdminsSection }))
);
export const LazyPlatformSettingsSection = lazy(() =>
  import("./PlatformSettingsSection").then((module) => ({ default: module.PlatformSettingsSection }))
);
