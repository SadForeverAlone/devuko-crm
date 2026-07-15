import type { FastifyReply } from "fastify";
import {
  createCsrfToken,
  csrfCookieClearOptions,
  csrfCookieOptions,
  CRM_CSRF_COOKIE,
} from "../../common/csrf-cookie.util";
import { WorkspaceProxyService } from "./workspace-proxy.service";

export function workspaceFromRequest(
  headers: Record<string, string | string[] | undefined>,
  query?: string
) {
  const fromQuery = query?.trim();
  if (fromQuery) return fromQuery;
  const raw = headers["x-crm-workspace-id"];
  const fromHeader = Array.isArray(raw) ? raw[0] : raw;
  return fromHeader?.trim() || undefined;
}

export function auditActor(req: { user?: { sub?: string; email?: string; name?: string } }) {
  return { id: req.user?.sub, email: req.user?.email, name: req.user?.name };
}

export function setCsrfCookie(reply: FastifyReply) {
  reply.setCookie(CRM_CSRF_COOKIE, createCsrfToken(), csrfCookieOptions());
}

export function clearCsrfCookie(reply: FastifyReply) {
  reply.clearCookie(CRM_CSRF_COOKIE, csrfCookieClearOptions());
}

export function proxyGet(
  proxy: WorkspaceProxyService,
  path: string,
  query: Record<string, string | undefined>,
  headers: Record<string, string | string[] | undefined>,
  authorization?: string
) {
  const ws = workspaceFromRequest(headers, query.workspaceId);
  const params = new URLSearchParams(query as Record<string, string>);
  params.delete("workspaceId");
  return proxy.forward(ws, path, {
    method: "GET",
    query: params.toString(),
    authorization,
  });
}
