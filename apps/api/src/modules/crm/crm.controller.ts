import {
  Body,
  Controller,
  Delete,
  Get,
  Headers,
  Param,
  Patch,
  Post,
  Query,
  Req,
  UseGuards,
} from "@nestjs/common";
import { CrmAdminService } from "./crm-admin.service";
import { PlatformDeployService } from "./platform-deploy.service";
import { PlatformMetricsService } from "./platform-metrics.service";
import { PlatformService } from "./platform.service";
import { WorkspaceProxyService } from "./workspace-proxy.service";
import { AdminGuard, JwtAuthGuard } from "./guards";

function workspaceFromRequest(headers: Record<string, string | string[] | undefined>, query?: string) {
  const fromQuery = query?.trim();
  if (fromQuery) return fromQuery;
  const raw = headers["x-crm-workspace-id"];
  const fromHeader = Array.isArray(raw) ? raw[0] : raw;
  return fromHeader?.trim() || undefined;
}

function auditActor(req: { user?: { sub?: string; email?: string; name?: string } }) {
  return { id: req.user?.sub, email: req.user?.email, name: req.user?.name };
}

@Controller("crm-auth")
export class CrmAuthController {
  constructor(private readonly admins: CrmAdminService) {}

  @Post("login")
  login(@Body() body: { login: string; password: string }) {
    return this.admins.login(body.login ?? "", body.password ?? "");
  }
}

@Controller("admin/crm")
@UseGuards(JwtAuthGuard, AdminGuard)
export class CrmPlatformController {
  constructor(
    private readonly platform: PlatformService,
    private readonly admins: CrmAdminService,
    private readonly metrics: PlatformMetricsService,
    private readonly deploy: PlatformDeployService
  ) {}

  @Get("session")
  session(@Req() req: { user?: { sub?: string } }) {
    return this.admins.getSession(req.user?.sub ?? "");
  }

  @Get("platform-logs")
  platformLogs(
    @Query() query: { limit?: string; offset?: string }
  ) {
    return this.platform.listPlatformLogs({
      limit: query.limit ? Number(query.limit) : undefined,
      offset: query.offset ? Number(query.offset) : undefined,
    });
  }

  @Get("admins")
  listAdmins(
    @Query()
    query: {
      search?: string;
      orderBy?: "createdAt" | "email" | "displayName" | "login" | "firstName";
      orderDir?: "asc" | "desc";
      limit?: string;
      offset?: string;
    }
  ) {
    return this.admins.listAdmins({
      search: query.search,
      orderBy: query.orderBy,
      orderDir: query.orderDir,
      limit: query.limit ? Number(query.limit) : undefined,
      offset: query.offset ? Number(query.offset) : undefined,
    });
  }

  @Post("admins")
  createAdmin(
    @Body()
    body: {
      login?: string;
      email?: string;
      password?: string;
      firstName?: string;
      lastName?: string;
    },
    @Req() req: { user?: { sub?: string; email?: string; name?: string } }
  ) {
    return this.admins.createAdmin(
      {
        login: body.login ?? "",
        email: body.email ?? "",
        password: body.password ?? "",
        firstName: body.firstName ?? "",
        lastName: body.lastName ?? "",
      },
      auditActor(req)
    );
  }

  @Patch("admins/:id")
  patchAdmin(
    @Param("id") id: string,
    @Body()
    body: {
      login?: string;
      email?: string;
      password?: string;
      firstName?: string;
      lastName?: string;
    },
    @Req() req: { user?: { sub?: string; email?: string; name?: string } }
  ) {
    return this.admins.updateAdmin(id, body, auditActor(req));
  }

  @Delete("admins/:id")
  deleteAdmin(@Param("id") id: string, @Req() req: { user?: { sub?: string; email?: string; name?: string } }) {
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
  createSite(
    @Body()
    body: {
      domain: string;
      repo?: string;
      apiPort?: number;
      webPort?: number;
      apiBaseUrl?: string;
      extraDomains?: string[];
      provision?: boolean;
    },
    @Req() req: { user?: { sub?: string; email?: string; name?: string } }
  ) {
    return this.platform.createSite(body, auditActor(req));
  }

  @Patch("sites/:id")
  patchSite(
    @Param("id") id: string,
    @Body() body: { repo?: string; apiPort?: number; webPort?: number; apiBaseUrl?: string; extraDomains?: string[] },
    @Req() req: { user?: { sub?: string; email?: string; name?: string } }
  ) {
    return this.platform.updateSite(id, body, auditActor(req));
  }

  @Delete("sites/:id")
  deleteSite(@Param("id") id: string, @Req() req: { user?: { sub?: string; email?: string } }) {
    return this.platform.deleteSite(id, auditActor(req));
  }

  @Post("sites/:id/provision")
  provisionSite(@Param("id") id: string, @Req() req: { user?: { sub?: string; email?: string } }) {
    return this.platform.provisionSite(id, auditActor(req));
  }

  @Post("platform-deploy")
  deployPlatform(@Req() req: { user?: { sub?: string; email?: string; name?: string } }) {
    return this.deploy.deployPlatform(auditActor(req));
  }

  @Post("sites/:id/deploy")
  deploySite(@Param("id") id: string, @Req() req: { user?: { sub?: string; email?: string; name?: string } }) {
    return this.deploy.deploySite(id, auditActor(req));
  }
}

@Controller("admin/crm")
@UseGuards(JwtAuthGuard, AdminGuard)
export class CrmProxyController {
  constructor(private readonly proxy: WorkspaceProxyService) {}

