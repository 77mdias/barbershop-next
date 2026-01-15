"use server";

import { revalidatePath } from "next/cache";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { db } from "@/lib/prisma";
import { UserService } from "./services/userService";
import { logger } from "@/lib/logger";

// Tipos para os dados retornados
interface User {
  id: string;
  name: string | null;
  email: string;
  role: string;
  createdAt: Date;
}

interface Barber extends User {
  totalReviews: number;
  averageRating: number | null;
  totalAppointments: number;
}

interface BarberMetrics {
  averageRating: number;
  activeCount: number;
  totalReviews: number;
  topPerformer: string | null;
}

interface ReportsData {
  totalRevenue: number;
  monthlyRevenue: number;
  totalClients: number;
  totalAppointments: number;
  monthlyAppointments: number;
  averageRating: number;
  totalReviews: number;
  topBarbers: Array<{
    id: string;
    name: string | null;
    totalReviews: number;
    averageRating: number;
  }>;
}

/**
 * Buscar todos os usuários para o painel administrativo
 */
export async function getUsersForAdmin() {
  try {
    // Verificar autenticação
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return {
        success: false,
        error: "Não autenticado",
        data: [],
      };
    }

    // Verificar role ADMIN
    if (session.user.role !== "ADMIN") {
      return {
        success: false,
        error: "Acesso negado: apenas administradores",
        data: [],
      };
    }

    const result = await UserService.findMany({
      status: "ALL",
      includeDeleted: true,
      page: 1,
      limit: 200,
    });

    return {
      success: true,
      data: result.users,
    };
  } catch (error) {
    console.error("Erro ao buscar usuários:", error);
    return {
      success: false,
      error: "Erro ao buscar usuários",
      data: [],
    };
  }
}

/**
 * Buscar todos os barbeiros com suas métricas
 *
 * @param filters - Filtros de busca, performance, ordenação e paginação
 * @param filters.search - Buscar por nome ou email
 * @param filters.performanceMin - Rating mínimo (1-5)
 * @param filters.sortBy - Ordenar por: "name" | "rating" | "appointments"
 * @param filters.page - Página atual (default: 1)
 * @param filters.limit - Itens por página (default: 20, max: 50)
 *
 * @returns Lista paginada de barbeiros com métricas agregadas
 */
export async function getBarbersForAdmin(filters?: {
  search?: string;
  performanceMin?: number;
  sortBy?: "name" | "rating" | "appointments";
  page?: number;
  limit?: number;
}) {
  try {
    // Verificar autenticação
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return {
        success: false,
        error: "Não autenticado",
        data: [],
        pagination: { page: 1, limit: 20, total: 0, totalPages: 0 },
      };
    }

    // Verificar role ADMIN
    if (session.user.role !== "ADMIN") {
      return {
        success: false,
        error: "Acesso negado: apenas administradores",
        data: [],
        pagination: { page: 1, limit: 20, total: 0, totalPages: 0 },
      };
    }

    // Parâmetros de paginação
    const page = Math.max(1, filters?.page || 1);
    const limit = Math.min(50, Math.max(1, filters?.limit || 20));
    const skip = (page - 1) * limit;

    // Construir filtros de busca
    const whereClause: any = {
      role: "BARBER",
      deletedAt: null,
    };

    if (filters?.search) {
      whereClause.OR = [
        { name: { contains: filters.search, mode: "insensitive" } },
        { email: { contains: filters.search, mode: "insensitive" } },
      ];
    }

    // Buscar barbeiros (sem paginação inicial para aplicar filtro de rating)
    const barbeiros = await db.user.findMany({
      where: whereClause,
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        createdAt: true,
        appointments: {
          select: {
            id: true,
            serviceHistory: {
              select: {
                rating: true,
              },
            },
          },
        },
      },
    });

    // Processar dados dos barbeiros com métricas
    let barbersWithMetrics: Barber[] = barbeiros.map((barber) => {
      const allRatings = barber.appointments
        .map((apt) => apt.serviceHistory?.rating)
        .filter((rating): rating is number => rating !== null && rating !== undefined);

      return {
        id: barber.id,
        name: barber.name,
        email: barber.email,
        role: barber.role,
        createdAt: barber.createdAt,
        totalReviews: allRatings.length,
        averageRating:
          allRatings.length > 0
            ? Number((allRatings.reduce((acc, rating) => acc + rating, 0) / allRatings.length).toFixed(1))
            : null,
        totalAppointments: barber.appointments.length,
      };
    });

    // Aplicar filtro de performance mínima
    if (filters?.performanceMin !== undefined && filters.performanceMin > 0) {
      barbersWithMetrics = barbersWithMetrics.filter(
        (b) => b.averageRating !== null && b.averageRating >= filters.performanceMin!,
      );
    }

    // Ordenar
    const sortBy = filters?.sortBy || "name";
    barbersWithMetrics.sort((a, b) => {
      switch (sortBy) {
        case "rating":
          // Barbeiros sem rating vão para o final
          if (a.averageRating === null && b.averageRating === null) return 0;
          if (a.averageRating === null) return 1;
          if (b.averageRating === null) return -1;
          return b.averageRating - a.averageRating; // Decrescente
        case "appointments":
          return b.totalAppointments - a.totalAppointments; // Decrescente
        case "name":
        default:
          return (a.name || "").localeCompare(b.name || "");
      }
    });

    // Calcular paginação
    const total = barbersWithMetrics.length;
    const totalPages = Math.ceil(total / limit);
    const paginatedData = barbersWithMetrics.slice(skip, skip + limit);

    const ratedBarbers = barbersWithMetrics.filter((b) => b.averageRating !== null);

    const averageRating =
      ratedBarbers.length > 0
        ? Number(
            (ratedBarbers.reduce((acc, barber) => acc + (barber.averageRating || 0), 0) / ratedBarbers.length).toFixed(
              2,
            ),
          )
        : 0;

    const activeCount = barbersWithMetrics.filter((b) => b.totalAppointments > 0).length;

    const topPerformer = barbersWithMetrics.reduce<Barber | null>((best, current) => {
      if (!best) return current;
      if (current.averageRating === null) return best;
      if (best.averageRating === null) return current;
      return current.averageRating > best.averageRating ? current : best;
    }, null);

    return {
      success: true,
      data: paginatedData,
      pagination: {
        page,
        limit,
        total,
        totalPages,
      },
      metrics: {
        averageRating,
        activeCount,
        totalReviews: barbersWithMetrics.reduce((acc, b) => acc + (b.totalReviews || 0), 0),
        topPerformer: topPerformer?.name || null,
      } satisfies BarberMetrics,
    };
  } catch (error) {
    console.error("Erro ao buscar barbeiros:", error);
    return {
      success: false,
      error: "Erro ao buscar barbeiros",
      data: [],
      pagination: { page: 1, limit: 20, total: 0, totalPages: 0 },
      metrics: {
        averageRating: 0,
        activeCount: 0,
        totalReviews: 0,
        topPerformer: null,
      },
    };
  }
}

