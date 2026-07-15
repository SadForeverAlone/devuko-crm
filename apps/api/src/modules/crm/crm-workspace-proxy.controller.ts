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
import { Throttle } from "@nestjs/throttler";
import { ApiTags } from "@nestjs/swagger";
import { proxyGet, workspaceFromRequest } from "./crm-http.util";
import {
  CreateWorkspaceUserDto,
  PatchWorkspaceSettingsDto,
  PatchWorkspaceUserDto,
} from "./dto/workspace-proxy.dto";
import { WorkspaceProxyService } from "./workspace-proxy.service";
import { AdminGuard, JwtAuthGuard, SessionActiveGuard } from "./guards";

@Controller("admin/crm")
@ApiTags("workspace-proxy")
@UseGuards(JwtAuthGuard, SessionActiveGuard, AdminGuard)
export class CrmWorkspaceProxyController {
  constructor(private readonly proxy: WorkspaceProxyService) {}

  @Get("overview")
  overview(
    @Query() query: Record<string, string | undefined>,
    @Headers() headers: Record<string, string | string[] | undefined>,
    @Req() req: { headers: { authorization?: string } }
  ) {
    return proxyGet(this.proxy, "/admin/crm/overview", query, headers, req.headers.authorization);
  }

  @Get("users")
  users(
    @Query() query: Record<string, string | undefined>,
    @Headers() headers: Record<string, string | string[] | undefined>,
    @Req() req: { headers: { authorization?: string } }
  ) {
    return proxyGet(this.proxy, "/admin/crm/users", query, headers, req.headers.authorization);
  }

  @Post("users")
  @Throttle({ default: { limit: 30, ttl: 60_000 } })
  createUser(
    @Body() body: CreateWorkspaceUserDto,
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
  @Throttle({ default: { limit: 30, ttl: 60_000 } })
  patchUser(
    @Param("id") id: string,
    @Body() body: PatchWorkspaceUserDto,
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
    return proxyGet(this.proxy, "/admin/crm/promises", query, headers, req.headers.authorization);
  }

  @Get("settings")
  settings(
    @Query() query: Record<string, string | undefined>,
    @Headers() headers: Record<string, string | string[] | undefined>,
    @Req() req: { headers: { authorization?: string } }
  ) {
    return proxyGet(this.proxy, "/admin/crm/settings", query, headers, req.headers.authorization);
  }

  @Patch("settings")
  @Throttle({ default: { limit: 30, ttl: 60_000 } })
  patchSettings(
    @Body() body: PatchWorkspaceSettingsDto,
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
    return proxyGet(this.proxy, "/admin/crm/contacts", query, headers, req.headers.authorization);
  }

  @Get("pages")
  pages(
    @Query() query: Record<string, string | undefined>,
    @Headers() headers: Record<string, string | string[] | undefined>,
    @Req() req: { headers: { authorization?: string } }
  ) {
    return proxyGet(this.proxy, "/admin/crm/pages", query, headers, req.headers.authorization);
  }

  @Get("reports")
  reports(
    @Query() query: Record<string, string | undefined>,
    @Headers() headers: Record<string, string | string[] | undefined>,
    @Req() req: { headers: { authorization?: string } }
  ) {
    return proxyGet(this.proxy, "/admin/crm/reports", query, headers, req.headers.authorization);
  }
}
