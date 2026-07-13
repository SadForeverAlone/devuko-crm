import { useEffect, useState } from "react";
import { getCrmSession, getCrmSessionFromToken, type CrmSession } from "@/entities/crm";

export function useCrmSession(token: string) {
  const [crmSession, setCrmSession] = useState<CrmSession | null>(null);

  useEffect(() => {
    if (!token) {
      setCrmSession(null);
      return;
    }
    let cancelled = false;
    void getCrmSession()
      .then((session) => {
        if (!cancelled) setCrmSession(session);
      })
      .catch(() => {
        const fallback = getCrmSessionFromToken();
        if (!cancelled) {
          setCrmSession(
            fallback
              ? {
                  id: fallback.id,
                  login: fallback.email.split("@")[0] ?? "",
                  email: fallback.email,
                  firstName: fallback.email.split("@")[0] ?? "",
                  lastName: "",
                  displayName: fallback.email,
                  createdAt: new Date().toISOString(),
                }
              : null
          );
        }
      });
    return () => {
      cancelled = true;
    };
  }, [token]);

  return crmSession;
}
