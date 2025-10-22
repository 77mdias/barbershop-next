"use server";

import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { db } from "@/lib/prisma";

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

    const startOfMonth = new Date(
      new Date().getFullYear(),
      new Date().getMonth(),
      1
    );

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
        monthlyAverageRating:
          Number(monthlyReviews._avg.rating?.toFixed(1)) || 0,
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
          percentage:
            totalReviews > 0
              ? Math.round((item._count.rating / totalReviews) * 100)
              : 0,
        })),

        // Metas do mês (podem ser configuráveis futuramente)
        goals: {
          averageRating: {
            target: 4.5,
            current: Number(monthlyReviews._avg.rating?.toFixed(1)) || 0,
            percentage: Math.min(
              Math.round(
                ((Number(monthlyReviews._avg.rating?.toFixed(1)) || 0) / 4.5) *
                  100
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

    const startOfMonth = new Date(
      new Date().getFullYear(),
      new Date().getMonth(),
      1
    );

    const startOfToday = new Date();
    startOfToday.setHours(0, 0, 0, 0);

    // 1. Contadores de usuários por role
    const userCounts = await db.user.groupBy({
      by: ["role"],
      _count: { id: true },
    });

    const totalUsers = await db.user.count();
    const clientsCount = userCounts.find(u => u.role === "CLIENT")?._count.id || 0;
    const barbersCount = userCounts.find(u => u.role === "BARBER")?._count.id || 0;
    const adminsCount = userCounts.find(u => u.role === "ADMIN")?._count.id || 0;

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
        updatedAt: { gte: startOfMonth },
      },
    });

    // 4. Reviews hoje
    const todayReviews = await db.serviceHistory.count({
      where: {
        rating: { not: null },
        updatedAt: { gte: startOfToday },
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
        createdAt: { gte: startOfMonth },
      },
    });

    // 8. Agendamentos do mês
    const monthlyAppointments = await db.appointment.count({
      where: {
        createdAt: { gte: startOfMonth },
      },
    });

    // 9. Novos usuários este mês
    const newUsersThisMonth = await db.user.count({
      where: {
        createdAt: { gte: startOfMonth },
      },
    });

    // 10. Usuários ativos (últimos 30 dias)
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    const activeUsers = await db.user.count({
      where: {
        OR: [
          { updatedAt: { gte: thirtyDaysAgo } },
          {
            serviceHistory: {
              some: {
                createdAt: { gte: thirtyDaysAgo },
              },
            },
          },
          {
            appointments: {
              some: {
                createdAt: { gte: thirtyDaysAgo },
              },
            },
          },
        ],
      },
    });

    // 11. Barbeiros ativos (com reviews nos últimos 30 dias) - simplificado
    const activeBarbersCount = await db.user.count({
      where: {
        role: "BARBER",
        // Por enquanto, todos os barbeiros são considerados ativos
      },
    });

    // 12. Top barbeiros por avaliação - temporariamente mockado
    const topBarbers = await db.user.findMany({
      where: {
        role: "BARBER",
      },
      select: {
        id: true,
        name: true,
      },
      take: 5,
    });

    // Processar top barbeiros - dados mocados por agora
    const processedTopBarbers = topBarbers.map((barber, index) => ({
      id: barber.id,
      name: barber.name || "Sem nome",
      totalReviews: Math.floor(Math.random() * 20) + 5, // 5-25 reviews
      averageRating: Number((4.0 + Math.random() * 1.0).toFixed(1)), // 4.0-5.0
    }));

    // 13. Receita estimada - mocada temporariamente
    const revenueData = { _sum: { finalPrice: 15420.50 } }; // R$ 15.420,50
    const monthlyRevenueData = { _sum: { finalPrice: 3890.75 } }; // R$ 3.890,75 este mês
    const paidServices = 127; // 127 serviços pagos

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
        totalRevenue: revenueData._sum.finalPrice || 0,
        monthlyRevenue: monthlyRevenueData._sum.finalPrice || 0,
        paidServices,

        // Top performers
        topBarbers: processedTopBarbers,
      },
    };
  } catch (error) {
    console.error("Erro ao buscar métricas administrativas:", error);
    return { success: false, error: "Erro interno do servidor" };
  }
}
