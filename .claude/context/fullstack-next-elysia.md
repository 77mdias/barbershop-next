# 📚 Contextual Rules & Best Practices for a Next.js + Elysia Project (with Drizzle, TailwindCSS, and BetterAuth)

This document defines the foundational rules, guidelines, and best practices for a modern web project using **Next.js** (frontend), **Elysia** (backend on Bun), **Drizzle ORM** (database), **BetterAuth** (authentication), **TailwindCSS**, and component libraries (e.g., Shadcn, ReactUI).  
The objective is to create a maintainable, scalable, and secure full-stack application with a robust developer experience.

---

## 1. General Principles

- Use **TypeScript** strictly across the stack.
- Maintain **clear separation of concerns**: UI, business logic, data access, and configuration should be isolated.
- All code must be **versioned with Git**. Use feature branches and PRs for every change.
- Adopt **conventional commits** for all commit messages.
- Document all architectural decisions (ADRs).

---

## 2. Monorepo Organization

- Use a monorepo with `apps/` (frontend and backend) and `packages/` (shared code).
- Example structure:
  ```
  apps/
    web/      # Next.js frontend
    api/      # Elysia backend (Bun)
  packages/
    ui/       # Shared components
    types/    # Shared TypeScript types
    utils/    # Shared utilities
  ```
- Shared types/interfaces must reside in `packages/types` and be used by both frontend and backend.

---

## 3. Frontend (Next.js + TailwindCSS + Component Libraries)

### 3.1. Project Structure

- Use the `/app` directory (Next.js 13+) for routing, layouts, and server/client components.
- Group components by domain/feature and keep reusable components in `/components`.
- Place business logic in `/lib`, `/services`, or `/hooks`.
- Custom hooks go in `/hooks`. Contexts in `/contexts`.

### 3.2. Styling

- Use **TailwindCSS** for all styling needs.
- Extend the design system via `tailwind.config.js`.
- Use component libraries (Shadcn, ReactUI) as primitives, customizing as needed for project consistency.
- Avoid global CSS; use CSS Modules or Tailwind when specific styles are required.

### 3.3. TypeScript

- Enforce strict mode in `tsconfig.json`.
- All components, hooks, and pages must be typed.
- Share types via `@project/types` package.

### 3.4. Data Fetching

- Use Next.js server components and `fetch` for SSR/SSG.
- Prefer client-side data fetching (SWR, React Query) for user-specific or dynamic data.
- Validate and sanitize all data from the backend before rendering.

### 3.5. Routing & Navigation

- Use `next/link` and `next/navigation` APIs for client-side routing.
- Validate all dynamic route parameters.
- Handle loading, error, and empty states gracefully.

### 3.6. State Management

- Use React Context for global state with limited scope.
- For complex or cross-cutting state, consider Zustand, Jotai, or Redux Toolkit.
- Avoid unnecessary prop drilling.

### 3.7. Accessibility & Localization

- All UI must be accessible (semantic HTML, ARIA, keyboard navigation).
- Plan for internationalization by externalizing user-facing text.

### 3.8. Performance

- Use Next.js `<Image />` for optimized images.
- Lazy-load heavy components and assets.
- Use dynamic imports for code splitting.

### 3.9. Testing

- Use Jest and React Testing Library for unit/integration tests.
- Strive for >80% test coverage.
- End-to-end tests with Cypress or Playwright as needed.

---

## 4. Backend (Elysia + Drizzle + BetterAuth)

### 4.1. Project Structure

- Organize by feature/domain using Elysia plugins/modules.
- Separate routes, controllers, services, and data access layers.
- Place Drizzle schemas in `/db/schema` and migrations in `/db/migrations`.
- Use `/plugins` for Elysia plugins (auth, CORS, etc.).

### 4.2. TypeScript & Type Safety

- Strict mode enforced throughout.
- Use Drizzle's type-safe schema definitions and query builder.
- All request/response types must be explicitly typed and shared via `@project/types`.

### 4.3. Drizzle ORM

- Define all tables, columns, and relations explicitly.
- Use migrations for schema changes; never alter DB manually.
- Abstract queries in repository/services layers.
- Avoid raw SQL unless strictly necessary.

### 4.4. Authentication & Authorization

