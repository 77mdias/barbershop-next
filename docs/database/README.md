# 🗄️ PostgreSQL Serverless (Neon/Supabase)

## Configuração Inicial

### Opção 1: Neon
1. Crie uma conta em [neon.tech](https://neon.tech)
2. Crie um novo projeto
3. Obtenha a string de conexão
4. Adicione ao arquivo `.env`:
   ```
   DATABASE_URL="postgresql://user:password@endpoint/database"
   ```

### Opção 2: Supabase
1. Crie uma conta em [supabase.com](https://supabase.com)
2. Crie um novo projeto
3. Vá em Configurações > Database > Connection string
4. Adicione ao arquivo `.env`:
   ```
   DATABASE_URL="postgresql://postgres:password@db.project.supabase.co:5432/postgres"
   ```

## Prisma Schema

```prisma
// prisma/schema.prisma
generator client {
  provider = "prisma-client-js"
}

datasource db {
  provider = "postgresql"
  url      = env("DATABASE_URL")
}

model User {
  id        String   @id @default(cuid())
  name      String
  email     String   @unique
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt
}
```

## Migrações

```bash
# Criar migração
npx prisma migrate dev --name init

# Aplicar migrações em produção
npx prisma migrate deploy
```

## Conexão Segura

Para ambientes serverless, use connection pooling:

```
DATABASE_URL="postgresql://user:password@endpoint/database?pgbouncer=true&connection_limit=1"
```