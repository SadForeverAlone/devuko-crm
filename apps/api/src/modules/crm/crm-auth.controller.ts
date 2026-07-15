import { Body, Controller, HttpException, HttpStatus, Post, Req, Res } from "@nestjs/common";
import { ApiTags } from "@nestjs/swagger";
import { Throttle } from "@nestjs/throttler";
import type { FastifyReply, FastifyRequest } from "fastify";
import { authCookieClearOptions, authCookieOptions, CRM_AUTH_COOKIE } from "../../common/auth-cookie.util";
import { clearCsrfCookie, setCsrfCookie } from "./crm-http.util";
import { CrmAdminService } from "./crm-admin.service";
import { CrmAuthOtpService } from "./crm-auth-otp.service";
import { CrmSessionService } from "./crm-session.service";
import { LoginDto, OtpRequestDto, OtpVerifyDto } from "./dto/auth.dto";

@Controller("crm-auth")
@ApiTags("auth")
export class CrmAuthController {
  constructor(
    private readonly admins: CrmAdminService,
    private readonly otp: CrmAuthOtpService,
    private readonly sessions: CrmSessionService
  ) {}

  @Post("login")
  @Throttle({ auth: { limit: 10, ttl: 60_000 } })
  async login(@Body() body: LoginDto, @Res({ passthrough: true }) reply: FastifyReply) {
    const allowPasswordLogin =
      process.env.NODE_ENV !== "production" || process.env.AUTH_PASSWORD_LOGIN === "true";
    if (!allowPasswordLogin) {
      throw new HttpException(
        "Password-only login is disabled. Use OTP: POST /crm-auth/otp/request then /crm-auth/otp/verify.",
        HttpStatus.GONE
      );
    }
    const result = await this.admins.login(body.login, body.password);
    if (result.ok && result.token) {
      reply.setCookie(CRM_AUTH_COOKIE, result.token, authCookieOptions());
      setCsrfCookie(reply);
      if (process.env.NODE_ENV === "production" && process.env.AUTH_RETURN_TOKEN !== "true") {
        return { ok: true as const };
      }
    }
    return result;
  }

  @Post("logout")
  @Throttle({ auth: { limit: 20, ttl: 60_000 } })
  async logout(@Req() req: FastifyRequest, @Res({ passthrough: true }) reply: FastifyReply) {
    await this.sessions.revokeFromRequest(req);
    reply.clearCookie(CRM_AUTH_COOKIE, authCookieClearOptions());
    clearCsrfCookie(reply);
    return { ok: true as const };
  }

  @Post("otp/request")
  @Throttle({ auth: { limit: 10, ttl: 60_000 } })
  requestOtp(@Body() body: OtpRequestDto) {
    return this.otp.requestOtp(body.login, body.password);
  }

  @Post("otp/verify")
  @Throttle({ auth: { limit: 10, ttl: 60_000 } })
  async verifyOtp(@Body() body: OtpVerifyDto, @Res({ passthrough: true }) reply: FastifyReply) {
    const result = await this.otp.verifyOtp(body.email, body.code);
    if (result.ok && result.token) {
      reply.setCookie(CRM_AUTH_COOKIE, result.token, authCookieOptions());
      setCsrfCookie(reply);
      if (process.env.NODE_ENV === "production" && process.env.AUTH_RETURN_TOKEN !== "true") {
        return { ok: true as const };
      }
    }
    return result;
  }
}
