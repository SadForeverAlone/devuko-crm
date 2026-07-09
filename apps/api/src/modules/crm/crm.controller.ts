import {
  Body,
  Controller,
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
  constructor(private readonly platform: PlatformService) {}

  @Get("workspaces")
  workspaces() {
    return this.platform.listWorkspaces();
  }

  @Get("sites")
  sites() {
    return this.platform.listSites();
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
    }
  ) {
    return this.platform.createSite(body);
  }

  @Patch("sites/:id")
  patchSite(
    @Param("id") id: string,
    @Body() body: { repo?: string; apiPort?: number; webPort?: number; apiBaseUrl?: string; extraDomains?: string[] }
  ) {
    return this.platform.updateSite(id, body);
  }

  @Post("sites/:id/provision")
  provisionSite(@Param("id") id: string) {
    return this.platform.provisionSite(id);
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
