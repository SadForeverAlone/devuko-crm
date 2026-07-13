#!/usr/bin/env bash
# Install provided TLS certs for crm.devuko.ru and enable HTTPS nginx.
# Usage (as root):
#   bash infra/nginx/install-ssl.sh /path/to/fullchain.pem /path/to/privkey.pem
set -euo pipefail

ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/../.." && pwd)"
SSL_DIR="/etc/nginx/ssl/crm.devuko.ru"
FULLCHAIN="${1:-}"
PRIVKEY="${2:-}"

if [[ "$(id -u)" -ne 0 ]]; then
  echo "Run as root" >&2
  exit 1
fi

if [[ -z "$FULLCHAIN" || -z "$PRIVKEY" ]]; then
  echo "Usage: $0 /path/to/fullchain.pem /path/to/privkey.pem" >&2
  exit 1
fi

if [[ ! -f "$FULLCHAIN" || ! -f "$PRIVKEY" ]]; then
  echo "Certificate files not found" >&2
  exit 1
fi

echo "==> install certs to $SSL_DIR"
mkdir -p "$SSL_DIR"
cp "$FULLCHAIN" "$SSL_DIR/fullchain.pem"
cp "$PRIVKEY" "$SSL_DIR/privkey.pem"
chmod 755 "$SSL_DIR"
chmod 644 "$SSL_DIR/fullchain.pem"
chmod 600 "$SSL_DIR/privkey.pem"

echo "==> nginx configs"
cp "$ROOT/infra/nginx/devuko-crm-locations.inc" /etc/nginx/sites-available/
cp "$ROOT/infra/nginx/devuko-crm-production-http.conf" /etc/nginx/sites-available/
cp "$ROOT/infra/nginx/devuko-crm-production-https.conf" /etc/nginx/sites-available/
cd /etc/nginx/sites-enabled
ln -sf /etc/nginx/sites-available/devuko-crm-production-http.conf .
ln -sf /etc/nginx/sites-available/devuko-crm-production-https.conf .
rm -f devuko-crm-production-http-bootstrap.conf

echo "==> sync static (if CRM web container is running)"
if docker ps -qf name=^devuko-crm-web$ | grep -q .; then
  staging=$(mktemp -d)
  docker cp devuko-crm-web:/usr/share/nginx/html/. "$staging/"
  mkdir -p "$ROOT/apps/web/dist"
  cp -a "$staging/." "$ROOT/apps/web/dist/"
  chmod -R a+rX "$ROOT/apps/web/dist"
  rm -rf "$staging"
fi

nginx -t
systemctl reload nginx
echo "HTTPS enabled for crm.devuko.ru"
