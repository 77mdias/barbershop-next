# 📚 Estudo 01 - Prisma: Conceitos Fundamentais

## 🎯 O que é o Prisma?

O **Prisma** é um **ORM (Object-Relational Mapping)** moderno para Node.js e TypeScript. Ele funciona como uma "ponte" entre seu código JavaScript/TypeScript e o banco de dados.

### 🤔 Por que usar um ORM?

**Sem ORM (SQL puro):**
```sql
SELECT * FROM users WHERE email = 'jean@email.com';
INSERT INTO users (name, email) VALUES ('Jean', 'jean@email.com');
```

**Com Prisma (TypeScript):**
```typescript
const user = await prisma.user.findUnique({ where: { email: 'jean@email.com' } });
const newUser = await prisma.user.create({ data: { name: 'Jean', email: 'jean@email.com' } });
```

### ✅ Vantagens do Prisma:
- **Type Safety**: Erros de tipo são detectados antes da execução
- **Auto-complete**: IDE sugere campos e métodos automaticamente
- **Migrations**: Controla mudanças no banco de dados
- **Prisma Studio**: Interface visual para ver dados

---

## 🏗️ Arquitetura do Prisma

```
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   Seu Código    │───▶│  Prisma Client  │───▶│  Banco de Dados │
│  (TypeScript)   │    │   (Gerado)      │    │  (PostgreSQL)   │
└─────────────────┘    └─────────────────┘    └─────────────────┘
        ▲                        ▲
        │                        │
        │              ┌─────────────────┐
        └──────────────│ Prisma Schema   │
                       │ (schema.prisma) │
                       └─────────────────┘
```

### 📝 Componentes principais:

1. **Prisma Schema** (`schema.prisma`): Define modelos e conexão com banco
2. **Prisma Client**: Código gerado automaticamente para fazer queries
3. **Prisma Migrate**: Gerencia mudanças no banco de dados

---

## 📁 Estrutura de Arquivos

```
projeto/
├── prisma/
│   ├── schema.prisma      ← Define modelos (User, Product, etc)
│   ├── migrations/        ← Histórico de mudanças no banco
│   └── seed.ts           ← Dados iniciais para teste
├── src/
│   ├── lib/
│   │   └── prisma.ts     ← Configuração do cliente
│   └── generated/        ← Cliente gerado automaticamente
└── node_modules/
    └── @prisma/client/   ← Biblioteca instalada
```

---

## 🔧 Instalação e Configuração

### 1. Instalação das dependências:
```bash
# Instalar Prisma CLI (ferramenta de desenvolvimento)
npm install prisma --save-dev

# Instalar Prisma Client (usado no código)
npm install @prisma/client
```

### 2. Inicializar Prisma:
```bash
npx prisma init
```

**O que acontece:**
- Cria pasta `prisma/` com `schema.prisma`
- Cria arquivo `.env` com variável `DATABASE_URL`

### 3. Configurar conexão com banco:
```env
# .env
DATABASE_URL="postgresql://usuario:senha@localhost:5432/meubanc"
```

### 4. Definir modelos no schema:
```prisma
// prisma/schema.prisma
generator client {
  provider = "prisma-client-js"
  output   = "../src/generated/prisma"  // Onde gerar o cliente
}

datasource db {
  provider = "postgresql"
  url      = env("DATABASE_URL")
}

model User {
  id    Int     @id @default(autoincrement())
  name  String
  email String  @unique
  posts Post[]
}

model Post {
  id       Int    @id @default(autoincrement())
  title    String
  content  String
  authorId Int
  author   User   @relation(fields: [authorId], references: [id])
}
```

---

## ⚙️ Geração do Prisma Client

### 🤔 O que é "gerar o cliente"?

O Prisma lê seu `schema.prisma` e **cria código TypeScript automaticamente** com:
- Tipos para cada modelo (User, Post, etc)
- Métodos para fazer queries (findMany, create, update, delete)
- Validações e relacionamentos

### 📝 Comando para gerar:
```bash
npx prisma generate
```

**O que acontece:**
1. Prisma lê `schema.prisma`
2. Gera código TypeScript em `src/generated/prisma/`
3. Cria tipos como `User`, `Post`, `PrismaClient`

### 📂 Arquivos gerados:
```
src/generated/prisma/
├── index.d.ts          ← Tipos TypeScript
├── index.js            ← Código JavaScript
└── package.json        ← Configuração do pacote
```

---

## 💻 Usando o Prisma Client

### 1. Configurar cliente:
```typescript
// src/lib/prisma.ts
import { PrismaClient } from '@/generated/prisma';

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
};

export const prisma = globalForPrisma.prisma ?? new PrismaClient();

if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prisma;
```

### 2. Usar em suas funções:
```typescript
// src/server/userActions.ts
import { prisma } from '@/lib/prisma';

export async function createUser(name: string, email: string) {
  const user = await prisma.user.create({
    data: { name, email }
  });
  return user;
}

export async function getUsers() {
  const users = await prisma.user.findMany({
    include: { posts: true }  // Incluir posts relacionados
  });
  return users;
}
```

---

## 🔄 Fluxo de Desenvolvimento

### 1. **Modificar Schema**
```prisma
model User {
  id       Int     @id @default(autoincrement())
  name     String
  email    String  @unique
  age      Int?    // ← Campo novo adicionado
}
```

### 2. **Criar Migration**
```bash
npx prisma migrate dev --name add-user-age
```

### 3. **Gerar Cliente**
```bash
npx prisma generate
```

### 4. **Usar no Código**
```typescript
const user = await prisma.user.create({
  data: { 
    name: 'Jean', 
    email: 'jean@email.com',
    age: 25  // ← Novo campo disponível
  }
});
```

---

## 🎓 Conceitos Importantes

### ✅ **Migration vs Generate**

| Comando | O que faz | Quando usar |
|---------|-----------|-------------|
| `prisma migrate dev` | Atualiza estrutura do banco | Após mudar schema |
| `prisma generate` | Gera código TypeScript | Após migrate ou mudança no schema |

### ✅ **Desenvolvimento vs Produção**

| Ambiente | Como funciona |
|----------|---------------|
| **Desenvolvimento** | Você roda comandos manualmente |
| **Produção/Docker** | Comandos são executados automaticamente |

### ✅ **Onde o cliente é gerado**

```prisma
generator client {
  provider = "prisma-client-js"
  output   = "../src/generated/prisma"  // ← Aqui!
}
```

---

## 📝 Anotações Pessoais

### ❓ Dúvidas Levantadas:
- Por que preciso gerar o cliente?
- Qual a diferença entre migrate e generate?
- Onde o código é gerado?

### 💡 Soluções Testadas:
- Testei `npx prisma generate` → gerou arquivos em `src/generated/`
- Testei importar de `@/generated/prisma` → funcionou
- Testei criar usuário → sucesso

### 🚀 Aprendizados Finais:
- Prisma é uma ferramenta que **gera código** baseado no schema
- Sempre que mudar o schema, preciso rodar `generate`
- O cliente gerado contém todos os tipos e métodos TypeScript
- É seguro porque detecta erros antes da execução

---

## 🔗 Próximos Estudos:
- [ ] Como funciona o Docker com Prisma
- [ ] Diferença entre desenvolvimento local vs container
- [ ] Configuração do Dockerfile para Prisma