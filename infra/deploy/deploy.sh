#!/usr/bin/env bash
# Production deploy: git sync, docker build/up, static copy for host nginx.
# Local dev web build: use `make web-build` so apps/web/dist is owned by your user (docker cp may leave root-owned files).
set -euo pipefail
ROOT="${DEVUKO_CRM_REPO_ROOT:-$(cd "$(dirname "${BASH_SOURCE[0]}")/../.." && pwd)}"
ENV_FILE="$ROOT/apps/api/.env"
if [[ ! -f "$ENV_FILE" ]]; then
  echo "Missing $ENV_FILE (see apps/api/.env.example)" >&2
  exit 1
fi
chmod 600 "$ENV_FILE" 2>/dev/null || true
COMPOSE=(docker compose --env-file "$ENV_FILE" -p devuko-crm -f "$ROOT/docker/docker-compose.yml")
cd "$ROOT"
export VITE_PUBLIC_URL="${VITE_PUBLIC_URL:-https://crm.devuko.ru}"

if [[ "${SKIP_GIT:-0}" != "1" ]] && git rev-parse --is-inside-work-tree >/dev/null 2>&1; then
  echo "==> git sync (prod checkout)"
  git fetch origin "${DEPLOY_BRANCH:-master}"
  git reset --hard "origin/${DEPLOY_BRANCH:-master}"
else
  echo "==> git sync skipped (SKIP_GIT or not a git checkout)"
fi

echo "==> docker compose (postgres)"
"${COMPOSE[@]}" up -d postgres

echo "==> build images (sequential)"
COMPOSE_PARALLEL_LIMIT=1 "${COMPOSE[@]}" build api
COMPOSE_PARALLEL_LIMIT=1 "${COMPOSE[@]}" build web

echo "==> start full stack"
compose_up() {
  "${COMPOSE[@]}" up -d --force-recreate --remove-orphans "$@"
}

if ! compose_up; then
  echo "==> compose up failed; cleaning stale name conflicts and retrying" >&2
  # Race with a concurrent recreate leaves container IDs compose still expects.
  docker ps -aq --filter name=devuko-crm-web --filter status=created | xargs -r docker rm -f || true
  docker ps -aq --filter name='_devuko-crm-web$' --filter status=created | xargs -r docker rm -f || true
  compose_up
fi

if command -v nginx >/dev/null 2>&1; then
  echo "==> sync static for host nginx"
  staging=$(mktemp -d)
  web_cid=$(docker ps -qf name=^devuko-crm-web$)
  if [[ -z "$web_cid" ]]; then
    echo "devuko-crm-web container is not running" >&2
    exit 1
  fi
  docker cp "$web_cid:/usr/share/nginx/html/." "$staging/"
  docker run --rm \
    -v "$staging:/src:ro" \
    -v "$ROOT/apps/web:/web" \
    alpine:3.20 \
    sh -c 'rm -rf /web/dist && mkdir -p /web/dist && cp -a /src/. /web/dist/ && chmod -R a+rX /web/dist'
  rm -rf "$staging"

  if [[ "$(id -u)" -eq 0 ]] || nginx -t 2>/dev/null; then
    if [[ -x "$ROOT/infra/nginx/sync-nginx.sh" ]]; then
      if [[ "$(id -u)" -eq 0 ]]; then
        echo "==> sync nginx config"
        bash "$ROOT/infra/nginx/sync-nginx.sh"
      elif sudo -n bash "$ROOT/infra/nginx/sync-nginx.sh" 2>/dev/null; then
        echo "==> sync nginx config (passwordless sudo)"
      elif [[ -x /home/sherli/web/selfpact.ru/infra/nginx/sync-nginx.sh ]] \
        && sudo -n /home/sherli/web/selfpact.ru/infra/nginx/sync-nginx.sh 2>/dev/null; then
        echo "==> sync nginx config (NOPASSWD wrapper)"
      else
        echo "==> nginx config drift: run sudo bash $ROOT/infra/nginx/sync-nginx.sh"
        echo "    or: sudo /home/sherli/web/selfpact.ru/infra/nginx/sync-nginx.sh"
      fi
    fi
    if [[ "$(id -u)" -eq 0 ]]; then
      echo "==> nginx reload"
      nginx -t && systemctl reload nginx
    elif sudo -n nginx -t 2>/dev/null && sudo -n systemctl reload nginx 2>/dev/null; then
      echo "==> nginx reload (passwordless sudo)"
    else
      echo "==> nginx reload skipped (run as root or configure passwordless sudo for sync-nginx.sh)"
    fi
  fi
fi

echo "Deploy finished."
