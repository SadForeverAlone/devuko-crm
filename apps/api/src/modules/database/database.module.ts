import { Module, Global } from "@nestjs/common";
import { DatabaseSchemaService } from "./database-schema.service";
import { DatabaseService } from "./database.service";

@Global()
@Module({
  providers: [DatabaseService, DatabaseSchemaService],
  exports: [DatabaseService, DatabaseSchemaService],
})
export class DatabaseModule {}
