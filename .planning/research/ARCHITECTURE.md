# Architecture Research

**Domain:** Barbershop scheduling web platform (Next.js modular monolith)
**Researched:** 2026-04-08
**Confidence:** HIGH

## Standard Architecture

### System Overview

```
┌──────────────────────────────────────────────────────────────────────────────┐
│                   Presentation + Interaction Layer                           │
├──────────────────────────────────────────────────────────────────────────────┤
│  App Routes (`src/app`)         UI (`src/components`)                       │
│  ┌───────────────────────┐      ┌────────────────────────────────────────┐  │
│  │ Home / Dashboard / API │────▶│ HomeExperience + Admin + Profile UIs  │  │
│  └───────────┬───────────┘      └───────────────────┬────────────────────┘  │
│              │                                      │                       │
├──────────────┴──────────────────────────────────────┴────────────────────────┤
│                  Application Boundary Layer                                   │
├──────────────────────────────────────────────────────────────────────────────┤
│  Server Actions (`src/server/*Actions.ts`) + Route Handlers (`app/api/**`)  │
│  ┌────────────────────────┐  ┌────────────────────────┐  ┌────────────────┐ │
│  │ Auth & Session Guards  │  │ Validation (Zod)       │  │ Revalidation   │ │
│  └────────────┬───────────┘  └────────────┬───────────┘  └───────┬────────┘ │
│               │                           │                      │          │
├───────────────┴───────────────────────────┴──────────────────────┴──────────┤
│                       Domain Service Layer                                    │
├──────────────────────────────────────────────────────────────────────────────┤
│  Booking Domain   Upload Domain   Security Domain   Reporting Read Model     │
│  (services/*)     (new seam)      (new seam)        (new seam)               │
├──────────────────────────────────────────────────────────────────────────────┤
│                     Infrastructure / Adapters                                 │
├──────────────────────────────────────────────────────────────────────────────┤
│  Prisma Client | NextAuth/Auth.js | Storage Adapter | Rate Limit Adapter     │
│  Realtime Bus  | Logger (redacted) | Cache/Revalidation                      │
├──────────────────────────────────────────────────────────────────────────────┤
│                         Data & Runtime                                        │
├──────────────────────────────────────────────────────────────────────────────┤
│  PostgreSQL (Prisma schema) | File/Object Storage | SSE Stream               │
└──────────────────────────────────────────────────────────────────────────────┘
```

### Component Responsibilities

| Component | Responsibility | Typical Implementation |
|-----------|----------------|------------------------|
| `HomeExperienceShell` | Compose homepage sections and keep booking CTA/data contracts stable | Server component + client composition that consumes `getHomePageData` DTO only |
| `HomeSceneAdapter` | Progressive-enhancement 3D rendering with fallback and performance tiering | Dynamic import (`ssr:false`) + capability detection (`WebGL`, reduced motion, pointer mode) |
| `AuthTokenLifecycleService` | Issue/verify/reset email + password tokens with secure storage model | `node:crypto` random token generation, hashed token persistence, single-use invalidation |
| `UploadOrchestrator` | Single upload/delete contract across profile/reviews with consistent error semantics | Application service called by both route handlers and server actions |
| `StorageAdapter` | Abstract local/cloud storage differences while preserving one domain contract | Adapter interface (`save/delete/exists`) with environment-specific implementations |
| `ReportingReadModel` | Isolate heavy admin reporting queries and projections from UI code | Query module + DTO mapper + cache keys + explicit indexes |
| `SecurityPolicyGateway` | Central authz/rate-limit/debug access policy checks | Shared middleware/guard helpers reused by routes/actions |
| `Architecture Contract Tests` | Freeze boundary behavior during refactors | Jest integration tests for route/action contracts and schema-level assertions |

## Recommended Project Structure

```text
src/
├── app/                              # App Router entrypoints + route handlers
├── components/
│   ├── home-3d/                      # 3D UI only (scene + fallback + presentation)
│   └── home/                         # Non-3D home sections and reusable blocks
├── server/
│   ├── actions/                      # Thin orchestration wrappers (gradual extraction target)
│   ├── domains/
│   │   ├── auth/                     # Token lifecycle + auth policies
│   │   ├── upload/                   # Upload orchestrator + delete semantics
│   │   └── reporting/                # Admin read-model queries/mappers
│   └── services/                     # Existing domain services (incremental migration)
├── lib/
│   ├── security/                     # Rate-limit/debug guards + security helpers
│   ├── upload/                       # Low-level adapters/utilities
│   └── logger.ts                     # Redaction-capable structured logging
├── schemas/                          # Zod contracts shared by handlers/actions
└── __tests__/
    ├── contracts/                    # Route/action contract tests
    ├── security/                     # Token/debug/rate-limit tests
    └── integration/                  # Upload and auth lifecycle e2e-ish tests
```

### Structure Rationale

- **`server/domains/*` as seams, not rewrite:** keep existing `services/*` working while introducing bounded modules for high-risk flows (auth/upload/reporting) with adapter-style migration.
- **`components/home-3d` isolated from data orchestration:** keep visual evolution decoupled from booking/business data pipelines.
- **`__tests__/contracts` first-class:** regression risk is currently boundary-level, so tests must target API/action contracts before large refactors.

## Architectural Patterns (Low-Regression Focus)

### Pattern 1: Strangler Boundary for Risky Flows

**What:** Keep route/action signatures stable, delegate internals to new domain modules.
**When to use:** Security hardening and upload consolidation.
**Trade-offs:** Slight temporary indirection, but major reduction in blast radius.

**Example:**
```typescript
// app/api/upload/profile/route.ts
export async function POST(req: NextRequest) {
  const input = await parseProfileUpload(req);
  return UploadRoutePresenter.fromResult(
    await uploadOrchestrator.uploadProfile(input)
  );
}
```

### Pattern 2: Progressive Enhancement Boundary for 3D

**What:** Treat 3D as an optional rendering adapter, never as the data/business source.
**When to use:** Home 3D evolution and future gallery extensions.
**Trade-offs:** Some duplicate presentation effort (fallback + 3D), but conversion-safe UX on weak devices.

**Example:**
```typescript
const showCanvas = isMounted && !prefersReducedMotion && webglEnabled;
return showCanvas ? <DynamicHomeSceneCanvas tier={tier} /> : <StaticBackdrop />;
```

### Pattern 3: Contract-First Mutation Architecture

**What:** Every mutation boundary has schema validation + deterministic result envelope + targeted revalidation.
**When to use:** Server Actions and Route Handlers that mutate DB/storage.
**Trade-offs:** More boilerplate, but failures become explicit and testable.

**Example:**
```typescript
const parsed = ResetPasswordBodySchema.safeParse(body);
if (!parsed.success) return NextResponse.json({ error: "Dados inválidos" }, { status: 400 });

const result = await authTokenLifecycle.resetPassword(parsed.data);
revalidatePath("/profile");
return NextResponse.json(result);
```

## Data Flow

### Request Flow (Target)

```text
[User Action]
    ↓
[Page/Client Component]
    ↓
[Server Action OR Route Handler]
    ↓ (Zod contract + authz + rate limit)
[Domain Orchestrator]
    ↓
[Service/Repository + Adapter]
    ↓
[Prisma + Storage + Realtime]
    ↓
[Presenter/Result Envelope + Revalidation]
    ↓
[UI update + SSE updates]
```

### Key Data Flows

1. **Token Lifecycle Flow (security hardening):**
   `forgot-password/verify-email route -> AuthTokenLifecycleService -> hash token + persist digest + expiry -> email dispatch -> reset/verify route compares digest (timing-safe) -> single-use invalidation`.

2. **Upload Flow (consistency hardening):**
   `upload route -> UploadOrchestrator -> validate (type/size/count) -> StorageAdapter.save/delete -> DB update in transaction boundary -> response presenter with consistent status codes`.

3. **Home 3D Flow (progressive enhancement):**
   `HomePage server component -> getHomePageData (cached, timeout-guarded) -> HomeExperienceShell -> HomeSceneAdapter decides 3D vs fallback at runtime -> same content contract rendered regardless of mode`.

4. **Admin reporting flow (future reliability):**
   `admin route -> reporting action -> ReportingReadModel query set (indexed + bounded) -> DTO mapper -> cached response + explicit invalidation on mutations`.

## Suggested Build Order (Phased, Low Regression Risk)

### Phase 1: Contract Safety Net First

- Build route/action contract tests for auth tokens, upload profile/reviews, debug access policy.
- Freeze current response shapes before refactor.
- Add redaction rules to logger tests (no token/PII leakage).

**Why first:** prevents silent behavior drift during all later phases.

### Phase 2: Security Domain Extraction

- Introduce `AuthTokenLifecycleService` with cryptographic token generation and hashed persistence.
- Route handlers (`forgot-password`, `reset-password`, `verify-email`) become thin delegates.
- Centralize debug endpoint policy and tighten middleware/auth checks.

**Dependency:** requires Phase 1 tests to validate parity and new security invariants.

### Phase 3: Upload Domain Consolidation

- Create single `UploadOrchestrator` used by both upload routes.
- Implement real delete semantics (remove placeholder success in review delete path).
- Ensure DB mutation + storage operation consistency and explicit failure contracts.

**Dependency:** security/logging patterns from Phase 2 reused for upload policies and audit logging.

### Phase 4: Home 3D Evolution Behind Stable Contract

- Keep `getHomePageData` contract stable; evolve only presentation layers (`HomeExperience`, `HomeScene*`).
- Introduce scene capability policy module (tier limits, reduced motion, fallback behavior).
- Add perf and UX regression tests around CTA visibility and fallback mode.

**Dependency:** upload/security hardening done first so visual work does not mask critical regressions.

### Phase 5: Reporting + Distributed Runtime Hardening

- Extract admin reporting into read-model query modules and DTO mappers.
- Add DB indexes/materialization strategy for heavy report paths.
- Migrate process-local rate limits to distributed backend when scaling pressure requires it.

**Dependency:** uses established test harness and domain boundary pattern from phases 1-3.

## Build-Order Implications

1. **Do not start with 3D refactors:** first secure boundaries that can cause account/data incidents (token/upload).
2. **Refactor and behavior change must be separated:** keep one phase for seam extraction, next for behavior hardening where possible.
3. **Contract tests are the release gate:** each phase exits only after unchanged contracts (or explicitly versioned changes) are proven.
4. **Legacy duplicates (`*.old`, `.bak`) should be removed only after seam adoption:** avoids deleting fallback paths prematurely.

## Scaling Considerations

| Scale | Architecture Adjustments |
|-------|--------------------------|
| 0-1k users | Keep modular monolith; prioritize boundary tests and security correctness over infra changes |
| 1k-100k users | Introduce distributed rate limiting, report query optimization/indexes, cache invalidation precision |
| 100k+ users | Split heavy read domains (reporting/media) into dedicated services only after stable contracts and observability maturity |

### Scaling Priorities

1. **First bottleneck:** admin/report query latency from broad reads and in-memory aggregation.
2. **Second bottleneck:** process-local abuse controls (rate limit/memory upload behavior) under horizontal scaling.

## Anti-Patterns to Avoid

### Anti-Pattern 1: Parallel Rewrite of Auth + Upload + UI

**What people do:** refactor high-risk domains and homepage visuals in one batch.
**Why it's wrong:** multiplies unknowns and makes rollback ambiguous.
**Do this instead:** execute domain hardening first, then visual evolution behind stable contracts.

### Anti-Pattern 2: Keep Dual Upload Pipelines Indefinitely

**What people do:** maintain `hybridUploadActions` and `uploadServerActions` with divergent semantics.
**Why it's wrong:** hidden behavior differences and inconsistent error/delete guarantees.
**Do this instead:** one orchestrator contract, adapter-based storage internals.

### Anti-Pattern 3: Treat Server Actions as Trusted Internal Calls

**What people do:** skip strict authz/validation because calls originate from app UI.
**Why it's wrong:** server functions are still network-invokable and mutate state.
**Do this instead:** enforce schema validation, auth policy checks, and explicit mutation guards at boundary.

## Integration Points

### External Services

| Service | Integration Pattern | Notes |
|---------|---------------------|-------|
| PostgreSQL (Prisma) | Repository/service calls through Prisma Client | Use transaction patterns by scenario; avoid long interactive transactions |
| Auth providers (NextAuth/Auth.js) | Provider adapters + middleware/session callbacks | Keep secrets/cookies/session policies centralized and test-backed |
| Object/local storage | Storage adapter behind upload orchestrator | Preserve one app-level contract independent of provider |
| Realtime/SSE | Event emitter + `/api/realtime` stream | Emit from mutation boundaries only after successful writes |

### Internal Boundaries

| Boundary | Communication | Notes |
|----------|---------------|-------|
| `app/api/*` ↔ `server/domains/*` | Command/result objects | Routes stay thin, domain owns mutation semantics |
| `server/*Actions` ↔ `server/services/*` | Typed function calls + result envelopes | Keep UI-facing error contracts stable |
| `components/home-3d/*` ↔ `server/home/getHomePageData` | DTO-only input props | 3D layer cannot reach DB/auth directly |
| `middleware` ↔ auth/security policies | Shared guards/config | Single source for authz/rate/debug policy |

## Sources

- Internal codebase context: `.planning/PROJECT.md`, `.planning/codebase/ARCHITECTURE.md`, `.planning/codebase/CONCERNS.md` (HIGH)
- Next.js route handlers and mutation model: https://nextjs.org/docs/app/api-reference/file-conventions/route and https://nextjs.org/docs/app/getting-started/mutating-data (HIGH)
- Next.js cache invalidation behavior: https://nextjs.org/docs/app/api-reference/functions/revalidatePath (HIGH)
- Prisma transaction patterns and caution for interactive transactions: https://www.prisma.io/docs/orm/prisma-client/queries/transactions (HIGH)
- Prisma index strategy best practices: https://www.prisma.io/docs/orm/more/best-practices (HIGH)
- Auth.js middleware + authorized callback patterns: https://authjs.dev/reference/nextjs (HIGH)
- OWASP Forgot Password Cheat Sheet (token lifecycle controls): https://cheatsheetseries.owasp.org/cheatsheets/Forgot_Password_Cheat_Sheet.html (HIGH)
- OWASP File Upload Cheat Sheet (validation/storage controls): https://cheatsheetseries.owasp.org/cheatsheets/File_Upload_Cheat_Sheet.html (HIGH)
- OWASP Logging Cheat Sheet (sensitive data exclusion): https://cheatsheetseries.owasp.org/cheatsheets/Logging_Cheat_Sheet.html (HIGH)

---
*Architecture research for: barbershop scheduling web platform*
*Researched: 2026-04-08*
