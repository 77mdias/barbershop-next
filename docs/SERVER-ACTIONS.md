# ⚡ Server Actions - Barbershop Next

Documentação completa das Server Actions implementadas no projeto para operações de servidor.

---

## 📋 Visão Geral

**Framework**: Next.js 14 Server Actions  
**Linguagem**: TypeScript  
**ORM**: Prisma

As Server Actions permitem executar código no servidor de forma segura e type-safe, eliminando a necessidade de criar API routes separadas.

---

## 🎯 Benefícios das Server Actions

### Vantagens
- ✅ **Type Safety**: TypeScript end-to-end
- ✅ **Simplicidade**: Sem necessidade de API routes
- ✅ **Segurança**: Execução apenas no servidor
- ✅ **Performance**: Otimização automática
- ✅ **Validação**: Integração com Zod
- ✅ **Revalidação**: Cache management integrado

---

## 📁 Estrutura de Arquivos

```
src/server/
├── reviewActions.ts        # CRUD de reviews e estatísticas
└── dashboardActions.ts     # Métricas e analytics de dashboards
```

---

## 1. 📝 Review Actions

**Arquivo**: `/src/server/reviewActions.ts`

### Funções Implementadas

#### createReview()

Cria uma nova avaliação para um serviço.

```typescript
export async function createReview(data: CreateReviewInput) {
  "use server";
  
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return { success: false, error: "Usuário não autenticado" };
  }

  // Validação
  const validated = createReviewSchema.safeParse(data);
  if (!validated.success) {
    return { 
      success: false, 
      error: validated.error.errors[0].message 
    };
  }

  // Verificar se já existe review
  const existingReview = await db.serviceHistory.findUnique({
    where: { id: validated.data.serviceHistoryId },
    select: { rating: true, userId: true },
  });

  if (existingReview?.rating) {
    return { 
      success: false, 
      error: "Avaliação já existe para este serviço" 
    };
  }

  if (existingReview?.userId !== session.user.id) {
    return { 
      success: false, 
      error: "Não autorizado" 
    };
  }

  // Criar review
  const review = await db.serviceHistory.update({
    where: { id: validated.data.serviceHistoryId },
    data: {
      rating: validated.data.rating,
      feedback: validated.data.feedback,
      images: validated.data.images,
    },
  });

  revalidatePath("/reviews");
  return { success: true, data: review };
}
```

**Parâmetros**:
```typescript
{
  serviceHistoryId: string;
  rating: number;          // 1-5
  feedback?: string;       // 10-1000 caracteres
  images?: string[];       // URLs das imagens
}
```

**Retorno**:
```typescript
{
  success: boolean;
  data?: ServiceHistory;
  error?: string;
}
```

---

#### updateReview()

Atualiza uma avaliação existente.

```typescript
export async function updateReview(data: UpdateReviewInput) {
  "use server";
  
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return { success: false, error: "Usuário não autenticado" };
  }

  // Validação
  const validated = updateReviewSchema.safeParse(data);
  if (!validated.success) {
    return { 
      success: false, 
      error: validated.error.errors[0].message 
    };
  }

  // Verificar propriedade
  const review = await db.serviceHistory.findUnique({
    where: { id: validated.data.id },
    select: { userId: true },
  });

  if (!review) {
    return { 
      success: false, 
      error: "Avaliação não encontrada" 
    };
  }

  if (review.userId !== session.user.id && session.user.role !== "ADMIN") {
    return { 
      success: false, 
      error: "Não autorizado" 
    };
  }

  // Atualizar
  const updated = await db.serviceHistory.update({
    where: { id: validated.data.id },
    data: {
      rating: validated.data.rating,
      feedback: validated.data.feedback,
      images: validated.data.images,
    },
  });

  revalidatePath("/reviews");
  return { success: true, data: updated };
}
```

---

#### getReviews()

Busca avaliações com filtros e paginação.

```typescript
export async function getReviews(params: GetReviewsInput) {
  "use server";
  
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return { success: false, error: "Usuário não autenticado" };
  }

  // Validação
  const validated = getReviewsSchema.safeParse(params);
  if (!validated.success) {
    return { 
      success: false, 
      error: validated.error.errors[0].message 
    };
  }

  const { userId, serviceId, barberId, page = 1, limit = 10 } = validated.data;

  // Construir filtros
  const where: Prisma.ServiceHistoryWhereInput = {
    rating: { not: null },
    ...(userId && { userId }),
    ...(serviceId && { serviceId }),
    ...(barberId && { 
      appointments: { 
        some: { barberId } 
      } 
    }),
  };

  // Buscar reviews e contagem total
  const [reviews, total] = await Promise.all([
    db.serviceHistory.findMany({
      where,
      include: {
        user: { select: { name: true, image: true } },
        service: { select: { name: true } },
        appointments: {
          include: {
            barber: { select: { name: true, image: true } },
          },
        },
      },
      orderBy: { updatedAt: "desc" },
      skip: (page - 1) * limit,
      take: limit,
    }),
    db.serviceHistory.count({ where }),
  ]);

  return {
    success: true,
    data: {
      reviews,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    },
  };
}
```

