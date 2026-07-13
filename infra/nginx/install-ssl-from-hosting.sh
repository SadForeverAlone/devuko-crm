#!/usr/bin/env bash
# Install hosting-provided SSL for crm.devuko.ru.
# Expects in DIR (default /root/crm-ssl):
#   certificate.crt      — domain cert
#   certificate_ca.crt   — CA chain / root
#   certificate.key        — private key
#   certificate.csr        — ignored
#
# Usage (as root):
#   bash infra/nginx/install-ssl-from-hosting.sh [/path/to/dir]
set -euo pipefail

DIR="${1:-/root/crm-ssl}"
ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/../.." && pwd)"

CERT="$DIR/certificate.crt"
CA="$DIR/certificate_ca.crt"
KEY="$DIR/certificate.key"

for f in "$CERT" "$CA" "$KEY"; do
  if [[ ! -f "$f" ]]; then
    echo "Missing: $f" >&2
    echo "" >&2
    echo "Upload from Windows (PowerShell):" >&2
    echo "  scp certificate.crt certificate_ca.crt certificate.key root@103.88.242.27:/root/crm-ssl/" >&2
    exit 1
  fi
done

WORK="$(mktemp -d)"
trap 'rm -rf "$WORK"' EXIT

# Domain cert first, then CA chain (standard for nginx)
cat "$CERT" "$CA" > "$WORK/fullchain.pem"
cp "$KEY" "$WORK/privkey.pem"

bash "$ROOT/infra/nginx/install-ssl.sh" "$WORK/fullchain.pem" "$WORK/privkey.pem"

echo ""
openssl x509 -in "$CERT" -noout -subject -dates 2>/dev/null || true
