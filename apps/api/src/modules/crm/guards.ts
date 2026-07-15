import { CanActivate, ExecutionContext, Injectable, UnauthorizedException } from "@nestjs/common";
import { AuthGuard } from "@nestjs/passport";
import { CRM_ADMIN_ROLE } from "../../common/auth.constants";
import { CrmSessionService } from "./crm-session.service";

@Injectable()
export class JwtAuthGuard extends AuthGuard("jwt") {
  handleRequest<T>(err: Error | null, user: T) {
    if (err || !user) {
      throw err || new UnauthorizedException();
    }
    return user;
  }
}

@Injectable()
export class SessionActiveGuard implements CanActivate {
  constructor(private readonly sessions: CrmSessionService) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const req = context.switchToHttp().getRequest<{ user?: { sid?: string } }>();
    const sid = req.user?.sid;
    if (!sid || !(await this.sessions.isSessionActive(sid))) {
      throw new UnauthorizedException();
    }
    return true;
  }
}

@Injectable()
export class AdminGuard implements CanActivate {
  canActivate(context: ExecutionContext): boolean {
    const req = context.switchToHttp().getRequest<{ user?: { sub?: string; role?: string } }>();
    if (!req.user?.sub || req.user.role !== CRM_ADMIN_ROLE) {
      throw new UnauthorizedException();
    }
    return true;
  }
}
