import { lazy } from "react";

export const LazyContactsSection = lazy(() =>
  import("./ui/ContactsSection").then((m) => ({ default: m.ContactsSection }))
);
