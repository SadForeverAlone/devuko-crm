import { execFile } from "child_process";
import { promisify } from "util";

const execFileAsync = promisify(execFile);

export type DomainRegistration = {
  domain: string;
  expiresAt: string;
  daysLeft: number;
  status: "healthy" | "warning" | "critical" | "unknown";
};

function statusFromDays(daysLeft: number): DomainRegistration["status"] {
  if (daysLeft < 0) return "unknown";
  if (daysLeft <= 14) return "critical";
  if (daysLeft <= 45) return "warning";
  return "healthy";
}

function parseExpiry(raw: string) {
  const patterns = [
    /paid-till:\s*(\S+)/i,
    /Registry Expiry Date:\s*(.+)/i,
    /Registrar Registration Expiration Date:\s*(.+)/i,
    /Expiration Date:\s*(.+)/i,
    /Expiry Date:\s*(.+)/i,
    /renewal date:\s*(\S+)/i,
    /free-date:\s*(\S+)/i,
  ];

  for (const pattern of patterns) {
    const match = raw.match(pattern);
    const value = match?.[1]?.trim();
    if (!value) continue;

    const normalized = value.replace(/\./g, "-").replace(/T.+$/, "");
    const date = new Date(value.includes("T") ? value : normalized);
    if (!Number.isNaN(date.getTime())) return date;
  }

  return null;
}

function apexDomain(domain: string) {
  const parts = domain.split(".").filter(Boolean);
  if (parts.length <= 2) return domain;
  return parts.slice(-2).join(".");
}

async function readDomainRegistration(domain: string): Promise<DomainRegistration> {
  const unknown: DomainRegistration = {
    domain,
    expiresAt: "",
    daysLeft: -1,
    status: "unknown",
  };

  const candidates = domain.includes(".") ? [domain, apexDomain(domain)] : [domain];
  const seen = new Set<string>();

  for (const candidate of candidates) {
    if (seen.has(candidate)) continue;
    seen.add(candidate);

    try {
      const { stdout } = await execFileAsync("whois", [candidate], { timeout: 15000, maxBuffer: 1024 * 1024 });
      const expiresAt = parseExpiry(stdout);
      if (!expiresAt) continue;

      const daysLeft = Math.ceil((expiresAt.getTime() - Date.now()) / 86_400_000);
      return {
        domain,
        expiresAt: expiresAt.toISOString(),
        daysLeft,
        status: statusFromDays(daysLeft),
      };
    } catch {
      continue;
    }
  }

  return unknown;
}

export async function readDomainRegistrations(domains: string[]): Promise<DomainRegistration[]> {
  const unique = [...new Set(domains.map((domain) => domain.trim()).filter(Boolean))];
  return Promise.all(unique.map(readDomainRegistration));
}
