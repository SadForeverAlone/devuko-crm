import type { CrmAdmin, CrmPlatformLog } from "@/entities/crm";

export function formatPlatformDate(
  value: string | null | undefined,
  locale: string,
  options: Intl.DateTimeFormatOptions
) {
  if (!value) return "—";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "—";
  return new Intl.DateTimeFormat(locale, options).format(date);
}

export function filterAdminLoginHistory(logs: CrmPlatformLog[], admin: CrmAdmin) {
  const login = admin.login.trim().toLowerCase();
  const email = admin.email.trim().toLowerCase();

  return logs
    .filter((log) => {
      if (log.action !== "auth.login" && log.action !== "auth.login_failed") return false;
      if (log.actorAdminId === admin.id) return true;
      const target = (log.target ?? "").trim().toLowerCase();
      return target === login || target === email;
    })
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
}

export function summarizeLoginHistory(entries: CrmPlatformLog[]) {
  const successful = entries.filter((entry) => entry.action === "auth.login" && entry.ok).length;
  const failed = entries.filter((entry) => entry.action === "auth.login_failed" || !entry.ok).length;
  const lastSuccess = entries.find((entry) => entry.action === "auth.login" && entry.ok) ?? null;
  const lastFailed = entries.find((entry) => entry.action === "auth.login_failed" || !entry.ok) ?? null;
  return { successful, failed, lastSuccess, lastFailed };
}

const ONLINE_WINDOW_MS = 15 * 60 * 1000;

export function isAdminOnline(
  adminId: string,
  currentAdminId: string | null,
  lastSuccess: CrmPlatformLog | null
) {
  if (currentAdminId && adminId === currentAdminId) return true;
  if (!lastSuccess) return false;
  const at = new Date(lastSuccess.createdAt).getTime();
  if (Number.isNaN(at)) return false;
  return Date.now() - at <= ONLINE_WINDOW_MS;
}
