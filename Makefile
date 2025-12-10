SHELL := /bin/bash
.SHELLFLAGS := -eu -o pipefail -c
.DEFAULT_GOAL := help

NPM := npm
DOCKER_MGR := ./scripts/docker-manager.sh
DEPLOY_PRO := ./scripts/deploy-pro.sh
DB_PROD_SCRIPT := ./scripts/db-prod.sh

BLUE := \033[34m
GREEN := \033[32m
YELLOW := \033[33m
RESET := \033[0m

log_info = @printf "$(BLUE)[info]$(RESET) %s\n" "$(1)"
log_run = @printf "$(GREEN)[run ]$(RESET) %s\n" "$(1)"
log_warn = @printf "$(YELLOW)[warn]$(RESET) %s\n" "$(1)"

.PHONY: help dev build start \
	lint lint-fix type-check validate quality \
	test test-watch test-coverage test-ci \
	db-migrate db-push db-pull db-seed db-reset db-status db-studio db-generate \
	db-prod-migrate db-prod-push db-prod-pull db-prod-seed db-prod-reset db-prod-studio db-prod-generate \
	docker-up-dev docker-down-dev docker-logs-dev docker-shell-dev docker-migrate-dev docker-seed-dev docker-studio-dev \
	docker-up-prod docker-down-prod docker-logs-prod docker-shell-prod docker-migrate-prod docker-seed-prod \
	docker-status docker-clean \
	prod-deploy prod-migrate prod-app prod-logs prod-status

help:
	@printf "\nBarbershop Next.js Makefile\n"
	@printf "=================================\n"
	@printf "\nDevelopment\n"
	@printf "  %-22s %s\n" "dev" "Start Next.js dev server (npm run dev)"
	@printf "  %-22s %s\n" "build" "Build production bundle (npm run build)"
	@printf "  %-22s %s\n" "start" "Run built app locally (npm start)"
	@printf "\nQuality & Tests\n"
	@printf "  %-22s %s\n" "lint" "Lint codebase (npm run lint:check)"
	@printf "  %-22s %s\n" "lint-fix" "Auto-fix lint issues (npm run lint:fix)"
	@printf "  %-22s %s\n" "type-check" "TypeScript check (npm run type-check)"
	@printf "  %-22s %s\n" "validate" "Lint + type-check (npm run validate)"
	@printf "  %-22s %s\n" "quality" "Alias: lint + type-check"
	@printf "  %-22s %s\n" "test" "Run Jest suite (npm test)"
	@printf "  %-22s %s\n" "test-watch" "Watch mode tests (npm run test:watch)"
	@printf "  %-22s %s\n" "test-coverage" "Coverage report (npm run test:coverage)"
	@printf "  %-22s %s\n" "test-ci" "CI-friendly tests (npm run test:ci)"
	@printf "\nDatabase (dev)\n"
	@printf "  %-22s %s\n" "db-migrate" "Prisma migrate dev"
	@printf "  %-22s %s\n" "db-push" "Prisma db push (dev)"
	@printf "  %-22s %s\n" "db-pull" "Prisma db pull (dev)"
	@printf "  %-22s %s\n" "db-seed" "Seed database (dev)"
	@printf "  %-22s %s\n" "db-reset" "Reset database (dev)"
	@printf "  %-22s %s\n" "db-status" "Migration status (dev)"
	@printf "  %-22s %s\n" "db-studio" "Prisma Studio (dev)"
	@printf "  %-22s %s\n" "db-generate" "Generate Prisma client"
	@printf "\nDatabase (prod via ./scripts/db-prod.sh)\n"
	@printf "  %-22s %s\n" "db-prod-migrate" "Prisma migrate deploy (prod)"
	@printf "  %-22s %s\n" "db-prod-push" "Prisma db push (prod)"
	@printf "  %-22s %s\n" "db-prod-pull" "Prisma db pull (prod)"
	@printf "  %-22s %s\n" "db-prod-seed" "Seed database (prod)"
	@printf "  %-22s %s\n" "db-prod-reset" "Reset database (prod, confirms)"
	@printf "  %-22s %s\n" "db-prod-studio" "Prisma Studio (prod)"
	@printf "  %-22s %s\n" "db-prod-generate" "Generate Prisma client (prod)"
	@printf "\nDocker helper (scripts/docker-manager.sh)\n"
	@printf "  %-22s %s\n" "docker-up-dev" "Compose up dev stack"
	@printf "  %-22s %s\n" "docker-down-dev" "Compose down dev stack"
	@printf "  %-22s %s\n" "docker-logs-dev" "Tail dev logs"
	@printf "  %-22s %s\n" "docker-shell-dev" "Shell into dev app container"
	@printf "  %-22s %s\n" "docker-migrate-dev" "Run migrations inside dev container"
	@printf "  %-22s %s\n" "docker-seed-dev" "Seed DB inside dev container"
	@printf "  %-22s %s\n" "docker-studio-dev" "Prisma Studio via dev container"
	@printf "  %-22s %s\n" "docker-up-prod" "Compose up prod stack"
	@printf "  %-22s %s\n" "docker-down-prod" "Compose down prod stack"
	@printf "  %-22s %s\n" "docker-logs-prod" "Tail prod logs"
	@printf "  %-22s %s\n" "docker-shell-prod" "Shell into prod app container"
	@printf "  %-22s %s\n" "docker-migrate-prod" "Run migrations inside prod container"
	@printf "  %-22s %s\n" "docker-seed-prod" "Seed DB inside prod container"
	@printf "  %-22s %s\n" "docker-status" "List containers"
	@printf "  %-22s %s\n" "docker-clean" "Prune containers/images/volumes (asks confirm)"
	@printf "\nProduction deploy (via ./scripts/deploy-pro.sh)\n"
	@printf "  %-22s %s\n" "prod-deploy" "Build + migrate profile + app up (deploy)"
	@printf "  %-22s %s\n" "prod-migrate" "Run only migrations using migrator profile"
	@printf "  %-22s %s\n" "prod-app" "Deploy app only (no migrations)"
	@printf "  %-22s %s\n" "prod-logs" "Tail app logs"
	@printf "  %-22s %s\n" "prod-status" "Container status (docker-compose.pro.yml)"

# Development
dev:
	$(call log_run,Starting Next.js dev server)
	@$(NPM) run dev

build:
	$(call log_run,Building production bundle)
	@$(NPM) run build

start:
	$(call log_run,Starting built application)
	@$(NPM) start

# Quality & Tests
lint:
	$(call log_run,Running eslint check)
	@$(NPM) run lint:check

lint-fix:
	$(call log_run,Running eslint autofix)
	@$(NPM) run lint:fix

type-check:
	$(call log_run,Running TypeScript type-check)
	@$(NPM) run type-check

validate:
	$(call log_run,Lint + type-check)
	@$(NPM) run validate

quality: lint type-check

test:
	$(call log_run,Running Jest suite)
	@$(NPM) test

test-watch:
	$(call log_run,Running Jest in watch mode)
	@$(NPM) run test:watch

test-coverage:
	$(call log_run,Running coverage)
	@$(NPM) run test:coverage

test-ci:
	$(call log_run,Running CI-safe tests)
	@$(NPM) run test:ci

# Database (dev)
db-migrate:
	$(call log_run,Prisma migrate dev)
	@$(NPM) run db:migrate

db-push:
	$(call log_run,Prisma db push (dev))
	@$(NPM) run db:push

db-pull:
	$(call log_run,Prisma db pull (dev))
	@$(NPM) run db:pull

db-seed:
	$(call log_run,Seeding database (dev))
	@$(NPM) run db:seed

db-reset:
	$(call log_warn,Reset will drop dev database)
	@$(NPM) run db:reset

db-status:
	$(call log_run,Checking migration status (dev))
	@$(NPM) run db:status

db-studio:
	$(call log_run,Starting Prisma Studio (dev))
	@$(NPM) run db:studio

db-generate:
	$(call log_run,Generating Prisma client)
	@$(NPM) run db:generate

# Database (prod helpers)
db-prod-migrate:
	$(call log_run,Prisma migrate deploy (prod))
	@$(DB_PROD_SCRIPT) migrate

db-prod-push:
	$(call log_run,Prisma db push (prod))
	@$(DB_PROD_SCRIPT) push

db-prod-pull:
	$(call log_run,Prisma db pull (prod))
	@$(DB_PROD_SCRIPT) pull

db-prod-seed:
	$(call log_run,Seeding database (prod))
	@$(DB_PROD_SCRIPT) seed

db-prod-reset:
	$(call log_warn,Resetting production database requires confirmation)
	@$(DB_PROD_SCRIPT) reset

db-prod-studio:
	$(call log_run,Starting Prisma Studio (prod))
	@$(DB_PROD_SCRIPT) studio

db-prod-generate:
	$(call log_run,Generating Prisma client (prod))
	@$(DB_PROD_SCRIPT) generate

# Docker helpers (scripts/docker-manager.sh)
docker-up-dev:
	$(call log_run,Starting dev docker stack)
	@$(DOCKER_MGR) up dev

docker-down-dev:
	$(call log_run,Stopping dev docker stack)
	@$(DOCKER_MGR) down dev

docker-logs-dev:
	$(call log_run,Following dev logs)
	@$(DOCKER_MGR) logs dev

docker-shell-dev:
	$(call log_run,Opening shell in dev app container)
	@$(DOCKER_MGR) shell dev

docker-migrate-dev:
	$(call log_run,Running migrations in dev container)
	@$(DOCKER_MGR) migrate dev

docker-seed-dev:
	$(call log_run,Running seed in dev container)
	@$(DOCKER_MGR) seed dev

docker-studio-dev:
	$(call log_run,Opening Prisma Studio via dev container)
	@$(DOCKER_MGR) studio dev

docker-up-prod:
	$(call log_run,Starting prod docker stack)
	@$(DOCKER_MGR) up prod

docker-down-prod:
	$(call log_run,Stopping prod docker stack)
	@$(DOCKER_MGR) down prod

docker-logs-prod:
	$(call log_run,Following prod logs)
	@$(DOCKER_MGR) logs prod

docker-shell-prod:
	$(call log_run,Opening shell in prod app container)
	@$(DOCKER_MGR) shell prod

docker-migrate-prod:
	$(call log_run,Running migrations in prod container)
	@$(DOCKER_MGR) migrate prod

docker-seed-prod:
	$(call log_run,Running seed in prod container)
	@$(DOCKER_MGR) seed prod

docker-status:
	$(call log_run,Listing docker containers)
	@$(DOCKER_MGR) status

docker-clean:
	$(call log_warn,Pruning containers/images/volumes)
	@$(DOCKER_MGR) clean

# Production deploy (scripts/deploy-pro.sh)
prod-deploy:
	$(call log_run,Deploying: build images + migrate + app up)
	@$(DEPLOY_PRO) deploy

prod-migrate:
	$(call log_run,Running migrations only via migrator profile)
	@$(DEPLOY_PRO) migrate

prod-app:
	$(call log_run,Deploying application only)
	@$(DEPLOY_PRO) app-only

prod-logs:
	$(call log_run,Tailing production logs)
	@$(DEPLOY_PRO) logs

prod-status:
	$(call log_run,Checking production service status)
	@$(DEPLOY_PRO) status
