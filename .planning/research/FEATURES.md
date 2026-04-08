# Feature Research

**Domain:** Barbershop scheduling and growth platform (B2C booking + B2B operations)
**Researched:** 2026-04-08
**Confidence:** MEDIUM

## Feature Landscape

### Table Stakes (Users Expect These)

Features users assume exist. Missing these = product feels incomplete.

| Feature | Why Expected | Complexity | Notes |
|---------|--------------|------------|-------|
| 24/7 self-service booking, reschedule, and cancel | Competitors position self-booking as baseline convenience and call/text reduction | MEDIUM | Must support mobile-first flow, timezone correctness, and immediate confirmation |
| Automated reminders and booking notifications | Vendors consistently push reminders as default no-show prevention | LOW | SMS + email coverage; include configurable reminder windows |
| No-show protection (deposits/card-on-file/cancellation policy) | Modern booking stacks treat policy enforcement as standard revenue protection | MEDIUM | Needs clear policy UX at checkout and dispute-safe audit trail |
| Multi-staff calendar integrity (shifts, blocks, overlap prevention) | Ops teams expect conflict-free scheduling across barbers/chairs | MEDIUM | Include guardrails for concurrent bookings and schedule edits |
| Client CRM profile (history, notes, preferences) | Service personalization depends on persistent customer context | MEDIUM | Tie profile to appointments, spend, and visit frequency |
| Waitlist with fast fill of canceled slots | Mature tools market waitlist as default utilization feature | MEDIUM | Start with manual + assisted fill; automate once cancellation volume justifies |
| Integrated checkout (service payment, tips, products) | Booking tools increasingly converge booking + payment + retail | HIGH | Scope carefully; can start with service payment first |
| Review capture and social proof hooks | Discovery and trust now rely on reviews + profile quality | MEDIUM | Trigger review requests post-appointment; support public profile/media |

### Differentiators (Competitive Advantage)

Features that set the product apart. Not required, but valuable.

| Feature | Value Proposition | Complexity | Notes |
|---------|-------------------|------------|-------|
| Premium conversion-first home/booking UX (rich brand storytelling with progressive enhancement) | Increases direct conversion and perceived quality for premium barbershops | HIGH | Use 3D/media only as progressive enhancement; protect Core Web Vitals and booking CTA prominence |
| Retention autopilot (next-visit nudges, lapse detection, win-back campaigns) | Converts one-time visitors into repeat revenue with low manual effort | MEDIUM | Build on appointment cadence + segmentation from client history |
| Portfolio-led barber matching (style gallery + skill tags + recommendation hints) | Reduces booking hesitation and improves fit between client and professional | MEDIUM | Requires media governance and reliable tagging taxonomy |
| Reliability layer for booking operations (idempotency, conflict-safe writes, replay-safe events) | Avoids double bookings and silent failures under load or retries | HIGH | Critical for trust; pair with structured observability and alerting |
| Revenue optimization policies (risk-based deposits/no-show policy by service/time/client) | Protects prime slots without over-friction for loyal clients | HIGH | Start rule-based, not ML-first; ensure transparent policy explanations |
| Acquisition channel orchestration (site + social + marketplace + Google profile links) | Improves top-of-funnel while preserving owned-channel conversion | MEDIUM | Track attribution and conversion by channel to control CAC |

### Anti-Features (Commonly Requested, Often Problematic)

Features that seem good but create problems.

| Feature | Why Requested | Why Problematic | Alternative |
|---------|---------------|-----------------|-------------|
| Native iOS/Android apps in this milestone | Feels "more premium" | Splits team focus and delays core reliability/booking quality | Keep web-first PWA-grade UX and revisit native after retention KPIs stabilize |
| Heavy always-on 3D/animation across the entire site | Strong visual wow factor | Hurts mobile performance and booking conversion when overused | Restrict to hero moments with static/low-motion fallbacks |
| AI chatbot as primary booking surface too early | Perceived innovation and automation | Adds failure modes to mission-critical booking without strong domain data | Keep deterministic booking UI; add assistant only for bounded support tasks |
| Full custom rule engine per shop/barber from day one | Promises flexibility for edge cases | Creates combinatorial complexity, support burden, and brittle scheduling logic | Ship opinionated policies + a small set of high-value toggles |
| Blanket discount blast tooling as default growth tactic | Easy short-term booking bump | Trains price-sensitive behavior and erodes premium brand positioning | Use targeted campaigns based on recency, spend, and slot-fill goals |

## Feature Dependencies

```text
[Identity & Role Model]
    -> requires -> [Booking Lifecycle (create/reschedule/cancel)]
        -> requires -> [Calendar Integrity & Availability Rules]
        -> requires -> [Notification/Reminder Pipeline]

[Payment Processing]
    -> requires -> [No-Show Protection Policies]
        -> enables -> [Risk-Based Deposit Optimization]

[Client CRM Profile]
    -> requires -> [Appointment History]
        -> enables -> [Retention Autopilot]
        -> enables -> [Portfolio-Led Barber Matching]

[Operational Event Logging]
    -> requires -> [Reliability Layer (idempotency + conflict-safe writes)]

[Premium Home UX]
    -> enhances -> [Acquisition Channel Orchestration]
    -> conflicts (if overused) -> [Mobile Performance + Booking Conversion]
```

