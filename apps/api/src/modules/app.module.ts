import { Module } from "@nestjs/common";
import { ConfigModule } from "@nestjs/config";
import { ThrottlerGuard, ThrottlerModule } from "@nestjs/throttler";
import { APP_GUARD } from "@nestjs/core";
import { CsrfGuard } from "../common/csrf.guard";
import { PostgresThrottlerStorage } from "../common/postgres-throttler.storage";
import { DatabaseModule } from "./database/database.module";
import { DatabaseService } from "./database/database.service";
import { HealthModule } from "./health/health.module";
import { CrmModule } from "./crm/crm.module";

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    DatabaseModule,
    ThrottlerModule.forRootAsync({
      imports: [DatabaseModule],
      inject: [DatabaseService],
      useFactory: (db: DatabaseService) => ({
        throttlers: [
          { name: "default", ttl: 60_000, limit: 120 },
          { name: "auth", ttl: 60_000, limit: 10 },
          { name: "deploy", ttl: 300_000, limit: 3 },
        ],
        storage: new PostgresThrottlerStorage(db),
      }),
    }),
    HealthModule,
    CrmModule,
  ],
  providers: [
    {
      provide: APP_GUARD,
      useClass: ThrottlerGuard,
    },
    {
      provide: APP_GUARD,
      useClass: CsrfGuard,
    },
  ],
})
export class AppModule {}
