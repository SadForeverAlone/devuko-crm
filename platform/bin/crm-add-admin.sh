#!/usr/bin/env bash
# Add a Devuko CRM admin user directly in PostgreSQL (not via bootstrap .env).
#
# Usage:
#   bash platform/bin/crm-add-admin.sh EMAIL PASSWORD [DISPLAY_NAME]
#
# Reads DATABASE_URL from apps/api/.env (prod: /srv/sites/crm.devuko.ru/repo/apps/api/.env).
# Or set DATABASE_URL in the environment.
set -euo pipefail

ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/../.." && pwd)"
ENV_FILE="${CRM_ENV_FILE:-$ROOT/apps/api/.env}"

EMAIL="${1:-}"
PASSWORD="${2:-}"
DISPLAY_NAME="${3:-CRM Admin}"

if [[ -z "$EMAIL" || -z "$PASSWORD" ]]; then
  echo "Usage: $0 EMAIL PASSWORD [DISPLAY_NAME]" >&2
  exit 1
fi

EMAIL_LC="$(echo "$EMAIL" | tr '[:upper:]' '[:lower:]')"
ID="admin_$(date +%s)_$$"
HASH="$(printf '%s' "$PASSWORD" | sha256sum | awk '{print $1}')"

if [[ -f "$ENV_FILE" ]]; then
  set -a
  # shellcheck disable=SC1090
  source "$ENV_FILE"
  set +a
fi

if [[ -z "${DATABASE_URL:-}" ]]; then
  echo "DATABASE_URL not set. Export it or create $ENV_FILE" >&2
  exit 1
fi

# docker compose uses host "postgres"; from host use localhost:5440
HOST_URL="${DATABASE_URL/@postgres:/@127.0.0.1:5440}"

run_sql() {
  if command -v psql >/dev/null 2>&1; then
    psql "$HOST_URL" -v ON_ERROR_STOP=1 -c "$1"
    return
  fi
  if docker ps -qf name=^devuko-crm-postgres$ | grep -q .; then
    docker exec -i devuko-crm-postgres psql -U "${POSTGRES_USER:-devuko}" -d "${POSTGRES_DB:-devuko_crm}" -v ON_ERROR_STOP=1 -c "$1"
    return
  fi
  echo "Need psql or running devuko-crm-postgres container" >&2
  exit 1
}

run_sql 'CREATE TABLE IF NOT EXISTS "CrmAdmin" (
  "id" TEXT PRIMARY KEY,
  "email" TEXT UNIQUE NOT NULL,
  "passwordHash" TEXT NOT NULL,
  "displayName" TEXT NOT NULL,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP
);'

EXISTING="$(run_sql "SELECT \"id\" FROM \"CrmAdmin\" WHERE lower(\"email\") = '$EMAIL_LC' LIMIT 1;" 2>/dev/null | grep -E '^ admin_' || true)"
if [[ -n "$EXISTING" ]]; then
  run_sql "UPDATE \"CrmAdmin\" SET \"passwordHash\" = '$HASH', \"displayName\" = '$DISPLAY_NAME' WHERE lower(\"email\") = '$EMAIL_LC';"
  echo "Updated admin: $EMAIL_LC"
else
  run_sql "INSERT INTO \"CrmAdmin\" (\"id\", \"email\", \"passwordHash\", \"displayName\") VALUES ('$ID', '$EMAIL_LC', '$HASH', '$DISPLAY_NAME');"
  echo "Created admin: $EMAIL_LC"
fi
