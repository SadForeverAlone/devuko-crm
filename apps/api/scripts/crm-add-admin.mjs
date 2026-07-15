#!/usr/bin/env node
/**
 * Safe CRM admin bootstrap — parameterized SQL + scrypt password hashing.
 * Usage: node scripts/crm-add-admin.mjs EMAIL PASSWORD [DISPLAY_NAME]
 */
import { randomBytes, scryptSync } from "node:crypto";
import { readFileSync, existsSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import pg from "pg";

const __dirname = dirname(fileURLToPath(import.meta.url));
const root = join(__dirname, "..");

function loadEnvFile(path) {
  if (!existsSync(path)) return;
  for (const line of readFileSync(path, "utf8").split("\n")) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith("#")) continue;
    const eq = trimmed.indexOf("=");
    if (eq <= 0) continue;
    const key = trimmed.slice(0, eq).trim();
    let value = trimmed.slice(eq + 1).trim();
    if (
      (value.startsWith('"') && value.endsWith('"')) ||
      (value.startsWith("'") && value.endsWith("'"))
    ) {
      value = value.slice(1, -1);
    }
    if (process.env[key] === undefined) {
      process.env[key] = value;
    }
  }
}

function hashPassword(password) {
  const salt = randomBytes(16).toString("hex");
  const derived = scryptSync(password, salt, 64).toString("hex");
  return `scrypt:${salt}:${derived}`;
}

function normalizeEmail(email) {
  return email.trim().toLowerCase();
}

function resolveDatabaseUrl() {
  let url = process.env.DATABASE_URL?.trim();
  if (!url) {
    loadEnvFile(process.env.CRM_ENV_FILE?.trim() || join(root, ".env"));
    url = process.env.DATABASE_URL?.trim();
  }
  if (!url) {
    console.error("DATABASE_URL not set. Export it or create apps/api/.env");
    process.exit(1);
  }
  return url.replace("@postgres:", "@127.0.0.1:5440");
}

async function main() {
  const email = process.argv[2];
  const password = process.argv[3];
  const displayName = process.argv[4]?.trim() || "CRM Admin";

  if (!email || !password) {
    console.error("Usage: node scripts/crm-add-admin.mjs EMAIL PASSWORD [DISPLAY_NAME]");
    process.exit(1);
  }

  if (password.length < 8) {
    console.error("Password must be at least 8 characters");
    process.exit(1);
  }

  const emailLc = normalizeEmail(email);
  const id = `admin_${Date.now()}_${process.pid}`;
  const hash = hashPassword(password);
  const client = new pg.Client({ connectionString: resolveDatabaseUrl() });

  await client.connect();
  try {
    await client.query(`
      CREATE TABLE IF NOT EXISTS "CrmAdmin" (
        "id" TEXT PRIMARY KEY,
        "email" TEXT UNIQUE NOT NULL,
        "passwordHash" TEXT NOT NULL,
        "displayName" TEXT NOT NULL,
        "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP
      )
    `);
    await client.query(`ALTER TABLE "CrmAdmin" ADD COLUMN IF NOT EXISTS "login" TEXT`);
    await client.query(`ALTER TABLE "CrmAdmin" ADD COLUMN IF NOT EXISTS "firstName" TEXT`);
    await client.query(`ALTER TABLE "CrmAdmin" ADD COLUMN IF NOT EXISTS "lastName" TEXT`);

    const existing = await client.query(
      `SELECT "id" FROM "CrmAdmin" WHERE lower("email") = $1 LIMIT 1`,
      [emailLc]
    );

    if (existing.rowCount && existing.rowCount > 0) {
      await client.query(
        `UPDATE "CrmAdmin"
         SET "passwordHash" = $1, "displayName" = $2
         WHERE lower("email") = $3`,
        [hash, displayName, emailLc]
      );
      console.log(`Updated admin: ${emailLc}`);
    } else {
      await client.query(
        `INSERT INTO "CrmAdmin" ("id", "email", "passwordHash", "displayName")
         VALUES ($1, $2, $3, $4)`,
        [id, emailLc, hash, displayName]
      );
      console.log(`Created admin: ${emailLc}`);
    }
  } finally {
    await client.end();
  }
}

main().catch((error) => {
  console.error(error instanceof Error ? error.message : error);
  process.exit(1);
});
