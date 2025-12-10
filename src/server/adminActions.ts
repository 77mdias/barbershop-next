"use server";

import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { db } from "@/lib/prisma";

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

    const users = await db.user.findMany({
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        createdAt: true,
      },
      orderBy: {
        createdAt: "desc",
      },
    });

    return {
      success: true,
      data: users,
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
 */
export async function getBarbersForAdmin() {
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

    const barbeiros = await db.user.findMany({
      where: {
        role: "BARBER",
      },
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
      orderBy: {
        createdAt: "desc",
      },
    });

    // Processar dados dos barbeiros
    const barbersWithMetrics: Barber[] = barbeiros.map((barber) => {
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
        averageRating: allRatings.length > 0 
          ? Number((allRatings.reduce((acc, rating) => acc + rating, 0) / allRatings.length).toFixed(1))
          : null,
        totalAppointments: barber.appointments.length,
      };
    });

    return {
      success: true,
      data: barbersWithMetrics,
    };
  } catch (error) {
    console.error("Erro ao buscar barbeiros:", error);
    return {
      success: false,
      error: "Erro ao buscar barbeiros",
      data: [],
    };
  }
}

/**
 * Buscar dados para relatórios
 */
export async function getReportsData() {
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

    // Dados básicos
    const totalClients = await db.user.count({
      where: { role: "CLIENT" },
    });

    const totalAppointments = await db.appointment.count();

    // Agendamentos deste mês
    const now = new Date();
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    
    const monthlyAppointments = await db.appointment.count({
      where: {
        createdAt: {
          gte: startOfMonth,
        },
      },
    });

    // Dados de reviews
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
    const averageRating = totalReviews > 0 
      ? Number((allReviews.reduce((acc, review) => acc + (review.rating || 0), 0) / totalReviews).toFixed(1))
      : 0;

    // Receita (simulada baseada nos preços dos serviços)
    const totalRevenue = allReviews.reduce((acc, review) => {
      const finalPrice = review.finalPrice;
      const numericPrice = typeof finalPrice === "number" ? finalPrice : Number(finalPrice ?? 25);
      return acc + numericPrice;
    }, 0);
    
    // Receita mensal (estimativa)
    const monthlyRevenue = Number(totalRevenue * 0.3); // Aproximadamente 30% da receita total no mês atual

    // Top barbeiros
    const barbeirosData = await getBarbersForAdmin();
    const topBarbers = barbeirosData.success && Array.isArray(barbeirosData.data)
      ? barbeirosData.data
          .filter((b) => b.totalReviews > 0)
          .sort((a, b) => (b.averageRating || 0) - (a.averageRating || 0))
          .slice(0, 10)
      : [];

    const reportsData: ReportsData = {
      totalRevenue,
      monthlyRevenue,
      totalClients,
      totalAppointments,
      monthlyAppointments,
      averageRating,
      totalReviews,
      topBarbers: topBarbers.map(b => ({
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

    const updatedUser = await db.user.update({
      where: { id: userId },
      data: { role: newRole },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
      },
    });

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
        error: "Acesso negado: apenas administradores podem inativar usuários",
      };
    }

    // Verificar se o usuário existe
    const user = await db.user.findUnique({
      where: { id: userId },
    });

    if (!user) {
      return {
        success: false,
        error: "Usuário não encontrado",
      };
    }

    // TODO: Implementar soft delete quando campo isActive for adicionado ao schema
    // await db.user.update({
    //   where: { id: userId },
    //   data: {
    //     isActive: false,
    //   }
    // });

    return {
      success: true,
      message: "Função de inativação será implementada quando campo isActive for adicionado ao schema Prisma",
    };
  } catch (error) {
    console.error("Erro ao deletar usuário:", error);
    return {
      success: false,
      error: "Erro ao inativar usuário",
    };
  }
}