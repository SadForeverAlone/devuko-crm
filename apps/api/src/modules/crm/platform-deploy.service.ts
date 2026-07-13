import { BadRequestException, Injectable, Logger } from "@nestjs/common";
import { execFile } from "child_process";
import { existsSync } from "fs";
import { join } from "path";
import { promisify } from "util";
import { PlatformAuditService } from "./platform-audit.service";
import { PlatformService } from "./platform.service";

const execFileAsync = promisify(execFile);

type AuditActor = { id?: string; email?: string; name?: string };

@Injectable()
export class PlatformDeployService {
  private readonly logger = new Logger(PlatformDeployService.name);
  private running = false;

  constructor(
    private readonly platform: PlatformService,
    private readonly audit: PlatformAuditService
  ) {}

  private repoRoot() {
    return process.env.DEVUKO_CRM_REPO_ROOT?.trim() || "/srv/sites/crm.devuko.ru/repo";
  }

  private deployImage() {
    return process.env.DEVUKO_CRM_DEPLOY_IMAGE?.trim() || "devuko-crm-api:latest";
  }

  private async runScript(scriptPath: string, env: Record<string, string>, timeoutMs: number) {
    if (!existsSync(scriptPath)) {
      throw new BadRequestException(`Deploy script not found: ${scriptPath}`);
    }
    const { stdout, stderr } = await execFileAsync("bash", [scriptPath], {
      timeout: timeoutMs,
      env: { ...process.env, ...env },
      maxBuffer: 4 * 1024 * 1024,
    });
    return { stdout: stdout.trim(), stderr: stderr.trim() };
  }

  private async runPlatformDeployInRunner(root: string, scriptPath: string, env: Record<string, string>) {
    await execFileAsync("docker", ["rm", "-f", "devuko-crm-deploy-runner"], { timeout: 10_000 }).catch(() => {});

    const envArgs = Object.entries(env).flatMap(([key, value]) => ["-e", `${key}=${value}`]);
    await execFileAsync(
      "docker",
      [
        "run",
        "-d",
        "--rm",
        "--name",
        "devuko-crm-deploy-runner",
        "-v",
        "/var/run/docker.sock:/var/run/docker.sock",
        "-v",
        "/srv/sites:/srv/sites",
        "-v",
        `${root}:${root}`,
        "-w",
        root,
        ...envArgs,
        this.deployImage(),
        "bash",
        scriptPath,
      ],
      { timeout: 30_000 }
    );
  }

  async deployPlatform(actor?: AuditActor) {
    if (this.running) {
      throw new BadRequestException("Deploy already in progress");
    }
    this.running = true;
    const root = this.repoRoot();
    const script = join(root, "infra/deploy/deploy.sh");
    const env = {
      DEVUKO_CRM_REPO_ROOT: root,
      SKIP_GIT: "1",
      VITE_PUBLIC_URL: process.env.VITE_PUBLIC_URL ?? "https://crm.devuko.ru",
    };

    try {
      if (!existsSync(script)) {
        throw new BadRequestException(`Deploy script not found: ${script}`);
      }

      await this.runPlatformDeployInRunner(root, script, env);

      const output =
        "Deploy started in background. CRM API may restart for up to 2 minutes while containers rebuild.";

      await this.audit.log({
        actorAdminId: actor?.id ?? null,
        actorEmail: actor?.email ?? null,
        actorName: actor?.name ?? null,
        action: "platform.deploy",
        target: "crm.devuko.ru",
        detail: output,
        ok: true,
      });

      return { ok: true as const, output };
    } catch (error) {
      const raw = (error as Error).message;
      const message = raw.includes("unknown command: docker compose")
        ? "Docker Compose is unavailable in the deploy runner"
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
    } finally {
      this.running = false;
    }
  }

  async deploySite(siteId: string, actor?: AuditActor) {
    if (this.running) {
      throw new BadRequestException("Deploy already in progress");
    }
    const site = await this.platform.getSite(siteId);
    const prodPath = site.prodPath?.trim() || `/srv/sites/${site.domain}`;
    const script = join(prodPath, "repo/infra/deploy/deploy.sh");
    if (!existsSync(script)) {
      throw new BadRequestException(`No deploy script for ${site.domain}`);
    }
    this.running = true;
    try {
      const result = await this.runScript(script, { SKIP_GIT: "1" }, 900_000);
      await this.audit.log({
        actorAdminId: actor?.id ?? null,
        actorEmail: actor?.email ?? null,
        actorName: actor?.name ?? null,
        action: "site.deploy",
        target: site.domain,
        detail: result.stdout.slice(-1500) || "ok",
        ok: true,
      });
      return { ok: true as const, output: result.stdout.slice(-4000) };
    } catch (error) {
      const message = (error as Error).message;
      await this.audit.log({
        actorAdminId: actor?.id ?? null,
        actorEmail: actor?.email ?? null,
        actorName: actor?.name ?? null,
        action: "site.deploy",
        target: site.domain,
        detail: message.slice(0, 1500),
        ok: false,
      });
      throw new BadRequestException(message.slice(0, 500));
    } finally {
      this.running = false;
    }
  }
}
