Development:
- `npm install` to install deps (postinstall runs `prisma generate`).
- `npm run dev` to start Next dev server.
- Docker workflow: `./scripts/docker-manager.sh up dev`, `./scripts/docker-manager.sh shell dev`, `./scripts/docker-manager.sh logs dev`, `./scripts/docker-manager.sh down dev`.

Quality:
- `npm run lint` or `npm run lint:check`; `npm run lint:fix` to autofix.
- `npm run type-check` for TS types.
- `npm run validate` (lint+type-check).
- Tests (prefer inside docker app container): `npm test`, `npm run test:watch`, `npm run test:coverage`, `npm run test:ci`.

Build/Prod:
- `npm run build`; `npm run start` after build. For vercel build: `npm run build:vercel`.

Database/Prisma:
- `npm run db:migrate`, `npm run db:push`, `npm run db:seed`, `npm run db:studio`, `npm run db:reset`; prod variants via `./scripts/db-prod.sh <cmd>`.

Docker compose direct examples (optional): `docker compose up -d`, `docker compose -f docker-compose.prod.yml up -d`.

Other: `./scripts/docker-manager.sh status|clean|migrate|seed|studio dev|prod`.
