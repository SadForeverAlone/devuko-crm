import "dotenv/config";
import { Module } from "@nestjs/common";
import { ConfigModule } from "@nestjs/config";
import { DatabaseModule } from "./database/database.module";
import { CrmModule } from "./crm/crm.module";

@Module({
  imports: [ConfigModule.forRoot({ isGlobal: true }), DatabaseModule, CrmModule],
})
export class AppModule {}
