# 🛠️ Dashboard Admin - Barbershop Next

Este documento detalha a estrutura, permissões e funcionalidades do painel administrativo do Barbershop Next.js.

---

## 📋 Visão Geral

**Status**: ✅ **IMPLEMENTADO** (Atualizado: 11 Jan 2026)
**Rota**: `/dashboard/admin` (rota dedicada)
**Acesso**: Apenas usuários com `role: ADMIN` 🔒 **SEGURO**

O dashboard do admin é um painel de controle centralizado que permite gerenciar toda a aplicação, incluindo usuários, serviços, reviews e métricas globais com dados reais.

### 🔒 Correções de Segurança Recentes (1 Nov 2025)

**CRÍTICO**: Vulnerabilidades de segurança foram corrigidas em todas as funções admin:
- ✅ Todas as 6 funções em `adminActions.ts` agora validam autenticação + role ADMIN
- ✅ Middleware corrigido para proteger `/dashboard/admin/*` corretamente
- ✅ Prevenção de escalação de privilégios implementada
- ✅ Proteção contra acesso não autorizado a dados sensíveis

**Antes**: Qualquer pessoa (incluindo não autenticados) podia listar usuários, ver dados financeiros e promover-se a ADMIN.
**Depois**: Sistema completamente seguro com validação em todas as camadas.

---

## 🎯 Funcionalidades

### ✅ Implementadas e Funcionais

#### 0. **Segurança** 🔒 **CRÍTICO - IMPLEMENTADO** (1 Nov 2025)
- **Autenticação e Autorização**: Todas as funções admin validam session + role ADMIN
- **Middleware Corrigido**: Proteção de rotas `/dashboard/admin/*` funcionando
- **Prevenção de Escalação**: Impossível promover-se a ADMIN sem autorização
- **Arquivos Protegidos**:
  - ✅ `/src/server/adminActions.ts` - 6 funções com validação completa
  - ✅ `/src/middleware.ts` - Proteção de rota corrigida

#### 0.1 **Gestão de Serviços** 🛠️ **IMPLEMENTADO** (11 Jan 2026)
- **CRUD Completo**: Criar, editar, deletar e listar serviços
- **Smart Delete**: Soft delete se serviço tem histórico, hard delete se não tem
- **Toggle Status**: Ativar/desativar serviços rapidamente
- **Estatísticas**: Cards com métricas (total, ativos, inativos, agendamentos, preço médio)
- **Validações**: Zod schemas, prevenção de duplicatas, role ADMIN
- **Filtros e Busca**: Busca debounced, filtro de status e paginação server-side via `ServicesPageClient` + componentes base (DebouncedSearchInput, FilterSelect, PaginationControls).
- **Arquivos Criados/Atualizados**:
  - ✅ `/src/server/serviceAdminActions.ts` - 6 server actions seguras
  - ✅ `/src/app/dashboard/admin/services/page.tsx` e `ServicesPageClient.tsx` - Página de gestão com wrapper client
  - ✅ `/src/components/ServiceForm.tsx` + dialogs de confirmação para criação/edição

#### 0.2 **Filtros e Busca Admin (TASK #025)** 🔍
- Busca debounced de 500ms com botão de limpar e loading controlado nas páginas Users, Services, Barbers e Reports.
- Filtros de role/status/performance/dateRange via FilterSelect, com paginação server-side e métricas agregadas retornadas pelas server actions.
- Wrapper pattern com `UsersPageClient`, `ServicesPageClient`, `BarbersPageClient` e `ReportsPageClient` mantendo estado reativo e refresh.

### ✅ Implementadas - Parcialmente Funcionais

#### 1. **Dashboard Completo Multi-Tabs**
- **Visão Geral**: Métricas globais e estatísticas principais
- **Usuários**: Gestão e analytics de usuários  
- **Avaliações**: Sistema de reviews e ratings
- **Sistema**: Status da aplicação e configurações

#### 2. **Métricas Globais Reais** (via `getAdminMetrics()`)
- **Total de Usuários**: Contagem por role (Cliente/Barbeiro/Admin)
- **Total de Reviews**: Quantidade e distribuição de avaliações
- **Média Global**: Rating médio calculado em tempo real
- **Atividade Mensal**: Agendamentos e serviços do mês
- **Reviews Pendentes**: Avaliações aguardando rating
- **Top Barbeiros**: Ranking por avaliação média
- **Receita Estimada**: Métricas financeiras (mockadas temporariamente)

