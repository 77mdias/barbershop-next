# Pitfalls Research

**Domain:** Barbershop scheduling platform (brownfield) evolving with realtime/social modules and richer motion/3D frontend
**Researched:** 2026-04-08
**Confidence:** HIGH

## Critical Pitfalls

### Pitfall 1: Double-booking from non-atomic slot confirmation

**What goes wrong:**
Two customers confirm the same slot during peak traffic, creating conflicting appointments and manual rework.

**Why it happens:**
Availability is checked in one query and inserted in another without a transaction boundary or unique slot constraint.

**How to avoid:**
Use DB-enforced slot uniqueness and wrap booking confirmation in `prisma.$transaction` with strict isolation for conflict-prone writes. Treat conflict errors as expected control flow (retry/select alternative slot).

**Warning signs:**
Duplicate appointments for same barber/time, rising conflict errors in peak windows, support tickets about “confirmed but unavailable” bookings.

**Phase to address:**
Phase A - Booking Consistency & Transaction Safety

---

### Pitfall 2: Realtime UI disagrees with App Router cache

**What goes wrong:**
Realtime events say “slot taken/message read,” but server-rendered pages still show stale data until refresh.

**Why it happens:**
Mutations publish realtime events but do not invalidate tagged/path caches, or critical reads are cached when they should be dynamic.

**How to avoid:**
Define cache policy per domain object (availability, unread counters, reports). Use `cache: 'no-store'` for volatile reads, and standardize `revalidateTag`/`revalidatePath` after mutations.

**Warning signs:**
Users see “fixed on refresh,” unread counters drift, admin dashboards lag behind chat/booking events.

**Phase to address:**
Phase B - Realtime Architecture & Event Contracts

---

### Pitfall 3: Duplicate/out-of-order social events

**What goes wrong:**
Chat messages or friendship notifications appear duplicated, out of order, or with broken unread counts.

**Why it happens:**
Realtime delivery is often at-least-once; reconnect/replay paths are not idempotent; client optimistic updates are not reconciled by server sequence.

**How to avoid:**
Adopt event contract: immutable event ID, monotonic sequence per conversation, idempotent consumer rules, and server ACK semantics. Persist last-processed sequence per client session.

**Warning signs:**
Negative/unexpected unread counters, repeated toast notifications, “phantom” duplicate messages after reconnect.

**Phase to address:**
Phase B - Realtime Architecture & Event Contracts

---

### Pitfall 4: Assuming native websocket statefulness on Vercel Functions

**What goes wrong:**
Realtime behavior is unstable in production (disconnect loops, event loss on deploy/scale events).

**Why it happens:**
Architecture assumes long-lived in-process websocket state on infrastructure that is optimized for stateless function execution.

**How to avoid:**
Use managed realtime provider for fanout/presence/pub-sub; keep app functions publish/authorize only. Define reconnect, replay, and backpressure behavior explicitly.

**Warning signs:**
Spike in reconnect attempts, missed delivery during deploy windows, environment-specific realtime bugs.

**Phase to address:**
Phase B - Realtime Architecture & Event Contracts

---

### Pitfall 5: Upload lifecycle inconsistency in social/review media

**What goes wrong:**
Files remain orphaned, API returns success while DB/state is inconsistent, and deletes are not reliable.

**Why it happens:**
Multiple upload paths with different validation/error semantics; delete flow is partially implemented; persistence errors are swallowed.

**How to avoid:**
Consolidate to one upload orchestration service with explicit commit/rollback semantics. Make delete idempotent and verifiable; fail requests when DB persistence fails.

**Warning signs:**
Storage usage grows without matching records, “deleted” images still accessible, success responses with missing profile/review linkage.

**Phase to address:**
Phase D - Upload Lifecycle Consolidation

---

### Pitfall 6: Social/booking BOLA (object-level authorization drift)

**What goes wrong:**
Users can fetch/update records they should not access (appointments, chats, friendships, reviews).

**Why it happens:**
Authorization checks are route-specific and inconsistent; ownership/role checks are not centralized in service layer.

**How to avoid:**
Enforce policy checks in server services (not only UI/routes), require ownership predicates in every read/write, and add deny-path tests for each protected mutation/query.

**Warning signs:**
IDs in requests can access cross-user data, inconsistent 403 behavior across endpoints, security review findings around IDOR/BOLA.

**Phase to address:**
Phase C - Security Hardening

---

### Pitfall 7: Motion/3D-first homepage hurting booking conversion

**What goes wrong:**
Premium visual redesign degrades LCP/INP on mobile and delays access to core booking CTAs.

**Why it happens:**
3D scene and heavy animations are loaded on critical path without device capability gating or reduced-motion policy.

**How to avoid:**
Treat 3D as progressive enhancement: static/low-motion fallback first, lazy-load advanced scene, honor `prefers-reduced-motion`, and enforce performance budgets before rollout.

**Warning signs:**
Mobile drop-off on home->booking funnel, elevated interaction latency, support complaints about lag/jank.

