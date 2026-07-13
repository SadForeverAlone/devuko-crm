# Devuko CRM platform Makefile

SHELL := /bin/bash
ROOT := $(abspath $(dir $(lastword $(MAKEFILE_LIST))))
API_DIR := $(ROOT)/apps/api
WEB_DIR := $(ROOT)/apps/web
COMPOSE := docker compose --env-file $(API_DIR)/.env -p devuko-crm -f $(ROOT)/docker/docker-compose.yml

.PHONY: help dev-infra-up dev-up prod-up prod-down deploy nginx-sync check

.DEFAULT_GOAL := help

help:
	@echo "Devuko CRM"
	@echo "  dev-infra-up   Postgres only (port 5440)"
	@echo "  dev-up         Postgres + hint for local API/web"
	@echo "  prod-up        Full prod stack (postgres, api, web)"
	@echo "  prod-down      Stop prod stack"
	@echo "  deploy         Production deploy (git + docker + nginx)"
	@echo "  nginx-sync     Sync host nginx configs (sudo)"
	@echo "  check          Typecheck + lint web and api"

check:
	cd $(WEB_DIR) && npm run typecheck && npm run lint
	cd $(API_DIR) && npm run typecheck && npm run lint

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
	$(COMPOSE) down

nginx-sync:
	sudo bash $(ROOT)/infra/nginx/sync-nginx.sh
