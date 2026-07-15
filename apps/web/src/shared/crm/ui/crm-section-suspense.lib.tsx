import type { ReactNode } from "react";
import { Suspense } from "react";
import { CrmSectionFallback } from "./CrmSectionSuspense";

export function withCrmSectionSuspense(node: ReactNode) {
  return <Suspense fallback={<CrmSectionFallback />}>{node}</Suspense>;
}
