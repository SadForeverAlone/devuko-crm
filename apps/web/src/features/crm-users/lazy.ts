import { lazy } from "react";

export const LazyUsersSection = lazy(() =>
  import("./ui/UsersSection").then((m) => ({ default: m.UsersSection }))
);
