import { lazy } from "react";

export const LazyPlatformAdminsSection = lazy(() =>
  import("./ui/PlatformAdminsSection").then((m) => ({ default: m.PlatformAdminsSection }))
);
