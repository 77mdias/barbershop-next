# Architecture

**Analysis Date:** 2026-04-08

## Pattern Overview

**Overall:** Layered modular monolith on Next.js App Router, combining Server Components, Server Actions, and REST route handlers.

**Key Characteristics:**
- UI routes in `src/app` call backend capabilities through direct Server Action imports (for app flows) and `route.ts` handlers (for HTTP APIs).
- Domain logic is centralized in service classes under `src/server/services`, while orchestration and auth checks live in `src/server/*Actions.ts`.
- Shared infrastructure (`auth`, `prisma`, security, realtime, upload) is isolated in `src/lib` and reused by both Server Actions and API handlers.

## Layers

**Presentation Layer:**
- Purpose: Render pages, compose layout, and run client interactivity.
- Location: `src/app`, `src/components`, `src/providers`, `src/hooks`, `src/contexts`
- Contains: App Router `page.tsx` files, UI components, client-side state/hooks, provider wiring.
- Depends on: `src/server/*Actions.ts`, `src/lib/*`, `next-auth`, `next/navigation`.
- Used by: Browser requests and user navigation.

**API Route Layer:**
- Purpose: Expose HTTP endpoints for auth, uploads, health, appointments, services, social features.
- Location: `src/app/api/**/route.ts` (and legacy `src/pages/api/debug/auth.ts`)
- Contains: `GET/POST/PUT/DELETE` handlers using `NextRequest`/`NextResponse`.
- Depends on: `src/lib/auth.ts`, `src/lib/prisma.ts`, `src/server/services/*`, `src/schemas/*`.
- Used by: Client fetches, SSE (`/api/realtime`), external consumers.

**Server Action Layer:**
- Purpose: Application orchestration for authenticated app flows.
- Location: `src/server/*Actions.ts`
- Contains: Action functions with `"use server"`, input validation, permission checks, revalidation, event emission.
- Depends on: `src/lib/auth.ts`, `src/schemas/*`, `src/server/services/*`, `src/lib/realtime.ts`, `next/cache`.
- Used by: Server Components and Client Components importing actions (for example `src/app/scheduling/page.tsx`, `src/app/dashboard/admin/users/UsersPageClient.tsx`).

**Domain Service Layer:**
- Purpose: Encapsulate business logic and persistence access.
- Location: `src/server/services/*.ts` and `src/server/home/getHomePageData.ts`
- Contains: Domain services (`AppointmentService`, `UserService`, `FriendshipService`, `ChatService`) and home-page aggregation logic.
- Depends on: `src/lib/prisma.ts`, Prisma types, domain schemas/types.
- Used by: `src/server/*Actions.ts` and selected API handlers (`src/app/api/friends/*.ts`).

**Validation Layer:**
- Purpose: Runtime contracts for inputs and filters.
- Location: `src/schemas/*.ts`
- Contains: Zod schemas and inferred input types.
- Depends on: `zod`.
- Used by: API routes and Server Actions before business logic execution.

**Infrastructure Layer:**
- Purpose: Cross-cutting capabilities and external integration boundaries.
- Location: `src/lib/*`
- Contains: Auth setup (`src/lib/auth.ts`), Prisma client (`src/lib/prisma.ts`), logging (`src/lib/logger.ts`), realtime bus (`src/lib/realtime.ts`), security/rate limits (`src/lib/security/*`, `src/lib/rate-limiter.ts`), upload storage strategies (`src/lib/upload/*`).
- Depends on: NextAuth, Prisma, Node APIs, storage provider SDKs.
- Used by: All backend-facing layers.

**Data Model Layer:**
- Purpose: Canonical relational domain model.
- Location: `prisma/schema.prisma`
- Contains: Models for users, appointments, services, history, promotions, social graph, chat, notifications.
- Depends on: PostgreSQL datasource and Prisma generator.
- Used by: `src/lib/prisma.ts` consumers in services/actions/routes.

## Data Flow

**Server Component + Server Action Flow:**

1. A route component in `src/app/**/page.tsx` loads the session (`getServerSession`) and optionally prefetches data via an action (for example `src/app/dashboard/admin/users/page.tsx`).
2. A client component triggers a Server Action imported from `src/server/*Actions.ts` (for example `src/components/scheduling/AppointmentWizard.tsx` -> `createAppointment`).
3. The action validates input via `src/schemas/*`, delegates business rules to `src/server/services/*`, writes through Prisma (`src/lib/prisma.ts`), then revalidates routes (`revalidatePath`) and may emit realtime events (`src/lib/realtime.ts`).

**HTTP API Route Flow:**

1. `src/app/api/**/route.ts` receives `NextRequest`.
2. Handler enforces auth/role via `getServerSession(authOptions)` from `src/lib/auth.ts`.
3. Handler validates query/body via schema modules in `src/schemas/*`.
4. Handler executes DB/service logic directly or via service classes, then returns `NextResponse.json(...)`.

