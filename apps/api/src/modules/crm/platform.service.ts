import {
  BadRequestException,
  ConflictException,
  Injectable,
  Logger,
  NotFoundException,
  OnModuleInit,
} from "@nestjs/common";
import { execFile } from "child_process";
import { createHash, randomBytes } from "crypto";
import { existsSync } from "fs";
import { join } from "path";
import { promisify } from "util";
import { DatabaseService } from "../database/database.service";

const execFileAsync = promisify(execFile);

export const PLATFORM_WORKSPACE_ID = "platform";

export type CrmWorkspaceRow = {
  id: string;
  slug: string;
  label: string;
  kind: "platform" | "site";
  siteId: string | null;
  siteDomain: string | null;
  createdAt: Date;
};

export type CrmSiteRow = {
  id: string;
  domain: string;
  slug: string;
  repo: string | null;
  status: string;
  prodPath: string | null;
  apiBaseUrl: string;
  apiPort: number | null;
  webPort: number | null;
  extraDomains: string[];
  devConfig: Record<string, unknown> | null;
  provisionLog: Array<{ step: string; ok: boolean; message: string; at: string }>;
  workspaceId: string;
  createdAt: Date;
  updatedAt: Date;
};

type CreateSiteInput = {
  domain: string;
  repo?: string;
  apiPort?: number;
  webPort?: number;
  apiBaseUrl?: string;
  extraDomains?: string[];
  provision?: boolean;
};

@Injectable()
export class PlatformService implements OnModuleInit {
  private readonly logger = new Logger(PlatformService.name);
  private ready = false;

  constructor(private readonly db: DatabaseService) {}

  async onModuleInit() {
    try {
      await this.ensurePlatformTables();
      await this.seedSelfpactFromEnv();
    } catch (error) {
      this.logger.warn(`Platform init skipped: ${(error as Error).message}`);
    }
  }

  private id(prefix: string) {
    return `${prefix}_${createHash("sha256").update(randomBytes(16)).digest("hex").slice(0, 16)}`;
  }

  private slugFromDomain(domain: string) {
    return domain.trim().toLowerCase().replace(/[^a-z0-9.-]/g, "");
  }

  private repoRoot() {
    return process.env.PLATFORM_REPO_ROOT?.trim() || join(__dirname, "../../../../..");
  }

  private registryPath() {
    const custom = process.env.PLATFORM_REGISTRY?.trim();
    if (custom) return custom;
    return join(this.repoRoot(), "platform/registry/sites.yaml");
  }

  private defaultApiBaseUrl(domain: string) {
    const override = process.env.DEFAULT_WORKSPACE_API_BASE?.trim();
    if (override) return override.replace(/\/$/, "");
    return `https://${domain}`;
  }

  async ensurePlatformTables() {
    if (this.ready) return;
    await this.db.execute(`CREATE EXTENSION IF NOT EXISTS pgcrypto`);
    await this.db.execute(`
      CREATE TABLE IF NOT EXISTS "CrmWorkspace" (
        "id" TEXT PRIMARY KEY,
        "slug" TEXT UNIQUE NOT NULL,
        "label" TEXT NOT NULL,
        "kind" TEXT NOT NULL,
        "siteId" TEXT NULL UNIQUE,
        "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP
      )
    `);
    await this.db.execute(`
      CREATE TABLE IF NOT EXISTS "CrmSite" (
        "id" TEXT PRIMARY KEY,
        "domain" TEXT UNIQUE NOT NULL,
        "slug" TEXT UNIQUE NOT NULL,
        "repo" TEXT NULL,
        "status" TEXT NOT NULL DEFAULT 'pending',
        "prodPath" TEXT NULL,
        "apiBaseUrl" TEXT NOT NULL,
        "apiPort" INTEGER NULL,
        "webPort" INTEGER NULL,
        "extraDomains" JSONB NULL,
        "devConfig" JSONB NULL,
        "provisionLog" JSONB NULL,
        "workspaceId" TEXT UNIQUE NOT NULL,
        "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
        "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP
      )
    `);
    await this.db.execute(`ALTER TABLE "CrmSite" ADD COLUMN IF NOT EXISTS "apiBaseUrl" TEXT`);
    await this.db.execute(`
      INSERT INTO "CrmWorkspace" ("id", "slug", "label", "kind", "siteId")
      VALUES ($1, 'platform', 'Platform', 'platform', NULL)
      ON CONFLICT ("id") DO NOTHING
    `, [PLATFORM_WORKSPACE_ID]);
    await this.syncFromRegistry();
    this.ready = true;
  }