**Phase to address:**
Phase E - Home Motion/3D Performance Rollout

---

### Pitfall 8: WebGL memory leaks and frame-loop anti-patterns

**What goes wrong:**
Session performance decays over time (FPS drops, memory growth, tab crashes) after navigation or repeated hero mounts.

**Why it happens:**
Objects are created inside frame loops, resource disposal is unmanaged, and React state updates run per-frame.

**How to avoid:**
Follow R3F/Three performance rules: no `setState` in `useFrame`, reuse vectors/materials, dispose resources on unmount, and instrument renderer memory stats in QA.

**Warning signs:**
Increasing GPU/heap usage after route changes, jitter on returning to homepage, worse performance on mid-range mobile devices.

**Phase to address:**
Phase E - Home Motion/3D Performance Rollout

---

### Pitfall 9: Shipping debug/security debt into new modules

**What goes wrong:**
New realtime/social features expand attack surface while old token/logging/debug risks remain exploitable.

**Why it happens:**
Feature work proceeds before hardening token generation/storage, sensitive logging, debug route exposure, and CSP policy.

**How to avoid:**
Hardening-first gate: secure token lifecycle, redact sensitive logs, disable debug endpoints in production build, and tighten CSP before enabling new public endpoints.

**Warning signs:**
PII in logs, production-accessible debug routes, security scanner findings, incident-response escalations tied to auth flows.

**Phase to address:**
Phase C - Security Hardening

## Technical Debt Patterns

Shortcuts that seem reasonable but create long-term problems.

| Shortcut | Immediate Benefit | Long-term Cost | When Acceptable |
|----------|-------------------|----------------|-----------------|
| Keep `.old/.bak` modules in active tree | Quick rollback comfort | Engineers patch wrong file; behavior drift | Never in active `src/` |
| Add one-off realtime handlers per feature | Faster feature shipping | Inconsistent event contracts and cache invalidation | Only for short-lived spike branches |
| Return “success with warning” on partial upload failures | Avoids blocking user flow | Hidden data corruption and orphan files | Never for persistence-critical writes |
| Push 3D to all clients by default | Strong visual impact quickly | Mobile regressions and conversion loss | Only behind experiment flag with kill switch |

## Integration Gotchas

Common mistakes when connecting to external services.

| Integration | Common Mistake | Correct Approach |
|-------------|----------------|------------------|
| Realtime provider (Ably/Pusher/Supabase/etc.) | Treat provider events as exactly-once | Build idempotent consumers + replay-safe sequencing |
| Prisma + Postgres | Rely only on app-level checks for slot conflicts | Enforce DB constraints + transactional conflict handling |
| Cloudinary/storage | Upload first, patch DB later without compensation | Use explicit saga/compensation or atomic finalize flow |
| Next.js cache + server actions | Emit realtime event but skip cache invalidation | Revalidate tags/paths in same mutation boundary |

## Performance Traps

Patterns that work at small scale but fail as usage grows.

| Trap | Symptoms | Prevention | When It Breaks |
|------|----------|------------|----------------|
| Sequential aggregation for admin analytics | Slow reports, timeouts | Push aggregation to SQL + parallelize + cache snapshots | Usually visible around tens of thousands of records |
| In-memory rate limiting only | Inconsistent abuse protection across instances | Shared distributed limiter (Redis/managed) | First scale-out event |
| Per-frame allocations in 3D loops | Increasing GC pauses, FPS decay | Reuse objects, no frame-loop allocations | Long sessions and mid-tier phones |
| Unbounded bundle/motion growth on home | Slow first interaction and jank | Split code, lazy 3D, strict performance budgets | Mobile networks/devices first |

## Security Mistakes

Domain-specific security issues beyond general web security.

| Mistake | Risk | Prevention |
|---------|------|------------|
| Predictable/plaintext reset/verify tokens | Account takeover after token leakage/guessing | Cryptographically strong random tokens + hashed storage + strict TTL |
| Object-level auth missing in social/booking routes | Cross-account data access (BOLA/IDOR) | Central service-layer authorization and deny-path tests |
| Debug/test routes reachable in production | Unauthorized internal action execution | Build-time exclusion or strict feature-flag/network gating |
| Overly permissive CSP while adding dynamic UI/motion | Higher XSS blast radius | Nonce/hash-based CSP and origin allowlist review |

## UX Pitfalls

Common user experience mistakes in this domain.

| Pitfall | User Impact | Better Approach |
|---------|-------------|-----------------|
| Fancy hero hides booking CTA priority | Users cannot quickly schedule | Keep booking CTA visible above fold even with 3D enabled |
| Realtime status flips without explanation | User distrust in slot availability | Show “last updated” + conflict resolution messaging |
| Social notifications without preference controls | Notification fatigue | Add granular notification settings and sensible defaults |
| Motion ignores reduced-motion preferences | Accessibility failures and discomfort | Respect system and app-level reduced-motion controls |

