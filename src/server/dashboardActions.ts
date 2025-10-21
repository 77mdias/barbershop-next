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
