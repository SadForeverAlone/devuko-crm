import { useEffect, useState } from "react";
import { getCrmSession, type CrmSession } from "@/entities/crm";

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
        if (!cancelled) setCrmSession(null);
      });
    return () => {
      cancelled = true;
    };
  }, [token]);

  return crmSession;
}
