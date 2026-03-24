# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

Full-stack barbershop appointment booking system. Next.js 15 (App Router) + React 19 + TypeScript + Prisma v6 + PostgreSQL + NextAuth.js v4. Mobile-first UI with shadcn/ui (Radix + Tailwind CSS).

## Commands

### Development
```bash
npm run dev              # Next.js dev server
npm run build            # Production build
npm run start            # Run built app
```

### Quality
```bash
npm run validate         # Lint + type-check (run before committing)
npm run lint:check       # ESLint only
npm run lint:fix         # ESLint autofix
npm run type-check       # TypeScript check (tsc --noEmit)
```

### Testing
```bash
npm test                 # Jest
npm run test:watch       # Watch mode
npm run test:coverage    # Coverage report
npm test -- --testPathPattern="path/to/test"  # Single test file
```

### Database (Prisma)
```bash
npm run db:migrate       # prisma migrate dev
npm run db:push          # Push schema without migration
npm run db:seed          # Seed via tsx prisma/seed.ts
npm run db:reset         # Full reset
npm run db:studio        # Prisma Studio GUI
npm run db:generate      # Generate client (also runs on postinstall)
```

### Docker (alternative dev workflow)
```bash
make dev-up              # Start Docker dev stack
make dev-down            # Stop
make dev-shell           # Shell into app container
make quality-check       # Lint + type-check
```

### Production
```bash
npm run build:vercel     # Vercel build (removes sharp)
./scripts/deploy-pro.sh deploy  # Docker prod deploy
make prod-local          # Simulate production locally
```

## Architecture

### Data Flow
```
Client → Zod validation (src/schemas/) → Server Actions (src/server/*Actions.ts)
       → Service layer (src/server/services/) → Prisma → PostgreSQL
```

API routes at `src/app/api/` are used for auth endpoints and real-time (SSE). Most mutations go through Server Actions.

### Key Directories
- `src/app/` — Next.js App Router pages and API routes
- `src/server/` — Server Actions (`*Actions.ts`) and service layer (`services/`)
- `src/schemas/` — Zod validation schemas (one per domain: appointment, auth, chat, etc.)
- `src/components/ui/` — shadcn/ui base components (Button, Card, Dialog, etc.)
- `src/components/` — Domain-specific components
- `src/lib/` — Shared utilities: `prisma.ts` (singleton client), `auth.ts` (NextAuth config), `logger.ts`, `utils.ts` (`cn()` for classnames)
- `src/hooks/` — Custom React hooks
- `src/providers/` — Context providers (Session, Realtime, Theme)
- `prisma/` — Schema, migrations, seed

### Authentication
NextAuth.js v4 with GitHub, Google, Discord OAuth + Credentials (email/password). JWT sessions. Three roles: `CLIENT`, `BARBER`, `ADMIN`. Middleware at `src/middleware.ts` protects routes. Use `getServerSession(authOptions)` server-side.

### Database Models (Prisma)
Core models: `User` (roles, soft delete), `Appointment` (status machine: SCHEDULED→CONFIRMED→COMPLETED/CANCELLED/NO_SHOW), `Service`, `ServiceHistory`, `Voucher` (discount types), `Promotion`, `Friendship`/`FriendRequest`, `Conversation`/`Message`, `Notification`.

Soft delete pattern uses `deletedAt`, `deletedById`, `updatedById` fields.

### Styling
Tailwind CSS primary. SCSS Modules (`.module.scss`) for complex components. Use `cn()` from `@/lib/utils` for conditional classes. `class-variance-authority` for component variants.

### Imports
```typescript
import { something } from "@/components/ui/component"  // shadcn components
import { db } from "@/lib/prisma"                       // Prisma client
import { authOptions } from "@/lib/auth"                // NextAuth config
```

## Conventions

- Path alias: `@/*` maps to `./src/*`
- Components: PascalCase files. Pages: kebab-case (App Router).
- Database columns: snake_case in DB, camelCase in Prisma schema.
- All external input validated with Zod schemas before reaching services.
- Forms use react-hook-form + `@hookform/resolvers/zod`.
- Server actions live in `src/server/` named `{domain}Actions.ts`.
- Prisma client imported as `db` from `@/lib/prisma`.
- Transactions required for multi-model operations.
