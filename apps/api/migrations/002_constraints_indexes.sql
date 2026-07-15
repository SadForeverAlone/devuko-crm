-- Referential integrity and lookup indexes (idempotent).

CREATE INDEX IF NOT EXISTS "CrmAuthOtp_active_email_idx"
  ON "CrmAuthOtp" (lower("email"), "createdAt" DESC)
  WHERE "consumedAt" IS NULL;

CREATE INDEX IF NOT EXISTS "CrmSite_status_idx"
  ON "CrmSite" ("status");

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'CrmAuthOtp_adminId_fkey'
  ) THEN
    ALTER TABLE "CrmAuthOtp"
      ADD CONSTRAINT "CrmAuthOtp_adminId_fkey"
      FOREIGN KEY ("adminId") REFERENCES "CrmAdmin"("id")
      ON DELETE SET NULL;
  END IF;
END $$;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'CrmPlatformAudit_actorAdminId_fkey'
  ) THEN
    ALTER TABLE "CrmPlatformAudit"
      ADD CONSTRAINT "CrmPlatformAudit_actorAdminId_fkey"
      FOREIGN KEY ("actorAdminId") REFERENCES "CrmAdmin"("id")
      ON DELETE SET NULL;
  END IF;
END $$;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'CrmSite_workspaceId_fkey'
  ) THEN
    ALTER TABLE "CrmSite"
      ADD CONSTRAINT "CrmSite_workspaceId_fkey"
      FOREIGN KEY ("workspaceId") REFERENCES "CrmWorkspace"("id")
      ON DELETE CASCADE;
  END IF;
END $$;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'CrmWorkspace_siteId_fkey'
  ) THEN
    ALTER TABLE "CrmWorkspace"
      ADD CONSTRAINT "CrmWorkspace_siteId_fkey"
      FOREIGN KEY ("siteId") REFERENCES "CrmSite"("id")
      ON DELETE SET NULL;
  END IF;
END $$;
