# Codebase Concerns

**Analysis Date:** 2026-04-08

## Tech Debt

**Legacy and duplicate backend modules:**
- Issue: Legacy files coexist with active implementations, creating duplicate logic paths and drift risk.
- Files: `src/server/appointmentActions.old.ts`, `src/server/serviceActions.old.ts`, `src/server/userActions.old.ts`, `src/app/global-error.tsx.bak`
- Impact: Fixes can land in stale files by mistake; behavior diverges across similarly named modules.
- Fix approach: Remove or archive `.old/.bak` files outside `src/`; keep only active modules and enforce dead-file checks in CI.

**Monolithic modules with high cognitive load:**
- Issue: Critical modules are very large and combine orchestration, business rules, transformation, and UI rendering.
- Files: `src/app/dashboard/admin/reports/ReportsPageClient.tsx`, `src/server/adminActions.ts`, `src/server/reviewActions.ts`, `src/server/services/userService.ts`, `src/server/services/friendshipService.ts`
- Impact: Changes are high-risk and expensive to review; regression probability increases with each feature addition.
- Fix approach: Split by bounded responsibilities (queries, mappers, policies, UI sections); add module-level tests before extraction.

**Inconsistent upload architecture:**
- Issue: Two upload pipelines exist with different guarantees; one is unused but contains stronger validation.
- Files: `src/server/hybridUploadActions.ts`, `src/server/uploadServerActions.ts`, `src/app/api/upload/profile/route.ts`, `src/app/api/upload/reviews/route.ts`
- Impact: Public routes bypass richer validation patterns; maintainers must reason about two competing implementations.
- Fix approach: Standardize on one server upload service and route all API handlers through it; remove unused path.

**Type-safety debt across runtime code:**
- Issue: `strict` mode is disabled and runtime modules rely on `any` in core data transformations.
- Files: `tsconfig.json`, `src/lib/serializers.ts`, `src/lib/upload-server.ts`, `src/server/adminActions.ts`
- Impact: Runtime shape mismatches can pass compile time and fail in production paths.
- Fix approach: Enable `strict` incrementally; replace `any` with DTOs/Zod-inferred types in server boundaries first.

## Known Bugs

**Review image deletion is acknowledged but not executed:**
- Symptoms: API returns success semantics for deletion without removing the file.
- Files: `src/app/api/upload/reviews/route.ts`
- Trigger: `DELETE /api/upload/reviews?filename=...`
- Workaround: None in route logic; files remain orphaned.

**Profile upload can report success while persistence fails:**
- Symptoms: Upload succeeds, DB update may fail, API still returns success response.
- Files: `src/app/api/upload/profile/route.ts`
- Trigger: Storage upload succeeds but `db.user.update` throws in the inner `try/catch`.
- Workaround: Manual retry or direct profile update endpoint.

**Review creation performs duplicated schema parsing and verbose payload logging:**
- Symptoms: Input is parsed twice and full payload is stringified in logs.
- Files: `src/server/reviewActions.ts`
- Trigger: `createReview` execution path for normal review submissions.
- Workaround: None; behavior is always active.

## Security Considerations

**Password/email tokens are predictable and stored in plain form:**
- Risk: Tokens are generated with `Math.random()`/timestamp and stored raw, increasing brute-force and DB leak impact.
- Files: `src/lib/email.ts`, `src/app/api/auth/forgot-password/route.ts`, `src/app/api/auth/reset-password/route.ts`, `src/app/api/auth/verify-email/route.ts`, `prisma/schema.prisma`
- Current mitigation: Expiration windows are enforced.
- Recommendations: Generate tokens with `crypto.randomBytes`, store hashed token digests, compare with timing-safe hash validation, add DB index on token digest columns.

**Sensitive operational logging in auth and profile flows:**
- Risk: Logs include user identifiers, email, validation context, and request payload details in auth/review/profile paths.
- Files: `src/lib/auth.ts`, `src/server/reviewActions.ts`, `src/server/profileActions.ts`, `src/app/api/user/update-profile-image/route.ts`
- Current mitigation: Some logger levels are environment-gated.
- Recommendations: Redact PII and secrets by default; centralize safe logging helpers and block raw payload logs in server actions.

**CSP policy allows unsafe script execution:**
- Risk: `unsafe-inline` and `unsafe-eval` in `script-src` reduce XSS protections.
- Files: `next.config.mjs`
- Current mitigation: Baseline security headers are set globally.
- Recommendations: Move to nonce/hash-based CSP, remove `unsafe-eval`, and scope third-party origins explicitly.

**Debug/test endpoints are present in production build surface:**
- Risk: Endpoints mutate/read internal state when debug token policy is satisfied.
- Files: `src/app/api/test-auth/route.ts`, `src/app/api/test-sharp/route.ts`, `src/app/api/test/create-review-data/route.ts`, `src/lib/security/debug-access.ts`
- Current mitigation: `canAccessDebugEndpoints` denies in production without configured token.
- Recommendations: Exclude debug routes from production build, or gate behind internal network and explicit feature flags.

## Performance Bottlenecks

**Admin reporting performs many sequential DB operations and in-memory aggregation:**
- Problem: Multiple `await` calls and broad `findMany` results are aggregated in Node for reporting.
- Files: `src/server/adminActions.ts`
- Cause: Report generation mixes data access and analytics in one request path.
- Improvement path: Parallelize independent queries (`Promise.all`), push aggregation to SQL, cache report snapshots by date range/service filter.

**Upload pipeline does high-memory transformations in request/response cycle:**
- Problem: Files are converted to base64 buffers and can be returned in API responses.
- Files: `src/server/hybridUploadActions.ts`, `src/lib/upload/storage.ts`, `src/app/api/upload/profile/route.ts`, `src/app/api/upload/reviews/route.ts`
- Cause: Buffer/base64 conversions happen inline per request; response payload may include `base64`.
- Improvement path: Return URL-only payloads, stream uploads, and move transformations to background jobs where possible.

