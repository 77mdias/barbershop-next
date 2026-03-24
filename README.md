# Barbershop Next

Aplicação de agendamento para barbearia com Next.js, TypeScript, Prisma e NextAuth.

## Fluxo Oficial (Fonte de Verdade)

- **Desenvolvimento local**: Docker (`make dev-up`)
- **Produção oficial**: Vercel
- **Produção Docker self-hosted**: opcional/avançado (`./scripts/deploy-pro.sh`)

## Quick Start (5 minutos)

### 1. Pré-requisitos

- Node.js 20+
- Docker + Docker Compose
- Arquivo `.env.development` configurado

### 2. Subir ambiente de desenvolvimento

```bash
make dev-up
```

Aplicação: `http://localhost:3000`

### 3. Comandos essenciais no dia a dia

```bash
make dev-logs        # logs da app
make dev-shell       # shell no container app
make quality-check   # lint + type-check
make test            # testes
make dev-down        # derrubar ambiente
```

## Produção (Vercel)

### Deploy

- Push para branch configurada no Vercel
- Build padrão: `npm run build:vercel`

### CI/CD (GitHub Actions)

- CI automático em PR/push: lint, type-check, testes e build
- CD automático para Vercel após CI bem-sucedido na `main`
- Guia de configuração: [docs/deployment/github-actions.md](./docs/deployment/github-actions.md)

### Migrações de banco

```bash
make prod-migrate-vercel
```

Esse comando usa `./scripts/db-prod.sh migrate` com variáveis de `.env.production`.

## Simular produção local

```bash
make prod-local
```

## Docker em produção (self-hosted, opcional)

Use este caminho apenas se você for operar fora da Vercel.

```bash
./scripts/deploy-pro.sh deploy
./scripts/deploy-pro.sh status
./scripts/deploy-pro.sh logs
```

## Mapa rápido da arquitetura

- `src/app`: rotas e páginas (App Router)
- `src/server`: server actions e serviços de domínio
- `src/lib`: utilitários compartilhados (auth, prisma, segurança)
- `src/schemas`: validação com Zod
- `prisma`: schema e migrations

Detalhes: [Architecture Map](./docs/architecture/ARCHITECTURE-MAP.md)

## Segurança

Baseline e práticas aplicadas:

- Headers HTTP de segurança no `next.config.mjs`
- Validação Zod nos endpoints críticos de auth
- Rate limit para rotas sensíveis de autenticação
- Endpoints de debug/test protegidos por token em produção

Guia: [Security Playbook](./docs/security/PLAYBOOK.md)

## Documentação consolidada

- Hub principal: [docs/README.md](./docs/README.md)
- Runbook operacional: [docs/operations/RUNBOOK.md](./docs/operations/RUNBOOK.md)
- Índice curto: [docs/INDEX.md](./docs/INDEX.md)

## Observação sobre arquivos Docker de produção

- `docker-compose.pro.yml`: fluxo profissional self-hosted (migrator + app)
- `docker-compose.prod.yml`: fluxo legado de produção Docker
