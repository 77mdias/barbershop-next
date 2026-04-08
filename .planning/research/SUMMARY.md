# Project Research Summary

**Project:** Barbershop Next
**Domain:** Barbershop scheduling and growth platform (B2C booking + B2B operations) on a Next.js modular monolith
**Researched:** 2026-04-08
**Confidence:** MEDIUM-HIGH

## Executive Summary

This is a brownfield scheduling platform where trust and reliability matter more than feature breadth. Research converges on a pragmatic path: keep the current modular monolith (Next.js App Router + Prisma + Postgres), harden critical mutation boundaries first, then expand product capabilities. Experts build this class of product by enforcing booking correctness (transactional writes + DB constraints), strict object-level authorization, deterministic event contracts, and progressive enhancement for rich UI rather than making visuals the system backbone.

The recommended approach is phased and dependency-driven. Launch scope should stay focused on table-stakes booking outcomes: self-service booking lifecycle, multi-staff calendar integrity, reminders, no-show protection, CRM profile/history, and fast mobile-first booking UX. Strategic differentiators (retention autopilot, portfolio-led matching, rich premium homepage) should be layered only after reliability controls and observability are in place.

Primary risks are known and preventable: double booking from non-atomic confirmation, stale App Router cache vs realtime drift, authorization drift (BOLA/IDOR), upload lifecycle inconsistency, and conversion regressions from over-ambitious motion/3D. Mitigation is explicit in research: contract-first boundaries, service-layer policy enforcement, idempotent eventing with sequence rules, unified upload orchestration, and performance-gated progressive 3D rollout with kill-switch fallback.

## Key Findings

### Recommended Stack

Research strongly supports staying on the current stack shape and modernizing in-place: Next.js App Router + React + Prisma + Postgres + Tailwind/shadcn. The highest-confidence path is upgrade-in-tracks (not a rewrite): Next.js 15 to 16, Prisma 6 to 7, Tailwind 3 to 4, while stabilizing auth on `next-auth@4.24.x` now and planning explicit migration to Auth.js v5 architecture once operationally safe.

**Core technologies:**
- `Next.js 16.2.x` + App Router: full-stack runtime and deployment fit for Vercel — best continuity with current codebase.
- `React 19.x` + `Node >=20.9` (prefer latest 20 LTS patch): required compatibility baseline for modern Next behavior.
- `Prisma 7.x` + PostgreSQL 17.x: transactional correctness and schema evolution stability for booking-critical writes.
- `next-auth@4.24.x` (now) with v5 migration track: reduces auth risk while preparing long-term architecture alignment.
- `Tailwind 4.x` + current shadcn patterns: performance and UI consistency without design-system rewrite.

### Expected Features

The MVP boundary is clear: users expect reliable booking and operations first, not platform novelty. Features that directly impact booking confidence and no-show prevention are P1; growth and premium UX layers are P2/P3 and should be gated by reliability metrics.

**Must have (table stakes):**
- Self-service booking/reschedule/cancel with realtime slot validation and conflict prevention.
- Multi-staff calendar integrity (shifts/blocks/no overlap) with deterministic write safety.
- Automated reminders/confirmations (SMS/email) with configurable windows.
- No-show protection (deposit/card-on-file/policy UX) with audit-safe records.
- Client CRM profile/history/notes tied to appointments and repeat behavior.
- Mobile-first branded booking page where booking CTA stays primary.

**Should have (competitive):**
- Retention autopilot (next-visit nudges, lapse/win-back flows) built from reliable visit data.
- Waitlist-assisted slot fill and review/reputation workflow.
- Acquisition channel orchestration with attribution.
- Premium conversion-first homepage storytelling, only as progressive enhancement.

**Defer (v2+):**
- Native mobile apps.
- AI-first booking assistant.
- Portfolio recommendation engine and dynamic pricing experiments.

### Architecture Approach