**Rate-limit stores are process-local and unbounded over long uptime:**
- Problem: In-memory maps grow per identity and do not synchronize across instances.
- Files: `src/lib/rate-limiter.ts`, `src/lib/security/rate-limit.ts`
- Cause: No shared backend (Redis) and no centralized cleanup usage for all stores.
- Improvement path: Use distributed rate-limit backend and enforce cleanup/TTL at storage layer.

## Fragile Areas

**Authentication configuration and callbacks:**
- Files: `src/lib/auth.ts`
- Why fragile: High coupling between providers, cookie config, events, and custom credential behavior in one file.
- Safe modification: Change one callback/provider block at a time with targeted auth regression tests.
- Test coverage: No dedicated tests found for auth callback behavior and cookie policy branching.

**Upload subsystem split across API routes, hybrid server action, and storage utilities:**
- Files: `src/app/api/upload/profile/route.ts`, `src/app/api/upload/reviews/route.ts`, `src/server/hybridUploadActions.ts`, `src/server/uploadServerActions.ts`, `src/lib/upload/storage.ts`, `src/lib/upload/validators.ts`
- Why fragile: Validation, storage, and response semantics differ by code path.
- Safe modification: Consolidate into one orchestrator service before adding new upload features.
- Test coverage: No focused API-route tests found for upload endpoints and rate-limit behavior.

**Admin reporting contract shared across server/client giant modules:**
- Files: `src/server/adminActions.ts`, `src/app/dashboard/admin/reports/ReportsPageClient.tsx`
- Why fragile: One schema change cascades through large typed objects and rendering logic.
- Safe modification: Introduce typed DTO boundaries and versioned mapper functions.
- Test coverage: `src/__tests__/AdminReportsPageClient.test.tsx` exists, but no dedicated server-report contract tests were found.

## Scaling Limits

**Rate limiting capacity is per-process only:**
- Current capacity: `MAX_UPLOADS_PER_WINDOW = 10` per key, 1-hour window in process memory.
- Limit: Horizontal scaling allows bypass by distributing requests across instances.
- Scaling path: Move to Redis-backed fixed-window/sliding-window limiter with shared keys.

**Analytics/report generation scales linearly with table growth:**
- Current capacity: Reporting requests query and iterate service history/appointment records at request time.
- Limit: Latency grows with `serviceHistory`/`appointment` volume due to runtime aggregation.
- Scaling path: Pre-aggregate metrics, materialized views, and cache invalidation on writes.

**Memory storage strategy is volatile in production-like environments:**
- Current capacity: `MemoryStorage` uses process memory map and optional manual cleanup.
- Limit: Data loss on restart and memory pressure under sustained uploads.
- Scaling path: Enforce external object storage and remove memory-backed production path.

## Dependencies at Risk

**Build pipeline can bypass quality gates:**
- Risk: Build can ignore lint/type failures when `ALLOW_UNSAFE_BUILD=1`.
- Impact: Defective code can ship to production.
- Migration plan: Remove unsafe bypass path and enforce immutable CI validation.
- Files: `next.config.mjs`

**Sharp build/runtime behavior diverges by script path:**
- Risk: `build:vercel` uninstalls `sharp` before build.
- Impact: Upload/image features can behave differently across environments.
- Migration plan: Keep deterministic dependency set per environment and gate optional image features explicitly.
- Files: `package.json`, `src/app/api/test-sharp/route.ts`

## Missing Critical Features

**No implemented server-side delete workflow for review uploads:**
- Problem: API surface includes delete contract without real storage deletion.
- Blocks: Reliable media lifecycle management and cleanup.
- Files: `src/app/api/upload/reviews/route.ts`, `src/server/hybridUploadActions.ts`

**No distributed security primitives for rate limiting/session-adjacent abuse controls:**
- Problem: Abuse protection is in-memory and instance-local.
- Blocks: Consistent protection under scale-out and edge/serverless deployments.
- Files: `src/lib/rate-limiter.ts`, `src/lib/security/rate-limit.ts`

## Test Coverage Gaps

**Security-critical auth token lifecycle lacks dedicated tests:**
- What's not tested: token generation entropy, token storage/lookup hardening, invalid/expired token edge cases across routes.
- Files: `src/lib/email.ts`, `src/app/api/auth/forgot-password/route.ts`, `src/app/api/auth/reset-password/route.ts`, `src/app/api/auth/verify-email/route.ts`
- Risk: Regressions in account recovery and verification safety may ship unnoticed.
- Priority: High

**Upload API routes and deletion behavior lack route-level automated tests:**
- What's not tested: `POST/DELETE/GET` upload route contracts, DB update failure paths, rate-limit header behavior.
- Files: `src/app/api/upload/profile/route.ts`, `src/app/api/upload/reviews/route.ts`
- Risk: Silent data inconsistency and broken client expectations.
- Priority: High

**Debug-access policy and debug endpoints are untested:**
- What's not tested: production token checks and deny paths for debug routes.
- Files: `src/lib/security/debug-access.ts`, `src/app/api/test-auth/route.ts`, `src/app/api/test-sharp/route.ts`, `src/app/api/test/create-review-data/route.ts`
- Risk: Accidental exposure of privileged debug behavior.
- Priority: Medium

**Manual pseudo-test file remains outside automated suite:**
- What's not tested: review-system manual scenarios are not enforced by CI.
- Files: `src/tests/reviewSystemTests.ts`
- Risk: False confidence in coverage for review, upload, and dashboard integration scenarios.
- Priority: Medium

---

*Concerns audit: 2026-04-08*
