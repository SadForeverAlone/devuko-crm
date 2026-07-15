#!/usr/bin/env bash
# One-time production bootstrap for crm.devuko.ru (run as root on the server).
set -euo pipefail

SRC="${1:-/home/sherli/sites/crm.devuko.ru/repo}"
DEST="/srv/sites/crm.devuko.ru/repo"
DOMAIN="crm.devuko.ru"

if [[ "$(id -u)" -ne 0 ]]; then
  echo "Run as root" >&2
  exit 1
fi

echo "==> create $DEST"
mkdir -p "$DEST"
chown -R sherli:selfpact /srv/sites/crm.devuko.ru

echo "==> sync repo from $SRC"
rsync -a --delete \
  --exclude node_modules --exclude dist --exclude .git --exclude tsconfig.tsbuildinfo \
  "$SRC/" "$DEST/"
chown -R sherli:selfpact "$DEST"
chmod +x "$DEST/infra/deploy/deploy.sh" "$DEST/infra/nginx/sync-nginx.sh"

ENV_FILE="$DEST/apps/api/.env"
if [[ ! -f "$ENV_FILE" ]]; then
  echo "==> create $ENV_FILE"
  PROXY_SECRET=$(openssl rand -hex 24)
  JWT_SECRET=$(openssl rand -hex 32)
  PG_PASS=$(openssl rand -hex 16)
  cat > "$ENV_FILE" <<EOF
PORT=8095
POSTGRES_USER=devuko
POSTGRES_PASSWORD=${PG_PASS}
POSTGRES_DB=devuko_crm
DATABASE_URL=postgresql://devuko:${PG_PASS}@postgres:5432/devuko_crm
JWT_SECRET=${JWT_SECRET}
DEVUKO_PROXY_SECRET=${PROXY_SECRET}
CRM_ADMIN_EMAIL=admin@devuko.ru
CRM_ADMIN_PASSWORD=
PLATFORM_REPO_ROOT=${DEST}
SELFPACT_WORKSPACE_DOMAIN=selfpact.ru
SELFPACT_WORKSPACE_API_BASE=https://selfpact.ru
SELFPACT_REPO_URL=git@github.com:SadForeverAlone/selfpact.git
EOF
  chown sherli:selfpact "$ENV_FILE"
  chmod 600 "$ENV_FILE"
  echo "CRM admin: create with  bash platform/bin/crm-add-admin.sh admin@devuko.ru YOUR_PASSWORD"
  echo "DEVUKO_PROXY_SECRET written to $ENV_FILE (not echoed)"
  echo "Add the same DEVUKO_PROXY_SECRET to /srv/sites/selfpact.ru/repo/apps/backend/.env"
fi

SELFPACT_ENV="/srv/sites/selfpact.ru/repo/apps/backend/.env"
if [[ -f "$SELFPACT_ENV" ]] && ! grep -q '^DEVUKO_PROXY_SECRET=' "$SELFPACT_ENV"; then
  PROXY_SECRET=$(grep '^DEVUKO_PROXY_SECRET=' "$ENV_FILE" | cut -d= -f2-)
  echo "DEVUKO_PROXY_SECRET=${PROXY_SECRET}" >> "$SELFPACT_ENV"
  echo "==> appended DEVUKO_PROXY_SECRET to selfpact .env (restart selfpact-backend)"
fi

echo "==> docker stack"
cd "$DEST/docker"
docker compose --env-file "$DEST/apps/api/.env" -p devuko-crm -f docker-compose.yml up -d --build

echo "==> restore selfpact stack (isolated project)"
if [[ -d /srv/sites/selfpact.ru/repo/docker ]]; then
  cd /srv/sites/selfpact.ru/repo/docker
  docker compose --env-file /srv/sites/selfpact.ru/repo/apps/backend/.env -p docker -f docker-compose.yml up -d postgres redis backend web
fi

echo "==> nginx (HTTP until cert exists)"
mkdir -p /var/www/certbot
cp "$DEST/infra/nginx/devuko-crm-locations.inc" /etc/nginx/sites-available/
if [[ -f "/etc/letsencrypt/live/${DOMAIN}/fullchain.pem" ]]; then
  cp "$DEST/infra/nginx/devuko-crm-production-http.conf" /etc/nginx/sites-available/
  cp "$DEST/infra/nginx/devuko-crm-production-https.conf" /etc/nginx/sites-available/
  ln -sf /etc/nginx/sites-available/devuko-crm-production-http.conf /etc/nginx/sites-enabled/
  ln -sf /etc/nginx/sites-available/devuko-crm-production-https.conf /etc/nginx/sites-enabled/
else
  cp "$DEST/infra/nginx/devuko-crm-production-http-bootstrap.conf" /etc/nginx/sites-available/
  ln -sf /etc/nginx/sites-available/devuko-crm-production-http-bootstrap.conf /etc/nginx/sites-enabled/
fi

echo "==> sync static"
staging=$(mktemp -d)
docker cp devuko-crm-web:/usr/share/nginx/html/. "$staging/"
mkdir -p "$DEST/apps/web/dist"
cp -a "$staging/." "$DEST/apps/web/dist/"
chmod -R a+rX "$DEST/apps/web/dist"
rm -rf "$staging"

nginx -t
systemctl reload nginx

if [[ ! -f "/etc/letsencrypt/live/${DOMAIN}/fullchain.pem" ]] && command -v certbot >/dev/null 2>&1; then
  echo "==> obtain TLS certificate (requires public DNS A record)"
  certbot certonly --webroot -w /var/www/certbot -d "$DOMAIN" --non-interactive --agree-tos -m admin@devuko.ru && \
    cp "$DEST/infra/nginx/devuko-crm-production-http.conf" /etc/nginx/sites-available/ && \
    cp "$DEST/infra/nginx/devuko-crm-production-https.conf" /etc/nginx/sites-available/ && \
    ln -sf /etc/nginx/sites-available/devuko-crm-production-http.conf /etc/nginx/sites-enabled/ && \
    ln -sf /etc/nginx/sites-available/devuko-crm-production-https.conf /etc/nginx/sites-enabled/ && \
    nginx -t && systemctl reload nginx || \
    echo "WARN: certbot failed — add DNS A record for ${DOMAIN}, then re-run certbot"
fi

echo ""
echo "Bootstrap finished."
echo "  https://${DOMAIN}"
echo "  API health: curl -sS http://127.0.0.1:8095/admin/crm/workspaces (needs JWT)"
docker ps --filter name=devuko-crm --format 'table {{.Names}}\t{{.Status}}\t{{.Ports}}'
