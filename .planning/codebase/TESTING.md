# Testing Patterns

**Analysis Date:** 2026-04-08

## Test Framework

**Runner:**
- Jest `^30.2.0` with `ts-jest` preset (`^29.4.5`)
- Config: `jest.config.js`
- E2E runner: Playwright `^1.58.2` with config in `playwright.config.ts`

**Assertion Library:**
- Jest `expect` + `@testing-library/jest-dom` matchers

**Run Commands:**
```bash
npm test                 # Run all Jest tests
npm run test:watch       # Jest watch mode
npm run test:coverage    # Jest coverage report (text + lcov + html)
npm run test:e2e         # Playwright E2E suite
```

## Test File Organization

**Location:**
- Automated unit/component/server-action tests are centralized in `src/__tests__/`
- Shared Jest setup/bootstrap lives in `src/tests/setup.ts`
- E2E tests live in `e2e/` with fixtures in `e2e/fixtures/`
- Manual/non-automated helper test harnesses exist in `src/tests/` (`src/tests/reviewSystemTests.ts`, `src/tests/appointmentFlowTests.ts`) and are not matched by Jest test globs

**Naming:**
- Jest files follow `*.test.ts` and `*.test.tsx`, e.g. `src/__tests__/reviewActions.test.ts`, `src/__tests__/ReviewForm.test.tsx`
- Playwright files follow `*.spec.ts`, e.g. `e2e/smoke.spec.ts`, `e2e/auth/storage-state-fixtures.spec.ts`

**Structure:**
```text
src/
  __tests__/
    *.test.ts
    *.test.tsx
  tests/
    setup.ts
e2e/
  *.spec.ts
  fixtures/
    *.fixture.ts
  global-setup.ts
```

## Test Structure

**Suite Organization:**
```typescript
describe("reviewActions", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe("createReview", () => {
    test("deve criar avaliação com sucesso", async () => {
      // arrange
      // act
      // assert
    });
  });
});
```

**Patterns:**
- Setup pattern:
- Global shared mocks/polyfills in `src/tests/setup.ts` (`next/navigation`, `next-auth/react`, `next/image`, `matchMedia`, `ResizeObserver`)
- Per-suite `beforeEach` reset in most files, e.g. `src/__tests__/ReviewForm.test.tsx`, `src/__tests__/reviewActions.test.ts`
- Teardown pattern:
- `afterEach` cleanup for timers in time-dependent suites, e.g. `src/__tests__/AdminServicesPageClient.test.tsx`
- Assertion pattern:
- Use semantic DOM assertions (`toBeInTheDocument`, `toHaveTextContent`, `toBeDisabled`) and async assertions via `waitFor`

## Mocking

**Framework:** Jest module/function mocks (`jest.mock`, typed `jest.MockedFunction`, spies and globals)

**Patterns:**
```typescript
jest.mock("@/server/reviewActions", () => ({
  createReview: jest.fn(),
  updateReview: jest.fn(),
}));

import * as reviewActions from "@/server/reviewActions";
const mockCreateReview = reviewActions.createReview as jest.MockedFunction<typeof reviewActions.createReview>;
```

```typescript
jest.unmock("@/server/reviewActions"); // test real module
jest.mock("@/lib/prisma", () => ({ db: { serviceHistory: { findFirst: jest.fn() } } }));
```

**What to Mock:**
- Component tests mock server actions and side effects:
- `src/__tests__/ReviewForm.test.tsx`
- `src/__tests__/ServiceForm.test.tsx`
- `src/__tests__/ReviewsList.test.tsx`
- Server-action tests mock infrastructure boundaries (`next-auth`, Prisma client, `next/cache`):
- `src/__tests__/reviewActions.test.ts`
- Browser globals are mocked when needed (`global.confirm`, `matchMedia`, timers)

**What NOT to Mock:**
- The module under test should remain real when behavior coverage is the goal:
- `jest.unmock("@/server/reviewActions")` in `src/__tests__/reviewActions.test.ts`
- E2E tests avoid unit-style mocks and rely on authenticated `storageState` fixture contexts from `e2e/fixtures/auth.fixture.ts`

## Fixtures and Factories

**Test Data:**
```typescript
const mockSession = {
  user: { id: "user-123", role: UserRole.CLIENT },
  expires: "2025-12-31",
};

const mockServiceHistory = {
  id: "service-history-123",
  rating: null,
  feedback: null,
};
```

**Location:**
- Inline fixture objects are common inside each test file (`src/__tests__/reviewActions.test.ts`, `src/__tests__/ReviewsList.test.tsx`)
- Reusable E2E auth/storage fixtures live in:
- `e2e/fixtures/auth.storage.ts`
- `e2e/fixtures/auth.fixture.ts`
- `e2e/fixtures/base.fixture.ts`
- No centralized Jest factory library directory is currently used

## Coverage

**Requirements:** None enforced (no `coverageThreshold` configured in `jest.config.js`)

**View Coverage:**
```bash
npm run test:coverage
```

Coverage collection currently includes `src/**/*.{ts,tsx}` and excludes selected non-testable framework files (`layout.tsx`, `loading.tsx`, `error.tsx`, `not-found.tsx`) per `jest.config.js`.

## Test Types

**Unit Tests:**
- UI primitives and utility contracts:
- `src/__tests__/Skeleton.test.tsx`
- `src/__tests__/LoadingSpinner.test.tsx`
- `src/__tests__/motionTokens.test.ts`

**Integration Tests:**
- Server action behavior with mocked persistence/session boundaries:
- `src/__tests__/reviewActions.test.ts`
- `src/__tests__/dashboardActions.test.ts`
- Component integration with mocked server actions and user interactions:
- `src/__tests__/AdminServicesPageClient.test.tsx`
- `src/__tests__/AdminReportsPageClient.test.tsx`

**E2E Tests:**
- Framework used: Playwright (`playwright.config.ts`)
- Current E2E coverage includes smoke/auth-fixture validation:
- `e2e/smoke.spec.ts`
- `e2e/auth/storage-state-fixtures.spec.ts`
- Auth states are generated in `e2e/global-setup.ts` before suite execution

## Common Patterns

**Async Testing:**
```typescript
fireEvent.click(submitButton);

await waitFor(() => {
  expect(mockCreateReview).toHaveBeenCalledWith(
    expect.objectContaining({ rating: 4 })
  );
});
```

**Error Testing:**
```typescript
mockDb.serviceHistory.findFirst.mockRejectedValue(new Error("Database error"));

const result = await createReview(validInput);
expect(result.success).toBe(false);
expect(result.error).toBe("Database error");
```

---

*Testing analysis: 2026-04-08*
