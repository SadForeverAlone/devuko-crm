import { BadGatewayException, BadRequestException, Injectable, Logger } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { secureWorkspaceFetch } from "../../common/secure-fetch.util";
import { PLATFORM_WORKSPACE_ID, PlatformService } from "./platform.service";

@Injectable()
export class WorkspaceProxyService {
  private readonly logger = new Logger(WorkspaceProxyService.name);

  constructor(
    private readonly platform: PlatformService,
    private readonly config: ConfigService
  ) {}

  private proxySecret() {
    return this.config.get<string>("DEVUKO_PROXY_SECRET")?.trim() ?? "";
  }

  async forward<T>(
    workspaceId: string | undefined,
    path: string,
    init: { method: string; query?: string; body?: string; authorization?: string }
  ): Promise<T> {
    const ws = workspaceId?.trim() || PLATFORM_WORKSPACE_ID;
    if (ws === PLATFORM_WORKSPACE_ID) {
      throw new BadRequestException("Select a site workspace to access site data");
    }

    const site = await this.platform.getSiteByWorkspaceId(ws);
    if (!site) {
      throw new BadRequestException("Unknown workspace");
    }

    const pathWithQuery = `${path}${init.query ? `?${init.query}` : ""}`;
    const headers: Record<string, string> = {
      Accept: "application/json",
      "X-Devuko-Proxy-Token": this.proxySecret(),
    };
    if (init.authorization) {
      headers.Authorization = init.authorization;
    }
    if (init.body) {
      headers["Content-Type"] = "application/json";
    }

    const res = await secureWorkspaceFetch(
      site.apiBaseUrl,
      pathWithQuery,
      { domain: site.domain, extraDomains: site.extraDomains },
      {
        method: init.method,
        headers,
        body: init.body,
      }
    );

    if (!res.ok) {
      const text = await res.text();
      this.logger.warn(
        `Proxy ${init.method} ${site.apiBaseUrl}${pathWithQuery} -> ${res.status}: ${text.slice(0, 200)}`
      );
      throw new BadRequestException(`Workspace API error (${res.status})`);
    }

    if (res.status === 204) {
      return undefined as T;
    }
    const text = await res.text();
    if (!text) {
      return undefined as T;
    }
    try {
      return JSON.parse(text) as T;
    } catch {
      throw new BadGatewayException("Workspace API returned invalid JSON");
    }
  }
}
