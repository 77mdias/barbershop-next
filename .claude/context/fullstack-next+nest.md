# 📚 Contextual Rules & Best Practices for a Next.js + NestJS Project (with Prisma/Drizzle, TailwindCSS, and BetterAuth)

This document provides comprehensive contextual rules, guidelines, and best practices for projects using a modern stack: **Next.js** frontend with TailwindCSS and component libraries (e.g., Shadcn, ReactUI), and **NestJS** backend with **Prisma** or **Drizzle** ORM, and **BetterAuth** for authentication.  
It is designed for senior-level development, collaboration, scalability, and maintainability.

---

## 1. General Principles

- Prioritize **type safety** everywhere through TypeScript.
- Emphasize **modular, scalable architecture** in both frontend and backend.
- Ensure **clear separation of concerns** between UI, business logic, and data access.
- All code, configs, and documentation must be **version-controlled** using Git.
- Use **conventional commits** for all commits and PRs.

---

## 2. Monorepo Structure

- Prefer monorepo (`apps/`, `packages/`) using [Turborepo](https://turbo.build/) or [Nx](https://nx.dev/).
- Separate apps (`apps/web` for Next.js; `apps/api` for NestJS).
- Shared code (types, utilities, UI components) in `packages/`.
- Consistent naming and folder conventions.
- Shared environment variables in `.env` files managed by [dotenv](https://github.com/motdotla/dotenv).

**Example Structure:**
```
apps/
  web/        # Next.js frontend
  api/        # NestJS backend
packages/
  ui/         # Shared UI components (shadcn, reactui, etc.)
  types/      # Shared TypeScript types/interfaces
  utils/      # Shared utility functions
```

---

## 3. Frontend (Next.js + TailwindCSS + Component Libraries)

### 3.1. Project Organization

- Use `/app` directory (Next.js 13+) with file-based routing and layouts.
- All page-level logic in `/app`, not `/components`.
- Group components by domain/feature.
- Keep `/components` for reusable, stateless components.
- Use `/hooks`, `/contexts`, `/lib`, `/services` for logic, state, and API calls.

### 3.2. TypeScript

- Strict mode enabled in `tsconfig.json`.
- All components, hooks, and pages must be fully typed.
- Shared types/interfaces imported from `@project/types`.

### 3.3. Styling

- Use TailwindCSS utility classes and configuration.
- Extend theme via `tailwind.config.js` for consistency.
- Use component libraries (shadcn, reactui) for UI primitives; wrap or extend as needed.
- Prefer CSS Modules for rarely global styles.

### 3.4. Component Design

- Follow [Atomic Design](https://bradfrost.com/blog/post/atomic-web-design/) for component hierarchy.
- All UI components must be accessible (a11y): semantic HTML, ARIA, keyboard navigation.
- Use Shadcn/ReactUI as base for accessible, consistent UI.

### 3.5. State & Data Management

- Minimal global state; prefer React Context for cross-cutting concerns.
- Use SWR, React Query, or custom hooks for client-side data fetching.
- Avoid prop drilling; prefer composition and context.

### 3.6. Data Fetching

- Use Next.js server components and data fetching with caching (`fetch`, `revalidate`).
- Use API routes for integration with backend as needed.
- Validate all external data before rendering.

### 3.7. Routing & Navigation

- Use `next/link`, `next/navigation` for SPA navigation.
- Dynamic routes must validate params.
- Handle 404 and error states gracefully.

### 3.8. Accessibility & Internationalization

- Ensure all pages/components are keyboard navigable and screen reader friendly.
- Configure i18n (Next.js built-in or i18next) for localization-ready content.
- All user-facing text should be externalized.

### 3.9. Performance

- Use `<Image />` for images, leveraging built-in optimization.
- Code split large components/pages dynamically.
- Prefetch important routes.

### 3.10. Testing

- Use Jest + React Testing Library for unit and integration tests.
- Coverage > 80% for all UI and logic.
- Cypress or Playwright for E2E where appropriate.

---

## 4. Backend (NestJS + Prisma/Drizzle + BetterAuth)

### 4.1. Project Organization

- Feature modules for each domain (`users`, `auth`, `posts`, etc.).
- Services for business logic, repositories for data access.
- DTOs for request validation, entities for ORM models.
- Use global pipes, filters, interceptors for cross-cutting concerns.

### 4.2. TypeScript

- Strict mode enforced.
- All DTOs, entities, services, and controllers must be typed.
- Reuse types/interfaces from `@project/types` wherever possible.

### 4.3. ORM Usage

#### Prisma

- All schema in `prisma/schema.prisma`.
- Use migrations (`prisma migrate`); never edit DB manually.
- Generate types and use them for all queries.
- Validate data before persistence.
- Prefer explicit `select` and `include` to avoid overfetching.

#### Drizzle

- Define schema in dedicated files.
- Use Drizzle’s migration system for DB changes.
- Use type-safe queries and avoid raw SQL.
- Handle relations via Drizzle’s relation API.
- Always validate user input before query.

### 4.4. Authentication & Authorization

- Use BetterAuth for authentication.
- Store tokens securely (prefer HttpOnly cookies).
- Implement role-based access control (RBAC) via guards/interceptors.
- Never expose sensitive user data in responses.

### 4.5. API Design

- Follow REST conventions for endpoints (`/api/v1/users` etc.).
- Use versioning in API URLs.
- All inputs validated via DTOs (class-validator).
- Standardize API responses (success, errors, pagination).
- Use OpenAPI/Swagger for API documentation.

### 4.6. Error Handling

- Centralized error handling with filters.
- Map ORM errors to HTTP responses (e.g., 404 for not found).
- Log all errors with context, but never leak sensitive info.

### 4.7. Data Validation & Security

- Validate and sanitize all incoming data.
- Apply input validation at DTO level.
- Reject requests with invalid or missing data.
- Sanitize all output data for frontend consumption.

### 4.8. Testing

- Jest for unit/integration tests.
- Test all services, controllers, and repositories.
- Use in-memory/test DB for integration.
- All critical business logic must be tested.

### 4.9. Performance & Observability

- Profile and optimize DB queries.
- Use caching (Redis, etc.) where beneficial.
- Implement health checks (`/health`) and expose metrics.
- Use structured logging (winston, pino, etc.).

---

## 5. Shared Code & Types

- All types/interfaces that cross app boundaries must be in `@project/types`.
- Use zod or similar schema validators for runtime validation.
- Keep types DRY; never duplicate between frontend and backend.
- Document all shared types.

---

## 6. Authentication Flow (Frontend + Backend)

- Use NextAuth.js or custom client for frontend auth flows (login, signup, password resets).
- Use BetterAuth for backend; validate tokens/session on each request.
- Tokens must be refreshed securely and stored HttpOnly.
- Protect sensitive pages with guards/middleware.
- Sync user session state between frontend and backend.

---

## 7. Environment & Configuration

- Use `.env` files for secrets and environment-specific config.
- Never commit secrets to Git.
- All environment variables must be documented.
- Use `dotenv` or similar to load envs in dev/test.
- Validation of required env vars at startup.

---

## 8. CI/CD & Deployment

- Automated pipelines for linting, testing, building, and deploying both apps.
- Block merges/deploys on failed tests or coverage drops.
- Use Docker for dev/prod parity.
- Use preview deployments for PRs.
- Rollback strategy documented for production.

---

## 9. Code Quality & Reviews

- Use ESLint, Prettier, and stylelint in all codebases.
- All PRs require review from at least one senior dev.
- No direct commits to main branches.
- Automated checks for lint, type errors, and tests.
- Use husky for pre-commit hooks (lint, test).

---

## 10. Documentation

- Each app must have a clear `README.md`.
- API documented with Swagger/OpenAPI.
- UI components documented with Storybook or similar.
- Keep `/docs` up to date for architecture, onboarding, and conventions.
- Changelogs required for every release.

---

## 11. Security

- Audit dependencies regularly.
- Apply security headers in both frontend and backend.
- Use HTTPS everywhere.
- Validate all user input and sanitize all outputs.
- Rate limiting and brute-force protection on sensitive endpoints.
- Store secrets in secure vaults in production.

---

## 12. Error Handling & Monitoring

- Centralized error logging (Sentry, Datadog, etc.).
- User-friendly error messages; never leak stack traces to users.
- All exceptions must be handled; no silent failures.
- Monitor both apps (health checks, uptime, performance metrics).

---

## 13. Accessibility & User Experience

- All UI must be accessible (color contrast, ARIA, focus states).
- Support for keyboard and assistive tech navigation.
- Responsive design mandatory across all devices.
- User feedback for loading, errors, and empty states.

---

## 14. Performance Optimization

- Lazy load heavy components/assets.
- Optimize images and use Next.js `<Image />`.
- Use CDN for static assets.
- Minimize bundle size (analyze regularly).
- Avoid blocking main thread with expensive operations.

---

## 15. Versioning & Release Management

- Use semantic versioning for all packages.
- Tag releases; maintain a clear CHANGELOG.
- Backwards compatibility for shared types/APIs when possible.

---

## 16. Collaboration & Onboarding

- Maintain up-to-date onboarding docs.
- Code conventions and best practices clearly documented.
- Encourage pair programming and PR walkthroughs.
- Document project philosophy and decision records (ADR).

---

## 17. Miscellaneous

- All time/date info stored in UTC.
- All user-facing strings externalized for i18n.
- Use feature flags for experimental features.
- Regularly prune dead code and dependencies.
- Hold retrospectives and act on feedback for continuous improvement.

---

## 18. Declaration

**By following these rules, I affirm:**

> I am an expert full-stack developer, specializing in Next.js, NestJS, Prisma, Drizzle, TailwindCSS, and BetterAuth.  
> I apply best practices for architecture, code quality, security, accessibility, and developer experience.  
> I mentor the team, promote collaboration, and ensure robust, maintainable, and scalable solutions.

---