import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  Query,
  Req,
  Res,
  UseGuards,
} from "@nestjs/common";
import { Throttle } from "@nestjs/throttler";
import { ApiTags } from "@nestjs/swagger";
import type { FastifyReply } from "fastify";
import { auditActor, setCsrfCookie } from "./crm-http.util";
import { CrmAdminService } from "./crm-admin.service";
import {
  CreateAdminDto,
  CreateSiteDto,
  ListAdminsQueryDto,
  PatchAdminDto,
  PatchSiteDto,
  PlatformLogsQueryDto,
} from "./dto/platform.dto";
import { PlatformDeployService } from "./platform-deploy.service";
import { PlatformMetricsService } from "./platform-metrics.service";
import { PlatformService } from "./platform.service";
import { AdminGuard, JwtAuthGuard, SessionActiveGuard } from "./guards";

@Controller("admin/crm")
@ApiTags("platform")
@UseGuards(JwtAuthGuard, SessionActiveGuard, AdminGuard)
export class CrmPlatformController {
  constructor(
    private readonly platform: PlatformService,
    private readonly admins: CrmAdminService,
    private readonly metrics: PlatformMetricsService,
    private readonly deploy: PlatformDeployService
  ) {}

  @Get("session")
  async session(
    @Req() req: { user?: { sub?: string } },
    @Res({ passthrough: true }) reply: FastifyReply
  ) {
    setCsrfCookie(reply);
    return this.admins.getSession(req.user?.sub ?? "");
  }

  @Get("platform-logs")
  platformLogs(@Query() query: PlatformLogsQueryDto) {
    return this.platform.listPlatformLogs({
      limit: query.limit,
      offset: query.offset,
    });
  }

  @Get("admins")
  listAdmins(@Query() query: ListAdminsQueryDto) {
    return this.admins.listAdmins({
      search: query.search,
      orderBy: query.orderBy,
      orderDir: query.orderDir,
      limit: query.limit,
      offset: query.offset,
    });
  }

  @Post("admins")
  @Throttle({ default: { limit: 20, ttl: 60_000 } })
  createAdmin(
    @Body() body: CreateAdminDto,
    @Req() req: { user?: { sub?: string; email?: string; name?: string } }
  ) {
    return this.admins.createAdmin(body, auditActor(req));
  }

  @Patch("admins/:id")
  @Throttle({ default: { limit: 20, ttl: 60_000 } })
  patchAdmin(
    @Param("id") id: string,
    @Body() body: PatchAdminDto,
    @Req() req: { user?: { sub?: string; email?: string; name?: string } }
  ) {
    return this.admins.updateAdmin(id, body, auditActor(req));
  }

  @Delete("admins/:id")
  @Throttle({ default: { limit: 10, ttl: 60_000 } })
  deleteAdmin(
    @Param("id") id: string,
    @Req() req: { user?: { sub?: string; email?: string; name?: string } }
  ) {
    return this.admins.deleteAdmin(id, req.user?.sub ?? "", req.user?.email, req.user?.name);
  }

  @Get("workspaces")
  workspaces() {
    return this.platform.listWorkspaces();
  }

  @Get("sites")
  sites() {
    return this.platform.listSites();
  }

  @Get("platform-status")
  platformStatus() {
    return this.platform.getPlatformStatus();
  }

  @Get("platform-metrics")
  platformMetrics() {
    return this.metrics.getMetrics();
  }

  @Get("sites/:id")
  site(@Param("id") id: string) {
    return this.platform.getSite(id);
  }

  @Post("sites")
  @Throttle({ default: { limit: 20, ttl: 60_000 } })
  createSite(
    @Body() body: CreateSiteDto,
    @Req() req: { user?: { sub?: string; email?: string; name?: string } }
  ) {
    return this.platform.createSite(body, auditActor(req));
  }

  @Patch("sites/:id")
  @Throttle({ default: { limit: 20, ttl: 60_000 } })
  patchSite(
    @Param("id") id: string,
    @Body() body: PatchSiteDto,
    @Req() req: { user?: { sub?: string; email?: string; name?: string } }
  ) {
    return this.platform.updateSite(id, body, auditActor(req));
  }

  @Delete("sites/:id")
  @Throttle({ default: { limit: 10, ttl: 60_000 } })
  deleteSite(
    @Param("id") id: string,
    @Req() req: { user?: { sub?: string; email?: string } }
  ) {
    return this.platform.deleteSite(id, auditActor(req));
  }

  @Post("sites/:id/provision")
  @Throttle({ default: { limit: 5, ttl: 300_000 } })
  provisionSite(
    @Param("id") id: string,
    @Req() req: { user?: { sub?: string; email?: string } }
  ) {
    return this.platform.provisionSite(id, auditActor(req));
  }

  @Post("platform-deploy")
  @Throttle({ deploy: { limit: 3, ttl: 300_000 } })
  deployPlatform(@Req() req: { user?: { sub?: string; email?: string; name?: string } }) {
    return this.deploy.deployPlatform(auditActor(req));
  }

  @Post("sites/:id/deploy")
  @Throttle({ deploy: { limit: 3, ttl: 300_000 } })
  deploySite(
    @Param("id") id: string,
    @Req() req: { user?: { sub?: string; email?: string; name?: string } }
  ) {
    return this.deploy.deploySite(id, auditActor(req));
  }
}
