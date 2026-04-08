# Stack Research

**Domain:** Barbershop scheduling web platform (brownfield, Next.js, Vercel, Prisma)
**Researched:** 2026-04-08
**Confidence:** MEDIUM-HIGH

## Recommended Stack

### Core Technologies

| Technology | Version | Purpose | Why Recommended | Confidence |
|------------|---------|---------|-----------------|------------|
| Next.js | `16.2.x` (upgrade from `15.5.x`) | Full-stack web framework (App Router, Server Components, Server Actions, Route Handlers) | Current platform direction from Vercel; strongest fit for existing App Router codebase and Vercel deployment model. | HIGH |
| React + React DOM | `19.x` | UI runtime and component model | Required baseline for modern Next.js; mature concurrent/runtime behavior and broad ecosystem support. | HIGH |
| Node.js | `>=20.9` (prefer latest 20 LTS patch; evaluate Node 22 in staging) | Runtime for build/server execution | Matches Next.js system requirements; minimizes deploy/runtime drift. | HIGH |
| Auth layer | **Track A now:** `next-auth@4.24.x` + `@next-auth/prisma-adapter`  **Track B target:** Auth.js/NextAuth v5 GA | Authentication/session/role access | Safe path: keep hardened v4 in production now, prepare migration to v5 architecture (`auth.ts`, universal `auth()`) after GA maturity for lower auth risk. | MEDIUM |
| Prisma ORM + Client | `7.x` (upgrade from `6.x`) | Type-safe DB access, migrations, schema evolution | Prisma 7 is the current major line; keep Prisma for brownfield continuity and safer refactors than ORM swap. | HIGH |
| PostgreSQL | `17.x` managed (or latest provider-supported stable) | Primary transactional datastore for scheduling/appointments | Strong transactional integrity + query/index performance improvements in PG17; best fit for booking consistency needs. | HIGH |
| Tailwind CSS + shadcn/ui | Tailwind `4.x` + current shadcn/ui generator | UI system and design tokens | Tailwind v4 is current and significantly faster; shadcn remains a pragmatic, composable UI baseline for product teams. | HIGH |

### Supporting Libraries

| Library | Version | Purpose | When to Use | Confidence |
|---------|---------|---------|-------------|------------|
| `zod` + `react-hook-form` + `@hookform/resolvers` | Current major (`zod@4`, `rhf@7`) | Runtime validation + typed forms | Keep as default for all auth, booking, and profile mutation boundaries. | HIGH |
| `date-fns@4` (plus timezone-safe storage conventions) | `4.x` | Date/time handling | Keep local display in user timezone, but persist canonical UTC timestamps; mandatory for scheduling correctness. | MEDIUM |
| `three` + `@react-three/fiber` + `@react-three/drei` | `three@r183`, `r3f@9`, latest `drei` | 3D hero modernization | Use only on marketing/home surfaces with strict perf budget and progressive fallback to static hero. | HIGH |
| `motion` (Framer Motion package) | `12.x` | 2D micro/macro animations for app UI | Prefer for product UI transitions; reserve GSAP for advanced timeline choreography only. | MEDIUM |
| `gsap` (+ `@gsap/react` if adopted) | `3.14.x` | Advanced hero/landing choreography | Use when motion requires timeline/scroll orchestration not cleanly handled by `motion`. | MEDIUM |
| `@vercel/otel` + OpenTelemetry API/SDK | Current | Traces/metrics correlation across route handlers/actions | Add for platform reliability hardening and faster production incident triage. | MEDIUM |

### Development Tools

| Tool | Purpose | Notes |
|------|---------|-------|
| Prisma Migrate (`prisma migrate dev/deploy`) | Controlled schema evolution | Keep `migrate deploy` in production CI/CD; avoid ad-hoc schema drift. |
| Jest + React Testing Library | Unit/integration testing of existing codebase | Pragmatic to keep in brownfield; migration to Vitest only if test runtime becomes major bottleneck. |
| Playwright | End-to-end critical journey testing | Mandatory for booking, auth recovery, and role-protected flows before major releases. |
| ESLint 9 + TypeScript 5 | Static quality gate | Keep `lint + type-check` blocking in CI; no bypass on main branch. |

## Installation

```bash
# Core (target track)
npm install next@^16 react@^19 react-dom@^19 prisma@^7 @prisma/client@^7
npm install next-auth@^4 @next-auth/prisma-adapter
npm install tailwindcss@^4 @tailwindcss/postcss

# Supporting
npm install zod react-hook-form @hookform/resolvers date-fns
npm install three @react-three/fiber @react-three/drei motion gsap
npm install @vercel/otel @opentelemetry/api

# Dev dependencies
npm install -D @playwright/test eslint typescript
```

Notes:
- Auth.js v5 migration should be tracked as a dedicated hardening phase, not an opportunistic in-place change.
- Tailwind v4 migration should include shadcn update alignment in the same branch.

