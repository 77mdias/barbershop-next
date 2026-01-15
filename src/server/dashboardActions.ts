"use server";

import { Prisma } from "@prisma/client";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { db } from "@/lib/prisma";

const toNumber = (value: Prisma.Decimal | number | null | undefined) => (value ? Number(value) : 0);

async function buildTopBarberRanking(startDate?: Date) {
  const histories = await db.serviceHistory.findMany({
    where: {
      ...(startDate ? { completedAt: { gte: startDate } } : {}),
      appointments: { some: { barberId: { not: null } } },
    },
    select: {
      finalPrice: true,
      rating: true,
      appointments: {
        select: { barberId: true },
      },
    },
  });

  const stats = new Map<string, { revenue: number; ratingSum: number; reviews: number; services: number }>();

  histories.forEach((history) => {
    const barberId = history.appointments[0]?.barberId;
    if (!barberId) return;

    const current = stats.get(barberId) || {
      revenue: 0,
      ratingSum: 0,
      reviews: 0,
      services: 0,
    };

    current.revenue += toNumber(history.finalPrice);
    if (typeof history.rating === "number") {
      current.ratingSum += history.rating;
      current.reviews += 1;
    }
    current.services += 1;

    stats.set(barberId, current);
  });

  if (stats.size === 0) {
    return [];
  }

  const barbers = await db.user.findMany({
    where: {
      id: { in: Array.from(stats.keys()) },
      role: "BARBER",
      deletedAt: null,
    },
    select: {
      id: true,
      name: true,
    },
  });

  return barbers
    .map((barber) => {
      const data = stats.get(barber.id);
      const averageRating = data && data.reviews > 0 ? Number((data.ratingSum / data.reviews).toFixed(1)) : 0;

      return {
        id: barber.id,
        name: barber.name || "Sem nome",
        totalReviews: data?.reviews ?? 0,
        averageRating,
        totalRevenue: Number((data?.revenue ?? 0).toFixed(2)),
      };
    })
    .filter((barber) => barber.totalReviews > 0)
    .sort((a, b) => {
      if (b.averageRating === a.averageRating) {
        return b.totalReviews - a.totalReviews;
      }
      return b.averageRating - a.averageRating;
    });
}

/**
 * Obter métricas completas do barbeiro para dashboard
 */
export async function getBarberMetrics(barberId: string) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return { success: false, error: "Usuário não autenticado" };
    }

    // Verificar se é o próprio barbeiro ou admin
    if (session.user.role !== "ADMIN" && session.user.id !== barberId) {
      return { success: false, error: "Não autorizado" };
    }

    const startOfMonth = new Date(new Date().getFullYear(), new Date().getMonth(), 1);

    // 1. Métricas de Reviews
    const reviewsMetrics = await db.serviceHistory.aggregate({
      where: {
        rating: { not: null },
        appointments: {
          some: { barberId },
        },
      },
      _avg: { rating: true },
      _count: { rating: true },
    });

    // 2. Reviews do mês atual
    const monthlyReviews = await db.serviceHistory.aggregate({
      where: {
        rating: { not: null },
        updatedAt: { gte: startOfMonth },
        appointments: {
          some: { barberId },
        },
      },
      _avg: { rating: true },
      _count: { rating: true },
    });

    // 3. Reviews 5 estrelas
    const fiveStarReviews = await db.serviceHistory.count({
      where: {
        rating: 5,
        appointments: {
          some: { barberId },
        },
      },
    });

    // 4. Total de clientes únicos atendidos
    const uniqueClients = await db.serviceHistory.findMany({
      where: {
        appointments: {
          some: { barberId },
        },
      },
      select: { userId: true },
      distinct: ["userId"],
    });

    // 5. Clientes do mês atual
    const monthlyClients = await db.serviceHistory.findMany({
      where: {
        createdAt: { gte: startOfMonth },
        appointments: {
          some: { barberId },
        },
      },
      select: { userId: true },
      distinct: ["userId"],
    });

    // 6. Receita estimada (baseada nos preços dos serviços)
    const revenueData = await db.serviceHistory.aggregate({
      where: {
        createdAt: { gte: startOfMonth },
        appointments: {
          some: { barberId },
        },
      },
      _sum: { finalPrice: true },
      _count: { id: true },
    });

    // 7. Distribuição de ratings
    const ratingDistribution = await db.serviceHistory.groupBy({
      by: ["rating"],
      where: {
        rating: { not: null },
        appointments: {
          some: { barberId },
        },
      },
      _count: { rating: true },
      orderBy: { rating: "desc" },
    });

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

        // Distribuição de ratings
        ratingDistribution: ratingDistribution.map((item) => ({
          rating: item.rating || 0,
          count: item._count.rating || 0,
          percentage: totalReviews > 0 ? Math.round((item._count.rating / totalReviews) * 100) : 0,
        })),

        // Metas do mês (podem ser configuráveis futuramente)
        goals: {
          averageRating: {
            target: 4.5,
            current: Number(monthlyReviews._avg.rating?.toFixed(1)) || 0,
            percentage: Math.min(Math.round(((Number(monthlyReviews._avg.rating?.toFixed(1)) || 0) / 4.5) * 100), 100),
          },
          monthlyReviews: {
            target: 20,
            current: monthlyReviews._count.rating || 0,
            percentage: Math.min(Math.round(((monthlyReviews._count.rating || 0) / 20) * 100), 100),
          },
          monthlyClients: {
            target: 100,
            current: monthlyClients.length || 0,
            percentage: Math.min(Math.round(((monthlyClients.length || 0) / 100) * 100), 100),
          },
        },
      },
    };
  } catch (error) {
    console.error("Erro ao buscar métricas do barbeiro:", error);
    return { success: false, error: "Erro interno do servidor" };
  }
}