**Realtime Flow (SSE + In-Process Event Bus):**

1. Client provider `src/providers/RealtimeProvider.tsx` opens `EventSource("/api/realtime")`.
2. `src/app/api/realtime/route.ts` subscribes to the event emitter in `src/lib/realtime.ts`.
3. Server Actions emit events via `emitRealtimeEvent(...)`.
4. SSE stream pushes matching events to subscribed sessions and the provider broadcasts cross-tab updates via `BroadcastChannel`.

**State Management:**
- Server state is persisted in PostgreSQL through Prisma models in `prisma/schema.prisma`.
- Auth/session state is JWT-based through NextAuth config in `src/lib/auth.ts` and consumed by middleware in `src/middleware.ts`.
- Client UI state is local React state/hooks in feature components plus context providers in `src/providers/*`.

## Key Abstractions

**Service Classes:**
- Purpose: Reusable domain operations with Prisma-backed data access.
- Examples: `src/server/services/appointmentService.ts`, `src/server/services/userService.ts`, `src/server/services/friendshipService.ts`
- Pattern: Static methods that encapsulate queries, business checks, and transaction boundaries.

**Server Action Result Contract:**
- Purpose: Uniform action responses for client/server callers.
- Examples: `src/server/appointmentActions.ts`, `src/server/userActions.ts`, `src/server/chatActions.ts`
- Pattern: Return shape `{ success: boolean, data?: ..., error?: string }` instead of throwing across UI boundaries.

**Schema-First Input Validation:**
- Purpose: Keep API/action boundaries strict.
- Examples: `src/schemas/appointmentSchemas.ts`, `src/schemas/authApiSchemas.ts`, `src/schemas/friendshipSchemas.ts`
- Pattern: `Schema.parse(...)` / `Schema.safeParse(...)` at entry points before service calls.

**Realtime Event Contract:**
- Purpose: Decouple event producers from subscribers.
- Examples: `src/lib/realtime.ts`, `src/types/realtime.ts`, `src/providers/RealtimeProvider.tsx`
- Pattern: Typed event payload + target filtering (`users`, `roles`, `broadcast`) with dedup by `eventId`.

**Upload Strategy Abstraction:**
- Purpose: Switch storage behavior by environment/provider.
- Examples: `src/server/hybridUploadActions.ts`, `src/lib/upload/storage.ts`, `src/server/uploadServerActions.ts`
- Pattern: Strategy/factory dispatch (`local` vs `cloudinary`/memory) while keeping route handlers stable.

## Entry Points

**Application Shell:**
- Location: `src/app/layout.tsx`
- Triggers: Every App Router request.
- Responsibilities: Global fonts, top nav, toaster, provider composition (`ThemeProvider` + NextAuth `SessionProvider` + `RealtimeProvider`).

**Primary Web Route:**
- Location: `src/app/page.tsx`
- Triggers: `GET /`.
- Responsibilities: Load homepage aggregate data through `getHomePageData` and render 3D home experience.

**Auth System Route:**
- Location: `src/app/api/auth/[...nextauth]/route.ts`
- Triggers: NextAuth auth endpoints.
- Responsibilities: Bind NextAuth handler to `authOptions` from `src/lib/auth.ts`.

**Route Protection Middleware:**
- Location: `src/middleware.ts`
- Triggers: Matched app routes.
- Responsibilities: Token inspection, role gating (`/dashboard/admin`), redirects for unauthenticated users.

**REST API Surface:**
- Location: `src/app/api/**/route.ts`
- Triggers: API HTTP calls.
- Responsibilities: Request validation, session checks, data access, JSON responses.

**Legacy Debug API Route:**
- Location: `src/pages/api/debug/auth.ts`
- Triggers: Pages Router API request to debug auth.
- Responsibilities: Diagnostic auth/session output guarded by `canAccessDebugEndpoints`.

## Error Handling

**Strategy:** Boundary-level `try/catch` with explicit failure responses per interface type (JSON for routes, result object for actions), plus logging.

**Patterns:**
- API routes return explicit HTTP status codes with `NextResponse.json(...)` (`401`, `403`, `404`, `409`, `429`, `500`) in files like `src/app/api/appointments/route.ts` and `src/app/api/auth/register/route.ts`.
- Server Actions avoid unhandled throw to callers and return `{ success: false, error }`, seen across `src/server/*Actions.ts`.
- Validation failures are handled close to entry (`safeParse`/`parse`) with user-facing messages from schema boundaries in `src/schemas/*`.

## Cross-Cutting Concerns

**Logging:** Structured logger in `src/lib/logger.ts` (plus residual `console.*` usage in several routes/actions).
**Validation:** Zod schemas in `src/schemas/*` used in API handlers and Server Actions.
**Authentication:** NextAuth session checks via `getServerSession(authOptions)` and route-level guards in `src/middleware.ts`.

---

*Architecture analysis: 2026-04-08*