/**
 * Buscar dados para relatórios
 *
 * @param dateRange - Período do relatório: "7d" | "30d" | "3m" | "year" (default: "30d")
 */
export async function getReportsData(dateRange?: "7d" | "30d" | "3m" | "year") {
  try {
    // Verificar autenticação
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return {
        success: false,
        error: "Não autenticado",
        data: null,
      };
    }

    // Verificar role ADMIN
    if (session.user.role !== "ADMIN") {
      return {
        success: false,
        error: "Acesso negado: apenas administradores",
        data: null,
      };
    }

    // Calcular data de início baseado no range
    const now = new Date();
    let startDate: Date;

    switch (dateRange || "30d") {
      case "7d":
        startDate = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
        break;
      case "30d":
        startDate = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
        break;
      case "3m":
        startDate = new Date(now.getFullYear(), now.getMonth() - 3, now.getDate());
        break;
      case "year":
        startDate = new Date(now.getFullYear() - 1, now.getMonth(), now.getDate());
        break;
      default:
        startDate = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
    }

    // Dados básicos (não filtrados por data)
    const totalClients = await db.user.count({
      where: { role: "CLIENT", deletedAt: null },
    });

    const totalAppointments = await db.appointment.count();

    // Agendamentos no período selecionado
    const periodAppointments = await db.appointment.count({
      where: {
        createdAt: {
          gte: startDate,
        },
      },
    });

    // Dados de reviews no período selecionado
    const periodReviews = await db.serviceHistory.findMany({
      where: {
        rating: { not: null },
        createdAt: {
          gte: startDate,
        },
      },
      select: {
        rating: true,
        finalPrice: true,
      },
    });

    // Dados de reviews totais (para comparação)
    const allReviews = await db.serviceHistory.findMany({
      where: {
        rating: { not: null },
      },
      select: {
        rating: true,
        finalPrice: true,
      },
    });

    const totalReviews = allReviews.length;
    const periodReviewsCount = periodReviews.length;

    const averageRating =
      totalReviews > 0
        ? Number((allReviews.reduce((acc, review) => acc + (review.rating || 0), 0) / totalReviews).toFixed(1))
        : 0;

    const periodAverageRating =
      periodReviewsCount > 0
        ? Number((periodReviews.reduce((acc, review) => acc + (review.rating || 0), 0) / periodReviewsCount).toFixed(1))
        : 0;

    // Receita total
    const totalRevenue = allReviews.reduce((acc, review) => {
      const finalPrice = review.finalPrice;
      const numericPrice = typeof finalPrice === "number" ? finalPrice : Number(finalPrice ?? 25);
      return acc + numericPrice;
    }, 0);

    // Receita do período selecionado
    const periodRevenue = periodReviews.reduce((acc, review) => {
      const finalPrice = review.finalPrice;
      const numericPrice = typeof finalPrice === "number" ? finalPrice : Number(finalPrice ?? 25);
      return acc + numericPrice;
    }, 0);

    // Top barbeiros
    const barbeirosData = await getBarbersForAdmin({
      sortBy: "rating",
      limit: 50,
    });
    const barbersList =
      barbeirosData.success && Array.isArray(barbeirosData.data)
        ? (barbeirosData.data as Array<{
            id: string;
            name: string;
            totalReviews: number;
            averageRating?: number | null;
          }>)
        : [];

    const topBarbers = barbersList
      .filter((b) => b.totalReviews > 0)
      .sort((a, b) => (b.averageRating || 0) - (a.averageRating || 0))
      .slice(0, 10);

    const reportsData: ReportsData = {
      totalRevenue,
      monthlyRevenue: periodRevenue, // Receita do período selecionado
      totalClients,
      totalAppointments,
      monthlyAppointments: periodAppointments, // Agendamentos do período
      averageRating,
      totalReviews,
      topBarbers: topBarbers.map((b) => ({
        id: b.id,
        name: b.name,
        totalReviews: b.totalReviews,
        averageRating: b.averageRating || 0,
      })),
    };

    return {
      success: true,
      data: reportsData,
    };
  } catch (error) {
    console.error("Erro ao buscar dados de relatórios:", error);
    return {
      success: false,
      error: "Erro ao buscar dados de relatórios",
      data: null,
    };
  }
}

