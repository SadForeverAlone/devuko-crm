# Devuko CRM — architecture

## Overview

Devuko CRM is a **Vite + React SPA** (`apps/web`) backed by a **NestJS + Fastify API** (`apps/api`) and **Postgres**. Host nginx serves static assets and reverse-proxies the API on `127.0.0.1`.

```txt
Browser → nginx (crm.devuko.ru)
            ├─ /           → web container (static SPA)
            ├─ /health     → api /health (readiness)
            └─ /crm-auth, /admin/crm → api (JSON)
```

## API modules

| Area | Controller | Purpose |
|---|---|---|
| Auth | `crm-auth` | OTP login, logout, session cookies |
| Platform | `admin/crm` (platform) | Sites, admins, metrics, deploy |
| Workspace proxy | `admin/crm` (proxy) | Forwards to workspace backends (Selfpact) |
| Health | `/health` | DB readiness (`503` when Postgres down) |

## Security model

1. **JWT** in httpOnly cookie (`devuko_crm_session`) with server-side session id (`CrmAuthSession`).
2. **Guard chain** on protected routes: `JwtAuthGuard` → `SessionActiveGuard` → `AdminGuard`.
3. **CSRF** double-submit on mutating requests when a session cookie is present (`CsrfGuard` global). Bearer does not bypass CSRF.
4. **Rate limits** stored in Postgres (`CrmRateLimit`) — shared across API replicas.
5. **Workspace proxy** resolves DNS at request time; private/link-local targets rejected (SSRF).
6. **CSP** enforced by nginx (`style-src 'self'`); API sets `X-Request-Id` on every response.

## Frontend

```txt
apps/web/src/
  app/              router, providers
  pages/            route shells (CrmPage, CrmTabRoute)
  widgets/crm-app/  shell: CrmApp, layout, context, tab router
  features/
    crm-auth/       login UI, useCrmAuth
    crm-sites/      projects/sites + handlers
    crm-platform-ops/ infra, monitoring, deploy
    crm-team/       platform admins
    crm-users/      workspace users + useCrmUsersQuery
    crm-logs/       site + platform logs
    crm-contacts/   contacts + useCrmContactsQuery
    crm-content/    promises/pages/reports + content queries
    crm-dashboard/  dashboard sections
    crm-admin/      useCrmUserAdminHandlers
  entities/crm/     API clients + storage
  shared/crm/model/ crmQueryKeys + per-resource TanStack Query hooks
  shared/crm/ui/    sectionTypes, suspense, table pagination
  shared/api/generated/  OpenAPI types (refresh via /docs-json)
  shared/ui/        platform UI kit
```

Workspace shell composes auth/nav/filters. Tab-gated data fetching lives in `shared/crm/model/useCrmFeatureQueries.ts` (used by `useCrmWorkspaceData`). Features re-export the same hooks.

## Ops

- **Deploy:** `make deploy` or GitHub Actions → `infra/deploy/deploy.sh` (git pull, docker build, optional nginx sync).
- **Nginx configs** live in `infra/nginx/`; apply with `make nginx-sync` (requires sudo). Passwordless path on this host: `sudo /home/sherli/web/selfpact.ru/infra/nginx/sync-nginx.sh` (also syncs CRM includes).
- **docker.sock** is not mounted by default; UI deploy needs `docker-compose.deploy.yml`.
- **Health probe:** `https://crm.devuko.ru/health` (or `--resolve …:127.0.0.1` on the server if DNS is missing locally).

## API docs

In non-production (or when `SWAGGER_ENABLED=true`), OpenAPI UI is at `/docs` and JSON at `/docs-json`. Committed stub: `apps/api/openapi/openapi.json`. Web types: `apps/web/src/shared/api/generated/crm-api.ts` (`npm run gen:api` after refresh).

## Tests

| Layer | Command |
|---|---|
| API unit + HTTP integration | `make test` (vitest) |
| API + real Postgres | `make test-db` (`CRM_DB_INTEGRATION=true`) |
| Playwright smoke | `make test-e2e-docker` |
| Auth flow e2e | `make test-e2e-auth` (temporarily enables `AUTH_OTP_ECHO` on API) |
| Bundle size | `cd apps/web && npm run build && npm run bundle-budget` |

Web lint includes **eslint-plugin-jsx-a11y** at **error** level.
