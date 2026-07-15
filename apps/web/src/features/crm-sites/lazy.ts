import { lazy } from "react";

export const LazySitesSection = lazy(() =>
  import("./ui/SitesSection").then((m) => ({ default: m.SitesSection }))
);
export const LazyProjectDetailSection = lazy(() =>
  import("./ui/ProjectDetailSection").then((m) => ({ default: m.ProjectDetailSection }))
);