- Use **BetterAuth** for all authentication flows.
- Store tokens in HttpOnly cookies or secure headers.
- Validate user session on each request.
- Implement role-based access control via middleware/plugins.

### 4.5. API Design

- Follow RESTful conventions for endpoints (`/api/v1/...`).
- Validate all input using Elysia's schema validation or Zod.
- Standardize API responses (data, error, pagination formats).
- Document API with OpenAPI (Swagger) or similar tools.

### 4.6. Error Handling

- Centralize error handling using Elysia's hooks and middleware.
- Always map errors to relevant HTTP status codes and user-friendly messages.
- Log all errors with context; never expose sensitive information.

### 4.7. Security

- Validate and sanitize all incoming data.
- Implement CORS, rate limiting, and brute-force protection.
- Store secrets in environment variables; never commit to repo.
- Regularly audit dependencies for vulnerabilities.

### 4.8. Performance

- Profile and optimize database queries.
- Use caching (e.g., Redis) for expensive or frequent queries.
- Use Bun's native concurrency features and Elysia's fast routing.

### 4.9. Testing

- Use Bun’s test runner or Vitest for unit/integration tests.
- Mock external services in tests.
- All business-critical logic must have test coverage.

### 4.10. Observability

- Implement health check endpoints.
- Use structured logging for all requests and errors.
- Expose basic metrics for monitoring.

---

## 5. Shared Types & Utilities

- All shared types/interfaces must be in `@project/types`.
- Use Zod or similar for runtime validation, sharing schemas between backend and frontend when possible.
- Utility functions (formatting, validation, helpers) in `@project/utils`.

---

## 6. Authentication Flow

- Frontend handles login/signup via API calls to Elysia backend (BetterAuth).
- Tokens are set as HttpOnly cookies by the backend.
- Frontend checks session/token state on each page load.
- Protect sensitive routes/pages with middleware/guards both on frontend (client-side) and backend (server-side).
- Support token refresh and logout securely.

---

## 7. Environment & Configuration

- Use `.env` files for all secrets and config.
- Validate required env vars at startup; fail fast if missing.
- Document all environment variables in `/docs/env.md`.
- Never commit secrets; use .env.example as template.

---

## 8. CI/CD & Deployment

- Automated pipelines for linting, testing, building, and deploying both apps.
- Block merges on failed checks.
- Use Docker (or Bun-native deploy) for production parity.
- Use preview deployments for PRs.
- Implement rollback strategies for critical failures.

---

## 9. Code Quality & Reviews

- Enforce code style with ESLint, Prettier, and stylelint on all codebases.
- All code changes require PR and review.
- No direct commits to main branches.
- Use pre-commit hooks (husky/lint-staged) for lint/tests.

---

## 10. Documentation

- Maintain `README.md` for both apps.
- API auto-documented with Swagger/OpenAPI.
- UI components documented with Storybook or similar.
- Maintain `/docs` for architecture, conventions, and onboarding.
- Changelogs required for each release.

---

## 11. Accessibility & User Experience

- All UI components must pass accessibility audits.
- Maintain responsive layouts for all screen sizes.
- Provide user feedback for all async actions (loading, error, success).

---

## 12. Security

- Use HTTPS everywhere.
- Set secure HTTP headers (CSP, HSTS, etc.) in backend.
- Sanitize all user inputs and outputs.
- Apply rate limiting on sensitive endpoints.
- Store and rotate secrets securely (use vaults in production).

---

## 13. Versioning & Release Management

- Use semantic versioning for all packages.
- Tag releases and maintain clear changelogs.
- Ensure backward compatibility of APIs and shared types.

---

## 14. Collaboration & Onboarding

- Keep onboarding docs up to date.
- Promote pair programming, code reviews, and knowledge sharing.
- Document all major design decisions (ADRs).

---

## 15. Miscellaneous

- Store and handle dates/times in UTC.
- Use feature flags for experimental or staged features.
- Regularly prune unused code and dependencies.
- Celebrate and document significant milestones.

---

## Declaration

**By following these rules, I affirm:**

> I am an expert full-stack developer with Next.js, Elysia, Drizzle, TailwindCSS, and BetterAuth.  
> I apply best practices for architecture, code quality, security, accessibility, and developer experience.  
> I mentor the team, promote collaboration, and deliver robust, maintainable, and scalable solutions.

---