import { useMemo } from "react";
import type { CrmOverview } from "@/entities/crm";
import { crmCopy } from "./config";
import type { UserRoleCode } from "./i18n";
import {
  buildRoleOverview,
  getStatusLabel,
  getUserRoleCode,
  humanizeAction,
  humanizePath,
} from "./lib";
import type { CrmLang } from "./types";

type CrmUserRecord = Awaited<ReturnType<typeof import("@/entities/crm").getCrmUsers>>[number];

type UsersWithMeta = Array<
  CrmUserRecord & {
    index: number;
    roleCode: UserRoleCode;
    gender: string;
    country: string;
  }
>;

type UseCrmLogsViewInput = {
  crmLang: CrmLang;
  data: CrmOverview | null;
  usersWithMeta: UsersWithMeta;
};

export function useCrmLogsView({ crmLang, data, usersWithMeta }: UseCrmLogsViewInput) {
  const userMap = useMemo(
    () => new Map(usersWithMeta.map((user) => [user.id, user])),
    [usersWithMeta]
  );

  const siteLogs = useMemo(() => {
    const logs = data?.recentLogs ?? [];
    const logUi = crmCopy[crmLang];
    return logs.map((log) => {
      const actor = log.actorUserId ? userMap.get(log.actorUserId) : null;
      const role: UserRoleCode = actor ? getUserRoleCode(actor) : "system";
      return {
        id: log.id,
        createdAt: log.createdAt,
        role,
        actorName: actor?.displayName ?? logUi.logSystemEvent,
        readableAction: humanizeAction(log.action),
        readablePath: humanizePath(log.path, log.method, crmLang),
        result: getStatusLabel(log.statusCode, crmLang),
        statusCode: log.statusCode,
      };
    });
  }, [data?.recentLogs, userMap, crmLang]);

  const roleOverview = useMemo(
    () => buildRoleOverview(usersWithMeta, siteLogs, crmLang),
    [usersWithMeta, siteLogs, crmLang]
  );

  return {
    siteLogs,
    roleOverview,
  };
}
