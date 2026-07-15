# Devuko CRM

Universal platform CRM for managing workspaces (sites).  
Production: **https://crm.devuko.ru**

## Layout (platform convention)

```txt
/home/<user>/sites/crm.devuko.ru/repo/   # this repository (dev)
/srv/sites/crm.devuko.ru/repo/          # production deploy
/home/<user>/web/crm.devuko.ru           # symlink → sites/.../repo
```

Same pattern as Selfpact (`sites/selfpact.ru/repo`).

## Apps

```txt
apps/web/     @devuko/crm-web — CRM UI (`app` / `pages` / `widgets` / `features` / `entities` / `shared`)
apps/api/     @devuko/crm-api — platform API + workspace proxy
platform/     site registry & provisioning scripts
```

API controllers are split: `crm-auth`, `crm-platform`, `crm-workspace-proxy`.

## Dev

```bash
cd ~/sites/crm.devuko.ru/repo/docker && docker compose up -d

cd ~/sites/crm.devuko.ru/repo/apps/api
cp .env.example .env && npm install && npm run start:dev

cd ~/sites/crm.devuko.ru/repo/apps/web
cp .env.example .env && npm install && npm run dev
```

Local checks: `make check` (typecheck + lint for web and api), `make test` (API unit tests), `make test-db` (API + real Postgres — needs `:5440` or `DATABASE_URL`), `make test-e2e` (Playwright smoke against Vite preview — needs `npx playwright install --with-deps chromium` once on the host). Prefer `make test-e2e-docker` when host Chromium libraries are missing (uses the official Playwright image against the running web container on `:8096`). For the full OTP auth flow: `PLAYWRIGHT_CRM_LOGIN=... PLAYWRIGHT_CRM_PASSWORD=... make test-e2e-auth` (briefly recreates API with `AUTH_OTP_ECHO=true` via `docker-compose.e2e.yml`).

UI feature modules: `apps/web/src/features/crm-*`. Shell/context/routing: `widgets/crm-app`. Shared query hooks: `shared/crm/model` (re-exported from feature folders). Lint: `eslint-plugin-jsx-a11y` at error level.

See `ARCHITECTURE.md` for module layout, guard chain, and ops notes.

Web routing uses **nested React Router** paths under `/crm/*` (e.g. `/crm/projects`, `/crm/monitoring`). Legacy aliases `/crm/sites/*` → `/crm/projects` and `/crm/security` → `/crm/monitoring` are handled in `apps/web/src/app/router.tsx`.

Data fetching: TanStack Query, enabled per active tab. Deploy concurrency: Postgres advisory locks. Rate limits: Postgres (`CrmRateLimit`), shared across API replicas.

## Environment (API)

Copy `apps/api/.env.example` → `apps/api/.env`. Key variables:

| Variable | Notes |
|---|---|
| `PORT` / `BIND_HOST` | Default port `8095`. Production bind defaults to `127.0.0.1`; Docker compose sets `BIND_HOST=0.0.0.0` inside the container (host still publishes `127.0.0.1:8095`). |
| `DATABASE_URL` / `POSTGRES_*` | Postgres connection; compose maps `127.0.0.1:5440`. |
| `JWT_SECRET` | Required in production (≥32 chars). |
| `JWT_EXPIRES_IN` | Lifetime in seconds. Production default **7200** (2h) when unset; dev default **28800** (8h). |
| `AUTH_PASSWORD_LOGIN` | Set `true` to allow legacy `POST /crm-auth/login` in production (default: OTP only). |
| `AUTH_RETURN_TOKEN` | Set `true` to include JWT in OTP verify JSON (default: httpOnly cookie only in production). |
| `DEVUKO_CRM_DEPLOY_ENABLED` | Set `false` to block deploy endpoints (docker.sock mount unchanged). |
| `DEVUKO_PROXY_SECRET` | Shared with workspace backends (Selfpact). ≥32 chars in production. |
| `CRM_ADMIN_EMAIL` / `CRM_ADMIN_PASSWORD` | Bootstrap admin (password required in production). |
| `CORS_ORIGINS` | Optional comma-separated origins. If unset in production, falls back to `VITE_PUBLIC_URL`. |
| `AUTH_SMTP_*` / `AUTH_EMAIL_FROM*` | SMTP for email OTP login. |
| `AUTH_OTP_ECHO` | `true` in local dev to log OTP codes to the API console; when `true`, `POST /crm-auth/otp/request` also returns `debugCode` for e2e (never enable in production). |
| `SWAGGER_ENABLED` | Set `true` to expose `/docs` OpenAPI UI in production (default: enabled when `NODE_ENV` is not `production`). |
| `WORKSPACE_DEV_PORTS` | Optional allowlist of localhost ports for workspace SSRF checks in non-production (default `8080,8081,8088,8095,3000`). |
| `SELFPACT_*` | Workspace domain / API base / repo URL for provisioning. |