/**
 * Obter métricas gerais para dashboard principal
 */
export async function getDashboardMetrics(userId: string) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return { success: false, error: "Usuário não autenticado" };
    }

    // Verificar autorização
    if (session.user.role !== "ADMIN" && session.user.id !== userId) {
      return { success: false, error: "Não autorizado" };
    }

    const userRole = session.user.role;
    const startOfMonth = new Date(new Date().getFullYear(), new Date().getMonth(), 1);

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

      const totalUsers = await db.user.count({ where: { deletedAt: null } });

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
  } catch (error) {
    console.error("Erro ao buscar métricas do dashboard:", error);
    return { success: false, error: "Erro interno do servidor" };
  }
}

/**
 * Obter métricas administrativas completas
 */
export async function getAdminMetrics() {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return { success: false, error: "Usuário não autenticado" };
    }

    // Verificar se é admin
    if (session.user.role !== "ADMIN") {
      return { success: false, error: "Não autorizado" };
    }

    const startOfMonth = new Date(new Date().getFullYear(), new Date().getMonth(), 1);

    const startOfToday = new Date();
    startOfToday.setHours(0, 0, 0, 0);

    // 1. Contadores de usuários por role
    const userCounts = await db.user.groupBy({
      where: { deletedAt: null },
      by: ["role"],
      _count: { id: true },
    });

    const totalUsers = await db.user.count({ where: { deletedAt: null } });
    const clientsCount = userCounts.find((u) => u.role === "CLIENT")?._count.id || 0;
    const barbersCount = userCounts.find((u) => u.role === "BARBER")?._count.id || 0;
    const adminsCount = userCounts.find((u) => u.role === "ADMIN")?._count.id || 0;

    // 2. Métricas de avaliações globais
    const reviewsMetrics = await db.serviceHistory.aggregate({
      where: {
        rating: { not: null },
      },
      _avg: { rating: true },
      _count: { rating: true },
    });

    // 3. Reviews do mês
    const monthlyReviews = await db.serviceHistory.count({
      where: {
        rating: { not: null },
        completedAt: { gte: startOfMonth },
      },
    });

    // 4. Reviews hoje
    const todayReviews = await db.serviceHistory.count({
      where: {
        rating: { not: null },
        completedAt: { gte: startOfToday },
      },
    });

    // 5. Reviews 5 estrelas
    const fiveStarReviews = await db.serviceHistory.count({
      where: {
        rating: 5,
      },
    });

    // 6. Distribuição de ratings
    const ratingDistribution = await db.serviceHistory.groupBy({
      by: ["rating"],
      where: {
        rating: { not: null },
      },
      _count: { rating: true },
      orderBy: { rating: "desc" },
    });

    // 7. Atividade mensal
    const monthlyActivity = await db.serviceHistory.count({
      where: {
        completedAt: { gte: startOfMonth },
      },
    });

    // 8. Agendamentos do mês
    const monthlyAppointments = await db.appointment.count({
      where: {
        date: { gte: startOfMonth },
        status: { notIn: ["CANCELLED", "NO_SHOW"] },
      },
    });

    // 9. Novos usuários este mês
    const newUsersThisMonth = await db.user.count({
      where: {
        createdAt: { gte: startOfMonth },
        deletedAt: null,
      },
    });

    // 10. Usuários ativos (últimos 30 dias)
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    const activeUsers = await db.user.count({
      where: {
        deletedAt: null,
        OR: [
          { updatedAt: { gte: thirtyDaysAgo } },
          {
            serviceHistory: {
              some: {
                completedAt: { gte: thirtyDaysAgo },
              },
            },
          },
          {
            appointments: {
              some: {
                date: { gte: thirtyDaysAgo },
              },
            },
          },
        ],
      },
    });

    // 11. Barbeiros ativos (com agendamentos nos últimos 30 dias)
    const activeBarbersCount = await db.user.count({
      where: {
        role: "BARBER",
        deletedAt: null,
        servicesProvided: {
          some: {
            date: { gte: thirtyDaysAgo },
            status: { notIn: ["CANCELLED", "NO_SHOW"] },
          },
        },
      },
    });

    // 12. Top barbeiros por avaliação (dados reais do período)
    const topBarbers = (await buildTopBarberRanking(startOfMonth)).slice(0, 5);

    // 13. Receita real
    const revenueData = await db.serviceHistory.aggregate({
      _sum: { finalPrice: true },
    });
    const monthlyRevenueData = await db.serviceHistory.aggregate({
      where: {
        completedAt: { gte: startOfMonth },
      },
      _sum: { finalPrice: true },
    });
    const paidServices = await db.serviceHistory.count();

    // 14. Reviews pendentes (sem rating)
    const pendingReviews = await db.serviceHistory.count({
      where: {
        rating: null,
      },
    });

    return {
      success: true,
      data: {
        // Usuários
        totalUsers,
        clientsCount,
        barbersCount,
        adminsCount,
        activeUsers,
        newUsersThisMonth,
        activeBarbersCount,

        // Reviews
        totalReviews: reviewsMetrics._count.rating || 0,
        globalAverage: Number(reviewsMetrics._avg.rating?.toFixed(1)) || 0,
        monthlyReviews,
        todayReviews,
        fiveStarReviews,
        pendingReviews,
        ratingDistribution,

        // Atividade
        monthlyActivity,
        monthlyAppointments,

        // Financeiro
        totalRevenue: toNumber(revenueData._sum.finalPrice),
        monthlyRevenue: toNumber(monthlyRevenueData._sum.finalPrice),
        paidServices,

        // Top performers
        topBarbers,
      },
    };
  } catch (error) {
    console.error("Erro ao buscar métricas administrativas:", error);
    return { success: false, error: "Erro interno do servidor" };
  }
}
