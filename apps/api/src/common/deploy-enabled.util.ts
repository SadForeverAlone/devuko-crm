import { BadRequestException } from "@nestjs/common";

/** When `false`, platform/site deploy endpoints refuse to run (docker.sock stays mounted for ops). */
export function assertDeployEnabled(): void {
  const raw = process.env.DEVUKO_CRM_DEPLOY_ENABLED?.trim().toLowerCase();
  if (raw === "false" || raw === "0") {
    throw new BadRequestException("Deploy operations are disabled on this host (DEVUKO_CRM_DEPLOY_ENABLED=false)");
  }
}
