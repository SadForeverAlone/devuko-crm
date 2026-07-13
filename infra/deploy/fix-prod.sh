#!/usr/bin/env bash
# Repair CRM after bootstrap issues (API crash, selfpact overlap). Run as root.
set -euo pipefail

SRC="${1:-/home/sherli/sites/crm.devuko.ru/repo}"
DEST="/srv/sites/crm.devuko.ru/repo"
DOMAIN="crm.devuko.ru"
SELFPACT="/srv/sites/selfpact.ru/repo"

if [[ "$(id -u)" -ne 0 ]]; then
  echo "Run as root" >&2
  exit 1
fi

echo "==> sync fixes"
rsync -a --delete \
  --exclude node_modules --exclude dist --exclude .git --exclude tsconfig.tsbuildinfo \
  "$SRC/" "$DEST/"
chown -R sherli:selfpact "$DEST"
chmod +x "$DEST/infra/deploy/"*.sh "$DEST/infra/nginx/sync-nginx.sh"

echo "==> rebuild devuko-crm stack (isolated project)"
cd "$DEST/docker"
docker compose --env-file "$DEST/apps/api/.env" -p devuko-crm -f docker-compose.yml build api web --no-cache
docker compose --env-file "$DEST/apps/api/.env" -p devuko-crm -f docker-compose.yml up -d

echo "==> restore selfpact stack"
if [[ -d "$SELFPACT/docker" ]]; then
  cd "$SELFPACT/docker"
  docker compose --env-file "$SELFPACT/apps/backend/.env" -p docker -f docker-compose.yml up -d postgres redis backend web --build
  docker restart selfpact-backend || true
fi

echo "==> nginx (HTTP serve until TLS cert exists)"
mkdir -p /var/www/certbot "$DEST/apps/web/dist"
cp "$DEST/infra/nginx/devuko-crm-locations.inc" /etc/nginx/sites-available/
if [[ -f "/etc/letsencrypt/live/${DOMAIN}/fullchain.pem" ]]; then
  cp "$DEST/infra/nginx/devuko-crm-production-http.conf" /etc/nginx/sites-available/
  cp "$DEST/infra/nginx/devuko-crm-production-https.conf" /etc/nginx/sites-available/
  ln -sf /etc/nginx/sites-available/devuko-crm-production-http.conf /etc/nginx/sites-enabled/
  ln -sf /etc/nginx/sites-available/devuko-crm-production-https.conf /etc/nginx/sites-enabled/
else
  cp "$DEST/infra/nginx/devuko-crm-production-http-bootstrap.conf" /etc/nginx/sites-available/
  ln -sf /etc/nginx/sites-available/devuko-crm-production-http-bootstrap.conf /etc/nginx/sites-enabled/
  echo "WARN: no TLS cert for ${DOMAIN} — add DNS A record, then:"
  echo "  certbot certonly --webroot -w /var/www/certbot -d ${DOMAIN}"
  echo "  cp .../devuko-crm-production-http.conf + https.conf to sites-enabled && nginx -t && systemctl reload nginx"
fi

staging=$(mktemp -d)
docker cp devuko-crm-web:/usr/share/nginx/html/. "$staging/"
cp -a "$staging/." "$DEST/apps/web/dist/"
chmod -R a+rX "$DEST/apps/web/dist"
rm -rf "$staging"

nginx -t
systemctl reload nginx

echo ""
echo "==> status"
docker ps --filter name=devuko-crm --format 'table {{.Names}}\t{{.Status}}\t{{.Ports}}'
docker ps --filter name=selfpact --format 'table {{.Names}}\t{{.Status}}\t{{.Ports}}'
curl -sS -o /dev/null -w "CRM API: %{http_code}\n" http://127.0.0.1:8095/crm-auth/login -X POST -H 'Content-Type: application/json' -d '{"login":"x","password":"y"}' || true
curl -sS -o /dev/null -w "Selfpact: %{http_code}\n" http://127.0.0.1:8080/health || true
