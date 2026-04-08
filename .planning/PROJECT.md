# Barbershop Next

## What This Is

Barbershop Next is a web platform for barber shop scheduling, discovery, and customer engagement. It combines booking flows, profile and account management, social/chat capabilities, and operational dashboards for admins and barbers. The product targets customers who want fast and reliable booking and teams that need centralized service operations.

## Core Value

Customers can schedule the right service at the right time with confidence, and the operation can manage that flow end to end.

## Requirements

### Validated

- [x] User authentication with session-based protected areas and role-aware access control.
- [x] Service discovery and browsing (services, salons, prices, promotions, and reviews pages).
- [x] Scheduling and appointment management flows for customers.
- [x] Dashboard areas for admin and barber operations.
- [x] Profile management with account settings, password and notification preferences.
- [x] Social/community capabilities including friendship and chat conversations.
- [x] Media upload flows for profile/review assets with API and server-side orchestration.
- [x] Realtime channel support for near-live updates in the web app.

### Active

- [ ] Home experience redesign to a premium 3D-first hero with graceful fallback and strong mobile behavior.
- [ ] Security hardening for auth/reset/verification token lifecycle and sensitive logging paths.
- [ ] Upload pipeline consolidation and correctness fixes (especially delete/error semantics).
- [ ] Stronger automated coverage for critical auth, upload, and debug-access boundaries.
- [ ] Performance and reliability improvements for admin reporting and heavy data paths.

### Out of Scope

- Native mobile applications (iOS/Android) in this milestone - web-first delivery remains the priority.
- Heavy 3D effects (complex physics, dense particles, multi-model scenes) before core UX/performance is stable.
- Large-scale multi-tenant franchise architecture redesign in this cycle.

## Context

- Existing brownfield codebase with Next.js App Router, Server Actions, route handlers, and Prisma-backed services.
- Production target is Vercel; local workflow is Docker-first for environment consistency.
- Existing codebase mapping already documents architecture, stack, and current concerns under `.planning/codebase/`.
- Current technical concerns include upload consistency, token handling strength, and uneven module/test quality.
- Product direction includes a premium visual upgrade for Home while preserving booking clarity and operational reliability.

## Constraints

- **Tech stack**: Continue with Next.js App Router + TypeScript + Prisma + NextAuth - align with existing architecture and team tooling.
- **Database access**: Use Prisma Client for all persistence access - avoid direct DB access outside ORM conventions.
- **UI system**: Keep Tailwind CSS and shadcn/ui patterns for reusable UI consistency.
- **Operations**: Development and tests should remain compatible with Dockerized workflows used by the team.
- **Deployment**: Production deploy path remains Vercel with controlled migration scripts.

## Key Decisions

| Decision | Rationale | Outcome |
|----------|-----------|---------|
| Keep the modular monolith architecture | Existing system already structures routes/actions/services around it, minimizing migration risk | -- Pending |
| Prioritize reliability + security hardening before major scope expansion | Current concerns show correctness/security debt in critical flows | -- Pending |
| Execute Home 3D redesign with strict performance guardrails and fallback | Brand differentiation is important, but booking usability and performance cannot regress | -- Pending |

## Evolution

This document evolves at phase transitions and milestone boundaries.

**After each phase transition** (via `/gsd-transition`):
1. Requirements invalidated? -> Move to Out of Scope with reason
2. Requirements validated? -> Move to Validated with phase reference
3. New requirements emerged? -> Add to Active
4. Decisions to log? -> Add to Key Decisions
5. "What This Is" still accurate? -> Update if drifted

**After each milestone** (via `/gsd-complete-milestone`):
1. Full review of all sections
2. Core Value check - still the right priority?
3. Audit Out of Scope - reasons still valid?
4. Update Context with current state

---
*Last updated: 2026-04-08 after initialization*
