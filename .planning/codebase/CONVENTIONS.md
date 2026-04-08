# Coding Conventions

**Analysis Date:** 2026-04-08

## Naming Patterns

**Files:**
- React component files use mixed conventions:
- `PascalCase.tsx` for many feature components, e.g. `src/components/ReviewForm.tsx`, `src/components/HeaderNavigation.tsx`, `src/components/home/HeroSection.tsx`
- `kebab-case.tsx` for many UI/utility components, e.g. `src/components/service-card.tsx`, `src/components/ui/loading-spinner.tsx`, `src/components/ui/dropdown-menu.tsx`
- Hooks use `camelCase` with `use` prefix, e.g. `src/hooks/useAuth.ts`, `src/hooks/useScrollDepthMotion.ts`
- Server action files use `*Actions.ts`, e.g. `src/server/reviewActions.ts`, `src/server/adminActions.ts`, `src/server/appointmentActions.ts`
- Schema files use `*Schemas.ts`, e.g. `src/schemas/reviewSchemas.ts`, `src/schemas/userSchemas.ts`

**Functions:**
- Use `camelCase` for functions and methods, e.g. `createReview` in `src/server/reviewActions.ts`, `buildUserWhere` in `src/server/services/userService.ts`
- React components use `PascalCase`, e.g. `ReviewForm` in `src/components/ReviewForm.tsx`, `RootLayout` in `src/app/layout.tsx`
- Hooks use `useX` naming, e.g. `useAuth` in `src/hooks/useAuth.ts`

**Variables:**
- Local/state variables use `camelCase`, e.g. `isPending`, `submitStatus`, `currentRating` in `src/components/ReviewForm.tsx`
- Constants use `UPPER_SNAKE_CASE`, e.g. `DEFAULT_LIMIT` in `src/server/services/userService.ts`, `CAPACITY_CONFIG` in `src/server/adminActions.ts`
- Test doubles use `mock*` prefix, e.g. `mockGetServerSession`, `mockDb` in `src/__tests__/reviewActions.test.ts`

**Types:**
- Interfaces/types use `PascalCase`, e.g. `ReviewFormProps` in `src/components/ReviewForm.tsx`, `UserWithStats` in `src/server/services/userService.ts`
- Zod-derived input types use `*Input` suffix, e.g. `CreateReviewInput` in `src/schemas/reviewSchemas.ts`
- Props interfaces use `*Props` suffix, e.g. `ButtonProps` in `src/components/ui/button.tsx`

## Code Style

**Formatting:**
- Tool used: ESLint flat config in `eslint.config.mjs`
- Prettier config: Not detected (`.prettierrc`/`prettier.config.*` absent at repo root)
- Current codebase style is mixed on quotes/semicolons:
- Semicolon-heavy examples: `src/components/ReviewForm.tsx`, `src/server/reviewActions.ts`
- Semicolon-light examples: `src/components/ui/button.tsx`, `src/lib/utils.ts`
- Practical rule for contributions: preserve file-local style when editing existing files and let ESLint be the enforcement baseline

**Linting:**
- Tool used: ESLint 9 + `next/core-web-vitals` + `next/typescript` from `eslint.config.mjs`
- Key rules:
- `@typescript-eslint/no-unused-vars`: `warn` with `_` ignore pattern
- `@typescript-eslint/no-explicit-any`: `warn` globally, `off` in tests and selected files
- `no-console`: `warn` globally, `off` for `src/server/**/*.ts`, `src/app/api/**/*.ts`, `src/lib/**/*.ts`, and test files
- Relaxed scope for tests: `**/__tests__/**`, `**/*.test.ts(x)`, `**/*.spec.ts(x)`

## Import Organization

**Order:**
1. Framework/third-party imports (e.g. `react`, `next-auth`, `@prisma/client`)
2. App alias imports via `@/` (e.g. `@/lib/auth`, `@/components/ui/button`)
3. Relative imports (e.g. `./services/userService`, `./logger`)

**Path Aliases:**
- `@/*` resolves to `src/*` in `tsconfig.json`
- Jest mirrors the alias in `jest.config.js` (`'^@/(.*)$': '<rootDir>/src/$1'`)

## Error Handling

**Patterns:**
- Server actions consistently guard session first and return result objects:
- `if (!session?.user?.id) return { success: false, error: "Usuário não autenticado" }` in `src/server/reviewActions.ts`
- Server actions use `try/catch` and return `{ success: false, error: ... }` instead of rethrowing, e.g. `src/server/reviewActions.ts`, `src/server/dashboardActions.ts`, `src/server/adminActions.ts`
- Zod validation is done with `.parse(...)` near entry points, e.g. `createReviewSchema.parse(input)` in `src/server/reviewActions.ts`
- API routes return explicit HTTP status codes with `NextResponse.json`, e.g. `src/app/api/upload/reviews/route.ts`

## Logging

**Framework:** `console` plus internal logger in `src/lib/logger.ts`

**Patterns:**
- `console.log`/`console.error` is heavily used in server actions and API routes:
- `src/server/reviewActions.ts`
- `src/app/api/upload/reviews/route.ts`
- Structured `logger` exists and is used selectively:
- `logger.info(...)` in `src/server/services/userService.ts`
- `logger` imported in `src/server/adminActions.ts`
- Current convention is permissive logging in backend layers due ESLint overrides; frontend/test code should avoid persistent debug logs unless needed

## Comments

**When to Comment:**
- High-level explanatory comments are common in Portuguese, especially for sections and business rules:
- `src/server/reviewActions.ts`
- `src/server/services/userService.ts`
- `src/components/ui/button.tsx`
- TODO markers exist but are sparse:
- `src/components/header.tsx` (`TODO: Implement avatar click functionality`)
- `src/app/api/upload/reviews/route.ts` (`TODO: Implement delete server action`)

**JSDoc/TSDoc:**
- JSDoc-style blocks are used for components/utilities and long modules:
- `src/components/ui/button.tsx`
- `src/lib/logger.ts`
- `src/tests/appointmentFlowTests.ts`
- AIDEV anchor comments (`AIDEV: TODO/FIXME/REVIEW`) are not detected in `src/`

## Function Design

**Size:** No strict max-size convention is enforced; large modules are present:
- `src/server/adminActions.ts` (large orchestration file)
- `src/server/reviewActions.ts` (multiple large actions)
- `src/app/dashboard/admin/reports/ReportsPageClient.tsx` (large client page)

**Parameters:** Input objects and schema-driven validation are preferred for complex operations:
- `createReview(input: CreateReviewInput)` in `src/server/reviewActions.ts`
- `buildUserWhere(filters: Partial<UserFiltersInput> = {})` in `src/server/services/userService.ts`

**Return Values:** Backend/server actions commonly return standardized result objects:
- `{ success: true, data, message }`
- `{ success: false, error }`
- Pattern appears in `src/server/reviewActions.ts`, `src/server/adminActions.ts`, `src/server/serviceAdminActions.ts`

## Module Design

**Exports:** Named exports are the default pattern:
- `export function ...` and `export const ...` across `src/server`, `src/hooks`, `src/schemas`
- Default exports are used mainly where framework conventions apply (e.g. `src/app/layout.tsx`) and in select components (`src/components/ProjectInfo.tsx`)

**Barrel Files:** Limited and localized usage:
- Present in `src/components/scheduling/index.ts`
- Most folders import concrete files directly rather than relying on barrels

---

*Convention analysis: 2026-04-08*