  private mapSiteRow(row: Record<string, unknown>): CrmSiteRow {
    return {
      id: String(row.id),
      domain: String(row.domain),
      slug: String(row.slug),
      repo: row.repo ? String(row.repo) : null,
      status: String(row.status),
      prodPath: row.prodPath ? String(row.prodPath) : null,
      apiBaseUrl: String(row.apiBaseUrl || this.defaultApiBaseUrl(String(row.domain))),
      apiPort: row.apiPort != null ? Number(row.apiPort) : null,
      webPort: row.webPort != null ? Number(row.webPort) : null,
      extraDomains: Array.isArray(row.extraDomains) ? (row.extraDomains as string[]) : [],
      devConfig: (row.devConfig as Record<string, unknown> | null) ?? null,
      provisionLog: Array.isArray(row.provisionLog)
        ? (row.provisionLog as CrmSiteRow["provisionLog"])
        : [],
      workspaceId: String(row.workspaceId),
      createdAt: row.createdAt as Date,
      updatedAt: row.updatedAt as Date,
    };
  }

  async listWorkspaces(): Promise<CrmWorkspaceRow[]> {
    await this.ensurePlatformTables();
    const { rows } = await this.db.query(`
      SELECT w."id", w."slug", w."label", w."kind", w."siteId", s."domain" AS "siteDomain", w."createdAt"
      FROM "CrmWorkspace" w
      LEFT JOIN "CrmSite" s ON s."id" = w."siteId"
      ORDER BY CASE WHEN w."kind" = 'platform' THEN 0 ELSE 1 END, w."label" ASC
    `);
    return rows.map((row) => ({
      id: String(row.id),
      slug: String(row.slug),
      label: String(row.label),
      kind: row.kind === "site" ? "site" : "platform",
      siteId: row.siteId ? String(row.siteId) : null,
      siteDomain: row.siteDomain ? String(row.siteDomain) : null,
      createdAt: row.createdAt as Date,
    }));
  }

  async getWorkspace(workspaceId: string) {
    await this.ensurePlatformTables();
    const { rows } = await this.db.query(
      `SELECT * FROM "CrmWorkspace" WHERE "id" = $1 LIMIT 1`,
      [workspaceId]
    );
    return rows[0] ?? null;
  }

  async getSiteByWorkspaceId(workspaceId: string): Promise<CrmSiteRow | null> {
    await this.ensurePlatformTables();
    const { rows } = await this.db.query(
      `SELECT * FROM "CrmSite" WHERE "workspaceId" = $1 LIMIT 1`,
      [workspaceId]
    );
    return rows[0] ? this.mapSiteRow(rows[0]) : null;
  }

  async listSites(): Promise<CrmSiteRow[]> {
    await this.ensurePlatformTables();
    const { rows } = await this.db.query(`SELECT * FROM "CrmSite" ORDER BY "createdAt" ASC`);
    return rows.map((row) => this.mapSiteRow(row));
  }

  async getSite(siteId: string): Promise<CrmSiteRow> {
    await this.ensurePlatformTables();
    const { rows } = await this.db.query(`SELECT * FROM "CrmSite" WHERE "id" = $1 LIMIT 1`, [siteId]);
    if (!rows[0]) throw new NotFoundException("Site not found");
    return this.mapSiteRow(rows[0]);
  }

