-- Server-side CRM sessions for JWT revocation (logout, password change).

CREATE TABLE IF NOT EXISTS "CrmAuthSession" (
  "id" TEXT PRIMARY KEY,
  "adminId" TEXT NOT NULL REFERENCES "CrmAdmin"("id") ON DELETE CASCADE,
  "expiresAt" TIMESTAMP(3) NOT NULL,
  "revokedAt" TIMESTAMP(3),
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS "CrmAuthSession_adminId_idx"
  ON "CrmAuthSession" ("adminId");

CREATE INDEX IF NOT EXISTS "CrmAuthSession_expiresAt_idx"
  ON "CrmAuthSession" ("expiresAt");
