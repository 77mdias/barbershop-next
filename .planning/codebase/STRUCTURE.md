# Codebase Structure

**Analysis Date:** 2026-04-08

## Directory Layout

```text
barbershop-next/
├── src/                    # Application code (Next.js routes, components, server logic)
├── prisma/                 # Prisma schema, migrations, seed
├── public/                 # Static assets and uploaded files
├── scripts/                # Docker, DB, deployment, and utility scripts
├── docs/                   # Project documentation and runbooks
├── e2e/                    # Playwright end-to-end tests
├── next.config.mjs         # Next.js build/runtime/security configuration
├── tsconfig.json           # TypeScript configuration and path aliases
└── package.json            # Scripts and dependency manifest
```

## Directory Purposes

**`src/app`:**
- Purpose: App Router routes, layouts, page-level data loading, and route handlers.
- Contains: `page.tsx`, `layout.tsx`, `loading.tsx`, `error.tsx`, `not-found.tsx`, and API `route.ts`.
- Key files: `src/app/layout.tsx`, `src/app/page.tsx`, `src/app/dashboard/**`, `src/app/api/**/route.ts`.

**`src/components`:**
- Purpose: Reusable UI and feature components.
- Contains: Feature folders (`chat`, `scheduling`, `social`, `home`, `admin`) and base UI primitives in `ui`.
- Key files: `src/components/scheduling/AppointmentWizard.tsx`, `src/components/chat/ChatWindow.tsx`, `src/components/ui/button.tsx`.

**`src/server`:**
- Purpose: Server-side orchestration and business application logic.
- Contains: Server Actions (`*Actions.ts`), service classes (`services/*.ts`), and home aggregation logic.
- Key files: `src/server/appointmentActions.ts`, `src/server/userActions.ts`, `src/server/services/appointmentService.ts`, `src/server/home/getHomePageData.ts`.

**`src/lib`:**
- Purpose: Shared infrastructure and utility modules.
- Contains: Auth (`auth.ts`), Prisma (`prisma.ts`), realtime, logging, security/rate-limiting, upload abstractions.
- Key files: `src/lib/auth.ts`, `src/lib/prisma.ts`, `src/lib/realtime.ts`, `src/lib/security/rate-limit.ts`.

**`src/schemas`:**
- Purpose: Zod contracts for runtime validation.
- Contains: Domain schema modules by feature (`appointmentSchemas.ts`, `friendshipSchemas.ts`, etc.).
- Key files: `src/schemas/appointmentSchemas.ts`, `src/schemas/authApiSchemas.ts`, `src/schemas/userSchemas.ts`.

**`src/providers`, `src/hooks`, `src/contexts`:**
- Purpose: Client-side context/state composition and reusable hooks.
- Contains: Session/theme/realtime providers and hooks for auth/theme/realtime/upload.
- Key files: `src/providers/SessionProvider.tsx`, `src/providers/RealtimeProvider.tsx`, `src/hooks/useRealtime.ts`.

**`src/types`:**
- Purpose: Shared TypeScript declarations and app contracts.
- Contains: Feature types (`home.ts`, `realtime.ts`, `upload.ts`) and declaration files (`*.d.ts`).
- Key files: `src/types/realtime.ts`, `src/types/home.ts`, `src/types/next-auth.d.ts`.

**`src/__tests__` and `src/tests`:**
- Purpose: Unit/integration tests and test setup.
- Contains: Jest test files and shared setup/mocks.
- Key files: `src/tests/setup.ts`, `src/__tests__/dashboardActions.test.ts`, `src/__tests__/userService.test.ts`.

**`prisma`:**
- Purpose: Data model and migration history.
- Contains: Schema, migration folders, seed file.
- Key files: `prisma/schema.prisma`, `prisma/seed.ts`, `prisma/migrations/*`.

## Key File Locations

**Entry Points:**
- `src/app/layout.tsx`: Root HTML/body shell and global providers for App Router.
- `src/app/page.tsx`: Main home page entry.
- `src/middleware.ts`: Global route protection and redirects.
- `src/app/api/auth/[...nextauth]/route.ts`: NextAuth API entry.
- `src/pages/api/debug/auth.ts`: Legacy Pages Router debug API endpoint.

**Configuration:**
- `package.json`: Dev/build/test/database scripts.
- `next.config.mjs`: Next runtime options, security headers, server-actions limits.
- `tsconfig.json`: TS options and `@/*` alias to `src/*`.
- `jest.config.js`: Unit test runner setup and coverage selection.
- `prisma.config.ts`: Prisma runtime configuration.

**Core Logic:**
- `src/server/*Actions.ts`: Server Action use-case orchestration.
- `src/server/services/*.ts`: Domain service layer for persistence/business rules.
- `src/app/api/**/route.ts`: HTTP endpoint handlers.
- `src/lib/*`: Auth, DB client, realtime, security, upload strategies.
- `prisma/schema.prisma`: Canonical domain model.

**Testing:**
- `src/__tests__/**/*.test.tsx`: UI and interaction coverage.
- `src/__tests__/**/*.test.ts`: Server/service behavior coverage.
- `src/tests/setup.ts`: Global Jest mocks and environment setup.
- `e2e/*.spec.ts`: Playwright end-to-end scenarios.

## Naming Conventions

**Files:**
- App Router conventions use reserved names: `page.tsx`, `layout.tsx`, `route.ts`, `loading.tsx`, `error.tsx`, `not-found.tsx` (for example `src/app/profile/settings/page.tsx`).
- Most React components use PascalCase filenames (for example `src/components/ServiceForm.tsx`, `src/components/home-3d/HomeExperience.tsx`).
- Some legacy/shared components use kebab-case names (for example `src/components/header.tsx`, `src/components/search-bar.tsx`).
- Server orchestration files follow suffix-based naming: `*Actions.ts` and `*Service.ts`/`*Service.ts` equivalent in `src/server/services`.

**Directories:**
- Feature directories are lowercase and domain-oriented (`src/app/dashboard/admin`, `src/components/scheduling`, `src/server/services`).
- Dynamic route segments use Next.js bracket syntax (`src/app/salons/[id]`, `src/app/chat/[conversationId]`).
- API route directories mirror endpoint paths under `src/app/api/...`.

## Where to Add New Code

**New Feature:**
- Primary code: Route in `src/app/<feature>/page.tsx`, UI in `src/components/<feature>/`.
- Backend orchestration: `src/server/<feature>Actions.ts`.
- Business/data rules: `src/server/services/<feature>Service.ts`.
- Validation contracts: `src/schemas/<feature>Schemas.ts`.
- Tests: `src/__tests__/` for unit/integration and `e2e/` for browser flows.

**New Component/Module:**
- Implementation: Shared primitives in `src/components/ui/`; feature-specific components in `src/components/<feature>/`.

**Utilities:**
- Shared helpers/infrastructure: `src/lib/`.
- Shared type contracts: `src/types/`.

## Special Directories

**`src/pages/api`:**
- Purpose: Legacy Pages Router API routes kept for debug.
- Generated: No.
- Committed: Yes.

**`src/server/*.old.ts`:**
- Purpose: Historical server-action versions (`src/server/userActions.old.ts`, `src/server/serviceActions.old.ts`, `src/server/appointmentActions.old.ts`).
- Generated: No.
- Committed: Yes.

**`prisma/migrations`:**
- Purpose: Prisma migration history used by deploy and local DB flows.
- Generated: Yes (via Prisma migration commands).
- Committed: Yes.

**`.next`:**
- Purpose: Next.js build artifacts for local runtime.
- Generated: Yes.
- Committed: No.

---

*Structure analysis: 2026-04-08*
