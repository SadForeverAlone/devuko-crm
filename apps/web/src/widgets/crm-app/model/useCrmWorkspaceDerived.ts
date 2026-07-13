import { useMemo } from "react";
import {
  PLATFORM_WORKSPACE_ID,
  type CrmOverview,
  type CrmSite,
  type CrmWorkspace,
} from "@/entities/crm";
import { crmCopy, crmNavItems, crmShortcutItems } from "./config";
import { platformNavItems } from "./platform-nav";
import {
  buildCountryMetrics,
  buildGenderMetrics,
  buildPromiseRecords,
  getCrmLocaleTag,
  getUserRoleCode,
  inferCountry,
  inferGender,
} from "./lib";
import type { CrmLang } from "./types";

type CrmUserRecord = Awaited<ReturnType<typeof import("@/entities/crm").getCrmUsers>>[number];
type CrmContactRecord = Awaited<ReturnType<typeof import("@/entities/crm").getCrmContacts>>[number];
type CrmPromiseRecord = Awaited<ReturnType<typeof import("@/entities/crm").getCrmPromises>>[number];

type UseCrmWorkspaceDerivedInput = {
  crmLang: CrmLang;
  isPlatformWorkspace: boolean;
  data: CrmOverview | null;
  users: CrmUserRecord[];
  contacts: CrmContactRecord[];
  promises: CrmPromiseRecord[];
  workspaces: CrmWorkspace[];
  sites: CrmSite[];
  contactSearch: string;
  selectedPromiseId: string;
};

export function useCrmWorkspaceDerived({
  crmLang,
  isPlatformWorkspace,
  data,
  users,
  contacts,
  promises,
  workspaces,
  sites,
  contactSearch,
  selectedPromiseId,
}: UseCrmWorkspaceDerivedInput) {
  const usersWithMeta = useMemo(
    () =>
      users.map((user, index) => ({
        ...user,
        index: index + 1,
        roleCode: getUserRoleCode(user),
        gender: inferGender(user),
        country: inferCountry(user),
      })),
    [users]
  );

  const visibleNavItems = useMemo(
    () => (isPlatformWorkspace ? platformNavItems : crmNavItems),
    [isPlatformWorkspace]
  );

  const visibleShortcutItems = useMemo(
    () => (isPlatformWorkspace ? [] : crmShortcutItems),
    [isPlatformWorkspace]
  );

  const visibleWorkspaces = useMemo(() => {
    const activeWorkspaceIds = new Set(
      sites.filter((site) => site.status === "active").map((site) => site.workspaceId)
    );
    return workspaces.filter(
      (item) =>
        item.id === PLATFORM_WORKSPACE_ID ||
        (item.kind === "site" && activeWorkspaceIds.has(item.id))
    );
  }, [workspaces, sites]);

  const genderMetrics = useMemo(() => buildGenderMetrics(usersWithMeta), [usersWithMeta]);
  const countryMetrics = useMemo(() => buildCountryMetrics(usersWithMeta), [usersWithMeta]);
  const promiseRecords = useMemo(
    () => buildPromiseRecords(promises, crmLang),
    [promises, crmLang]
  );
  const selectedPromise = useMemo(
    () =>
      promiseRecords.find((item) => item.id === selectedPromiseId) ??
      promiseRecords[0] ??
      null,
    [promiseRecords, selectedPromiseId]
  );

  const ui = crmCopy[crmLang];

  const sidebarAudit = useMemo(() => {
    const raw = data?.lastAuditActivityAt;
    const usedPercent = data?.storageUsage?.usedPercent;
    const usedPercentLabel =
      usedPercent != null && Number.isFinite(usedPercent) ? `${usedPercent}%` : "—";
    if (!raw) {
      return {
        line1: ui.sidebarNoAuditActivity,
        line2: "" as string,
        usedPercent: usedPercent ?? null,
        usedPercentLabel,
      };
    }
    const d = new Date(raw);
    const loc = getCrmLocaleTag(crmLang);
    const timeStr = new Intl.DateTimeFormat(loc, {
      hour: "numeric",
      minute: "2-digit",
    }).format(d);
    const dateStr = new Intl.DateTimeFormat(loc, {
      year: "numeric",
      month: "long",
      day: "numeric",
    }).format(d);
    return {
      line1: `${ui.sidebarLastEvent}: ${timeStr}`,
      line2: dateStr,
      usedPercent: usedPercent ?? null,
      usedPercentLabel,
    };
  }, [data?.lastAuditActivityAt, data?.storageUsage?.usedPercent, crmLang, ui]);

  const visibleContacts = useMemo(
    () =>
      contacts.filter((contact) =>
        `${contact.name} ${contact.email} ${contact.message}`
          .toLowerCase()
          .includes(contactSearch.trim().toLowerCase())
      ),
    [contacts, contactSearch]
  );

  return {
    usersWithMeta,
    visibleNavItems,
    visibleShortcutItems,
    visibleWorkspaces,
    genderMetrics,
    countryMetrics,
    promiseRecords,
    selectedPromise,
    ui,
    sidebarAudit,
    visibleContacts,
  };
}
