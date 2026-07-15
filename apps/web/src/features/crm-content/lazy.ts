import { lazy } from "react";

export const LazyPromisesSection = lazy(() =>
  import("./ui/PromisesSection").then((m) => ({ default: m.PromisesSection }))
);
export const LazyPagesSection = lazy(() =>
  import("./ui/PagesSection").then((m) => ({ default: m.PagesSection }))
);
export const LazyReportsSection = lazy(() =>
  import("./ui/ReportsSection").then((m) => ({ default: m.ReportsSection }))
);
export const LazySettingsSection = lazy(() =>
  import("./ui/SettingsSection").then((m) => ({ default: m.SettingsSection }))
);
export const LazyPlatformSettingsSection = lazy(() =>
  import("./ui/PlatformSettingsSection").then((m) => ({ default: m.PlatformSettingsSection }))
);
