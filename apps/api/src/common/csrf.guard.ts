import { CanActivate, ExecutionContext, ForbiddenException, Injectable } from "@nestjs/common";
import type { FastifyRequest } from "fastify";
import { isCsrfValid } from "./csrf-check.util";

@Injectable()
export class CsrfGuard implements CanActivate {
  canActivate(context: ExecutionContext): boolean {
    const req = context.switchToHttp().getRequest<FastifyRequest>();
    if (
      !isCsrfValid({
        method: req.method,
        url: req.url,
        cookies: req.cookies,
        headers: req.headers as Record<string, string | string[] | undefined>,
      })
    ) {
      throw new ForbiddenException("Invalid CSRF token");
    }

    return true;
  }
}
