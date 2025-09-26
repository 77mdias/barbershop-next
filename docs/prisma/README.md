# 🔄 Prisma ORM

## Configuração Básica

O Prisma é um ORM moderno para Node.js e TypeScript que facilita o acesso ao banco de dados PostgreSQL.

### Instalação

```bash
npm install prisma @prisma/client
npx prisma init
```

### Cliente Prisma

```typescript
// src/lib/prisma.ts
import { PrismaClient } from '@prisma/client'

const globalForPrisma = global as unknown as { prisma: PrismaClient }

export const prisma = globalForPrisma.prisma || new PrismaClient()

if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prisma
```

## Modelos Principais

```prisma
// prisma/schema.prisma
model User {
  id        String   @id @default(cuid())
  name      String
  email     String   @unique
  password  String?
  image     String?
  role      String   @default("user")
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt
  
  appointments Appointment[]
}

model Appointment {
  id        String   @id @default(cuid())
  date      DateTime
  service   String
  status    String   @default("pending")
  userId    String
  user      User     @relation(fields: [userId], references: [id])
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt
}
```

## Operações Comuns

### Consultas

```typescript
// Buscar todos os usuários
const users = await prisma.user.findMany();

// Buscar usuário por ID
const user = await prisma.user.findUnique({
  where: { id: userId }
});

// Buscar com relações
const appointments = await prisma.appointment.findMany({
  include: { user: true }
});
```

### Mutações

```typescript
// Criar usuário
const user = await prisma.user.create({
  data: {
    name: "João Silva",
    email: "joao@example.com"
  }
});

// Atualizar usuário
const updatedUser = await prisma.user.update({
  where: { id: userId },
  data: { name: "João Santos" }
});

// Excluir usuário
await prisma.user.delete({
  where: { id: userId }
});
```

## Migrações

```bash
# Gerar migração
npx prisma migrate dev --name add_user_role

# Aplicar migrações
npx prisma migrate deploy

# Visualizar banco de dados
npx prisma studio
```