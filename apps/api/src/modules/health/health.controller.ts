import { Controller, Get, HttpStatus, Res } from "@nestjs/common";
import { ApiTags } from "@nestjs/swagger";
import { SkipThrottle } from "@nestjs/throttler";
import type { FastifyReply } from "fastify";
import { DatabaseService } from "../database/database.service";

@Controller("health")
@ApiTags("health")
export class HealthController {
  constructor(private readonly db: DatabaseService) {}

  @Get()
  @SkipThrottle()
  async check(@Res({ passthrough: true }) reply: FastifyReply) {
    try {
      await this.db.query("SELECT 1");
      return { ok: true, db: "up" as const };
    } catch {
      reply.status(HttpStatus.SERVICE_UNAVAILABLE);
      return { ok: false, db: "down" as const };
    }
  }
}
