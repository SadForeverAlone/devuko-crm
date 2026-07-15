-- Devuko CRM schema bootstrap (idempotent).
-- Applied once at startup via DatabaseSchemaService; full Prisma migration path is future work.

CREATE EXTENSION IF NOT EXISTS pgcrypto;

CREATE TABLE IF NOT EXISTS "CrmSchemaMeta" (
  "id" TEXT PRIMARY KEY,
  "appliedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS "CrmAdmin" (
  "id" TEXT PRIMARY KEY,
  "email" TEXT UNIQUE NOT NULL,
  "passwordHash" TEXT NOT NULL,
  "displayName" TEXT NOT NULL,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP
);

ALTER TABLE "CrmAdmin" ADD COLUMN IF NOT EXISTS "login" TEXT;
ALTER TABLE "CrmAdmin" ADD COLUMN IF NOT EXISTS "firstName" TEXT;
ALTER TABLE "CrmAdmin" ADD COLUMN IF NOT EXISTS "lastName" TEXT;

CREATE UNIQUE INDEX IF NOT EXISTS "CrmAdmin_login_lower_idx"
  ON "CrmAdmin" (lower("login"));

CREATE TABLE IF NOT EXISTS "CrmAuthOtp" (
  "id" TEXT PRIMARY KEY,
  "email" TEXT NOT NULL,
  "adminId" TEXT,
  "codeHash" TEXT NOT NULL,
  "expiresAt" TIMESTAMP(3) NOT NULL,
  "attempts" INTEGER NOT NULL DEFAULT 0,
  "consumedAt" TIMESTAMP(3),
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP
);

ALTER TABLE "CrmAuthOtp" ADD COLUMN IF NOT EXISTS "adminId" TEXT;

CREATE INDEX IF NOT EXISTS "CrmAuthOtp_email_created_idx"
  ON "CrmAuthOtp" (lower("email"), "createdAt" DESC);

CREATE TABLE IF NOT EXISTS "CrmPlatformAudit" (
  "id" TEXT PRIMARY KEY,
  "actorAdminId" TEXT NULL,
  "actorEmail" TEXT NULL,
  "action" TEXT NOT NULL,
  "target" TEXT NULL,
  "detail" TEXT NULL,
  "ok" BOOLEAN NOT NULL DEFAULT TRUE,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP
);

ALTER TABLE "CrmPlatformAudit" ADD COLUMN IF NOT EXISTS "actorName" TEXT NULL;

CREATE INDEX IF NOT EXISTS "CrmPlatformAudit_createdAt_idx"
  ON "CrmPlatformAudit" ("createdAt" DESC);

CREATE TABLE IF NOT EXISTS "CrmWorkspace" (
  "id" TEXT PRIMARY KEY,
  "slug" TEXT UNIQUE NOT NULL,
  "label" TEXT NOT NULL,
  "kind" TEXT NOT NULL,
  "siteId" TEXT NULL UNIQUE,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS "CrmSite" (
  "id" TEXT PRIMARY KEY,
  "domain" TEXT UNIQUE NOT NULL,
  "slug" TEXT UNIQUE NOT NULL,
  "repo" TEXT NULL,
  "status" TEXT NOT NULL DEFAULT 'pending',
  "prodPath" TEXT NULL,
  "apiBaseUrl" TEXT NOT NULL,
  "apiPort" INTEGER NULL,
  "webPort" INTEGER NULL,
  "extraDomains" JSONB NULL,
  "devConfig" JSONB NULL,
  "provisionLog" JSONB NULL,
  "workspaceId" TEXT UNIQUE NOT NULL,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP
);

ALTER TABLE "CrmSite" ADD COLUMN IF NOT EXISTS "apiBaseUrl" TEXT;
