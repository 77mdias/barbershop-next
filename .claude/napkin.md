# Napkin Runbook

## Curation Rules
- Re-prioritize on every read.
- Keep recurring, high-value notes only.
- Max 10 items per category.
- Each item includes date + "Do instead".

## Execution & Validation (Highest Priority)
1. **[2026-03-25] Vinext + Nitro requires `serverHandler: false` for plugin-rsc**
   Do instead: Always use `vinext({ rsc: false })` + manual `rsc({ serverHandler: false })` in vite.config.ts when Nitro is present. Nitro creates `FetchableDevEnvironment` without `runner`, crashing plugin-rsc's default server handler.

2. **[2026-03-25] Docker dev uses `npm run dev` (vinext), not `npm run dev:next`**
   Do instead: Check `package.json` scripts — primary runtime is vinext, Next.js scripts are fallback only (`dev:next`, `build:next`).

3. **[2026-03-25] Vinext reads `next.config.ts` for Next.js-compatible settings**
   Do instead: Put `serverExternalPackages`, `images`, `eslint` config in `next.config.ts`. Do NOT use `next.config.mjs` (renamed to `.legacy`).

## Shell & Command Reliability
1. **[2026-03-25] Run tests inside Docker container when available**
   Do instead: `npm run docker:dev:shell` then `npm test` inside container, or `docker compose exec app npm test`.

## Domain Behavior Guardrails
1. **[2026-03-25] NextAuth params differ between Next.js 15 and Vinext**
   Do instead: Always handle both Promise-based (Next.js 15) and direct (vinext thenable) params in API route handlers. See `src/app/api/auth/[...nextauth]/route.ts` for the pattern.

2. **[2026-03-25] Vinext shims next/* imports — don't replace with custom code**
   Do instead: Keep using `next/link`, `next/image`, `next/navigation`, `next/cache`, `next/server` imports. Vinext provides working shims for all of them.

## User Directives
1. **[2026-03-25] Keep Next.js fallback scripts**
   Do instead: Preserve `dev:next`, `build:next`, `start:next` in package.json for safety rollback.