### Dependency Notes

- **Booking lifecycle requires identity + role checks:** customer and staff capabilities differ and must be enforced before mutation.
- **No-show protection requires payment primitives:** deposits and fees are not reliable without card/payment authorization infrastructure.
- **Retention automation requires clean history data:** weak appointment and profile data makes campaigns noisy and reduces trust.
- **Reliability layer depends on event logging:** conflict detection and incident response need traceable booking events.
- **Premium UX conflicts with conversion when unchecked:** visual ambition must stay behind performance budgets and explicit CTA hierarchy.

## MVP Definition

### Launch With (v1)

Minimum viable product for a mature, credible scheduling experience.

- [ ] Self-service booking/reschedule/cancel with real-time slot validation - core customer expectation
- [ ] Calendar integrity for multi-staff operations - prevents trust-breaking scheduling conflicts
- [ ] Automated reminders + confirmations - baseline no-show reduction
- [ ] No-show policy with deposits/card capture - protects revenue on high-demand slots
- [ ] Client profile + history + notes - foundation for repeat service quality
- [ ] Mobile-first branded booking page (fast, clear CTA, social proof) - required for direct conversion

### Add After Validation (v1.x)

- [ ] Waitlist automation with priority rules - add when cancellation volume is measurable
- [ ] Retention autopilot campaigns - add when historical visit data quality is consistent
- [ ] Review/reputation workflow with referral hooks - add after baseline fulfillment quality is stable
- [ ] Channel attribution dashboard - add when at least 2 acquisition channels are active

### Future Consideration (v2+)

- [ ] Portfolio-based barber recommendation engine - defer until media taxonomy and data quality mature
- [ ] Dynamic pricing experiments by demand window - defer until policy trust and analytics are strong
- [ ] AI assistant for booking/support - defer until deterministic flows are highly reliable
- [ ] Native mobile apps - defer until web conversion + retention metrics plateau

## Feature Prioritization Matrix

| Feature | User Value | Implementation Cost | Priority |
|---------|------------|---------------------|----------|
| Self-service booking lifecycle | HIGH | MEDIUM | P1 |
| Multi-staff calendar integrity | HIGH | MEDIUM | P1 |
| Automated reminders | HIGH | LOW | P1 |
| No-show protection policies | HIGH | MEDIUM | P1 |
| Client CRM profile/history | HIGH | MEDIUM | P1 |
| Mobile-first branded booking page | HIGH | MEDIUM | P1 |
| Waitlist automation | MEDIUM | MEDIUM | P2 |
| Retention autopilot campaigns | HIGH | MEDIUM | P2 |
| Premium hero/storytelling layer | MEDIUM | HIGH | P2 |
| Reliability layer (idempotency/observability) | HIGH | HIGH | P1 |
| Portfolio-led barber matching | MEDIUM | MEDIUM | P3 |
| AI booking assistant | LOW | HIGH | P3 |

**Priority key:**
- P1: Must have for launch credibility
- P2: Should have after baseline is stable
- P3: Nice to have / defer until stronger signal

## Competitor Feature Analysis

| Feature | Competitor A (Fresha) | Competitor B (Square Appointments) | Our Approach |
|---------|------------------------|------------------------------------|--------------|
| Booking + calendar operations | Strong scheduling, team management, shift/no-overlap emphasis | Online booking with synced calendar and scheduling controls | Match baseline, then harden conflict safety and observability |
| No-show protection | Deposits, cancellation policy, autopilot no-show protection | Built-in cancellation/no-show fee controls | Ship transparent policy UX + rule-based optimization by slot value |
| Client profile depth | Rich profile with history/preferences/notes/forms | Customer profiles + appointment management | Use profile as engine for retention and personalization, not just storage |
| Marketing/discovery channels | Marketplace + booking profile exposure | Booking website + social/Google presence tooling | Blend owned conversion-first site with channel orchestration and attribution |
| Campaign/retention tools | Built-in follow-up and growth tooling | Automated reminders and campaign primitives | Differentiate on lifecycle automation tied to barber cadence and behavior |

## Sources

- Fresha for Business, Scheduling Features: https://www.fresha.com/for-business/features/scheduling (HIGH)
- Square Appointments, Product/Feature pages: https://squareup.com/us/en/appointments (MEDIUM)
- Booksy Biz, Barber and How-it-works pages: https://biz.booksy.com/en-us/who-loves-us/barber and https://biz.booksy.com/en-us/lp/how-it-works (HIGH)
- Vagaro Support, feature baseline and campaign tooling: https://support.vagaro.com/hc/en-us/articles/18977274427803-Vagaro-Features and https://support.vagaro.com/hc/en-us/articles/360036414133-View-Campaign-Success-and-Performance (HIGH)
- Context files for project fit: `.planning/PROJECT.md`, `.planning/codebase/ARCHITECTURE.md`, `README.md` (HIGH)

---
*Feature research for: barbershop scheduling and growth platform*
*Researched: 2026-04-08*
