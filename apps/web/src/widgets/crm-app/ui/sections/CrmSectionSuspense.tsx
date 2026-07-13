import type { ReactNode } from "react";
import { Suspense } from "react";

export function CrmSectionFallback() {
  return <section className="crm-page crm-page--loading" aria-busy="true" aria-label="Loading" />;
}

export function withCrmSectionSuspense(node: ReactNode) {
  return <Suspense fallback={<CrmSectionFallback />}>{node}</Suspense>;
}
