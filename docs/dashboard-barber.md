# 💈 Dashboard Barbeiro - Barbershop Next

Este documento detalha a estrutura, permissões e funcionalidades do painel completo do barbeiro.

---

## 📋 Visão Geral

**Status**: ✅ Implementado (Outubro 2025)  
**Rota**: `/dashboard/barber`  
**Acesso**: Apenas usuários com `role: BARBER`

O dashboard do barbeiro é uma interface profissional e completa com métricas em tempo real, analytics, sistema de metas e gerenciamento de reviews.

---

## 🎯 Funcionalidades Implementadas

### 1. Métricas Principais

**Dados Gerais**:
- 📊 **Avaliação Média Total**: Rating médio de todas as avaliações recebidas
- ⭐ **Total de Reviews**: Quantidade total de avaliações
- 👥 **Total de Clientes**: Clientes únicos atendidos

**Métricas do Mês Atual**:
- 📈 **Avaliação Média Mensal**: Rating médio do mês
- 📝 **Reviews no Mês**: Quantidade de avaliações no mês
- 🆕 **Novos Clientes**: Clientes únicos atendidos no mês
- 💰 **Receita Estimada**: Soma dos valores dos serviços prestados

### 2. Sistema de Metas

Metas configuráveis com indicadores de progresso:

**Meta de Avaliação**:
- Target: 4.5 ⭐
- Progress bar visual
- Percentual de atingimento

**Meta de Reviews Mensais**:
- Target: 20 reviews
- Contador de progresso
- Feedback visual

**Meta de Clientes Mensais**:
- Target: 100 clientes
- Indicador de performance
- Estatísticas de crescimento

### 3. Analytics e Distribuição

**Distribuição de Ratings**:
- Gráfico de distribuição (5★ até 1★)
- Porcentagem por rating
- Total de cada categoria
- Destaque para 5 estrelas

### 4. Tabs de Navegação

- **Reviews**: Lista completa de avaliações recebidas
- **Agendamentos**: Agenda de serviços (em desenvolvimento)
- **Análises**: Analytics detalhados
- **Performance**: Métricas de performance

---

## 🏗️ Estrutura Implementada

### Arquivo Principal

**Localização**: `/src/app/dashboard/barber/page.tsx`

```tsx
import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";
import { authOptions } from "@/lib/auth";
import { getBarberMetrics } from "@/server/dashboardActions";

export default async function BarberDashboardPage() {
  const session = await getServerSession(authOptions);
  
  if (!session?.user) {
    redirect("/auth/signin");
  }

  if (session.user.role !== "BARBER") {
    redirect("/dashboard");
  }

  const result = await getBarberMetrics(session.user.id);
  
  // Renderizar dashboard com métricas
}
```

### Server Actions

**Localização**: `/src/server/dashboardActions.ts`

#### getBarberMetrics()

Busca métricas completas do barbeiro:

```typescript
export async function getBarberMetrics(barberId: string) {
  // 1. Métricas de Reviews
  const reviewsMetrics = await db.serviceHistory.aggregate({
    where: {
      rating: { not: null },
      appointments: { some: { barberId } },
    },
    _avg: { rating: true },
    _count: { rating: true },
  });

  // 2. Reviews do mês
  const monthlyReviews = await db.serviceHistory.aggregate({
    where: {
      rating: { not: null },
      updatedAt: { gte: startOfMonth },
      appointments: { some: { barberId } },
    },
    _avg: { rating: true },
    _count: { rating: true },
  });

  // 3. Clientes únicos
  const uniqueClients = await db.serviceHistory.findMany({
    where: { appointments: { some: { barberId } } },
    select: { userId: true },
    distinct: ["userId"],
  });

  // 4. Receita estimada
  const revenueData = await db.serviceHistory.aggregate({
    where: {
      createdAt: { gte: startOfMonth },
      appointments: { some: { barberId } },
    },
    _sum: { finalPrice: true },
    _count: { id: true },
  });

  // 5. Distribuição de ratings
  const ratingDistribution = await db.serviceHistory.groupBy({
    by: ["rating"],
    where: {
      rating: { not: null },
      appointments: { some: { barberId } },
    },
    _count: { rating: true },
  });

  return { success: true, data: metrics };
}
```

---

## 🎨 Interface e Componentes

### Layout Visual

```
┌─────────────────────────────────────────────────────────┐
│ 💈 Dashboard do Barbeiro                                │
├─────────────────────────────────────────────────────────┤
│                                                          │
│  📊 Métricas Principais (Cards)                         │
│  ┌──────────┐  ┌──────────┐  ┌──────────┐             │
│  │  4.8 ⭐   │  │  125 📝  │  │  89 👥   │             │
│  │ Avaliação│  │  Reviews │  │ Clientes │             │
│  └──────────┘  └──────────┘  └──────────┘             │
│                                                          │
│  📈 Métricas do Mês (Grid)                              │
│  ┌──────────┐  ┌──────────┐  ┌──────────┐  ┌────────┐ │
│  │ 4.9 ⭐   │  │  15 📝   │  │  12 🆕   │  │ R$ 850 │ │
│  └──────────┘  └──────────┘  └──────────┘  └────────┘ │
│                                                          │
│  🎯 Metas do Mês                                        │
│  ┌────────────────────────────────────────────────┐   │
│  │ Avaliação 4.5★   [████████░░] 90%            │   │
│  │ Reviews 20       [███████░░░] 75%            │   │
│  │ Clientes 100     [████░░░░░░] 45%            │   │
│  └────────────────────────────────────────────────┘   │
│                                                          │
│  📊 Distribuição de Avaliações                          │
│  ⭐⭐⭐⭐⭐  [████████████] 60% (75 reviews)             │
│  ⭐⭐⭐⭐    [██████░░░░░░] 25% (31 reviews)             │
│  ⭐⭐⭐      [██░░░░░░░░░░] 10% (13 reviews)             │
│                                                          │
│  📑 Tabs: [Reviews] [Agendamentos] [Análises] [Perf]   │
│  ┌────────────────────────────────────────────────┐   │
│  │ Conteúdo da tab selecionada                    │   │
│  └────────────────────────────────────────────────┘   │
│                                                          │
└─────────────────────────────────────────────────────────┘
```