  @Get("overview")
  overview(
    @Query() query: Record<string, string | undefined>,
    @Headers() headers: Record<string, string | string[] | undefined>,
    @Req() req: { headers: { authorization?: string } }
  ) {
    const ws = workspaceFromRequest(headers, query.workspaceId);
    const params = new URLSearchParams(query as Record<string, string>);
    params.delete("workspaceId");
    return this.proxy.forward(ws, "/admin/crm/overview", {
      method: "GET",
      query: params.toString(),
      authorization: req.headers.authorization,
    });
  }

  @Get("users")
  users(
    @Query() query: Record<string, string | undefined>,
    @Headers() headers: Record<string, string | string[] | undefined>,
    @Req() req: { headers: { authorization?: string } }
  ) {
    const ws = workspaceFromRequest(headers, query.workspaceId);
    const params = new URLSearchParams(query as Record<string, string>);
    params.delete("workspaceId");
    return this.proxy.forward(ws, "/admin/crm/users", {
      method: "GET",
      query: params.toString(),
      authorization: req.headers.authorization,
    });
  }

  @Post("users")
  createUser(
    @Body() body: unknown,
    @Headers() headers: Record<string, string | string[] | undefined>,
    @Query("workspaceId") workspaceId: string | undefined,
    @Req() req: { headers: { authorization?: string } }
  ) {
    const ws = workspaceFromRequest(headers, workspaceId);
    return this.proxy.forward(ws, "/admin/crm/users", {
      method: "POST",
      body: JSON.stringify(body),
      authorization: req.headers.authorization,
    });
  }

  @Patch("users/:id")
  patchUser(
    @Param("id") id: string,
    @Body() body: unknown,
    @Headers() headers: Record<string, string | string[] | undefined>,
    @Query("workspaceId") workspaceId: string | undefined,
    @Req() req: { headers: { authorization?: string } }
  ) {
    const ws = workspaceFromRequest(headers, workspaceId);
    return this.proxy.forward(ws, `/admin/crm/users/${id}`, {
      method: "PATCH",
      body: JSON.stringify(body),
      authorization: req.headers.authorization,
    });
  }

  @Get("promises")
  promises(
    @Query() query: Record<string, string | undefined>,
    @Headers() headers: Record<string, string | string[] | undefined>,
    @Req() req: { headers: { authorization?: string } }
  ) {
    const ws = workspaceFromRequest(headers, query.workspaceId);
    const params = new URLSearchParams(query as Record<string, string>);
    params.delete("workspaceId");
    return this.proxy.forward(ws, "/admin/crm/promises", {
      method: "GET",
      query: params.toString(),
      authorization: req.headers.authorization,
    });
  }

  @Get("settings")
  settings(
    @Query() query: Record<string, string | undefined>,
    @Headers() headers: Record<string, string | string[] | undefined>,
    @Req() req: { headers: { authorization?: string } }
  ) {
    const ws = workspaceFromRequest(headers, query.workspaceId);
    const params = new URLSearchParams(query as Record<string, string>);
    params.delete("workspaceId");
    return this.proxy.forward(ws, "/admin/crm/settings", {
      method: "GET",
      query: params.toString(),
      authorization: req.headers.authorization,
    });
  }

  @Patch("settings")
  patchSettings(
    @Body() body: unknown,
    @Headers() headers: Record<string, string | string[] | undefined>,
    @Query("workspaceId") workspaceId: string | undefined,
    @Req() req: { headers: { authorization?: string } }
  ) {
    const ws = workspaceFromRequest(headers, workspaceId);
    return this.proxy.forward(ws, "/admin/crm/settings", {
      method: "PATCH",
      body: JSON.stringify(body),
      authorization: req.headers.authorization,
    });
  }

  @Get("contacts")
  contacts(
    @Query() query: Record<string, string | undefined>,
    @Headers() headers: Record<string, string | string[] | undefined>,
    @Req() req: { headers: { authorization?: string } }
  ) {
    const ws = workspaceFromRequest(headers, query.workspaceId);
    const params = new URLSearchParams(query as Record<string, string>);
    params.delete("workspaceId");
    return this.proxy.forward(ws, "/admin/crm/contacts", {
      method: "GET",
      query: params.toString(),
      authorization: req.headers.authorization,
    });
  }

  @Get("pages")
  pages(
    @Query() query: Record<string, string | undefined>,
    @Headers() headers: Record<string, string | string[] | undefined>,
    @Req() req: { headers: { authorization?: string } }
  ) {
    const ws = workspaceFromRequest(headers, query.workspaceId);
    const params = new URLSearchParams(query as Record<string, string>);
    params.delete("workspaceId");
    return this.proxy.forward(ws, "/admin/crm/pages", {
      method: "GET",
      query: params.toString(),
      authorization: req.headers.authorization,
    });
  }

  @Get("reports")
  reports(
    @Query() query: Record<string, string | undefined>,
    @Headers() headers: Record<string, string | string[] | undefined>,
    @Req() req: { headers: { authorization?: string } }
  ) {
    const ws = workspaceFromRequest(headers, query.workspaceId);
    const params = new URLSearchParams(query as Record<string, string>);
    params.delete("workspaceId");
    return this.proxy.forward(ws, "/admin/crm/reports", {
      method: "GET",
      query: params.toString(),
      authorization: req.headers.authorization,
    });
  }
}
