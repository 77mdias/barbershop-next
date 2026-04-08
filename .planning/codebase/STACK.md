# Technology Stack

**Analysis Date:** 2026-04-08

## Languages

**Primary:**
- TypeScript (5.x) - Código da aplicação em `src/**/*.ts` e `src/**/*.tsx`, rotas em `src/app/api/**/route.ts`, backend em `src/server/**/*.ts`.

**Secondary:**
- JavaScript/ESM - Configuração e toolchain em `next.config.mjs`, `eslint.config.mjs`, `jest.config.js`, `tailwind.config.js`, `postcss.config.mjs`.
- Shell (bash) - Automação operacional e deploy em `scripts/docker-manager.sh`, `scripts/deploy-pro.sh`, `scripts/db-prod.sh`.
- Prisma Schema (DSL) - Modelo de dados em `prisma/schema.prisma`.

## Runtime

**Environment:**
- Node.js 20+ (`README.md`) e Node 20 em containers/workflows (`Dockerfile`, `Dockerfile.pro`, `.github/workflows/ci.yml`, `.github/workflows/cd-vercel.yml`).

**Package Manager:**
- npm (`package.json`)
- Lockfile: present (`package-lock.json`)

## Frameworks

**Core:**
- Next.js `^15.5.14` - App Router, API routes, Server Actions (`package.json`, `src/app/**`, `src/server/**`).
- React `19.1.0` + React DOM `19.1.0` - UI (`package.json`, `src/components/**`).
- NextAuth `^4.24.11` - autenticação e sessão (`src/lib/auth.ts`, `src/app/api/auth/[...nextauth]/route.ts`).
- Prisma Client `^6.17.1` - acesso ao PostgreSQL (`src/lib/prisma.ts`, `prisma/schema.prisma`).

**Testing:**
- Jest `^30.2.0` + ts-jest `^29.4.5` - testes unitários/integrados (`jest.config.js`, `src/__tests__/**`).
- React Testing Library (`@testing-library/react`) - testes de UI (`package.json`, `src/__tests__/**`).
- Playwright `^1.58.2` - E2E (`playwright.config.ts`, `e2e/**`).

**Build/Dev:**
- TypeScript (`tsconfig.json`) - compilação e checagem de tipos (`npm run type-check` em `package.json`).
- ESLint 9 (`eslint.config.mjs`) - lint (`npm run lint:check`).
- Tailwind CSS 3 + PostCSS (`tailwind.config.js`, `postcss.config.mjs`) - estilização.
- Docker Compose (`docker-compose.yml`, `docker-compose.pro.yml`) - ambiente containerizado.

## Key Dependencies

**Critical:**
- `next` / `react` / `react-dom` - runtime web principal (`package.json`).
- `next-auth` + `@next-auth/prisma-adapter` - autenticação OAuth/credentials com persistência em banco (`src/lib/auth.ts`).
- `@prisma/client` + `prisma` - ORM e migrations (`prisma/schema.prisma`, scripts `db:*` em `package.json`).
- `zod` - validação de payloads de API (`src/schemas/**`, uso em `src/app/api/auth/*.ts`).

**Infrastructure:**
- `nodemailer` - envio de emails SMTP (`src/lib/email.ts`).
- `cloudinary` - upload de mídia em produção quando habilitado (`src/server/hybridUploadActions.ts`, `src/server/cloudinaryActions.ts`).
- `bcryptjs` - hashing e verificação de senha (`src/lib/auth.ts`, `src/app/api/auth/register/route.ts`).
- `sharp` - processamento de imagem no fluxo local/build (`package.json`, exclusões em `next.config.mjs`, teste em `src/app/api/test-sharp/route.ts`).

## Configuration

**Environment:**
- Arquivos de ambiente detectados: `.env.development`, `.env.local`, `.env.production`, `.env.production.local`, `.env.example`, `.env.storage.example` (apenas presença).
- Config de Prisma carrega `.env.development` (dev) ou `.env` (outros ambientes) em `prisma.config.ts`.
- Config principal de auth e integrações depende de variáveis em `src/lib/auth.ts`, `src/lib/email.ts`, `src/lib/upload/storage-providers.ts`.

**Build:**
- Next.js: `next.config.mjs` (security headers, standalone output, serverActions limit, ajustes de webpack).
- TypeScript: `tsconfig.json`.
- ESLint: `eslint.config.mjs`.
- Jest: `jest.config.js`.
- Playwright: `playwright.config.ts`.
- Vercel: `vercel.json`.
- Docker build/runtime: `Dockerfile`, `Dockerfile.pro`, `docker-compose.yml`, `docker-compose.pro.yml`, `docker-compose.prod.yml`.

## Platform Requirements

**Development:**
- Node.js 20+ (`README.md`).
- Docker + Docker Compose para fluxo oficial local (`README.md`, `Makefile`, `docker-compose.yml`).
- PostgreSQL local em container `postgres:15-alpine` (`docker-compose.yml`).

**Production:**
- Deploy target principal: Vercel (`README.md`, `vercel.json`, `.github/workflows/cd-vercel.yml`).
- Banco PostgreSQL externo acessado via `DATABASE_URL` (migrations com Prisma em `.github/workflows/cd-vercel.yml` e scripts em `scripts/db-prod.sh`).
- Caminho alternativo self-hosted com Docker (opcional) (`docker-compose.pro.yml`, `scripts/deploy-pro.sh`).

---

*Stack analysis: 2026-04-08*
