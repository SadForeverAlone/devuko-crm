#!/usr/bin/env bash
# Sync Devuko CRM nginx configs from repo to /etc/nginx and reload.
set -euo pipefail

ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/../.." && pwd)"
NGINX_DIR="$ROOT/infra/nginx"

if [[ "$(id -u)" -ne 0 ]]; then
  echo "Run as root: sudo bash $0" >&2
  exit 1
fi

if ! command -v nginx >/dev/null 2>&1; then
  echo "nginx is not installed" >&2
  exit 1
fi

echo "==> sites-available"
for f in \
  devuko-crm-security-headers.inc \
  devuko-crm-locations.inc \
  devuko-crm-production-http.conf \
  devuko-crm-production-https.conf
do
  cp "$NGINX_DIR/$f" "/etc/nginx/sites-available/$f"
done

echo "==> sites-enabled symlinks"
cd /etc/nginx/sites-enabled
for f in devuko-crm-production-http.conf devuko-crm-production-https.conf; do
  ln -sf "/etc/nginx/sites-available/$f" "$f"
done

echo "==> nginx -t"
nginx -t

echo "==> reload nginx"
systemctl reload nginx

echo "Devuko CRM nginx configs synced."
