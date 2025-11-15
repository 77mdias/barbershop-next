# 🏗️ Architecture - Barbershop Next

Documentação sobre a arquitetura do sistema, padrões de código e estruturas fundamentais.

## 📚 Documentos Disponíveis

### Core Architecture

- **[Server Actions](./server-actions.md)** - Padrões de Server Actions e Server Components
  - Server Actions pattern com `"use server"`
  - Estrutura de resposta padronizada
  - Tratamento de erros
  - Validação com Zod
  - Exemplos práticos

- **[API Examples](./api-examples.md)** - Exemplos de uso da API
  - Exemplos de endpoints
  - Estrutura de requisições e respostas
  - Autenticação em APIs

- **[Roles & Permissions](./roles-permissions.md)** - Sistema de permissões e roles
  - Roles: CLIENT, BARBER, ADMIN
  - Middleware de proteção
  - Verificação de permissões

### Database & Data Layer

- **[Database Model](./database-model.md)** - Estudo detalhado do modelo de dados
  - Modelos principais do Prisma
  - Relacionamentos entre entidades
  - Campos e tipos de dados

- **[Prisma Queries](./prisma-queries.md)** - Exemplos práticos de consultas Prisma
  - CRUD operations
  - Queries complexas com relations
  - Agregações e filters
  - Transactions

- **[Relationships](./relationships.md)** - Guia de relacionamentos entre modelos
  - One-to-One
  - One-to-Many
  - Many-to-Many
  - Self-relations (Friendships)

### Business Logic

- **[Business Rules](./business-rules.md)** - Regras de negócio da aplicação
  - Regras de agendamento
  - Validações de vouchers e promoções
  - Fluxo de status de appointments
  - Políticas de cancelamento

---

## 🎯 Principais Conceitos

### Server Actions Pattern

```typescript
export async function actionName(input: InputType) {
  const session = await getServerSession(authOptions)

  if (!session?.user?.id) {
    return { success: false, error: "Not authenticated" }
  }

  try {
    const validated = Schema.parse(input)
    const result = await db.model.operation(...)
    return { success: true, data: result }
  } catch (error) {
    return { success: false, error: "User-friendly message" }
  }
}
```

### Estrutura de Resposta Padronizada

```typescript
{
  success: boolean,
  data?: T,
  error?: string,
  pagination?: { page, limit, total, totalPages }
}
```

### Prisma Relations Pattern

```prisma
model User {
  id        String   @id @default(cuid())
  appointments Appointment[] // One-to-Many
  servicesProvided Appointment[] @relation("BarberAppointments")
}

model Appointment {
  id       String @id @default(cuid())
  userId   String
  barberId String
  user     User   @relation(fields: [userId], references: [id])
  barber   User   @relation("BarberAppointments", fields: [barberId], references: [id])
}
```

---

## 🔑 Conceitos-Chave

### Authentication Flow

1. NextAuth.js com JWT session strategy
2. Providers: GitHub, Google, Email/Password
3. Session callback re-queries database para dados frescos
4. Middleware protege rotas por auth status e role

### Data Validation

- **Client-side**: React Hook Form + Zod
- **Server-side**: Zod schemas em todas Server Actions
- **Database**: Prisma schema constraints

### Error Handling

- Nunca expor stack traces ao cliente
- Sempre logar erros server-side
- Retornar mensagens user-friendly
- Usar try-catch estruturado

---

## 📖 Leitura Recomendada

### Para Novos Desenvolvedores

1. [Server Actions](./server-actions.md) - Entenda o pattern fundamental
2. [Database Model](./database-model.md) - Conheça os modelos
3. [Relationships](./relationships.md) - Aprenda os relacionamentos
4. [Business Rules](./business-rules.md) - Entenda as regras de negócio

### Para Features Específicas

- Trabalhando com agendamentos? → [Business Rules](./business-rules.md)
- Criando queries complexas? → [Prisma Queries](./prisma-queries.md)
- Implementando autenticação? → [Roles & Permissions](./roles-permissions.md)

---

## 🔗 Links Relacionados

- [Features Documentation](../features/) - Implementação de funcionalidades
- [Database Guide](../database/) - Guias práticos de banco de dados
- [Development Guide](../development/) - Guia de desenvolvimento

---

**Última atualização**: 15 de Novembro de 2025
