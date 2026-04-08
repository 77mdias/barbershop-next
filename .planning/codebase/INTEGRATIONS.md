# External Integrations

**Analysis Date:** 2026-04-08

## APIs & External Services

**Authentication / OAuth:**
- GitHub OAuth - login social via NextAuth.
  - SDK/Client: `next-auth` + provider em `src/lib/auth.ts`
  - Auth: `GITHUB_ID`, `GITHUB_SECRET`
- Google OAuth - login social via NextAuth.
  - SDK/Client: `next-auth` + provider em `src/lib/auth.ts`
  - Auth: `GOOGLE_CLIENT_ID`, `GOOGLE_CLIENT_SECRET`
- Discord OAuth - login social via NextAuth.
  - SDK/Client: `next-auth` + provider em `src/lib/auth.ts`
  - Auth: `DISCORD_CLIENT_ID`, `DISCORD_CLIENT_SECRET`

**Email Delivery (SMTP):**
- Gmail SMTP (implementação atual) - envio de verificação de email e reset de senha.
  - SDK/Client: `nodemailer` em `src/lib/email.ts`
  - Auth: `EMAIL_USER`, `EMAIL_PASSWORD`

**Media Storage / CDN:**
- Cloudinary (condicional) - upload de imagens de perfil e avaliações em produção quando `STORAGE_PROVIDER=cloudinary`.
  - SDK/Client: `cloudinary` em `src/server/hybridUploadActions.ts`, `src/server/cloudinaryActions.ts`, `src/lib/upload/storage-adapters.ts`
  - Auth: `CLOUDINARY_CLOUD_NAME`, `CLOUDINARY_API_KEY`, `CLOUDINARY_API_SECRET` (+ `CLOUDINARY_UPLOAD_PRESET` opcional em `src/lib/upload/storage-providers.ts`)

**Optional Storage Backends (adapter-based):**
- AWS S3 / GCS / Azure Blob - suportados por configuração de adapters; uso depende de dependências/variáveis e escolha de provider.
  - SDK/Client: adapters em `src/lib/upload/storage-adapters.ts`, configuração em `src/lib/upload/storage-providers.ts`
  - Auth: `AWS_*`, `GCP_*`, `AZURE_*` conforme provider

## Data Storage

**Databases:**
- PostgreSQL
  - Connection: `DATABASE_URL` (`prisma/schema.prisma`, `prisma.config.ts`)
  - Client: Prisma (`@prisma/client`) em `src/lib/prisma.ts`
- PostgreSQL local para desenvolvimento em container `db` (`postgres:15-alpine`) em `docker-compose.yml`.
- PostgreSQL em CI via service container em `.github/workflows/ci.yml`.

**File Storage:**
- Estratégia híbrida:
  - Local filesystem (`public/uploads`) em desenvolvimento (`src/server/hybridUploadActions.ts`, `src/lib/upload/storage-adapters.ts`)
  - Cloudinary em produção quando configurado (`src/server/hybridUploadActions.ts`, `src/app/api/upload/profile/route.ts`, `src/app/api/upload/reviews/route.ts`)

**Caching:**
- None detected (não há Redis/Upstash/Memcached implementado no código de runtime).

## Authentication & Identity

**Auth Provider:**
- NextAuth (custom + OAuth + credentials)
  - Implementation: `PrismaAdapter(db)` + JWT sessions em `src/lib/auth.ts`; handler em `src/app/api/auth/[...nextauth]/route.ts`
- Credenciais locais com senha hash (`bcryptjs`) em `src/lib/auth.ts` e `src/app/api/auth/register/route.ts`.

## Monitoring & Observability

**Error Tracking:**
- None detected (Sentry/Datadog/New Relic não implementados em `src/**`).

**Logs:**
- Logging interno com utilitário próprio em `src/lib/logger.ts`, usado em rotas/API/auth (`src/lib/auth.ts`, `src/app/api/auth/*.ts`, `src/lib/email.ts`).
- Health endpoint para checagem de app + DB em `src/app/api/health/route.ts`.

## CI/CD & Deployment

**Hosting:**
- Vercel (target oficial) em `README.md` e `vercel.json`.
- Self-hosted Docker opcional em `docker-compose.pro.yml` + `scripts/deploy-pro.sh`.

**CI Pipeline:**
- GitHub Actions:
  - CI em `.github/workflows/ci.yml`
  - CD para Vercel em `.github/workflows/cd-vercel.yml`

## Environment Configuration

**Required env vars:**
- Core app/auth:
  - `DATABASE_URL`
  - `NEXTAUTH_SECRET`
  - `NEXTAUTH_URL`
- OAuth:
  - `GITHUB_ID`, `GITHUB_SECRET`
  - `GOOGLE_CLIENT_ID`, `GOOGLE_CLIENT_SECRET`
  - `DISCORD_CLIENT_ID`, `DISCORD_CLIENT_SECRET`
- Email:
  - `EMAIL_USER`, `EMAIL_PASSWORD`
- Storage:
  - `STORAGE_PROVIDER`
  - `CLOUDINARY_CLOUD_NAME`, `CLOUDINARY_API_KEY`, `CLOUDINARY_API_SECRET`
- Optional storage providers:
  - `AWS_REGION`, `AWS_S3_BUCKET`, `AWS_ACCESS_KEY_ID`, `AWS_SECRET_ACCESS_KEY`, `AWS_CLOUDFRONT_URL`
  - `GCP_PROJECT_ID`, `GCP_KEY_FILE`, `GCS_BUCKET`
  - `AZURE_STORAGE_CONNECTION_STRING`, `AZURE_CONTAINER_NAME`
- Security/debug:
  - `DEBUG_API_TOKEN` (`src/lib/security/debug-access.ts`)

**Secrets location:**
- Local/dev/prod env files (presença): `.env.development`, `.env.local`, `.env.production`, `.env.production.local`.
- CI/CD secrets no GitHub Actions (`.github/workflows/cd-vercel.yml`): `VERCEL_TOKEN`, `VERCEL_ORG_ID`, `VERCEL_PROJECT_ID`, `DATABASE_URL`.
- Runtime production vars no Vercel (referência em `README.md`, `docs/deployment/README.md` e `vercel.json`).

## Webhooks & Callbacks

**Incoming:**
- OAuth callback/NextAuth handler em `src/app/api/auth/[...nextauth]/route.ts`.
- Nenhum endpoint de webhook dedicado implementado em `src/app/api/**` (não há `src/app/api/webhooks/route.ts`).
- Existe configuração de header para `/api/webhooks` em `next.config.mjs`, mas sem handler correspondente no código.

**Outgoing:**
- Requisições SMTP para provedor de email via `nodemailer` em `src/lib/email.ts`.
- Upload/delete/ping para API do Cloudinary quando habilitado (`src/server/hybridUploadActions.ts`, `src/lib/upload/storage-adapters.ts`).
- Fluxo OAuth outbound gerenciado pelo NextAuth providers em `src/lib/auth.ts`.

---

*Integration audit: 2026-04-08*