Architecture research is high-confidence and specific: preserve public route/action contracts, extract risky domains behind seams, and validate with contract tests before behavior changes. The correct direction is a strangler-style refactor for auth/upload/reporting internals while keeping App Router endpoints stable. 3D remains an adapter-level enhancement, never a dependency for data/booking flow.

**Major components:**
1. `AuthTokenLifecycleService` + `SecurityPolicyGateway` — secure token lifecycle, centralized authz/rate/debug policy checks.
2. `UploadOrchestrator` + `StorageAdapter` — single upload/delete semantics with explicit consistency guarantees.
3. `ReportingReadModel` — isolated heavy admin reads with indexing/caching strategy.
4. `HomeExperienceShell` + `HomeSceneAdapter` — stable data contract with capability-gated 3D fallback behavior.
5. Contract-test harness (`__tests__/contracts`, security/integration suites) — regression gate for every phase.

### Critical Pitfalls

1. **Double booking from non-atomic confirmation** — enforce DB uniqueness + transactional booking confirmation; treat conflicts as expected path.
2. **Realtime state diverges from App Router cache** — standardize mutation-time `revalidateTag`/`revalidatePath` and no-store policy for volatile reads.
3. **BOLA/IDOR in social and booking flows** — enforce ownership/role authorization in service layer with deny-path tests per endpoint.
4. **Upload lifecycle inconsistency** — consolidate to one orchestrator with idempotent delete and fail-fast DB/storage reconciliation.
5. **3D/motion regressions harming conversion** — progressive enhancement only, reduced-motion compliance, strict performance budgets, kill switch.

## Implications for Roadmap

Based on research, suggested phase structure:

### Phase 1: Contract Safety + Security Hardening Gate
**Rationale:** Highest blast-radius risks are auth/logging/debug exposure and untested mutation boundaries.
**Delivers:** Contract tests for auth/upload/debug boundaries, hardened token lifecycle (hashed/TTL/single-use), centralized security policy checks, redacted logging.
**Addresses:** Active requirements for security hardening and stronger automated coverage.
**Avoids:** Pitfalls on token leakage, debug route exposure, BOLA drift, and hidden boundary regressions.

### Phase 2: Booking Consistency Core
**Rationale:** Booking trust is the product’s core value and prerequisite for all growth features.
**Delivers:** Transaction-safe booking confirmation, slot uniqueness constraints, multi-staff conflict prevention, stable booking/reschedule/cancel envelopes.
**Uses:** Prisma transaction patterns + Postgres constraints on current stack.
**Implements:** Booking domain reliability seam in `server/domains` with contract-preserving route/action delegates.
**Addresses:** Table-stake booking lifecycle + calendar integrity.
**Avoids:** Double-booking and “confirmed but unavailable” incidents.

### Phase 3: Operational Reliability (Notifications + Upload + Realtime Contracts)
**Rationale:** Once booking writes are correct, consistency across notifications, media, and live UI becomes the next trust layer.
**Delivers:** Reminder pipeline hardening, unified `UploadOrchestrator`, realtime event contract (event ID/sequence/idempotency), cache invalidation standard.
**Uses:** Next.js revalidation primitives + storage adapter abstraction.
**Implements:** Upload/realtime seams and deterministic mutation-to-event pipeline.
**Addresses:** Automated reminders, upload consolidation/correctness, realtime stability.
**Avoids:** Stale UI drift, duplicate/out-of-order events, orphaned uploads.

### Phase 4: CRM + Retention + Reporting Performance
**Rationale:** Growth tooling should sit on top of reliable booking and clean profile/history data.
**Delivers:** CRM enrichment, waitlist assist, retention automations, read-model extraction for admin analytics, targeted indexes/caching.
**Uses:** Reporting read-model pattern and bounded query modules.
**Implements:** `ReportingReadModel` and campaign orchestration hooks.
**Addresses:** Client history value and active reporting-performance requirement.
**Avoids:** Slow reporting bottlenecks and noisy/unreliable campaign logic.

