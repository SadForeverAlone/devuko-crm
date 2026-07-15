import cookie from "@fastify/cookie";
import { ValidationPipe } from "@nestjs/common";
import { NestFactory } from "@nestjs/core";
import { FastifyAdapter, NestFastifyApplication } from "@nestjs/platform-fastify";

const REQUIRED = [
  "DATABASE_URL",
  "JWT_SECRET",
  "DEVUKO_PROXY_SECRET",
  "CRM_ADMIN_EMAIL",
  "CRM_ADMIN_PASSWORD",
] as const;

export function isDbIntegrationEnabled(): boolean {
  return process.env.CRM_DB_INTEGRATION === "true";
}

export function applyDbIntegrationEnv() {
  process.env.NODE_ENV = "test";
  process.env.AUTH_OTP_ECHO = "true";
  process.env.AUTH_PASSWORD_LOGIN = "false";
  process.env.AUTH_RETURN_TOKEN = "false";
  process.env.DEV_ALLOW_WEAK_JWT = "true";
  process.env.DEVUKO_CRM_DEPLOY_ENABLED = "false";
  if (!process.env.DATABASE_URL?.trim()) {
    process.env.DATABASE_URL =
      "postgresql://devuko:ci-test-postgres-password@127.0.0.1:5432/devuko_crm";
  }
  process.env.JWT_SECRET =
    process.env.JWT_SECRET?.trim() || "ci-test-jwt-secret-with-32-characters-min";
  process.env.DEVUKO_PROXY_SECRET =
    process.env.DEVUKO_PROXY_SECRET?.trim() || "ci-test-proxy-secret-with-32-chars-min";
  process.env.CRM_ADMIN_EMAIL = process.env.CRM_ADMIN_EMAIL?.trim() || "ci-admin@devuko.test";
  process.env.CRM_ADMIN_PASSWORD = process.env.CRM_ADMIN_PASSWORD?.trim() || "CiAdminPassw0rd!";
  process.env.POSTGRES_PASSWORD = process.env.POSTGRES_PASSWORD?.trim() || "ci-test-postgres-password";
}

export function assertDbIntegrationEnv() {
  applyDbIntegrationEnv();
  for (const key of REQUIRED) {
    if (!process.env[key]?.trim()) {
      throw new Error(`Missing ${key} for DB integration tests`);
    }
  }
}

export async function createDbIntegrationApp(): Promise<NestFastifyApplication> {
  assertDbIntegrationEnv();
  const { AppModule } = await import("../modules/app.module");
  const app = await NestFactory.create<NestFastifyApplication>(
    AppModule,
    new FastifyAdapter({ trustProxy: true }),
    { logger: false }
  );
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

export function parseSetCookie(headers: string[]): Record<string, string> {
  const cookies: Record<string, string> = {};
  for (const header of headers) {
    const part = header.split(";")[0]?.trim();
    if (!part) continue;
    const eq = part.indexOf("=");
    if (eq <= 0) continue;
    cookies[part.slice(0, eq)] = part.slice(eq + 1);
  }
  return cookies;
}
