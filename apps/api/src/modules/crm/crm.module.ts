import { Module } from "@nestjs/common";
import { AuthModule } from "../auth/auth.module";
import { CrmAdminService } from "./crm-admin.service";
import { CrmAuthController, CrmPlatformController, CrmProxyController } from "./crm.controller";
import { PlatformAuditService } from "./platform-audit.service";
import { PlatformDeployService } from "./platform-deploy.service";
import { PlatformMetricsService } from "./platform-metrics.service";
import { PlatformService } from "./platform.service";
import { WorkspaceProxyService } from "./workspace-proxy.service";

@Module({
  imports: [AuthModule],
  providers: [PlatformAuditService, PlatformDeployService, PlatformMetricsService, PlatformService, WorkspaceProxyService, CrmAdminService],
  controllers: [CrmAuthController, CrmPlatformController, CrmProxyController],
})
export class CrmModule {}