### Phase 5: Premium Home UX Rollout (Performance-Gated)
**Rationale:** Brand differentiation should be additive after core reliability, not a prerequisite.
**Delivers:** 3D-first hero via progressive enhancement, mobile-safe fallback modes, funnel/performance instrumentation, CTA prominence safeguards.
**Uses:** R3F/Three only behind capability tiers and reduced-motion policy.
**Implements:** `HomeSceneAdapter` and UX performance guardrails.
**Addresses:** Active home redesign requirement with conversion protection.
**Avoids:** LCP/INP regressions, jank, and booking conversion drop.

### Phase Ordering Rationale

- Security/test gate first reduces risk of compounding defects during all later refactors.
- Booking consistency precedes retention, realtime, and premium UX because those layers depend on trustworthy transactional state.
- Upload/realtime/reporting are grouped as operational reliability because they share boundary, cache, and idempotency concerns.
- Premium 3D is intentionally last to prevent visual scope from masking unresolved correctness/security debt.

### Research Flags

Phases likely needing deeper research during planning:
- **Phase 3:** Realtime provider strategy on Vercel, replay semantics, and event contract rollout details.
- **Phase 4:** Reporting index/materialization strategy under realistic production data volume.
- **Phase 5:** Device-tier performance budgets, 3D fallback heuristics, and conversion-safe experimentation design.

Phases with standard patterns (skip research-phase):
- **Phase 1:** OWASP-backed token/logging controls and contract-test patterns are well established.
- **Phase 2:** Transactional booking + DB uniqueness constraints are standard and well documented.

## Confidence Assessment

| Area | Confidence | Notes |
|------|------------|-------|
| Stack | MEDIUM-HIGH | Strong official-source coverage and clear compatibility path; auth v5 timing still a migration judgment call. |
| Features | MEDIUM | Competitive patterns are clear, but vendor marketing sources require product-fit validation during scoping. |
| Architecture | HIGH | Internal codebase mapping + established Next/Prisma boundary patterns are coherent and directly actionable. |
| Pitfalls | HIGH | Risks are concrete, reproducible in this domain, and mapped to explicit prevention and verification tactics. |

**Overall confidence:** MEDIUM-HIGH

### Gaps to Address

- **Auth migration timing:** Decide exact milestone for Auth.js v5 transition based on security hardening completion and regression budget.
- **Realtime transport/provider choice:** Validate provider operational model, cost, replay guarantees, and incident handling before implementation lock.
- **SMS/email vendor constraints:** Confirm deliverability, cost, and compliance for reminder/no-show policy flows in target market.
- **Performance SLO targets:** Define explicit budgets (LCP/INP/FPS/error rates) before home 3D rollout and use them as release gates.
- **Data volume assumptions for reports:** Baseline production query profiles to avoid premature or insufficient reporting optimizations.

## Sources

### Primary (HIGH confidence)
- Internal planning artifacts: `.planning/PROJECT.md`, `.planning/research/STACK.md`, `.planning/research/FEATURES.md`, `.planning/research/ARCHITECTURE.md`, `.planning/research/PITFALLS.md`
- Next.js App Router docs and revalidation references (`nextjs.org`, Context7 `/vercel/next.js/v16.2.2`)
- Prisma official docs and Prisma 7 materials (`prisma.io`)
- Auth.js official migration/reference docs (`authjs.dev`, Context7 `/nextauthjs/next-auth`)
- OWASP cheat sheets (forgot password, file upload, logging, API security)
- PostgreSQL official documentation (transaction isolation, release notes)

### Secondary (MEDIUM confidence)
- Realtime/provider guidance for Vercel websocket constraints (`vercel.com` KB)
- R3F performance/pitfall references (`r3f.docs.pmnd.rs`, pmndrs docs)

### Tertiary (LOW confidence)
- Competitor feature positioning pages used for feature benchmarking (Fresha, Square Appointments, Booksy, Vagaro) — directional only, not implementation authority.

---
*Research completed: 2026-04-08*
*Ready for roadmap: yes*