**Parâmetros**:
```typescript
{
  userId?: string;
  serviceId?: string;
  barberId?: string;
  page?: number;
  limit?: number;
}
```

---

#### deleteReview()

Remove uma avaliação.

```typescript
export async function deleteReview(id: string) {
  "use server";
  
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return { success: false, error: "Usuário não autenticado" };
  }

  // Verificar propriedade
  const review = await db.serviceHistory.findUnique({
    where: { id },
    select: { userId: true, images: true },
  });

  if (!review) {
    return { 
      success: false, 
      error: "Avaliação não encontrada" 
    };
  }

  if (review.userId !== session.user.id && session.user.role !== "ADMIN") {
    return { 
      success: false, 
      error: "Não autorizado" 
    };
  }

  // Deletar imagens do storage
  if (review.images?.length > 0) {
    for (const imageUrl of review.images) {
      await deleteImage(imageUrl);
    }
  }

  // Remover rating do ServiceHistory
  await db.serviceHistory.update({
    where: { id },
    data: {
      rating: null,
      feedback: null,
      images: [],
    },
  });

  revalidatePath("/reviews");
  return { success: true };
}
```

---

#### getReviewStats()

Retorna estatísticas de avaliações.

```typescript
export async function getReviewStats(params: {
  userId?: string;
  serviceId?: string;
  barberId?: string;
}) {
  "use server";
  
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return { success: false, error: "Usuário não autenticado" };
  }

  // Construir filtros
  const where: Prisma.ServiceHistoryWhereInput = {
    rating: { not: null },
    ...(params.userId && { userId: params.userId }),
    ...(params.serviceId && { serviceId: params.serviceId }),
    ...(params.barberId && { 
      appointments: { 
        some: { barberId: params.barberId } 
      } 
    }),
  };

  // Buscar estatísticas
  const [aggregate, distribution] = await Promise.all([
    db.serviceHistory.aggregate({
      where,
      _avg: { rating: true },
      _count: { rating: true },
    }),
    db.serviceHistory.groupBy({
      by: ["rating"],
      where,
      _count: { rating: true },
      orderBy: { rating: "desc" },
    }),
  ]);

  const total = aggregate._count.rating || 0;

  return {
    success: true,
    data: {
      average: Number(aggregate._avg.rating?.toFixed(1)) || 0,
      total,
      distribution: distribution.map((item) => ({
        rating: item.rating || 0,
        count: item._count.rating || 0,
        percentage: total > 0 
          ? Math.round((item._count.rating / total) * 100) 
          : 0,
      })),
    },
  };
}
```

---

## 2. 📊 Dashboard Actions

**Arquivo**: `/src/server/dashboardActions.ts`

### Funções Implementadas

#### getBarberMetrics()

Retorna métricas completas do barbeiro.

```typescript
export async function getBarberMetrics(barberId: string) {
  "use server";
  
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return { success: false, error: "Usuário não autenticado" };
  }

  // Verificar autorização
  if (session.user.role !== "ADMIN" && session.user.id !== barberId) {
    return { success: false, error: "Não autorizado" };
  }

  const startOfMonth = new Date(
    new Date().getFullYear(),
    new Date().getMonth(),
    1
  );

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
    where: {
      appointments: { some: { barberId } },
    },
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
    orderBy: { rating: "desc" },
  });

  // Calcular metas
  const totalReviews = reviewsMetrics._count.rating || 0;

  return {
    success: true,
    data: {
      // Métricas principais
      averageRating: Number(reviewsMetrics._avg.rating?.toFixed(1)) || 0,
      totalReviews,
      totalClients: uniqueClients.length || 0,

      // Métricas do mês
      monthlyAverageRating: Number(monthlyReviews._avg.rating?.toFixed(1)) || 0,
      monthlyReviews: monthlyReviews._count.rating || 0,
      monthlyClients: monthlyClients.length || 0,
      monthlyRevenue: Number(revenueData._sum.finalPrice) || 0,

      // Estatísticas especiais
      fiveStarReviews,
      totalServices: revenueData._count || 0,

      // Distribuição
      ratingDistribution: ratingDistribution.map((item) => ({
        rating: item.rating || 0,
        count: item._count.rating || 0,
        percentage: totalReviews > 0
          ? Math.round((item._count.rating / totalReviews) * 100)
          : 0,
      })),

      // Metas
      goals: {
        averageRating: {
          target: 4.5,
          current: Number(monthlyReviews._avg.rating?.toFixed(1)) || 0,
          percentage: Math.min(
            Math.round(
              ((Number(monthlyReviews._avg.rating?.toFixed(1)) || 0) / 4.5) * 100
            ),
            100
          ),
        },
        monthlyReviews: {
          target: 20,
          current: monthlyReviews._count.rating || 0,
          percentage: Math.min(
            Math.round(((monthlyReviews._count.rating || 0) / 20) * 100),
            100
          ),
        },
        monthlyClients: {
          target: 100,
          current: monthlyClients.length || 0,
          percentage: Math.min(
            Math.round(((monthlyClients.length || 0) / 100) * 100),
            100
          ),
        },
      },
    },
  };
}
```

