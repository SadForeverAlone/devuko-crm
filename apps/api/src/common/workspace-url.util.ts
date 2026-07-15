import { BadRequestException } from "@nestjs/common";

const DEV_LOCALHOST_PORTS = new Set(
  (process.env.WORKSPACE_DEV_PORTS ?? "8080,8081,8088,8095,3000")
    .split(",")
    .map((value) => Number(value.trim()))
    .filter((port) => Number.isInteger(port) && port > 0 && port <= 65535)
);

function parseIpv4(hostname: string): number[] | null {
  const parts = hostname.split(".");
  if (parts.length !== 4) return null;
  const octets = parts.map((part) => Number(part));
  if (octets.some((octet) => !Number.isInteger(octet) || octet < 0 || octet > 255)) {
    return null;
  }
  return octets;
}

function isPrivateIpv4(octets: number[]): boolean {
  const [a, b] = octets;
  if (a === 127) return true;
  if (a === 10) return true;
  if (a === 172 && b >= 16 && b <= 31) return true;
  if (a === 192 && b === 168) return true;
  if (a === 169 && b === 254) return true;
  if (a === 0) return true;
  return false;
}

function isPrivateIpLiteral(hostname: string): boolean {
  const normalized = hostname.toLowerCase().replace(/^\[|\]$/g, "");
  if (normalized === "::1") return true;
  if (normalized.startsWith("fe80:")) return true;
  if (normalized.startsWith("fc") || normalized.startsWith("fd")) return true;

  const mapped = normalized.match(/^::ffff:(\d+\.\d+\.\d+\.\d+)$/i);
  if (mapped) {
    const ipv4 = parseIpv4(mapped[1]);
    if (ipv4) return isPrivateIpv4(ipv4);
  }

  const ipv4 = parseIpv4(normalized);
  if (ipv4) return isPrivateIpv4(ipv4);
  return false;
}

export function isPrivateNetworkHost(hostname: string): boolean {
  return isPrivateIpLiteral(hostname);
}

function hostnameMatchesSite(hostname: string, domain: string, extraDomains: string[]): boolean {
  const allowed = [domain, ...extraDomains].map((value) => value.trim().toLowerCase()).filter(Boolean);
  const host = hostname.toLowerCase();
  return allowed.some((value) => host === value || host.endsWith(`.${value}`));
}

function isLocalhost(hostname: string): boolean {
  const host = hostname.toLowerCase().replace(/^\[|\]$/g, "");
  return host === "localhost" || host === "127.0.0.1" || host === "::1";
}

export function assertWorkspaceApiUrl(
  apiBaseUrl: string,
  site: { domain: string; extraDomains?: string[] },
  options?: { isProduction?: boolean }
): string {
  const normalized = apiBaseUrl.trim().replace(/\/$/, "");
  let parsed: URL;
  try {
    parsed = new URL(normalized);
  } catch {
    throw new BadRequestException("Invalid API base URL");
  }

  if (parsed.protocol !== "http:" && parsed.protocol !== "https:") {
    throw new BadRequestException("API base URL must use http or https");
  }
  if (parsed.username || parsed.password) {
    throw new BadRequestException("API base URL must not include credentials");
  }

  const hostname = parsed.hostname;
  const blockedHosts = new Set(["169.254.169.254", "metadata.google.internal"]);
  if (blockedHosts.has(hostname.toLowerCase())) {
    throw new BadRequestException("API base URL targets a forbidden host");
  }

  const isProduction = options?.isProduction ?? process.env.NODE_ENV === "production";
  const extraDomains = site.extraDomains ?? [];

  if (hostnameMatchesSite(hostname, site.domain, extraDomains)) {
    if (isPrivateIpLiteral(hostname)) {
      throw new BadRequestException("API base URL must not target private networks");
    }
    return normalized;
  }

  if (!isProduction && isLocalhost(hostname)) {
    const port = parsed.port ? Number(parsed.port) : parsed.protocol === "https:" ? 443 : 80;
    if (DEV_LOCALHOST_PORTS.has(port)) {
      return normalized;
    }
    throw new BadRequestException("Localhost API URL uses a disallowed port");
  }

  if (isPrivateIpLiteral(hostname)) {
    throw new BadRequestException("API base URL must not target private networks");
  }

  throw new BadRequestException("API base URL host is not allowed for this site");
}
