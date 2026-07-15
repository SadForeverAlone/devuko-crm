import type { Dispatch, SetStateAction } from "react";
import type { getCrmPromises } from "@/entities/crm";
import { crmCopy } from "./i18n";
import type { UserRoleCode } from "./i18n";
import type { CrmLang, CrmUser, PromiseRecord } from "./types";

export const CRM_LOCALE_TAGS: Record<CrmLang, string> = {
  ru: "ru-RU",
  en: "en-US",
};

export function getCrmLocaleTag(lang: CrmLang): string {
  return CRM_LOCALE_TAGS[lang];
}

export function formatStoragePathLabel(path: string | null | undefined, lang: CrmLang) {
  if (!path || path === "/") {
    return crmCopy[lang].platformStorageRoot;
  }
  return path;
}

export function getUserInitials(name: string) {
  return name
    .split(" ")
    .slice(0, 2)
    .map((part) => part[0] ?? "")
    .join("")
    .toUpperCase();
}

export function getUserRoleCode(user: CrmUser): UserRoleCode {
  if (user.permissions === 1) {
    return "admin";
  }
  const source = `${user.adminNote ?? ""} ${user.displayName} ${user.email}`.toLowerCase();
  if (source.includes("support")) {
    return "support";
  }
  if (source.includes("sales") || source.includes("manager") || source.includes("lead")) {
    return "manager";
  }
  return "user";
}

export function inferGender(user: CrmUser) {
  const stored = user.adminNote?.match(/gender[:=]\s*(\S+)/i)?.[1];
  if (stored) return stored;
  return "Не указано";
}

export function inferCountry(user: CrmUser) {
  const stored = user.country?.trim();
  if (stored) {
    return stored;
  }
  return "—";
}

export function buildGenderMetrics(users: Array<CrmUser & { gender: string }>) {
  const counts = new Map<string, number>();
  for (const user of users) {
    counts.set(user.gender, (counts.get(user.gender) ?? 0) + 1);
  }
  const total = Math.max(1, users.length);
  return [...counts.entries()]
    .map(([label, count]) => ({ label, count, percent: Math.round((count / total) * 100) }))
    .sort((a, b) => b.count - a.count);
}

export function buildCountryMetrics(users: Array<CrmUser & { country: string }>) {
  const counts = new Map<string, number>();
  for (const user of users) {
    counts.set(user.country, (counts.get(user.country) ?? 0) + 1);
  }
  return [...counts.entries()]
    .map(([label, count]) => ({ label, count }))
    .sort((a, b) => b.count - a.count)
    .slice(0, 6);
}

export function buildRoleOverview(
  users: Array<CrmUser & { roleCode: UserRoleCode }>,
  logs: Array<{ role?: UserRoleCode }>,
  lang: CrmLang,
) {
  const roleUsers = new Map<UserRoleCode, number>();
  for (const user of users) {
    roleUsers.set(user.roleCode, (roleUsers.get(user.roleCode) ?? 0) + 1);
  }
  const roleLogs = new Map<UserRoleCode, number>();
  for (const log of logs) {
    const role: UserRoleCode = log.role ?? "system";
    roleLogs.set(role, (roleLogs.get(role) ?? 0) + 1);
  }
  const order: UserRoleCode[] = ["admin", "manager", "support", "user", "system"];
  const ui = crmCopy[lang];
  return order.map((code) => ({
    code,
    label: ui.userRoles[code],
    value: `${roleUsers.get(code) ?? 0} · ${roleLogs.get(code) ?? 0}`,
  }));
}

export function buildPromiseRecords(
  items: Awaited<ReturnType<typeof getCrmPromises>>,
  lang: CrmLang,
): PromiseRecord[] {
  const ui = crmCopy[lang];
  return items.map((item) => ({
    id: item.id,
    userId: item.userId,
    title: item.title,
    owner: item.user.displayName,
    status: item.status,
    proofStatus: item.proofCount > 0 ? ui.proofStateAdded : ui.proofStatePending,
    proofAdded: item.proofCount > 0,
    proofCount: item.proofCount,
    deadline: new Date(item.deadlineAt).toLocaleDateString(getCrmLocaleTag(lang)),
    deadlineAt: item.deadlineAt,
    pledgeAmount: item.pledgeAmount,
    category: item.category,
    description: item.description,
    userEmail: item.user.email,
    createdAt: item.createdAt,
    updatedAt: item.updatedAt,
  }));
}

export function clampNumber(value: number, min: number, max: number, fallback: number) {
  if (!Number.isFinite(value)) {
    return fallback;
  }
  return Math.min(max, Math.max(min, value));
}

export function humanizeAction(action: string) {
  return action
    .replace(/_/g, " ")
    .replace(/\b\w/g, (letter) => letter.toUpperCase());
}

export function humanizePath(path: string | null, method: string | null, lang: CrmLang) {
  if (!path) {
    return crmCopy[lang].logSystemPath;
  }
  return `${method ?? "SYS"} ${path}`;
}

export function getStatusLabel(statusCode: number | null, lang: CrmLang) {
  const ui = crmCopy[lang];
  if (!statusCode) {
    return ui.logStatusNoCode;
  }
  if (statusCode >= 500) {
    return `${ui.logStatusError} ${statusCode}`;
  }
  if (statusCode >= 400) {
    return `${ui.logStatusClientError} ${statusCode}`;
  }
  return `${ui.logStatusOk} ${statusCode}`;
}

export function getStatusClassName(value: string) {
  const normalized = value.toLowerCase();
  if (/(error|high|отклон|missed|не |failed|открыт)/.test(normalized)) {
    return "crm-status crm-status--error";
  }
  if (/(pending|нов|process|ожида|medium|перерыв|moderation|соглас)/.test(normalized)) {
    return "crm-status crm-status--pending";
  }
  return "crm-status crm-status--ok";
}

export function translateGender(value: string, lang: CrmLang) {
  const ui = crmCopy[lang];
  if (value === "Мужчины") return ui.genderMale;
  if (value === "Женщины") return ui.genderFemale;
  return ui.genderNotSpecified;
}

export function renderLogFilterHeader(
  label: string,
  key: "" | "time" | "role" | "actor" | "action" | "path" | "result",
  activeMenu: "" | "time" | "role" | "actor" | "action" | "path" | "result",
  setActiveMenu: Dispatch<SetStateAction<"" | "time" | "role" | "actor" | "action" | "path" | "result">>,
  value: string,
  onChange: (value: string) => void,
  resetLabel: string,
) {
  const opened = activeMenu === key;
  const inputType = key === "time" ? "datetime-local" : "text";
  return (
    <div className="crm-th-filter">
      <button type="button" className={opened || value ? "crm-th-filter__btn crm-th-filter__btn--active" : "crm-th-filter__btn"} onClick={() => setActiveMenu(opened ? "" : key)}>
        {label}
      </button>
      {opened ? (
        <div className="crm-th-filter__menu">
          <input className="spx-input crm-input crm-input--table" type={inputType} value={value} onChange={(event) => onChange(event.target.value)} />
          <button type="button" className="crm-chip" onClick={() => { onChange(""); setActiveMenu(""); }}>
            {resetLabel}
          </button>
        </div>
      ) : null}
    </div>
  );
}

export { translateCrmStatus } from "./statusLexicon";
