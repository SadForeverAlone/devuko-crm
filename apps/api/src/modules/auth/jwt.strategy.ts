import { Injectable } from "@nestjs/common";
import { PassportStrategy } from "@nestjs/passport";
import type { FastifyRequest } from "fastify";
import { ExtractJwt, Strategy } from "passport-jwt";
import { CRM_ADMIN_ROLE, type CrmJwtPayload } from "../../common/auth.constants";
import { CRM_AUTH_COOKIE } from "../../common/auth-cookie.util";
import { resolveJwtSecret } from "../../common/jwt-secret.util";

function jwtFromCookieOrBearer(req: FastifyRequest) {
  const fromCookie = req.cookies?.[CRM_AUTH_COOKIE];
  if (typeof fromCookie === "string" && fromCookie.trim()) {
    return fromCookie.trim();
  }
  return ExtractJwt.fromAuthHeaderAsBearerToken()(req);
}

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor() {
    super({
      jwtFromRequest: jwtFromCookieOrBearer,
      ignoreExpiration: false,
      secretOrKey: resolveJwtSecret(),
      algorithms: ["HS256"],
    });
  }

  validate(payload: CrmJwtPayload) {
    if (payload.role !== CRM_ADMIN_ROLE || !payload.sid?.trim()) {
      return null;
    }
    return {
      sub: payload.sub,
      email: payload.email,
      name: payload.name,
      role: payload.role,
      sid: payload.sid.trim(),
    };
  }
}
