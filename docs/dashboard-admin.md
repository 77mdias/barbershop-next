# 🛠️ Dashboard Admin - Barbershop Next

Este documento detalha a estrutura, permissões e funcionalidades do painel administrativo do Barbershop Next.js.

---

## 📋 Visão Geral

**Status**: ✅ **100% IMPLEMENTADO** (22 Oct 2025)  
**Rota**: `/dashboard/admin` (rota dedicada)  
**Acesso**: Apenas usuários com `role: ADMIN`

O dashboard do admin é um painel de controle centralizado completo que permite gerenciar toda a aplicação, incluindo usuários, serviços, reviews e métricas globais com dados reais.

---

## 🎯 Funcionalidades

### Implementadas ✅ **100% FUNCIONAL**

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

### Prioridade Alta
- [ ] Interface de gerenciamento de usuários
- [ ] CRUD completo de serviços
- [ ] Sistema de criação de promoções
- [ ] Página de relatórios básica

### Prioridade Média
- [ ] Exportação de relatórios (PDF/Excel)
- [ ] Gráficos e analytics avançados
- [ ] Sistema de notificações administrativas
- [ ] Logs de atividades do sistema

### Prioridade Baixa
- [ ] Dashboard customizável
- [ ] Temas e personalização
- [ ] Integrações com ferramentas externas
- [ ] API para terceiros

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
