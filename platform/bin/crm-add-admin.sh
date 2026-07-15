#!/usr/bin/env bash
# Add a Devuko CRM admin user via parameterized Node script (scrypt hashing).
#
# Usage:
#   bash platform/bin/crm-add-admin.sh EMAIL PASSWORD [DISPLAY_NAME]
set -euo pipefail

ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/../.." && pwd)"
API_DIR="$ROOT/apps/api"

EMAIL="${1:-}"
PASSWORD="${2:-}"
DISPLAY_NAME="${3:-CRM Admin}"

if [[ -z "$EMAIL" || -z "$PASSWORD" ]]; then
  echo "Usage: $0 EMAIL PASSWORD [DISPLAY_NAME]" >&2
  exit 1
fi

if [[ -f "$API_DIR/.env" ]]; then
  export CRM_ENV_FILE="$API_DIR/.env"
fi

exec node "$API_DIR/scripts/crm-add-admin.mjs" "$EMAIL" "$PASSWORD" "$DISPLAY_NAME"