#### 3. **Analytics Avançados**
- **Distribuição de Ratings**: Breakdown de 1-5 estrelas
- **Barbeiros Ativos**: Profissionais com atividade recente  
- **Status do Sistema**: Métricas operacionais
- **Tendências Temporais**: Atividade por período

#### 4. **Interface Administrativa Profissional**
- Design responsivo e intuitivo
- Cards de métricas com ícones informativos
- Navegação por tabs organizada
- Redirecionamento automático para admins
- Acesso restrito com validação de role

#### 5. **Integração com Server Actions**
- `getAdminMetrics()`: 14 métricas diferentes do sistema
- Queries otimizadas do Prisma para performance  
- Dados em tempo real do banco de dados
- Error handling robusto
- Relatórios de campanhas

#### 6. Relatórios e Analytics
- Exportação de dados (PDF/Excel)
- Gráficos de performance
- Análise de tendências
- Comparativos mensais

---

## 🏗️ Estrutura Recomendada

### Arquivos e Componentes

```
src/
├── app/
│   └── dashboard/
│       ├── page.tsx              # Dashboard principal (role-based)
│       ├── admin/                # Área administrativa
│       │   ├── page.tsx          # Dashboard admin específico
│       │   ├── users/            # Gerenciamento de usuários
│       │   │   ├── page.tsx
│       │   │   └── [id]/         # Edição de usuário
│       │   ├── services/         # Gerenciamento de serviços
│       │   │   ├── page.tsx
│       │   │   └── [id]/
│       │   ├── promotions/       # Gerenciamento de promoções
│       │   │   ├── page.tsx
│       │   │   └── [id]/
│       │   └── reports/          # Relatórios
│       │       └── page.tsx
│       └── barber/
│           └── page.tsx          # Dashboard barbeiro
├── components/
│   └── dashboard/
│       ├── AdminPanel.tsx        # Painel principal
│       ├── UserTable.tsx         # Tabela de usuários
│       ├── ServiceManager.tsx    # Gerenciador de serviços
│       └── ReportCard.tsx        # Cards de relatórios
└── server/
    ├── userActions.ts            # CRUD de usuários
    ├── serviceActions.ts         # CRUD de serviços
    └── reportActions.ts          # Geração de relatórios
```

---

## 🔐 Permissões e Segurança

### Proteção de Rotas

**Middleware**: `/src/middleware.ts`

```typescript
export async function middleware(request: NextRequest) {
  const session = await getToken({ req: request });
  
  if (request.nextUrl.pathname.startsWith('/dashboard/admin')) {
    if (!session || session.role !== 'ADMIN') {
      return NextResponse.redirect(new URL('/dashboard', request.url));
    }
  }
}
```

### Server Actions

Todas as ações administrativas devem verificar:

```typescript
export async function adminAction() {
  "use server";
  
  const session = await getServerSession(authOptions);
  
  // Verificar autenticação
  if (!session?.user?.id) {
    return { success: false, error: "Não autenticado" };
  }

  // Verificar role ADMIN
  if (session.user.role !== "ADMIN") {
    return { success: false, error: "Não autorizado" };
  }

  // Executar ação...
}
```

---

## 📊 Server Actions Disponíveis

### getDashboardMetrics()

Retorna métricas globais para admins.

**Arquivo**: `/src/server/dashboardActions.ts`

```typescript
export async function getDashboardMetrics(userId: string) {
  const session = await getServerSession(authOptions);
  
  if (session.user.role === "ADMIN") {
    // Métricas globais
    const globalMetrics = await db.serviceHistory.aggregate({
      where: { rating: { not: null } },
      _count: { rating: true },
      _avg: { rating: true },
    });

    const totalUsers = await db.user.count();

    const monthlyActivity = await db.serviceHistory.count({
      where: { 
        createdAt: { 
          gte: new Date(
            new Date().getFullYear(),
            new Date().getMonth(),
            1
          ) 
        } 
      },
    });

    return {
      success: true,
      data: {
        totalReviews: globalMetrics._count.rating || 0,
        globalAverage: Number(globalMetrics._avg.rating?.toFixed(1)) || 0,
        totalUsers,
        monthlyActivity,
        userRole: "ADMIN",
      },
    };
  }
}
```

