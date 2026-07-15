import { lazy } from "react";

export const LazyLogsSection = lazy(() =>
  import("./ui/LogsSection").then((m) => ({ default: m.LogsSection }))
);
export const LazyPlatformLogsSection = lazy(() =>
  import("./ui/PlatformLogsSection").then((m) => ({ default: m.PlatformLogsSection }))
);
