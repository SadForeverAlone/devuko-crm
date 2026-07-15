import cookie from "@fastify/cookie";
import { Controller, Inject, Post, ValidationPipe } from "@nestjs/common";
import { APP_GUARD } from "@nestjs/core";
import { Test } from "@nestjs/testing";
import { ThrottlerGuard, ThrottlerModule } from "@nestjs/throttler";
import { FastifyAdapter, NestFastifyApplication } from "@nestjs/platform-fastify";
import { CsrfGuard } from "../common/csrf.guard";
import { DatabaseService } from "../modules/database/database.service";

@Controller("integration-probe")
class IntegrationProbeController {
  constructor(@Inject(DatabaseService) private readonly db: DatabaseService) {}

  @Post()
  async mutate() {
    await this.db.query("SELECT 1");
    return { ok: true as const };
  }
}

export async function createIntegrationTestApp(): Promise<NestFastifyApplication> {
  const moduleRef = await Test.createTestingModule({
    imports: [ThrottlerModule.forRoot([{ ttl: 60_000, limit: 10_000 }])],
    controllers: [IntegrationProbeController],
    providers: [
      {
        provide: DatabaseService,
        useValue: { query: async () => ({ rows: [{ "?column?": 1 }] }) },
      },
      { provide: APP_GUARD, useClass: ThrottlerGuard },
      { provide: APP_GUARD, useClass: CsrfGuard },
    ],
  }).compile();

  const app = moduleRef.createNestApplication<NestFastifyApplication>(new FastifyAdapter({ trustProxy: true }));

  await app.register(cookie);
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
    })
  );

  await app.init();
  await app.getHttpAdapter().getInstance().ready();
  return app;
}
