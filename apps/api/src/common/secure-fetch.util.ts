import { BadRequestException } from "@nestjs/common";
import { lookup } from "dns/promises";
import { isIP } from "net";
import { assertWorkspaceApiUrl } from "./workspace-url.util";

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

function isPrivateIpLiteral(address: string): boolean {
  const normalized = address.toLowerCase().replace(/^\[|\]$/g, "");
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

async function assertResolvedAddressesAllowed(hostname: string): Promise<void> {
  if (isIP(hostname)) {
    if (isPrivateIpLiteral(hostname)) {
      throw new BadRequestException("API base URL must not target private networks");
    }
    return;
  }

  let records: Array<{ address: string; family: number }>;
  try {
    const resolved = await lookup(hostname, { all: true, verbatim: true });
    records = Array.isArray(resolved) ? resolved : [resolved];
  } catch {
    throw new BadRequestException("Could not resolve API host");
  }

  const list = records;
  if (list.length === 0) {
    throw new BadRequestException("Could not resolve API host");
  }

  for (const record of list) {
    if (isPrivateIpLiteral(record.address)) {
      throw new BadRequestException("API host resolves to a forbidden network");
    }
  }
}

export async function secureWorkspaceFetch(
  apiBaseUrl: string,
  pathWithQuery: string,
  site: { domain: string; extraDomains?: string[] },
  init: RequestInit
): Promise<Response> {
  const base = assertWorkspaceApiUrl(apiBaseUrl, site);
  const url = `${base}${pathWithQuery}`;
  const parsed = new URL(url);
  await assertResolvedAddressesAllowed(parsed.hostname);

  const response = await fetch(url, { ...init, redirect: "manual" });
  if (response.status >= 300 && response.status < 400) {
    throw new BadRequestException("Workspace API redirects are not allowed");
  }
  return response;
}
