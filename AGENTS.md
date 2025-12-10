# Repository Guidelines

## Project Structure & Module Organization
- `src/app/`: Next.js App Router routes, layouts, error boundaries, and page-level SCSS/Tailwind styling.
- `src/components/`: Shared UI and domain components (radix/shadcn-based), reused across pages.
- `src/server/`: Server actions/services for auth, chat, notifications, scheduling, and admin flows.
- `src/lib/`, `src/hooks/`, `src/contexts/`, `src/providers/`, `src/types/`: Utilities, state, and shared typing/helpers.
- `prisma/`: Schema, migrations, and `seed.ts`; regenerate client on install via `prisma generate`.
- `src/__tests__/` and `src/tests/setup.ts`: Jest + Testing Library suites and global setup.
- `public/`: Static assets; `docs/`, `DOCKER*.md`, `SETUP-DOCKER.md`, `TESTING.md` for extended guides; `scripts/` for Docker/db helpers.

## Build, Test, and Development Commands
- `npm run dev`: Local dev server at `http://localhost:3000`.
- `npm run build` / `npm start`: Production build and serve.
- `npm run lint:check` | `npm run lint:fix`: ESLint verification or autofix; `npm run type-check` for TS; `npm run validate` runs lint + type-check.
- `npm test` | `npm run test:watch` | `npm run test:coverage`: Jest suites, watch mode, and coverage.
- Prisma/database: `npm run db:migrate` (dev migrations), `npm run db:seed`, `npm run db:reset`; production variants use `./scripts/db-prod.sh ...`.
- Docker workflows: `./scripts/docker-manager.sh up dev` (dev stack), `... migrate dev`, `... logs dev`; production profiles use `./scripts/docker-manager.sh up prod` or `docker compose -f docker-compose.pro.yml`.

## Coding Style & Naming Conventions
- TypeScript-first; prefer `.tsx` for React components (PascalCase filenames) and `.ts` for utilities/hooks (camelCase exports).
- Keep JSX classNames tailwind-first; co-locate SCSS modules with the page when present.
- Use absolute imports via `@/` alias; colocate zod schemas in `src/schemas` for validation.
- Run `npm run lint:fix` before commits; adopt existing double-quote style and 2-space indentation seen in `src/app/layout.tsx`.

## Testing Guidelines
- Place component tests in `src/__tests__` using `ComponentName.test.tsx`; rely on `src/tests/setup.ts` for router/auth/toast mocks.
- Prefer Testing Library queries by role/text; cover loading/error states and server-action interactions.
- For new UI, add at least one smoke test and one interaction/assertion test; generate coverage with `npm run test:coverage` when changing critical flows.

## Commit & Pull Request Guidelines
- Follow existing history: lower-case prefixes like `feat: ...`, `fix: ...` with concise Portuguese/English descriptions.
- Before PRs, run `npm run validate` and relevant `npm test`/db commands; include screenshots or GIFs for UI changes.
- Describe scope, link issues, and note migrations/seeds touched (commit `prisma/migrations` and `prisma/seed.ts` changes together).

## Security & Configuration Tips
- Copy `.env.example` (or environment-specific variants) and never commit secrets; keep app vs migrator separation—rebuild the migrator image whenever migrations change.
- When touching uploads/email/storage, review `CONFIGURAR-EMAIL.md`, `.env.storage.example`, and `SECURITY.md` for required keys and policies.
