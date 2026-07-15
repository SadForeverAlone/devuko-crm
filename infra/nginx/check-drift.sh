#!/usr/bin/env bash
# Compare host nginx configs with repo. Exit 1 when drift detected.
set -euo pipefail

ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/../.." && pwd)"
NGINX_DIR="$ROOT/infra/nginx"
DRIFT=0

for f in \
  devuko-crm-security-headers.inc \
  devuko-crm-locations.inc \
  devuko-crm-production-http.conf \
  devuko-crm-production-https.conf
do
  live="/etc/nginx/sites-available/$f"
  repo="$NGINX_DIR/$f"
  if [[ ! -f "$live" ]]; then
    echo "MISSING on host: $live" >&2
    DRIFT=1
    continue
  fi
  if ! diff -q "$live" "$repo" >/dev/null 2>&1; then
    echo "DRIFT: $f differs from repo" >&2
    diff -u "$live" "$repo" | head -20 >&2 || true
    DRIFT=1
  fi
done

if [[ "$DRIFT" -ne 0 ]]; then
  echo "Run: sudo bash $ROOT/infra/nginx/sync-nginx.sh" >&2
  echo "  or: sudo /home/sherli/web/selfpact.ru/infra/nginx/sync-nginx.sh" >&2
  exit 1
fi

echo "Host nginx matches repo."