  async createSite(input: CreateSiteInput): Promise<CrmSiteRow> {
    await this.ensurePlatformTables();
    const domain = input.domain.trim().toLowerCase();
    if (!/^[a-z0-9]([a-z0-9-]*[a-z0-9])?(\.[a-z0-9]([a-z0-9-]*[a-z0-9])?)+$/.test(domain)) {
      throw new BadRequestException("Invalid domain");
    }
    const slug = this.slugFromDomain(domain);
    const { rows: existing } = await this.db.query(
      `SELECT "id" FROM "CrmSite" WHERE "domain" = $1 OR "slug" = $2 LIMIT 1`,
      [domain, slug]
    );
    if (existing[0]) throw new ConflictException("Site already exists");

    const siteId = this.id("site");
    const workspaceId = this.id("ws");
    const apiBaseUrl = (input.apiBaseUrl?.trim() || this.defaultApiBaseUrl(domain)).replace(/\/$/, "");

    await this.db.execute(
      `INSERT INTO "CrmWorkspace" ("id", "slug", "label", "kind", "siteId") VALUES ($1, $2, $3, 'site', $4)`,
      [workspaceId, slug, domain, siteId]
    );
    await this.db.execute(
      `
      INSERT INTO "CrmSite"
        ("id", "domain", "slug", "repo", "status", "prodPath", "apiBaseUrl", "apiPort", "webPort", "extraDomains", "devConfig", "provisionLog", "workspaceId")
      VALUES ($1, $2, $3, $4, 'pending', $5, $6, $7, $8, $9::jsonb, $10::jsonb, '[]'::jsonb, $11)
      `,
      [
        siteId,
        domain,
        slug,
        input.repo?.trim() || null,
        `/srv/sites/${domain}`,
        apiBaseUrl,
        input.apiPort ?? 8080,
        input.webPort ?? 8088,
        JSON.stringify((input.extraDomains ?? []).map((d) => d.trim().toLowerCase()).filter(Boolean)),
        JSON.stringify({ domain_pattern: `{user}.${domain}` }),
        workspaceId,
      ]
    );

    let site = await this.getSite(siteId);
    if (input.provision !== false) {
      site = await this.provisionSite(siteId);
    }
    return site;
  }

  async updateSite(
    siteId: string,
    input: { repo?: string; apiPort?: number; webPort?: number; apiBaseUrl?: string; extraDomains?: string[] }
  ): Promise<CrmSiteRow> {
    await this.ensurePlatformTables();
    await this.getSite(siteId);
    const sets = [`"updatedAt" = CURRENT_TIMESTAMP`];
    const params: unknown[] = [];
    let idx = 1;
    if (input.repo !== undefined) {
      sets.push(`"repo" = $${idx++}`);
      params.push(input.repo?.trim() || null);
    }
    if (input.apiPort !== undefined) {
      sets.push(`"apiPort" = $${idx++}`);
      params.push(input.apiPort);
    }
    if (input.webPort !== undefined) {
      sets.push(`"webPort" = $${idx++}`);
      params.push(input.webPort);
    }
    if (input.apiBaseUrl !== undefined) {
      sets.push(`"apiBaseUrl" = $${idx++}`);
      params.push(input.apiBaseUrl.replace(/\/$/, ""));
    }
    if (input.extraDomains !== undefined) {
      sets.push(`"extraDomains" = $${idx++}::jsonb`);
      params.push(JSON.stringify(input.extraDomains.map((d) => d.trim().toLowerCase()).filter(Boolean)));
    }
    params.push(siteId);
    await this.db.execute(`UPDATE "CrmSite" SET ${sets.join(", ")} WHERE "id" = $${idx}`, params);
    return this.getSite(siteId);
  }

  async provisionSite(siteId: string): Promise<CrmSiteRow> {
    const site = await this.getSite(siteId);
    const log: CrmSiteRow["provisionLog"] = [...site.provisionLog];
    const pushLog = (step: string, ok: boolean, message: string) => {
      log.push({ step, ok, message, at: new Date().toISOString() });
    };

    await this.db.execute(`UPDATE "CrmSite" SET "status" = 'provisioning', "updatedAt" = CURRENT_TIMESTAMP WHERE "id" = $1`, [siteId]);

    const script = join(this.repoRoot(), "platform/bin/site-register.sh");
    if (existsSync(script)) {
      try {
        const { stdout, stderr } = await execFileAsync("bash", [script, site.domain], {
          env: {
            ...process.env,
            SITE_REPO: site.repo ?? "",
            SITE_API_PORT: String(site.apiPort ?? 8080),
            SITE_WEB_PORT: String(site.webPort ?? 8088),
            SITE_EXTRA_DOMAINS: site.extraDomains.join(","),
            PLATFORM_REGISTRY: this.registryPath(),
          },
          timeout: 120_000,
        });
        pushLog("site-register", true, (stdout || stderr || "ok").trim().slice(0, 2000));
      } catch (error) {
        const message = error instanceof Error ? error.message : String(error);
        pushLog("site-register", false, message.slice(0, 2000));
        await this.db.execute(
          `UPDATE "CrmSite" SET "status" = 'error', "provisionLog" = $2::jsonb, "updatedAt" = CURRENT_TIMESTAMP WHERE "id" = $1`,
          [siteId, JSON.stringify(log)]
        );
        return this.getSite(siteId);
      }
    } else {
      pushLog("site-register", true, "Script not found — dev mode");
    }

    await this.db.execute(
      `UPDATE "CrmSite" SET "status" = 'active', "provisionLog" = $2::jsonb, "updatedAt" = CURRENT_TIMESTAMP WHERE "id" = $1`,
      [siteId, JSON.stringify(log)]
    );
    return this.getSite(siteId);
  }

