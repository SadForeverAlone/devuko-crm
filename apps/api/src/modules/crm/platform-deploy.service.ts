import { BadRequestException, Injectable, Logger } from "@nestjs/common";
import { access } from "fs/promises";
import { execFile } from "child_process";
import { join } from "path";
import { promisify } from "util";
import { withAdvisoryLock } from "../../common/advisory-lock.util";
import { pickChildEnv } from "../../common/child-env.util";
import { assertAllowedDeployScript } from "../../common/deploy-path.util";
import { assertDeployEnabled } from "../../common/deploy-enabled.util";
import { DatabaseService } from "../database/database.service";
import { PlatformAuditService } from "./platform-audit.service";
import { PlatformService } from "./platform.service";

const execFileAsync = promisify(execFile);
const DEPLOY_LOCK = "devuko-crm-deploy";

type AuditActor = { id?: string; email?: string; name?: string };

@Injectable()
export class PlatformDeployService {
  private readonly logger = new Logger(PlatformDeployService.name);

  constructor(
    private readonly platform: PlatformService,
    private readonly audit: PlatformAuditService,
    private readonly db: DatabaseService
  ) {}

  private repoRoot() {
    return process.env.DEVUKO_CRM_REPO_ROOT?.trim() || "/srv/sites/crm.devuko.ru/repo";
  }

  private async assertDockerAvailable() {
    try {
      await access("/var/run/docker.sock");
    } catch {
      throw new BadRequestException(
        "Docker is unavailable in this API container. Deploy via CI (`make deploy` / GitHub Actions) or enable docker-compose.deploy.yml explicitly."
      );
    }
  }

  private async runScript(scriptPath: string, env: Record<string, string>, timeoutMs: number) {
    const allowed = assertAllowedDeployScript(scriptPath, this.repoRoot());
    const { stdout, stderr } = await execFileAsync("bash", [allowed], {
      timeout: timeoutMs,
      env: pickChildEnv(env),
      maxBuffer: 4 * 1024 * 1024,
    });
    return { stdout: stdout.trim(), stderr: stderr.trim() };
  }

  private async withDeployLock<T>(fn: () => Promise<T>): Promise<T> {
    try {
      return await withAdvisoryLock(this.db, DEPLOY_LOCK, fn);
    } catch (error) {
      if (error instanceof Error && error.message === "LOCK_BUSY") {
        throw new BadRequestException("Deploy already in progress");
      }
      throw error;
    }
  }

  async deployPlatform(actor?: AuditActor) {
    assertDeployEnabled();
    await this.assertDockerAvailable();
    const root = this.repoRoot();
    const script = assertAllowedDeployScript(join(root, "infra/deploy/deploy.sh"), root);
    const env = {
      DEVUKO_CRM_REPO_ROOT: root,
      SKIP_GIT: "1",
      VITE_PUBLIC_URL: process.env.VITE_PUBLIC_URL ?? "https://crm.devuko.ru",
    };

    return this.withDeployLock(async () => {
      try {
        const result = await this.runScript(script, env, 900_000);
        const output = result.stdout || result.stderr || "Deploy finished";

        await this.audit.log({
          actorAdminId: actor?.id ?? null,
          actorEmail: actor?.email ?? null,
          actorName: actor?.name ?? null,
          action: "platform.deploy",
          target: "crm.devuko.ru",
          detail: output.slice(0, 1500),
          ok: true,
        });

        return { ok: true as const, output };
      } catch (error) {
        const raw = (error as Error).message;
        const message = raw.includes("unknown command: docker compose")
          ? "Docker Compose is unavailable in the deploy environment"
          : raw;
        this.logger.error(`Platform deploy failed: ${message}`);
        await this.audit.log({
          actorAdminId: actor?.id ?? null,
          actorEmail: actor?.email ?? null,
          actorName: actor?.name ?? null,
          action: "platform.deploy",
          target: "crm.devuko.ru",
          detail: message.slice(0, 1500),
          ok: false,
        });
        throw new BadRequestException(message.slice(0, 500));
      }
    });
  }

  async deploySite(siteId: string, actor?: AuditActor) {
    assertDeployEnabled();
    await this.assertDockerAvailable();
    const site = await this.platform.getSite(siteId);
    const prodPath = site.prodPath?.trim() || `/srv/sites/${site.domain}`;
    const script = assertAllowedDeployScript(join(prodPath, "repo/infra/deploy/deploy.sh"));

    return this.withDeployLock(async () => {
      try {
        const result = await this.runScript(script, { SKIP_GIT: "1" }, 900_000);
        await this.audit.log({
          actorAdminId: actor?.id ?? null,
          actorEmail: actor?.email ?? null,
          actorName: actor?.name ?? null,
          action: "site.deploy",
          target: site.domain,
          detail: (result.stdout || result.stderr || "Deploy finished").slice(0, 1500),
          ok: true,
        });
        return { ok: true as const, output: result.stdout || result.stderr || "Deploy finished" };
      } catch (error) {
        const message = (error as Error).message.slice(0, 500);
        await this.audit.log({
          actorAdminId: actor?.id ?? null,
          actorEmail: actor?.email ?? null,
          actorName: actor?.name ?? null,
          action: "site.deploy",
          target: site.domain,
          detail: message,
          ok: false,
        });
        throw new BadRequestException(message);
      }
    });
  }
}