### Componentes Utilizados

- **Card**: Cards de métricas com ícones
- **Progress**: Barras de progresso para metas
- **Tabs**: Sistema de navegação por tabs
- **ReviewSection**: Seção integrada de reviews
- **Badge**: Badges para destacar conquistas
- **Icons**: Lucide React icons para visual

---

## 🔐 Permissões e Segurança

### Proteção de Rota

**Middleware**: `/src/middleware.ts`

```typescript
export async function middleware(request: NextRequest) {
  const session = await getToken({ req: request });
  
  if (request.nextUrl.pathname.startsWith('/dashboard/barber')) {
    if (!session || session.role !== 'BARBER') {
      return NextResponse.redirect(new URL('/dashboard', request.url));
    }
  }
}
```

### Server Actions

```typescript
export async function getBarberMetrics(barberId: string) {
  const session = await getServerSession(authOptions);
  
  // Verificar autenticação
  if (!session?.user?.id) {
    return { success: false, error: "Não autenticado" };
  }

  // Verificar autorização
  if (session.user.role !== "ADMIN" && session.user.id !== barberId) {
    return { success: false, error: "Não autorizado" };
  }

  // Buscar dados...
}
```

---

## 📊 Dados e Métricas

### Estrutura de Dados Retornada

```typescript
interface BarberMetrics {
  // Métricas principais
  averageRating: number;        // Ex: 4.8
  totalReviews: number;         // Ex: 125
  totalClients: number;         // Ex: 89

  // Métricas mensais
  monthlyAverageRating: number; // Ex: 4.9
  monthlyReviews: number;       // Ex: 15
  monthlyClients: number;       // Ex: 12
  monthlyRevenue: number;       // Ex: 850.00

  // Estatísticas especiais
  fiveStarReviews: number;      // Ex: 75
  totalServices: number;        // Ex: 150

  // Distribuição
  ratingDistribution: Array<{
    rating: number;             // 1-5
    count: number;              // Quantidade
    percentage: number;         // Porcentagem
  }>;

  // Metas
  goals: {
    averageRating: {
      target: number;           // 4.5
      current: number;          // 4.9
      percentage: number;       // 90
    };
    monthlyReviews: {
      target: number;           // 20
      current: number;          // 15
      percentage: number;       // 75
    };
    monthlyClients: {
      target: number;           // 100
      current: number;          // 45
      percentage: number;       // 45
    };
  };
}
```

### Queries Prisma Utilizadas

```typescript
// Agregação de reviews
db.serviceHistory.aggregate({
  where: {
    rating: { not: null },
    appointments: { some: { barberId } }
  },
  _avg: { rating: true },
  _count: { rating: true }
});

// Agrupamento por rating
db.serviceHistory.groupBy({
  by: ["rating"],
  where: {
    rating: { not: null },
    appointments: { some: { barberId } }
  },
  _count: { rating: true }
});

// Clientes distintos
db.serviceHistory.findMany({
  where: {
    appointments: { some: { barberId } }
  },
  select: { userId: true },
  distinct: ["userId"]
});
```

---

## 🎯 Próximas Implementações

### Em Desenvolvimento
- [ ] Tab de Agendamentos funcional
- [ ] Calendário de disponibilidade
- [ ] Gestão de horários
- [ ] Confirmação de agendamentos

### Planejado
- [ ] Analytics avançados
- [ ] Exportação de relatórios (PDF/Excel)
- [ ] Gráficos interativos
- [ ] Comparativos mensais
- [ ] Notificações de novas reviews
- [ ] Sistema de conquistas e badges

---

## 📚 Referências

### Documentação Relacionada
- [Features Implementadas](/docs/FEATURES.md)
- [Sistema de Reviews](/docs/review-system.md)
- [Dashboard Admin](/docs/dashboard-admin.md)
- [Papéis e Permissões](/docs/roles-permissions.md)

### Server Actions
- [Dashboard Actions](/src/server/dashboardActions.ts)
- [Review Actions](/src/server/reviewActions.ts)

---

## 🔧 Manutenção e Atualização

### Adicionar Nova Métrica

1. Atualizar query em `getBarberMetrics()`
2. Atualizar interface `BarberMetrics`
3. Adicionar visualização no dashboard
4. Documentar mudança

### Customizar Metas

```typescript
// Em dashboardActions.ts
goals: {
  averageRating: {
    target: 4.5, // 👈 Ajustar aqui
    // ...
  }
}
```

---

**Última atualização**: 21 de outubro de 2025  
**Responsável**: Development Team  
**Status**: ✅ Implementação completa e funcional
