# Requirements: Barbershop Next

**Defined:** 2026-04-08
**Core Value:** Customers can schedule the right service at the right time with confidence, and the operation can manage that flow end to end.

## v1 Requirements

### Security and Auth

- [ ] **AUTH-01**: User password reset and email verification tokens are generated with cryptographic randomness and stored as hashed digests.
- [ ] **AUTH-02**: User reset/verification tokens are single-use, enforce expiry, and return deterministic errors for invalid/expired tokens.
- [ ] **AUTH-03**: Sensitive auth/debug payload fields are redacted from server logs in production paths.
- [ ] **AUTH-04**: Mutating booking, social, and profile endpoints enforce object-level authorization checks.

### Booking Consistency

- [ ] **BOOK-01**: User can confirm a booking through a transaction-safe flow that prevents double booking.
- [ ] **BOOK-02**: User receives clear conflict feedback when attempting to reserve an unavailable slot.
- [ ] **BOOK-03**: Staff schedule edits preserve calendar integrity across overlapping changes.

### Upload and Realtime Reliability

- [ ] **UPLD-01**: User profile and review upload routes use one unified upload orchestration contract.
- [ ] **UPLD-02**: User can delete review media and the storage object is actually removed with consistent API status semantics.
- [ ] **UPLD-03**: User profile image updates only return success when storage and database persistence both succeed.
- [ ] **RLTM-01**: User-facing realtime updates use deterministic event metadata (event id/ordering/idempotency safeguards).
- [ ] **RLTM-02**: User-facing data views remain consistent after mutations through explicit cache revalidation rules.

### Premium Home Experience

- [ ] **HOME-01**: User sees a premium 3D-first home hero on capable devices and a graceful static/low-motion fallback on constrained devices.
- [ ] **HOME-02**: User can always reach the primary booking CTA regardless of 3D mode.
- [ ] **HOME-03**: User experience honors reduced-motion preferences while preserving content hierarchy.
- [ ] **HOME-04**: Home experience meets defined performance guardrails (LCP/INP/FPS thresholds) before rollout.

### Quality Gates

- [ ] **TEST-01**: Team has contract tests for auth token routes, upload routes, and debug-access policy behavior.
- [ ] **TEST-02**: Team has integration tests covering token lifecycle and upload success/failure/delete paths.
- [ ] **TEST-03**: Team has regression tests for home fallback behavior and booking CTA visibility.

## v2 Requirements

### Growth and Product Expansion

- **WAIT-01**: User can join a waitlist and receive automated slot-fill offers.
- **RETN-01**: User receives retention campaigns based on visit cadence and profile history.
- **RETN-02**: Team can monitor campaign performance by channel and conversion outcomes.
- **PORT-01**: User can discover barbers by portfolio style and skill tags.
- **PAYM-01**: User can complete full integrated checkout including tips and product add-ons.

## Out of Scope

| Feature | Reason |
|---------|--------|
| Native iOS/Android apps | Web-first strategy remains faster and lower risk for current milestone |
| Always-on heavy 3D across all pages | High regression risk for mobile performance and booking conversion |
| AI-first booking assistant as primary flow | Deterministic booking reliability is higher priority |
| Full custom rule engine for every shop/barber scenario | Too much complexity before core consistency goals are stable |

## Traceability

| Requirement | Phase | Status |
|-------------|-------|--------|
| AUTH-01 | TBD | Pending |
| AUTH-02 | TBD | Pending |
| AUTH-03 | TBD | Pending |
| AUTH-04 | TBD | Pending |
| BOOK-01 | TBD | Pending |
| BOOK-02 | TBD | Pending |
| BOOK-03 | TBD | Pending |
| UPLD-01 | TBD | Pending |
| UPLD-02 | TBD | Pending |
| UPLD-03 | TBD | Pending |
| RLTM-01 | TBD | Pending |
| RLTM-02 | TBD | Pending |
| HOME-01 | TBD | Pending |
| HOME-02 | TBD | Pending |
| HOME-03 | TBD | Pending |
| HOME-04 | TBD | Pending |
| TEST-01 | TBD | Pending |
| TEST-02 | TBD | Pending |
| TEST-03 | TBD | Pending |

**Coverage:**
- v1 requirements: 19 total
- Mapped to phases: 0
- Unmapped: 19

---
*Requirements defined: 2026-04-08*
*Last updated: 2026-04-08 after initial definition*
