import { Module } from "@nestjs/common";
import { AuthModule } from "../auth/auth.module";
import { CrmAdminService } from "./crm-admin.service";
import { CrmAuthController, CrmPlatformController, CrmProxyController } from "./crm.controller";
import { PlatformService } from "./platform.service";
import { WorkspaceProxyService } from "./workspace-proxy.service";

@Module({
  imports: [AuthModule],
  providers: [PlatformService, WorkspaceProxyService, CrmAdminService],
  controllers: [CrmAuthController, CrmPlatformController, CrmProxyController],
})
export class CrmModule {}
