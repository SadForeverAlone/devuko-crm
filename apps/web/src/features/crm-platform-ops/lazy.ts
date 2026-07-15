import { lazy } from "react";

export const LazyInfrastructureSectionView = lazy(() =>
  import("./ui/InfrastructureSection").then((m) => ({ default: m.InfrastructureSectionView }))
);
export const LazyDeploymentsSection = lazy(() =>
  import("./ui/DeploymentsSection").then((m) => ({ default: m.DeploymentsSection }))
);
export const LazyMonitoringSection = lazy(() =>
  import("./ui/MonitoringSection").then((m) => ({ default: m.MonitoringSection }))
);
export const LazyAutomationSection = lazy(() =>
  import("./ui/AutomationSection").then((m) => ({ default: m.AutomationSection }))
);
export const LazyNotificationsSection = lazy(() =>
  import("./ui/NotificationsSection").then((m) => ({ default: m.NotificationsSection }))
);
