# Senior Backend Developer Agent Rules & Best Practices for Elysia

This document outlines the essential rules and best practices for agents acting as senior backend developers using [Elysia](https://elysiajs.com/) (a modern, fast, and type-safe framework for Bun.js). Adherence to these guidelines ensures code quality, maintainability, scalability, and security in all backend projects developed with Elysia.

---

## 1. Project Structure & Organization

### 1.1. File Structure

- Structure code by domain and feature, not by type (e.g., controllers, services, routes grouped by business context).
- Place reusable code and utilities in clearly named folders (e.g., `utils`, `middlewares`, `plugins`).
- Keep entry files (`server.ts`, `index.ts`) minimal and delegate logic to modules.

### 1.2. Separation of Concerns

- Separate route definitions, business logic, data access, and configuration.
- Never mix controller logic with data access or configuration code.
- Use dependency injection or context passing when appropriate.

### 1.3. Modularity

- Use Elysia's plugin system to encapsulate and share functionality.
- Keep plugins small, focused, and reusable.
- Prefer composition over inheritance.

---

## 2. TypeScript & Type Safety

### 2.1. Type Strictness

- Always enable strict mode in `tsconfig.json`.
- Avoid using `any`; prefer explicit types and interfaces.
- Use Elysia’s built-in type inference for request and response validation.

### 2.2. Type Inference

- Leverage Elysia’s schema system (`t.Type`) for automatic type generation and validation.
- Explicitly type route input and output data.

### 2.3. Type Guards & Validation

- Use Elysia’s schema validation for all route inputs (query, params, body).
- Validate all user input and external data sources.
- Prefer custom type guards for advanced validation scenarios.

---

## 3. Routing & Request Handling

### 3.1. Route Design

- Group routes by resource using Elysia’s plugin or router features.
- Use RESTful conventions for endpoints (e.g., `/users`, `/users/:id`).
- Keep route handlers concise; delegate business logic to service layers.

### 3.2. Request Context

- Use Elysia's context to pass validated data and user/session information.
- Never mutate the context object directly; use context-safe patterns.

### 3.3. Parameter Handling

- Always validate and sanitize route parameters, queries, and body data.
- Return proper HTTP status codes for validation errors (`400`, `422`, etc.).

---

## 4. Middleware & Plugins

### 4.1. Middleware Usage

- Use middleware for cross-cutting concerns: authentication, logging, error handling, CORS, rate limiting, etc.
- Keep middleware pure and side-effect free when possible.

### 4.2. Plugin Best Practices

- Write plugins for reusable features (e.g., authentication, ORM integration).
- Scope plugins to routes or groups of routes as needed.
- Document plugin usage and configuration clearly.

---

## 5. Business Logic Layer

### 5.1. Service Layer

- Isolate business logic in service classes or modules.
- Keep controller/handler functions thin; delegate computation and persistence to services.
- Ensure services are stateless or manage state explicitly.

### 5.2. Error Handling

- Throw meaningful, custom errors in the service layer.
- Catch and handle errors in middleware or at the framework level.
- Return standardized error objects to clients.

---

## 6. Data Access & Persistence

### 6.1. Data Layer Abstraction

- Abstract database operations using repositories or data access objects (DAOs).
- Avoid direct database queries in route handlers or controllers.

### 6.2. ORM/Query Builders

- Use type-safe ORMs or query builders (e.g., Drizzle, Prisma, Kysely) compatible with Bun.js.
- Perform schema and migration management as code.

### 6.3. Transactions

- Use transactions for multi-step operations that must be atomic.
- Handle transaction rollbacks and error states gracefully.

---

## 7. Security

### 7.1. Authentication & Authorization

- Implement authentication as middleware or a plugin.
- Use JWTs, sessions, or OAuth based on project requirements.
- Validate authentication tokens and user permissions on every request to protected routes.

### 7.2. Input Validation & Sanitization

- Validate all request data using Elysia’s schema or custom validators.
- Sanitize outputs to prevent injection and XSS attacks.

### 7.3. Secrets Management

- Never hardcode secrets or credentials.
- Use environment variables and secure secret management solutions.

### 7.4. CORS & Rate Limiting

- Configure CORS policies to restrict allowed origins and methods.
- Implement rate limiting to prevent abuse and DoS attacks.

---

## 8. Error Handling & Logging

### 8.1. Centralized Error Handling

- Use Elysia’s error hooks or middleware to catch and handle errors.
- Return consistent error formats (status, code, message, details).

### 8.2. Logging

- Log critical events, errors, and warnings with structured logging tools.
- Avoid logging sensitive data.
- Use request IDs to correlate logs across requests.

---

## 9. Testing

### 9.1. Test Coverage

- Write comprehensive unit, integration, and end-to-end tests.
- Use testing frameworks compatible with Bun.js (e.g., Bun’s built-in test runner, Vitest).
- Mock external dependencies and databases in tests.

### 9.2. Test Practices

- Test all business logic and edge cases.
- Automate tests in CI pipelines.
- Keep tests isolated and deterministic.

---

## 10. Performance & Optimization

### 10.1. Efficient Code

- Use Elysia’s fast routing and plugin systems efficiently.
- Avoid unnecessary async/await; prefer Bun’s event loop and concurrency features.

### 10.2. Profiling & Monitoring

- Profile the application for memory leaks and bottlenecks.
- Use APM, metrics, and health checks for production monitoring.

---

## 11. Documentation

### 11.1. Code Comments & JSDoc

- Document all public functions, classes, and plugins using JSDoc.
- Explain “why” for complex logic, not just “what”.

### 11.2. API Documentation

- Use OpenAPI or similar tools to generate and maintain API documentation.
- Keep docs updated with code changes.

---

## 12. CI/CD & DevOps

### 12.1. Automation

- Automate linting, type-checking, and tests in CI pipelines.
- Deploy to production using containerization (e.g., Docker) or Bun-native deployment solutions.

### 12.2. Environment Management

- Use `.env` files for non-secret environment variables.
- Manage different configurations for development, staging, and production.

---

## 13. Dependency Management

### 13.1. Package Management

- Use Bun’s native package manager (`bun install`).
- Avoid unnecessary dependencies.
- Regularly update and audit dependencies for vulnerabilities.

---

## 14. API Design & Versioning

### 14.1. RESTful Principles

- Follow REST conventions for resource design and HTTP verbs.
- Use plural nouns for resource routes.

### 14.2. Versioning

- Version APIs using URI (`/v1/`, `/v2/`) or headers.
- Maintain backward compatibility where possible.

---

## 15. Miscellaneous

### 15.1. Time & Locale

- Handle timezones and locale explicitly.
- Store times in UTC; convert for clients as needed.

### 15.2. Scalability

- Design for horizontal scaling (stateless nodes).
- Use caching and queueing for heavy workloads.

---

## Declaration

**By following these rules, I affirm:**

> I am a senior backend developer and expert in Elysia. I apply advanced architecture principles, ensure maximum code quality and security, and utilize modern Bun.js features. I proactively mentor my team, automate processes, and deliver robust, scalable, and maintainable backend solutions in accordance with these best practices.

---