import { lazy } from "react";

export const LazyDashboardSection = lazy(() =>
  import("./ui/DashboardSection").then((m) => ({ default: m.DashboardSection }))
);
export const LazyPlatformDashboardV2Section = lazy(() =>
  import("./ui/PlatformDashboardV2Section").then((m) => ({ default: m.PlatformDashboardV2Section }))
);