Web (`apps/web/.env`): `VITE_DEV_PORT`, `VITE_DEV_API_PORT`, `VITE_API_URL`, `VITE_PUBLIC_URL`.

## Production

On the server as **root** (first time):

```bash
bash /home/sherli/sites/crm.devuko.ru/repo/infra/deploy/bootstrap-prod.sh
```

Updates (from `/srv/sites/crm.devuko.ru/repo`):

```bash
export VITE_PUBLIC_URL=https://crm.devuko.ru
sudo -u sherli bash -lc 'cd /srv/sites/crm.devuko.ru/repo && make deploy'
```

Or via GitHub Actions: `.github/workflows/deploy.yml` on push to `master`. Required secrets:

- `DEVUKO_CRM_DEPLOY_HOST` / `DEVUKO_CRM_DEPLOY_USER` / `DEVUKO_CRM_DEPLOY_KEY`
- `DEVUKO_CRM_REPO_ROOT` — absolute path to the checkout on the server (e.g. `/srv/sites/crm.devuko.ru/repo`)

CI (`.github/workflows/ci.yml`): `npm audit --audit-level=high`, typecheck, lint, build for `apps/web` and `apps/api`; API unit tests; **API DB integration** (`api-db` job, Postgres service); Playwright smoke (`e2e`); **auth e2e** (`e2e-auth`, OTP echo on ephemeral API); shellcheck + `docker compose config` (`infra` job).

Requires:

- DNS `crm.devuko.ru` → server IP
- `certbot` for HTTPS (bootstrap tries automatically)
- Same `DEVUKO_PROXY_SECRET` in CRM and Selfpact `apps/backend/.env`

Prod ports: API **8095**, web container **8096**, host nginx serves static + proxies API (bound on `127.0.0.1` only).

After deploy, sync host nginx when `infra/nginx/` changed (CSP, `/health`, body size). Deploy script syncs automatically when run as root or with passwordless sudo for `sync-nginx.sh`; otherwise:

```bash
make nginx-check-drift   # detect drift
sudo bash ~/sites/crm.devuko.ru/repo/infra/nginx/sync-nginx.sh
# or: make nginx-sync
curl -fsS https://crm.devuko.ru/health
```

### Security notes

- **OTP login** is required in production; `POST /crm-auth/login` returns `410 Gone` unless `AUTH_PASSWORD_LOGIN=true`.
- **Session JWT** is stored in an httpOnly cookie (`devuko_crm_session`) with a server-side session id (`CrmAuthSession`); logout and password change revoke sessions before JWT expiry. The SPA uses `credentials: include` and does not persist the token in `localStorage`.
- **CSRF** double-submit is enforced whenever a session cookie is present — `Authorization: Bearer …` does **not** bypass CSRF.
- **docker.sock is not mounted by default** in `docker/docker-compose.yml`. UI deploy requires the optional high-risk overlay `docker-compose.deploy.yml`. Prefer **GitHub Actions / `make deploy`** for production updates.
- **Workspace proxy** resolves DNS at request time and rejects private/link-local addresses (SSRF hardening).
- **Admin bootstrap** uses `platform/bin/crm-add-admin.sh` → parameterized Node script with scrypt hashing (not raw SQL).
- **Deploy path allowlists** under `/srv/sites`; child processes receive an env allowlist only.
- **CSP** on host nginx: `style-src 'self'`. API responses include `X-Request-Id`.

### Secrets rotation

| Secret | Rotate | After |
|---|---|---|
| `JWT_SECRET` | Generate ≥32 chars; update `apps/api/.env`; recreate API | All sessions invalid (expected). Users re-login via OTP. |
| `DEVUKO_PROXY_SECRET` | Generate ≥32 chars; update **both** CRM API and each workspace backend `.env`, then restart both | Prefer short dual-deploy window; old secret rejects immediately after restart. |
| `POSTGRES_PASSWORD` | Update Postgres + `DATABASE_URL` / compose env; rolling restart postgres→api | Prefer maintenance window. |
| Deploy SSH key (`DEVUKO_CRM_DEPLOY_KEY`) | Generate new keypair; update GitHub secret + server `authorized_keys`; remove old key | Verify one Actions deploy. |

Keep `AUTH_RETURN_TOKEN=false` and `AUTH_OTP_ECHO=false` in production.

### Monitoring

- Probe **`https://crm.devuko.ru/health`** (Uptime Kuma / statuscake / Grafana). Expect JSON `{"ok":true,"db":"up"}`; alert on non-200 or `db≠up`.
- Correlate API logs with response header **`X-Request-Id`**.
- Optional: `SENTRY_DSN` for client/server error capture (not wired by default).

Create CRM admin (not in bootstrap):

```bash
bash platform/bin/crm-add-admin.sh you@example.com 'your-password' 'Your Name'
```
