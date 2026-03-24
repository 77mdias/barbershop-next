# GitHub Actions CI/CD

Este projeto agora possui pipeline CI/CD com GitHub Actions, alinhada com o fluxo oficial:

- CI em pull requests e pushes (`main`/`develop`)
- CD para produção na Vercel após CI bem-sucedido na `main`

## Workflows

### 1) CI (`.github/workflows/ci.yml`)

Executa:

1. `npm ci`
2. `npx prisma migrate deploy` em banco PostgreSQL de CI
3. `npm run lint:check`
4. `npm run type-check`
5. `npm run test:ci`
6. `npm run build`
7. Upload do artefato de cobertura (`coverage/`)

### 2) CD Vercel (`.github/workflows/cd-vercel.yml`)

Disparado:

- Automaticamente quando o workflow `CI` conclui com sucesso na branch `main`
- Manualmente via `workflow_dispatch`

Executa:

1. `npm ci`
2. `npx prisma migrate deploy` (se `DATABASE_URL` estiver definido)
3. `npx vercel pull --environment=production`
4. `npx vercel build --prod`
5. `npx vercel deploy --prebuilt --prod`

## Secrets Obrigatórios

Configurar em `Settings > Secrets and variables > Actions`:

- `VERCEL_TOKEN`
- `VERCEL_ORG_ID`
- `VERCEL_PROJECT_ID`

Secret recomendado:

- `DATABASE_URL` (para migrações automáticas antes do deploy)

## Recomendações de Proteção de Branch

Na branch `main`, marque como obrigatório:

- Status check do workflow `CI`
- Aprovação de PR antes de merge

## Observações

- O deploy oficial continua sendo Vercel.
- O caminho self-hosted com Docker (`deploy-pro.sh`) permanece opcional e separado.
