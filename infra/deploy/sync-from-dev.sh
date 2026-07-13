#!/usr/bin/env bash
set -euo pipefail

DEV_ROOT="${DEVUKO_CRM_DEV_ROOT:-/home/sherli/sites/crm.devuko.ru/repo}"
PROD_ROOT="${DEVUKO_CRM_PROD_ROOT:-/srv/sites/crm.devuko.ru/repo}"

if [[ ! -d "$DEV_ROOT" ]]; then
  echo "Dev repo not found: $DEV_ROOT" >&2
  exit 1
fi
if [[ ! -d "$PROD_ROOT" ]]; then
  echo "Prod repo not found: $PROD_ROOT" >&2
  exit 1
fi

echo "==> rsync dev -> prod ($DEV_ROOT -> $PROD_ROOT)"
rsync -a --delete \
  --exclude .git \
  --exclude node_modules \
  --exclude apps/api/node_modules \
  --exclude apps/web/node_modules \
  --exclude apps/web/dist \
  --exclude apps/api/dist \
  --exclude .env \
  "$DEV_ROOT/" "$PROD_ROOT/"

if [[ "${RUN_DEPLOY:-1}" == "1" ]]; then
  echo "==> deploy on prod"
  DEVUKO_CRM_REPO_ROOT="$PROD_ROOT" bash "$PROD_ROOT/infra/deploy/deploy.sh"
fi

echo "Sync finished."
