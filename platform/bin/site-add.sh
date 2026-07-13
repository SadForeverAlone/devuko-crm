#!/usr/bin/env bash
# Register and scaffold a new production site.
# Usage: sudo site-add.sh <domain> [git-url]
# Example: sudo site-add.sh blog.example.com git@github.com:org/blog.git
set -euo pipefail

DOMAIN="${1:?domain}"
GIT_URL="${2:-}"
PROD_ROOT="/srv/sites/${DOMAIN}"
PLATFORM_ROOT="${PLATFORM_ROOT:-/opt/platform}"

require_root() { [[ "$(id -u)" -eq 0 ]] || { echo "sudo required" >&2; exit 1; }; }
require_root

mkdir -p "$PROD_ROOT"/{repo,shared,compose,releases}
mkdir -p "/var/lib/platform/${DOMAIN}"
chown -R deploy:selfpact "$PROD_ROOT" 2>/dev/null || chown -R root:selfpact "$PROD_ROOT" 2>/dev/null || true
chmod -R g+rwX "$PROD_ROOT" 2>/dev/null || true

if [[ -n "$GIT_URL" ]] && [[ ! -d "$PROD_ROOT/repo/.git" ]]; then
  git clone "$GIT_URL" "$PROD_ROOT/repo"
fi

echo "Prod site scaffold: $PROD_ROOT"
echo "Add entry to $PLATFORM_ROOT/registry/sites.yaml and configure nginx."
echo "GitHub secret: SELF_PACT_REPO_ROOT or ${DOMAIN//./_}_REPO_ROOT=$PROD_ROOT/repo"