---

## 💡 Exemplos de Implementação

### 1. Listar Usuários

```typescript
// src/server/userActions.ts
export async function getUsers(filters?: {
  role?: "CLIENT" | "BARBER" | "ADMIN";
  search?: string;
  page?: number;
  limit?: number;
}) {
  "use server";
  
  const session = await getServerSession(authOptions);
  if (session?.user?.role !== "ADMIN") {
    return { success: false, error: "Não autorizado" };
  }

  const where: Prisma.UserWhereInput = {
    ...(filters?.role && { role: filters.role }),
    ...(filters?.search && {
      OR: [
        { name: { contains: filters.search, mode: "insensitive" } },
        { email: { contains: filters.search, mode: "insensitive" } },
      ],
    }),
  };

  const [users, total] = await Promise.all([
    db.user.findMany({
      where,
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        image: true,
        createdAt: true,
        _count: {
          select: {
            serviceHistories: true,
            appointments: true,
          },
        },
      },
      skip: ((filters?.page || 1) - 1) * (filters?.limit || 10),
      take: filters?.limit || 10,
      orderBy: { createdAt: "desc" },
    }),
    db.user.count({ where }),
  ]);

  return {
    success: true,
    data: {
      users,
      pagination: {
        page: filters?.page || 1,
        limit: filters?.limit || 10,
        total,
        totalPages: Math.ceil(total / (filters?.limit || 10)),
      },
    },
  };
}
```

### 2. Gerenciar Serviços

```typescript
// src/server/serviceActions.ts
export async function createService(data: {
  name: string;
  description: string;
  price: number;
  duration: number;
  category?: string;
}) {
  "use server";
  
  const session = await getServerSession(authOptions);
  if (session?.user?.role !== "ADMIN") {
    return { success: false, error: "Não autorizado" };
  }

  const service = await db.service.create({
    data: {
      name: data.name,
      description: data.description,
      price: data.price,
      duration: data.duration,
      category: data.category,
      isActive: true,
    },
  });

  revalidatePath("/dashboard/admin/services");
  return { success: true, data: service };
}

export async function updateService(
  id: string,
  data: Partial<{
    name: string;
    description: string;
    price: number;
    duration: number;
    category: string;
    isActive: boolean;
  }>
) {
  "use server";
  
  const session = await getServerSession(authOptions);
  if (session?.user?.role !== "ADMIN") {
    return { success: false, error: "Não autorizado" };
  }

  const service = await db.service.update({
    where: { id },
    data,
  });

  revalidatePath("/dashboard/admin/services");
  return { success: true, data: service };
}
```

### 3. Criar Promoções

```typescript
// src/server/promotionActions.ts
export async function createPromotion(data: {
  name: string;
  description: string;
  type: VoucherType;
  value: number;
  startDate: Date;
  endDate: Date;
  maxUses?: number;
  serviceIds?: string[];
}) {
  "use server";
  
  const session = await getServerSession(authOptions);
  if (session?.user?.role !== "ADMIN") {
    return { success: false, error: "Não autorizado" };
  }

  const promotion = await db.promotion.create({
    data: {
      name: data.name,
      description: data.description,
      type: data.type,
      value: data.value,
      startDate: data.startDate,
      endDate: data.endDate,
      maxUses: data.maxUses,
      isActive: true,
      services: data.serviceIds
        ? {
            connect: data.serviceIds.map((id) => ({ id })),
          }
        : undefined,
    },
  });

  revalidatePath("/dashboard/admin/promotions");
  return { success: true, data: promotion };
}
```

---

## 🎨 Interface Sugerida

### Layout do Dashboard Admin