/**
 * Atualizar role de um usuário
 */
export async function updateUserRole(userId: string, newRole: "CLIENT" | "BARBER" | "ADMIN") {
  try {
    // Verificar autenticação
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return {
        success: false,
        error: "Não autenticado",
      };
    }

    // Verificar role ADMIN
    if (session.user.role !== "ADMIN") {
      return {
        success: false,
        error: "Acesso negado: apenas administradores podem alterar roles",
      };
    }

    const targetUser = await db.user.findFirst({
      where: { id: userId, deletedAt: null },
    });

    if (!targetUser) {
      return {
        success: false,
        error: "Usuário não encontrado ou removido.",
      };
    }

    const updatedUser = await db.user.update({
      where: { id: userId },
      data: { role: newRole, updatedById: session.user.id },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
      },
    });

    logger.info("User role updated", {
      actorId: session.user.id,
      userId,
      newRole,
    });

    revalidatePath("/dashboard/admin/users");

    return {
      success: true,
      data: updatedUser,
      message: `Usuário promovido para ${newRole} com sucesso!`,
    };
  } catch (error) {
    console.error("Erro ao atualizar role do usuário:", error);
    return {
      success: false,
      error: "Erro ao atualizar role do usuário",
    };
  }
}

/**
 * Buscar usuário específico por ID
 */
export async function getUserById(userId: string) {
  try {
    // Verificar autenticação
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return {
        success: false,
        error: "Não autenticado",
      };
    }

    // Verificar role ADMIN
    if (session.user.role !== "ADMIN") {
      return {
        success: false,
        error: "Acesso negado: apenas administradores",
      };
    }

    const user = await db.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        nickname: true,
        phone: true,
        image: true,
        isActive: true,
        deletedAt: true,
        deletedById: true,
        updatedById: true,
        createdAt: true,
        appointments: {
          select: {
            id: true,
            status: true,
            createdAt: true,
            serviceHistory: {
              select: {
                rating: true,
                feedback: true,
                finalPrice: true,
              },
            },
          },
          orderBy: { createdAt: "desc" },
          take: 10,
        },
      },
    });

    if (!user) {
      return {
        success: false,
        error: "Usuário não encontrado",
      };
    }

    return {
      success: true,
      data: user,
    };
  } catch (error) {
    console.error("Erro ao buscar usuário:", error);
    return {
      success: false,
      error: "Erro ao buscar usuário",
    };
  }
}

/**
 * Deletar usuário (soft delete ou inativação)
 */
export async function deleteUser(userId: string) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return {
        success: false,
        error: "Não autenticado",
      };
    }

    if (session.user.role !== "ADMIN") {
      return {
        success: false,
        error: "Acesso negado: apenas administradores podem inativar usuários",
      };
    }

    if (session.user.id === userId) {
      return {
        success: false,
        error: "Você não pode remover sua própria conta.",
      };
    }

    const user = await UserService.softDeleteUser(userId, session.user.id);

    if (!user) {
      return {
        success: false,
        error: "Usuário não encontrado ou já removido.",
      };
    }

    logger.warn("User soft deleted via adminActions", {
      actorId: session.user.id,
      userId,
    });

    revalidatePath("/dashboard/admin/users");
    revalidatePath(`/dashboard/admin/users/${userId}`);

    return {
      success: true,
      message: "Usuário inativado com sucesso",
      data: user,
    };
  } catch (error) {
    console.error("Erro ao deletar usuário:", error);
    return {
      success: false,
      error: "Erro ao inativar usuário",
    };
  }
}
