import { Module } from "@nestjs/common";
import { AuthModule } from "../auth/auth.module";
import { CrmAdminService } from "./crm-admin.service";
import { CrmAuthController } from "./crm-auth.controller";
import { CrmAuthOtpService } from "./crm-auth-otp.service";
import { CrmSessionService } from "./crm-session.service";
import { CrmPlatformController } from "./crm-platform.controller";
import { CrmWorkspaceProxyController } from "./crm-workspace-proxy.controller";
import { MailService } from "./mail.service";
import { PlatformAuditService } from "./platform-audit.service";
import { PlatformDeployService } from "./platform-deploy.service";
import { PlatformMetricsService } from "./platform-metrics.service";
import { PlatformService } from "./platform.service";
import { WorkspaceProxyService } from "./workspace-proxy.service";

@Module({
  imports: [AuthModule],
  providers: [
    PlatformAuditService,
    PlatformDeployService,
    PlatformMetricsService,
    PlatformService,
    WorkspaceProxyService,
    MailService,
    CrmAuthOtpService,
    CrmAdminService,
    CrmSessionService,
  ],
  controllers: [CrmAuthController, CrmPlatformController, CrmWorkspaceProxyController],
})
export class CrmModule {}
