import { BadRequestException } from "@nestjs/common";
import { resolve } from "path";

const DEPLOY_ROOT = "/srv/sites";

export function assertAllowedDeployScript(scriptPath: string, repoRoot?: string): string {
  const resolved = resolve(scriptPath.trim());
  if (!resolved.startsWith(`${resolve(DEPLOY_ROOT)}/`)) {
    throw new BadRequestException("Deploy script must be under /srv/sites");
  }

  if (repoRoot) {
    const root = resolve(repoRoot.trim());
    if (!resolved.startsWith(`${root}/`)) {
      throw new BadRequestException("Deploy script is outside repo root");
    }
    if (!resolved.endsWith("/infra/deploy/deploy.sh")) {
      throw new BadRequestException("Invalid deploy script path");
    }
    return resolved;
  }

  if (!resolved.endsWith("/repo/infra/deploy/deploy.sh")) {
    throw new BadRequestException("Invalid deploy script path");
  }
  return resolved;
}

export function assertDeployPath(prodPath: string, site: { domain: string }): string {
  const trimmed = prodPath.trim();
  if (!trimmed || trimmed.includes("..")) {
    throw new BadRequestException("Invalid deploy path");
  }

  const resolved = resolve(trimmed);
  const root = resolve(DEPLOY_ROOT);
  if (!resolved.startsWith(`${root}/`)) {
    throw new BadRequestException("Deploy path must be under /srv/sites");
  }

  const expected = site.domain.trim().toLowerCase();
  const basename = resolved.split("/").pop()?.toLowerCase();
  if (!expected || basename !== expected) {
    throw new BadRequestException("Deploy path must match site domain");
  }

  return resolved;
}

export function assertCrmRepoRoot(repoRoot: string): string {
  const trimmed = repoRoot.trim();
  if (!trimmed || trimmed.includes("..")) {
    throw new BadRequestException("Invalid CRM repo root");
  }

  const resolved = resolve(trimmed);
  const root = resolve(DEPLOY_ROOT);
  if (!resolved.startsWith(`${root}/`)) {
    throw new BadRequestException("CRM repo root must be under /srv/sites");
  }

  return resolved;
}
