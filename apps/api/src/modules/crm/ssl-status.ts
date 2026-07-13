import { execFile } from "child_process";
import { existsSync, readdirSync } from "fs";
import { promisify } from "util";

const execFileAsync = promisify(execFile);

export type SslCertificate = {
  domain: string;
  path: string;
  issuer: string;
  expiresAt: string;
  daysLeft: number;
  status: "healthy" | "warning" | "critical" | "missing";
};

const CERT_ROOTS = ["/etc/nginx/ssl", "/etc/letsencrypt/live"];

function certPaths(domain: string) {
  return [
    `/etc/nginx/ssl/${domain}/fullchain.pem`,
    `/etc/letsencrypt/live/${domain}/fullchain.pem`,
  ];
}

function statusFromDays(daysLeft: number): SslCertificate["status"] {
  if (daysLeft < 0) return "critical";
  if (daysLeft <= 14) return "critical";
  if (daysLeft <= 30) return "warning";
  return "healthy";
}

function discoverCertFiles() {
  const paths = new Set<string>();

  for (const root of CERT_ROOTS) {
    if (!existsSync(root)) continue;
    try {
      for (const entry of readdirSync(root)) {
        const fullchain = `${root}/${entry}/fullchain.pem`;
        if (existsSync(fullchain)) paths.add(fullchain);
      }
    } catch {
      // unreadable cert root
    }
  }

  for (const domain of ["selfpact.ru", "crm.devuko.ru", "selfpact.online"]) {
    for (const path of certPaths(domain)) {
      if (existsSync(path)) paths.add(path);
    }
  }

  return [...paths];
}

function parseCertNames(stdout: string) {
  const names = new Set<string>();
  const subject = stdout.split("\n").find((line) => line.startsWith("subject=")) ?? "";
  const cnMatch = subject.match(/CN\s*=\s*([^,/]+)/);
  if (cnMatch?.[1]) names.add(cnMatch[1].trim());

  const sanBlock = stdout.match(/X509v3 Subject Alternative Name:\s*\n(?:\s{4,}[^\n]+\n?)+/);
  if (sanBlock) {
    const dnsMatches = sanBlock[0].matchAll(/DNS:([^,\s]+)/g);
    for (const match of dnsMatches) {
      if (match[1]) names.add(match[1].trim());
    }
  }

  return [...names];
}

async function readCertificateMeta(path: string) {
  try {
    const { stdout } = await execFileAsync(
      "openssl",
      ["x509", "-enddate", "-noout", "-issuer", "-subject", "-ext", "subjectAltName", "-in", path],
      { timeout: 5000 }
    );
    const notAfter = stdout
      .split("\n")
      .find((line) => line.startsWith("notAfter="))
      ?.slice("notAfter=".length)
      .trim();
    if (!notAfter) return null;

    const expiresAt = new Date(notAfter);
    if (Number.isNaN(expiresAt.getTime())) return null;

    const daysLeft = Math.ceil((expiresAt.getTime() - Date.now()) / 86_400_000);
    const issuerLine = stdout.split("\n").find((line) => line.startsWith("issuer=")) ?? "";
    const issuer = issuerLine.replace(/^issuer=\s*/, "").trim() || "Unknown";

    return {
      path,
      issuer,
      expiresAt: expiresAt.toISOString(),
      daysLeft,
      status: statusFromDays(daysLeft),
      names: parseCertNames(stdout),
    };
  } catch {
    return null;
  }
}

async function buildDomainCertIndex() {
  const index = new Map<string, Awaited<ReturnType<typeof readCertificateMeta>>>();
  const files = discoverCertFiles();

  for (const path of files) {
    const meta = await readCertificateMeta(path);
    if (!meta) continue;
    for (const name of meta.names) {
      if (!index.has(name)) index.set(name, meta);
    }
    const folder = path.split("/").slice(-2)[0];
    if (folder && !index.has(folder)) index.set(folder, meta);
  }

  return index;
}

export async function readSslCertificates(domains: string[]): Promise<SslCertificate[]> {
  const unique = [...new Set(domains.map((domain) => domain.trim()).filter(Boolean))];
  const index = await buildDomainCertIndex();
  const results: SslCertificate[] = [];

  for (const domain of unique) {
    let meta = index.get(domain);

    if (!meta) {
      const directPath = certPaths(domain).find((path) => existsSync(path));
      if (directPath) meta = await readCertificateMeta(directPath);
    }

    results.push(
      meta
        ? {
            domain,
            path: meta.path,
            issuer: meta.issuer,
            expiresAt: meta.expiresAt,
            daysLeft: meta.daysLeft,
            status: meta.status,
          }
        : {
            domain,
            path: "",
            issuer: "—",
            expiresAt: "",
            daysLeft: -1,
            status: "missing",
          }
    );
  }

  return results;
}