## Alternatives Considered

| Recommended | Alternative | When to Use Alternative |
|-------------|-------------|-------------------------|
| Next.js + App Router | Remix | Only if team intentionally exits Vercel/Next ecosystem and accepts migration cost. |
| Prisma 7 | Drizzle ORM | If team prioritizes SQL-first ergonomics and is willing to absorb ORM migration in brownfield code. |
| Jest (current) + Playwright | Full Vitest migration | If CI runtime is a bottleneck and team accepts test harness migration effort. |
| Vercel Cron + idempotent handlers | External queue/scheduler (e.g., managed queue) | If reminder/notification workloads need retries, dead-lettering, and high-frequency fan-out beyond cron simplicity. |

## What NOT to Use

| Avoid | Why | Use Instead |
|-------|-----|-------------|
| `prisma db push` in production | Bypasses migration history and increases schema drift risk. | `prisma migrate deploy` in production pipelines. |
| New auth work on legacy NextAuth v4-only patterns (`getServerSession` everywhere) | Increases future migration cost and duplicates session APIs. | Adopt v5-compatible architecture boundaries progressively (`auth.ts` abstraction), while keeping stable runtime path. |
| `tailwindcss-animate` for new shadcn v4 setups | Deprecated in shadcn Tailwind v4 guidance. | `tw-animate-css` (or native CSS/Tailwind v4 capabilities). |
| Always-on 60fps 3D render loops for homepage hero | Burns CPU/GPU on low-end mobile and hurts conversion/perf. | Demand-based rendering, reduced animation intensity, and static fallback variant. |
| Plaintext reset/verification tokens in DB/logs | Direct credential recovery risk and audit exposure. | Store hashed tokens + short TTL + one-time consumption semantics. |

## Stack Patterns by Variant

**If goal is safe incremental modernization (recommended now):**
- Keep modular monolith on Next.js App Router + Prisma + Postgres
- Upgrade in tracks: `Next 15 -> 16`, `Prisma 6 -> 7`, `Tailwind 3 -> 4`
- Because this preserves delivery speed while reducing platform risk

**If goal is heavy growth in async workflows (later phase):**
- Keep core stack, add explicit job subsystem for reminders/notifications/retries
- Keep API boundaries idempotent and traceable
- Because scheduling reliability depends on deterministic background execution at scale

## Version Compatibility

| Package A | Compatible With | Notes |
|-----------|-----------------|-------|
| `next@16.2.x` | `react@19.x`, `node>=20.9` | Next.js docs list Node 20.9 minimum in system requirements. |
| `@react-three/fiber@9.x` | `react@19` | R3F v9 targets React 19 compatibility. |
| `next-auth@4.24.x` | Next.js App Router (current project) | Stable current path; v5 migration should be explicit and tested. |
| Auth.js/NextAuth v5 track | Next.js App Router + `auth.ts` root config | Migration guide defines universal `auth()` and handler export pattern. |
| `prisma@7.x` | PostgreSQL (managed/self-hosted) | Prisma 7 introduces config/provider track changes; plan migration deliberately. |
| `tailwindcss@4.x` | `@tailwindcss/postcss`, updated shadcn tooling | Tailwind v4 changes config model and installation flow. |

## Sources

- Context7 `/vercel/next.js/v16.2.2` - App Router caching/revalidation patterns (`revalidateTag`, `revalidatePath`) and production behavior. (HIGH)
- Next.js docs (system requirements and current docs stream): https://nextjs.org/docs/pages/building-your-application/configuring/absolute-imports-and-module-aliases (HIGH)
- Context7 `/nextauthjs/next-auth` - Auth.js v5 migration model (`auth.ts`, universal `auth()`, handlers). (HIGH)
- Auth.js migration docs: https://authjs.dev/getting-started/migrating-to-v5 (HIGH)
- Context7 `/prisma/prisma/7.6.0` + Prisma 7 release notes: https://www.prisma.io/blog/announcing-prisma-orm-7-0-0 (HIGH)
- Prisma Migrate CLI docs: https://www.prisma.io/docs/cli/migrate (HIGH)
- PostgreSQL 17 release notes: https://www.postgresql.org/docs/current/release-17.html (HIGH)
- Tailwind v4 release: https://tailwindcss.com/blog/tailwindcss-v4 (HIGH)
- shadcn/ui Tailwind v4 migration guidance: https://ui.shadcn.com/docs/tailwind-v4 (HIGH)
- React Three Fiber docs + scaling performance guidance: https://r3f.docs.pmnd.rs/getting-started/introduction and https://r3f.docs.pmnd.rs/advanced/scaling-performance (MEDIUM-HIGH)
- Vercel Cron idempotency guidance: https://vercel.com/docs/cron-jobs/manage-cron-jobs (HIGH)

---
*Stack research for: Barbershop scheduling web platform*
*Researched: 2026-04-08*
