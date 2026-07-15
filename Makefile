# Devuko CRM platform Makefile

SHELL := /bin/bash
ROOT := $(abspath $(dir $(lastword $(MAKEFILE_LIST))))
API_DIR := $(ROOT)/apps/api
WEB_DIR := $(ROOT)/apps/web
COMPOSE := docker compose --env-file $(API_DIR)/.env -p devuko-crm -f $(ROOT)/docker/docker-compose.yml

.PHONY: help dev-infra-up dev-up prod-up prod-down deploy nginx-sync nginx-check-drift check web-build test test-db test-e2e test-e2e-docker test-e2e-auth bundle-budget

.DEFAULT_GOAL := help

help:
	@echo "Devuko CRM"
	@echo "  dev-infra-up   Postgres only (port 5440)"
	@echo "  dev-up         Postgres + hint for local API/web"
	@echo "  web-build      Build web SPA and fix dist ownership (dev)"
	@echo "  prod-up        Full prod stack (postgres, api, web)"
	@echo "  prod-down      Stop prod stack"
	@echo "  deploy         Production deploy (git + docker + nginx)"
	@echo "  nginx-sync     Sync host nginx configs (sudo)"
	@echo "  nginx-check-drift Fail if host nginx differs from repo"
	@echo "  check          Typecheck + lint web and api"
	@echo "  test           API unit tests"
	@echo "  test-db        API integration tests against Postgres (port 5440 dev)"
	@echo "  test-e2e       Web Playwright smoke (needs host chromium deps)"
	@echo "  test-e2e-docker Playwright smoke via Playwright Docker image (no host libs)"
	@echo "  test-e2e-auth   Full auth e2e (needs PLAYWRIGHT_CRM_* + running stack)"
	@echo "  bundle-budget  Fail if web JS chunks exceed size budget"

check:
	cd $(WEB_DIR) && npm run typecheck && npm run lint
	cd $(API_DIR) && npm run typecheck && npm run lint

test:
	cd $(API_DIR) && npm test

test-db:
	cd $(API_DIR) && CRM_DB_INTEGRATION=true \
	  DATABASE_URL=$${DATABASE_URL:-postgresql://devuko:$$(grep '^POSTGRES_PASSWORD=' $(API_DIR)/.env | cut -d= -f2-)@127.0.0.1:5440/devuko_crm} \
	  npm run test:db

test-e2e:
	cd $(WEB_DIR) && npm run test:e2e

test-e2e-docker:
	docker run --rm --network host \
	  -v $(WEB_DIR):/work -w /work \
	  -e PLAYWRIGHT_BASE_URL=$${PLAYWRIGHT_BASE_URL:-http://127.0.0.1:8096} \
	  -e PLAYWRIGHT_API_URL=$${PLAYWRIGHT_API_URL:-http://127.0.0.1:8095} \
	  -e PLAYWRIGHT_CRM_LOGIN=$${PLAYWRIGHT_CRM_LOGIN:-} \
	  -e PLAYWRIGHT_CRM_PASSWORD=$${PLAYWRIGHT_CRM_PASSWORD:-} \
	  -e PLAYWRIGHT_OTP_ECHO=$${PLAYWRIGHT_OTP_ECHO:-} \
	  mcr.microsoft.com/playwright:v1.61.1-jammy \
	  bash -lc 'npx --yes playwright@1.61.1 test --config=playwright.config.ts'

test-e2e-auth:
	@test -n "$$PLAYWRIGHT_CRM_LOGIN" && test -n "$$PLAYWRIGHT_CRM_PASSWORD" || ( \
	  echo "Set PLAYWRIGHT_CRM_LOGIN and PLAYWRIGHT_CRM_PASSWORD for auth e2e" >&2; exit 1)
	@echo "==> Recreate API with AUTH_OTP_ECHO=true (temporary)"
	cd $(ROOT)/docker && docker compose --env-file $(API_DIR)/.env -p devuko-crm \
	  -f docker-compose.yml -f docker-compose.e2e.yml up -d --force-recreate api
	@sleep 4
	PLAYWRIGHT_OTP_ECHO=true $(MAKE) test-e2e-docker
	@echo "==> Restore API without OTP echo"
	cd $(ROOT)/docker && docker compose --env-file $(API_DIR)/.env -p devuko-crm \
	  -f docker-compose.yml up -d --force-recreate api
web-build:
	cd $(WEB_DIR) && npm run build
	@chown -R $$(id -u):$$(id -g) $(WEB_DIR)/dist 2>/dev/null || true
	cd $(WEB_DIR) && npm run bundle-budget

bundle-budget:
	cd $(WEB_DIR) && npm run bundle-budget

dev-infra-up:
	cd $(ROOT)/docker && docker compose up -d postgres

dev-up: dev-infra-up
	@echo "API:  cd apps/api && cp .env.example .env && npm install && npm run start:dev"
	@echo "Web:  cd apps/web && cp .env.example .env && npm install && npm run dev"

check-prod-path:
	@if [[ "$(ROOT)" != /srv/sites/* ]]; then \
	  echo "Prod targets belong in /srv/sites/crm.devuko.ru/repo" >&2; \
	  exit 1; \
	fi

deploy: check-prod-path
	@export DEVUKO_CRM_REPO_ROOT="$(ROOT)" && bash "$(ROOT)/infra/deploy/deploy.sh"

prod-up: check-prod-path
	cd $(ROOT)/docker && $(COMPOSE) up -d --build

prod-down: check-prod-path
	cd $(ROOT)/docker && $(COMPOSE) down

nginx-sync:
	sudo bash $(ROOT)/infra/nginx/sync-nginx.sh

nginx-check-drift:
	bash $(ROOT)/infra/nginx/check-drift.sh

check-prod-path:
