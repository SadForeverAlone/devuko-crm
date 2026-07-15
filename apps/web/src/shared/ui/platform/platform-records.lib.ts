import type { CrmDockerContainer, CrmSite } from "@/entities/crm";
import { filterProjectContainers } from "@/features/crm-sites/ui/project-detail.lib";

export type SiteRecordGroup<T> = {
  site: CrmSite | null;
  rows: T[];
};

export function groupContainersBySite(
  sites: CrmSite[],
  containers: CrmDockerContainer[]
): SiteRecordGroup<CrmDockerContainer>[] {
  const assigned = new Set<string>();
  const groups: SiteRecordGroup<CrmDockerContainer>[] = [];

  for (const site of sites) {
    const rows = filterProjectContainers(site, containers).filter((container) => {
      if (assigned.has(container.id)) return false;
      assigned.add(container.id);
      return true;
    });
    if (rows.length > 0) groups.push({ site, rows });
  }

  const orphanRows = containers.filter((container) => !assigned.has(container.id));
  if (orphanRows.length > 0) groups.push({ site: null, rows: orphanRows });

  return groups;
}

export function groupItemsBySiteDomains<T>(
  sites: CrmSite[],
  items: T[],
  resolveDomain: (item: T) => string,
  resolveKey: (item: T) => string
): SiteRecordGroup<T>[] {
  const assigned = new Set<string>();
  const groups: SiteRecordGroup<T>[] = [];

  for (const site of sites) {
    const domains = new Set([site.domain, ...site.extraDomains]);
    const rows = items.filter((item) => {
      const key = resolveKey(item);
      if (assigned.has(key)) return false;
      if (!domains.has(resolveDomain(item))) return false;
      assigned.add(key);
      return true;
    });
    if (rows.length > 0) groups.push({ site, rows });
  }

  const orphanRows = items.filter((item) => !assigned.has(resolveKey(item)));
  if (orphanRows.length > 0) groups.push({ site: null, rows: orphanRows });

  return groups;
}

export function groupDeploymentsByTarget<T extends { target: string | null; id: string }>(
  sites: CrmSite[],
  items: T[]
): SiteRecordGroup<T>[] {
  const assigned = new Set<string>();
  const groups: SiteRecordGroup<T>[] = [];

  for (const site of sites) {
    const rows = items.filter((item) => {
      if (assigned.has(item.id)) return false;
      const target = item.target?.trim().toLowerCase() ?? "";
      if (!target) return false;
      const matches =
        target === site.domain.toLowerCase() ||
        target === site.slug.toLowerCase() ||
        target.includes(site.slug.toLowerCase()) ||
        site.extraDomains.some((domain) => target.includes(domain.toLowerCase()));
      if (!matches) return false;
      assigned.add(item.id);
      return true;
    });
    if (rows.length > 0) groups.push({ site, rows });
  }

  const platformRows = items.filter((item) => {
    if (assigned.has(item.id)) return false;
    assigned.add(item.id);
    return true;
  });
  if (platformRows.length > 0) groups.push({ site: null, rows: platformRows });

  return groups;
}

export function groupResourcesBySiteName<T>(
  sites: CrmSite[],
  items: T[],
  resolveName: (item: T) => string,
  resolveKey: (item: T) => string
): SiteRecordGroup<T>[] {
  const assigned = new Set<string>();
  const groups: SiteRecordGroup<T>[] = [];

  for (const site of sites) {
    const slug = site.slug.toLowerCase();
    const domainToken = site.domain.split(".")[0]?.toLowerCase() ?? "";
    const rows = items.filter((item) => {
      const key = resolveKey(item);
      if (assigned.has(key)) return false;
      const name = resolveName(item).toLowerCase();
      const matches =
        (slug.length > 2 && name.includes(slug)) ||
        (domainToken.length > 2 && name.includes(domainToken)) ||
        name.includes(site.domain.toLowerCase());
      if (!matches) return false;
      assigned.add(key);
      return true;
    });
    if (rows.length > 0) groups.push({ site, rows });
  }

  const orphanRows = items.filter((item) => !assigned.has(resolveKey(item)));
  if (orphanRows.length > 0) groups.push({ site: null, rows: orphanRows });

  return groups;
}

export function formatUptime(seconds: number, crmLang: "ru" | "en") {
  const days = Math.floor(seconds / 86_400);
  const hours = Math.floor((seconds % 86_400) / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);

  if (crmLang === "ru") {
    if (days > 0) return `${days}д ${hours}ч`;
    if (hours > 0) return `${hours}ч ${minutes}м`;
    return `${minutes}м`;
  }

  if (days > 0) return `${days}d ${hours}h`;
  if (hours > 0) return `${hours}h ${minutes}m`;
  return `${minutes}m`;
}

export function sitePortsMeta(site: CrmSite) {
  return `API ${site.apiPort ?? "—"} · Web ${site.webPort ?? "—"}`;
}