**Retorno**:
```typescript
{
  success: boolean;
  data?: {
    averageRating: number;
    totalReviews: number;
    totalClients: number;
    monthlyAverageRating: number;
    monthlyReviews: number;
    monthlyClients: number;
    monthlyRevenue: number;
    fiveStarReviews: number;
    totalServices: number;
    ratingDistribution: Array<{
      rating: number;
      count: number;
      percentage: number;
    }>;
    goals: {
      averageRating: GoalMetric;
      monthlyReviews: GoalMetric;
      monthlyClients: GoalMetric;
    };
  };
  error?: string;
}
```

---

#### getDashboardMetrics()

Retorna métricas gerais baseadas no role do usuário.

```typescript
export async function getDashboardMetrics(userId: string) {
  "use server";
  
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return { success: false, error: "Usuário não autenticado" };
  }

  // Verificar autorização
  if (session.user.role !== "ADMIN" && session.user.id !== userId) {
    return { success: false, error: "Não autorizado" };
  }

  const userRole = session.user.role;
  const startOfMonth = new Date(
    new Date().getFullYear(),
    new Date().getMonth(),
    1
  );

  if (userRole === "CLIENT") {
    // Métricas para cliente
    const clientMetrics = await db.serviceHistory.aggregate({
      where: {
        userId,
        rating: { not: null },
      },
      _count: { rating: true },
      _avg: { rating: true },
    });

    const monthlyServices = await db.serviceHistory.count({
      where: {
        userId,
        createdAt: { gte: startOfMonth },
      },
    });

    return {
      success: true,
      data: {
        totalReviews: clientMetrics._count.rating || 0,
        averageGiven: Number(clientMetrics._avg.rating?.toFixed(1)) || 0,
        monthlyServices,
        userRole: "CLIENT",
      },
    };
  } else if (userRole === "BARBER") {
    // Redirecionar para métricas de barbeiro
    return await getBarberMetrics(userId);
  } else {
    // Admin - métricas globais
    const globalMetrics = await db.serviceHistory.aggregate({
      where: { rating: { not: null } },
      _count: { rating: true },
      _avg: { rating: true },
    });

    const totalUsers = await db.user.count();

    const monthlyActivity = await db.serviceHistory.count({
      where: { createdAt: { gte: startOfMonth } },
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

## 🔐 Segurança e Validação

### 1. Autenticação

Todas as Server Actions verificam autenticação:

```typescript
const session = await getServerSession(authOptions);
if (!session?.user?.id) {
  return { success: false, error: "Usuário não autenticado" };
}
```

### 2. Autorização

Verificação de permissões baseada em roles:

```typescript
if (session.user.role !== "ADMIN" && session.user.id !== resourceOwnerId) {
  return { success: false, error: "Não autorizado" };
}
```

### 3. Validação com Zod

```typescript
const validated = createReviewSchema.safeParse(data);
if (!validated.success) {
  return { 
    success: false, 
    error: validated.error.errors[0].message 
  };
}
```

### 4. Tratamento de Erros

```typescript
try {
  // operação
} catch (error) {
  console.error("Erro:", error);
  return { success: false, error: "Erro interno do servidor" };
}
```

---

## 🚀 Uso nos Componentes

### Client Component

```tsx
"use client";

import { createReview } from "@/server/reviewActions";
import { toast } from "sonner";

export function ReviewForm() {
  const onSubmit = async (data: FormData) => {
    const result = await createReview(data);
    
    if (result.success) {
      toast.success("Avaliação criada!");
    } else {
      toast.error(result.error);
    }
  };

  return <form action={onSubmit}>...</form>;
}
```

### Server Component

```tsx
import { getBarberMetrics } from "@/server/dashboardActions";

export default async function BarberDashboard() {
  const result = await getBarberMetrics(barberId);
  
  if (!result.success) {
    return <div>Erro: {result.error}</div>;
  }

  return <Dashboard metrics={result.data} />;
}
```

---

## 📊 Performance

### Otimizações Implementadas

1. **Queries Paralelas**
```typescript
const [reviews, total] = await Promise.all([
  db.serviceHistory.findMany(...),
  db.serviceHistory.count(...),
]);
```

2. **Revalidação de Cache**
```typescript
revalidatePath("/reviews");
```

3. **Seleção de Campos**
```typescript
select: { id: true, name: true } // Apenas campos necessários
```

---

## 📚 Referências

### Documentação Relacionada
- [Features](/docs/FEATURES.md)
- [Review System](/docs/review-system.md)
- [Dashboard Barber](/docs/dashboard-barber.md)

### Next.js Documentation
- [Server Actions](https://nextjs.org/docs/app/building-your-application/data-fetching/server-actions-and-mutations)
- [Revalidating Data](https://nextjs.org/docs/app/building-your-application/data-fetching/fetching-caching-and-revalidating)

---

**Última atualização**: 21 de outubro de 2025  
**Responsável**: Development Team  
**Status**: ✅ Implementado e documentado
