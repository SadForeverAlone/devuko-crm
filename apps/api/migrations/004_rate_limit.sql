-- Rate-limit store for @nestjs/throttler (shared across API replicas).

CREATE TABLE IF NOT EXISTS "CrmRateLimit" (
  "key" TEXT PRIMARY KEY,
  "hits" INTEGER NOT NULL DEFAULT 0,
  "expiresAt" BIGINT NOT NULL,
  "isBlocked" BOOLEAN NOT NULL DEFAULT FALSE,
  "blockExpiresAt" BIGINT NOT NULL DEFAULT 0
);
