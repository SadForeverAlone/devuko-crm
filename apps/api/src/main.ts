import "dotenv/config";
import cookie from "@fastify/cookie";
import helmet from "@fastify/helmet";
import { ValidationPipe } from "@nestjs/common";
import { NestFactory } from "@nestjs/core";
import { FastifyAdapter, NestFastifyApplication } from "@nestjs/platform-fastify";
import { DocumentBuilder, SwaggerModule } from "@nestjs/swagger";
import { ProductionExceptionFilter } from "./common/production-exception.filter";
import { validateProductionSecrets } from "./common/production-secrets.util";
import { registerRequestId } from "./common/request-id.plugin";
import { AppModule } from "./modules/app.module";

function resolveCorsOrigins(): boolean | string[] {
  const raw = process.env.CORS_ORIGINS?.trim();
  const fromEnv = raw
    ? raw
        .split(",")
        .map((value) => value.trim())
        .filter(Boolean)
    : [];
  if (fromEnv.length > 0) {
    return fromEnv;
  }
  const publicUrl = process.env.VITE_PUBLIC_URL?.trim();
  if (publicUrl) {
    return [publicUrl];
  }
  return false;
}

async function bootstrap() {
  validateProductionSecrets();

  const app = await NestFactory.create<NestFastifyApplication>(
    AppModule,
    new FastifyAdapter({ trustProxy: true })
  );

  await app.register(cookie);

  await registerRequestId(app);

  await app.register(helmet, {
    contentSecurityPolicy: false,
    crossOriginOpenerPolicy: { policy: "same-origin" },
    crossOriginResourcePolicy: { policy: "same-origin" },
  });

  const isProd = process.env.NODE_ENV === "production";
  app.enableCors({
    origin: isProd ? resolveCorsOrigins() : true,
    credentials: true,
  });

  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
    })
  );
  app.useGlobalFilters(new ProductionExceptionFilter());

  const swaggerEnabled =
    process.env.SWAGGER_ENABLED === "true" || process.env.NODE_ENV !== "production";
  if (swaggerEnabled) {
    const document = SwaggerModule.createDocument(
      app,
      new DocumentBuilder()
        .setTitle("Devuko CRM API")
        .setDescription("Platform CRM API and workspace proxy")
        .setVersion("0.1.0")
        .addCookieAuth("devuko_crm_session")
        .build()
    );
    SwaggerModule.setup("docs", app, document);
  }

  const port = Number(process.env.PORT || 8095);
  const defaultHost = process.env.NODE_ENV === "production" ? "127.0.0.1" : "0.0.0.0";
  const host = process.env.BIND_HOST?.trim() || defaultHost;
  await app.listen(port, host);
}

bootstrap();