  private async seedSelfpactFromEnv() {
    const domain = process.env.SELFPACT_WORKSPACE_DOMAIN?.trim() || "selfpact.ru";
    const apiBase = process.env.SELFPACT_WORKSPACE_API_BASE?.trim() || this.defaultApiBaseUrl(domain);
    const { rows } = await this.db.query(`SELECT "id" FROM "CrmSite" WHERE "domain" = $1 LIMIT 1`, [domain]);
    if (rows[0]) return;
    await this.createSite({
      domain,
      repo: process.env.SELFPACT_REPO_URL?.trim(),
      apiBaseUrl: apiBase,
      provision: false,
    });
    this.logger.log(`Seeded workspace for ${domain}`);
  }

  async syncFromRegistry() {
    const registry = this.registryPath();
    if (!existsSync(registry)) return;
    let parsed: { sites?: Record<string, Record<string, unknown>> };
    try {
      parsed = await this.parseYamlSites(registry);
    } catch (error) {
      this.logger.warn(`Registry sync skipped: ${(error as Error).message}`);
      return;
    }
    for (const [domain, cfg] of Object.entries(parsed.sites ?? {})) {
      const slug = this.slugFromDomain(domain);
      const { rows: existing } = await this.db.query(`SELECT "id" FROM "CrmSite" WHERE "domain" = $1 LIMIT 1`, [domain]);
      if (existing[0]) continue;
      const prod = (cfg.prod as Record<string, unknown> | undefined) ?? {};
      const siteId = this.id("site");
      const workspaceId = this.id("ws");
      const domains = Array.isArray(prod.domains) ? (prod.domains as string[]) : [domain];
      await this.db.execute(
        `INSERT INTO "CrmWorkspace" ("id", "slug", "label", "kind", "siteId") VALUES ($1, $2, $3, 'site', $4)`,
        [workspaceId, slug, domain, siteId]
      );
      await this.db.execute(
        `
        INSERT INTO "CrmSite"
          ("id", "domain", "slug", "repo", "status", "prodPath", "apiBaseUrl", "apiPort", "webPort", "extraDomains", "devConfig", "provisionLog", "workspaceId")
        VALUES ($1, $2, $3, $4, 'active', $5, $6, $7, $8, $9::jsonb, $10::jsonb, '[]'::jsonb, $11)
        `,
        [
          siteId,
          domain,
          slug,
          (cfg.repo as string | undefined) ?? null,
          (prod.path as string | undefined) ?? `/srv/sites/${domain}`,
          this.defaultApiBaseUrl(domain),
          Number(prod.api_port ?? 8080),
          Number(prod.web_port ?? 8088),
          JSON.stringify(domains.filter((d) => d !== domain)),
          JSON.stringify(cfg.dev ?? {}),
          workspaceId,
        ]
      );
    }
  }

  private async parseYamlSites(registryPath: string) {
    const { stdout } = await execFileAsync(
      "python3",
      ["-c", "import sys,yaml,json; print(json.dumps(yaml.safe_load(open(sys.argv[1]))))", registryPath],
      { timeout: 10_000 }
    );
    return JSON.parse(stdout) as { sites?: Record<string, Record<string, unknown>> };
  }
}