## "Looks Done But Isn't" Checklist

Things that appear complete but are missing critical pieces.

- [ ] **Realtime chat/status:** Missing replay + idempotency tests — verify duplicate/out-of-order event handling
- [ ] **Booking flow:** Missing concurrency tests — verify double-booking cannot happen under parallel requests
- [ ] **3D homepage:** Missing fallback path — verify non-WebGL and reduced-motion experiences
- [ ] **Upload delete:** Missing storage+DB consistency checks — verify file is actually deleted and record reconciled
- [ ] **Security hardening:** Missing production deny tests — verify debug routes and unsafe token flows are blocked
- [ ] **Observability:** Missing SLO metrics — verify booking conflict rate, event lag, and client error rates are tracked

## Recovery Strategies

When pitfalls occur despite prevention, how to recover.

| Pitfall | Recovery Cost | Recovery Steps |
|---------|---------------|----------------|
| Double booking incident | HIGH | Freeze new confirmations for affected window, run reconciliation script, notify impacted users, apply constraint+transaction patch |
| Realtime duplicate/out-of-order events | MEDIUM | Enable dedup hotfix keyed by event ID, replay canonical state snapshot, purge invalid counters |
| 3D performance regression | MEDIUM | Trigger kill switch to fallback hero, roll out segmented optimization, re-enable by device tier |
| Upload consistency failures | MEDIUM | Run orphan cleanup + DB repair job, disable flaky route path, ship unified upload service |
| Debug/security exposure | HIGH | Disable endpoint/feature flag immediately, rotate affected secrets/tokens, run audit and backfill security tests |

## Pitfall-to-Phase Mapping

How roadmap phases should address these pitfalls.

| Pitfall | Prevention Phase | Verification |
|---------|------------------|--------------|
| Double-booking from non-atomic slot confirmation | Phase A - Booking Consistency & Transaction Safety | Parallel booking test proves one winner per slot; conflict path covered in CI |
| Cache/realtime disagreement | Phase B - Realtime Architecture & Event Contracts | Mutation tests assert revalidation + realtime publish; stale-read bug reproduction resolved |
| Duplicate/out-of-order social events | Phase B - Realtime Architecture & Event Contracts | Replay/reconnect tests keep message order and unread counters correct |
| Vercel realtime transport mismatch | Phase B - Realtime Architecture & Event Contracts | Load test validates stable reconnect and no event loss on deploy |
| Upload lifecycle inconsistency | Phase D - Upload Lifecycle Consolidation | Route-level tests verify create/delete/error semantics and no orphan artifacts |
| Object-level auth drift (BOLA) | Phase C - Security Hardening | Authorization matrix tests prove deny paths across roles/ownership |
| Motion/3D conversion regression | Phase E - Home Motion/3D Performance Rollout | Performance gate on mobile (LCP/INP/FPS) and funnel conversion A/B safety check |
| WebGL leak/frame-loop anti-patterns | Phase E - Home Motion/3D Performance Rollout | Soak tests show stable memory/FPS after repeated mounts/navigation |
| Shipping debug/security debt | Phase C - Security Hardening | Production profile tests confirm debug route denial and hardened token lifecycle |

## Sources

- Local codebase context: `.planning/PROJECT.md`, `.planning/codebase/CONCERNS.md`, `.planning/codebase/TESTING.md` [HIGH]
- Next.js App Router revalidation and caching docs:  
  https://github.com/vercel/next.js/blob/canary/docs/01-app/01-getting-started/09-revalidating.mdx [HIGH]  
  https://github.com/vercel/next.js/blob/canary/docs/01-app/02-guides/migrating/app-router-migration.mdx [HIGH]
- Prisma transactions (including isolation and error handling):  
  https://www.prisma.io/docs/orm/prisma-client/queries/transactions [HIGH]
- PostgreSQL transaction isolation (`Serializable` semantics):  
  https://www.postgresql.org/docs/16/transaction-iso.html [HIGH]
- React Three Fiber pitfalls and disposal behavior:  
  https://github.com/pmndrs/react-three-fiber/blob/master/docs/advanced/pitfalls.mdx [HIGH]  
  https://github.com/pmndrs/react-three-fiber/blob/master/docs/API/objects.mdx [HIGH]
- Vercel guidance for realtime providers with Vercel Functions:  
  https://vercel.com/kb/guide/do-vercel-serverless-functions-support-websocket-connections [MEDIUM]
- Reduced-motion accessibility references:  
  https://motion.dev/docs/react-motion-config [HIGH]  
  https://developer.mozilla.org/fr/docs/Web/CSS/Reference/At-rules/%40media/prefers-reduced-motion [HIGH]
- OWASP API Security (BOLA/authorization risk framing):  
  https://owasp.org/www-project-api-security/ [HIGH]

---
*Pitfalls research for: barbershop scheduling platform (subsequent milestone, realtime/social + 3D/motion evolution)*
*Researched: 2026-04-08*