```
┌─────────────────────────────────────────────────────────┐
│ 🛠️ Painel Administrativo                                │
├─────────────────────────────────────────────────────────┤
│                                                          │
│  📊 Métricas Globais                                    │
│  ┌──────────┐  ┌──────────┐  ┌──────────┐  ┌────────┐ │
│  │ 350 📝   │  │  4.7 ⭐   │  │ 245 👥   │  │ 89 📈  │ │
│  │ Reviews  │  │ Média    │  │ Usuários │  │ Mês    │ │
│  └──────────┘  └──────────┘  └──────────┘  └────────┘ │
│                                                          │
│  🔧 Ações Rápidas                                       │
│  ┌────────────────────┐  ┌────────────────────┐       │
│  │ 👥 Gerenciar      │  │ 💇 Gerenciar      │       │
│  │    Usuários       │  │    Serviços       │       │
│  └────────────────────┘  └────────────────────┘       │
│  ┌────────────────────┐  ┌────────────────────┐       │
│  │ 🎁 Criar          │  │ 📊 Ver            │       │
│  │    Promoção       │  │    Relatórios     │       │
│  └────────────────────┘  └────────────────────┘       │
│                                                          │
│  📈 Atividade Recente                                   │
│  ┌────────────────────────────────────────────────┐   │
│  │ • João Silva criou uma conta (há 5 min)       │   │
│  │ • Maria Santos completou um serviço (há 1h)   │   │
│  │ • Nova avaliação 5⭐ recebida (há 2h)         │   │
│  └────────────────────────────────────────────────┘   │
│                                                          │
└─────────────────────────────────────────────────────────┘
```

---

## 🎯 Próximas Implementações

### 🔥 Prioridade ALTA - Funcionalidades Core

- [ ] **#022** - Componentes Client para Forms de Serviços
  - Criar ServiceForm com validação client-side
  - Páginas /services/new e /services/[id]/edit
  - Handlers dos botões toggle/delete
  - Modal de confirmação de exclusão
  - Loading states

- [ ] **#023** - CRUD de Promoções
  - Criar `promotionAdminActions.ts` (CRUD completo)
  - Criar página `/dashboard/admin/promotions`
  - Forms de criação/edição de promoções
  - Suporte a promoções globais vs específicas
  - Vincular promoções a serviços (M:M)

- [x] **#024** - Soft Delete e Edição de Usuários
  - Adicionar colunas de soft delete (`deletedAt/deletedById/updatedById`) no Prisma ✅
  - Migration criada (`20251204120000_user_soft_delete`) ✅
  - `deleteUser()`/`softDeleteUser` + restore implementados ✅
  - `updateUser()` server action com validação e audit ✅
  - Form handler em `users/[id]/page.tsx` + ações de tabela ✅
  - Doc: `docs/architecture/user-soft-delete.md` ✅

### 🟡 Prioridade MÉDIA - UX e Refinamentos

- [ ] **#025** - Filtros e Busca Funcionais
  - Busca em users (nome/email)
  - Filtros em barbers (performance)
  - Busca em services (nome/descrição)
  - Paginação real (backend + frontend)
  - Componentes reutilizáveis

- [ ] **#026** - Correção de Dados Mockados
  - Calcular receita real do banco
  - Top barbeiros com queries reais
  - Remover Math.random() e hardcoded values
  - Queries para crescimento mensal
  - Métricas de horários movimentados

### 🟢 Prioridade BAIXA - Melhorias Futuras

- [ ] Exportação de relatórios (PDF/Excel)
- [ ] Gráficos e analytics avançados (charts.js)
- [ ] Sistema de audit logs (quem fez o quê)
- [ ] Dashboard customizável
- [ ] Notificações administrativas em tempo real
- [ ] Integrações com ferramentas externas

---

## 📚 Referências

### Documentação Relacionada
- [Features Implementadas](/docs/FEATURES.md)
- [Server Actions](/docs/SERVER-ACTIONS.md)
- [Dashboard Barbeiro](/docs/dashboard-barber.md)
- [Papéis e Permissões](/docs/roles-permissions.md)

### Guias Técnicos
- [Sistema de Reviews](/docs/review-system.md)
- [Banco de Dados](/docs/database/README.md)

---

## 🔧 Manutenção

### Adicionar Nova Métrica Global

1. Atualizar `getDashboardMetrics()` em `dashboardActions.ts`
2. Adicionar query Prisma necessária
3. Atualizar interface de retorno
4. Implementar visualização no dashboard

### Adicionar Novo Tipo de Relatório

1. Criar server action em `reportActions.ts`
2. Implementar lógica de geração
3. Adicionar rota em `/dashboard/admin/reports`
4. Criar componente de visualização

---

**Última atualização**: 21 de outubro de 2025  
**Responsável**: Development Team  
**Status**: ✅ Base implementada, expansão planejada
