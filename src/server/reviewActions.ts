"use server";

import { revalidatePath } from "next/cache";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { db } from "@/lib/prisma";
import {
  serializeReviewsResult,
  serializeServiceHistory,
} from "@/lib/serializers";
import {
  createReviewSchema,
  updateReviewSchema,
  deleteReviewSchema,
  getReviewsSchema,
  type CreateReviewInput,
  type UpdateReviewInput,
  type DeleteReviewInput,
  type GetReviewsInput,
} from "@/schemas/reviewSchemas";
import { UserRole } from "@prisma/client";

/**
 * Criar uma nova avaliação
 */
export async function createReview(input: CreateReviewInput) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return { success: false, error: "Usuário não autenticado" };
    }

    // Debug: log dos dados recebidos
    console.log(
      "🔍 Dados recebidos no createReview:",
      JSON.stringify(input, null, 2)
    );

    // Validar entrada
    try {
      const validatedInput = createReviewSchema.parse(input);
      console.log(
        "✅ Dados validados:",
        JSON.stringify(validatedInput, null, 2)
      );
    } catch (validationError: any) {
      console.error("❌ Erro de validação:", validationError);
      return {
        success: false,
        error: `Erro de validação: ${validationError.message}`,
      };
    }

    const validatedInput = createReviewSchema.parse(input);

    // Verificar se o ServiceHistory existe e pertence ao usuário
    const serviceHistory = await db.serviceHistory.findFirst({
      where: {
        id: validatedInput.serviceHistoryId,
        userId: session.user.id,
      },
      include: {
        appointments: true,
        service: true,
      },
    });

    if (!serviceHistory) {
      return {
        success: false,
        error: "Histórico de serviço não encontrado ou não autorizado",
      };
    }

    // Verificar se já existe uma avaliação para este histórico
    if (serviceHistory.rating !== null) {
      return { success: false, error: "Este serviço já foi avaliado" };
    }

    // Atualizar o ServiceHistory com a avaliação
    const updatedServiceHistory = await db.serviceHistory.update({
      where: { id: validatedInput.serviceHistoryId },
      data: {
        rating: validatedInput.rating,
        feedback: validatedInput.feedback || null,
        ...(validatedInput.images && {
          images: {
            set: validatedInput.images,
          },
        }),
        updatedAt: new Date(),
      } as any,
      include: {
        user: {
          select: {
            id: true,
            name: true,
            image: true,
          },
        },
        service: {
          select: {
            id: true,
            name: true,
            description: true,
            price: true,
          },
        },
      },
    });

    // Revalidar páginas relacionadas
    revalidatePath("/dashboard");
    revalidatePath("/reviews");
    revalidatePath(`/services/${serviceHistory.service.id}`);

    return {
      success: true,
      data: serializeServiceHistory(updatedServiceHistory),
      message: "Avaliação criada com sucesso!",
    };
  } catch (error) {
    console.error("Erro ao criar avaliação:", error);

    if (error instanceof Error) {
      return { success: false, error: error.message };
    }

    return { success: false, error: "Erro interno do servidor" };
  }
}

/**
 * Atualizar uma avaliação existente
 */
export async function updateReview(input: UpdateReviewInput) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return { success: false, error: "Usuário não autenticado" };
    }

    // Validar entrada
    const validatedInput = updateReviewSchema.parse(input);

    // Verificar se a avaliação existe e autorização do usuário
    const serviceHistory = await db.serviceHistory.findFirst({
      where: {
        id: validatedInput.id,
        userId: session.user.id,
        rating: { not: null }, // Garantir que já tem avaliação
      },
    });

    if (!serviceHistory) {
      return {
        success: false,
        error: "Avaliação não encontrada ou não autorizada",
      };
    }

    // Preparar dados para atualização (apenas campos fornecidos)
    const updateData: any = {
      updatedAt: new Date(),
    };

    if (validatedInput.rating !== undefined) {
      updateData.rating = validatedInput.rating;
    }
    if (validatedInput.feedback !== undefined) {
      updateData.feedback = validatedInput.feedback || null;
    }
    if (validatedInput.images !== undefined) {
      updateData.images = {
        set: validatedInput.images,
      };
    }

    // Atualizar a avaliação
    const updatedServiceHistory = await db.serviceHistory.update({
      where: { id: validatedInput.id },
      data: updateData as any,
      include: {
        user: {
          select: {
            id: true,
            name: true,
            image: true,
          },
        },
        service: {
          select: {
            id: true,
            name: true,
            description: true,
            price: true,
          },
        },
      },
    });

    // Revalidar páginas relacionadas
    revalidatePath("/dashboard");
    revalidatePath("/reviews");
    revalidatePath(`/services/${updatedServiceHistory.service.id}`);

    return {
      success: true,
      data: serializeServiceHistory(updatedServiceHistory),
      message: "Avaliação atualizada com sucesso!",
    };
  } catch (error) {
    console.error("Erro ao atualizar avaliação:", error);

    if (error instanceof Error) {
      return { success: false, error: error.message };
    }

    return { success: false, error: "Erro interno do servidor" };
  }
}

/**
 * Buscar avaliações públicas (sem autenticação) para exibição na homepage
 */
export async function getPublicReviews(limit: number = 6) {
  try {
    const reviews = await db.serviceHistory.findMany({
      where: {
        rating: { not: null }, // Apenas históricos com avaliação
        feedback: { not: null }, // Apenas com feedback
      },
      orderBy: [{ rating: "desc" }, { updatedAt: "desc" }],
      take: limit,
      include: {
        user: {
          select: {
            id: true,
            name: true,
            image: true,
          },
        },
        service: {
          select: {
            id: true,
            name: true,
            description: true,
            price: true,
          },
        },
      },
    });

    // Formatar para o componente ClientReview
    const formattedReviews = reviews.map((review) => ({
      id: review.id,
      name: review.user.name || "Cliente",
      service: review.service.name,
      rating: review.rating!,
      comment: review.feedback!,
      image: review.user.image || undefined,
      images: review.images || [],
      date: review.updatedAt,
    }));

    return { success: true, data: formattedReviews };
  } catch (error) {
    console.error("Erro ao buscar avaliações públicas:", error);
    return { success: false, error: "Erro interno do servidor" };
  }
}

/**
 * Buscar avaliações com filtros e paginação
 */
export async function getReviews(input: Partial<GetReviewsInput> = {}) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return { success: false, error: "Usuário não autenticado" };
    }

    // Validar entrada e aplicar defaults
    const validatedInput = getReviewsSchema.parse(input);

    // Construir filtros WHERE
    const whereConditions: any = {
      rating: { not: null }, // Apenas históricos com avaliação
    };

    // Filtros baseados no papel do usuário
    if (session.user.role === UserRole.CLIENT) {
      // Cliente só vê suas próprias avaliações
      whereConditions.userId = session.user.id;
    } else if (session.user.role === UserRole.BARBER) {
      // Barbeiro vê avaliações dos serviços que ele prestou
      whereConditions.appointments = {
        some: {
          barberId: session.user.id,
        },
      };
    }
    // ADMIN vê todas as avaliações (não adiciona filtro extra)

    // Aplicar filtros opcionais
    if (validatedInput.userId) {
      whereConditions.userId = validatedInput.userId;
    }
    if (validatedInput.serviceId) {
      whereConditions.serviceId = validatedInput.serviceId;
    }
    if (validatedInput.barberId) {
      whereConditions.appointments = {
        some: {
          barberId: validatedInput.barberId,
        },
      };
    }
    if (validatedInput.rating) {
      whereConditions.rating = validatedInput.rating;
    }

    // Calcular offset para paginação
    const offset = (validatedInput.page - 1) * validatedInput.limit;

    // Buscar avaliações com paginação
    const [reviews, totalCount] = await Promise.all([
      db.serviceHistory.findMany({
        where: whereConditions,
        include: {
          user: {
            select: {
              id: true,
              name: true,
              image: true,
            },
          },
          service: {
            select: {
              id: true,
              name: true,
              description: true,
              price: true,
            },
          },
          appointments: {
            select: {
              barber: {
                select: {
                  id: true,
                  name: true,
                  image: true,
                },
              },
            },
            take: 1, // Pegar apenas o primeiro barbeiro (assumindo um barbeiro por serviço)
          },
        },
        orderBy: {
          [validatedInput.sortBy]: validatedInput.sortOrder,
        },
        skip: offset,
        take: validatedInput.limit,
      }),
      db.serviceHistory.count({
        where: whereConditions,
      }),
    ]);

    // Calcular informações de paginação
    const totalPages = Math.ceil(totalCount / validatedInput.limit);
    const hasNextPage = validatedInput.page < totalPages;
    const hasPreviousPage = validatedInput.page > 1;

    return {
      success: true,
      data: serializeReviewsResult({
        reviews,
        pagination: {
          currentPage: validatedInput.page,
          totalPages,
          totalCount,
          hasNextPage,
          hasPreviousPage,
          limit: validatedInput.limit,
        },
      }),
    };
  } catch (error) {
    console.error("Erro ao buscar avaliações:", error);

    if (error instanceof Error) {
      return { success: false, error: error.message };
    }

    return { success: false, error: "Erro interno do servidor" };
  }
}

/**
 * Deletar uma avaliação
 */
export async function deleteReview(input: DeleteReviewInput) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return { success: false, error: "Usuário não autenticado" };
    }

    // Validar entrada
    const validatedInput = deleteReviewSchema.parse(input);

    // Verificar se a avaliação existe e autorização
    const serviceHistory = await db.serviceHistory.findFirst({
      where: {
        id: validatedInput.id,
        ...(session.user.role !== UserRole.ADMIN && {
          userId: session.user.id,
        }),
        rating: { not: null }, // Garantir que tem avaliação
      },
      include: {
        service: true,
      },
    });

    if (!serviceHistory) {
      return {
        success: false,
        error: "Avaliação não encontrada ou não autorizada",
      };
    }

    // "Deletar" a avaliação (removendo os campos de avaliação)
    await db.serviceHistory.update({
      where: { id: validatedInput.id },
      data: {
        rating: null,
        feedback: null,
        images: {
          set: [],
        },
        updatedAt: new Date(),
      } as any,
    });

    // Revalidar páginas relacionadas
    revalidatePath("/dashboard");
    revalidatePath("/reviews");
    revalidatePath(`/services/${serviceHistory.service.id}`);

    return {
      success: true,
      message: "Avaliação removida com sucesso!",
    };
  } catch (error) {
    console.error("Erro ao deletar avaliação:", error);

    if (error instanceof Error) {
      return { success: false, error: error.message };
    }

    return { success: false, error: "Erro interno do servidor" };
  }
}

/**
 * Obter estatísticas de avaliações
 */
export async function getReviewStats(serviceId?: string, barberId?: string) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return { success: false, error: "Usuário não autenticado" };
    }

    // Construir filtros WHERE
    const whereConditions: any = {
      rating: { not: null },
    };

    if (serviceId) {
      whereConditions.serviceId = serviceId;
    }

    if (barberId) {
      whereConditions.appointments = {
        some: {
          barberId: barberId,
        },
      };
    }

    // Buscar estatísticas
    const stats = await db.serviceHistory.aggregate({
      where: whereConditions,
      _avg: {
        rating: true,
      },
      _count: {
        rating: true,
      },
    });

    // Buscar distribuição das avaliações
    const ratingDistribution = await db.serviceHistory.groupBy({
      by: ["rating"],
      where: whereConditions,
      _count: {
        rating: true,
      },
      orderBy: {
        rating: "desc",
      },
    });

    return {
      success: true,
      data: {
        averageRating: Number(stats._avg.rating?.toFixed(1)) || 0,
        totalReviews: stats._count.rating || 0,
        ratingDistribution: ratingDistribution.map((item) => ({
          rating: item.rating,
          count: item._count.rating,
        })),
      },
    };
  } catch (error) {
    console.error("Erro ao buscar estatísticas de avaliações:", error);

    if (error instanceof Error) {
      return { success: false, error: error.message };
    }

    return { success: false, error: "Erro interno do servidor" };
  }
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
    if (session.user.role !== UserRole.ADMIN && session.user.id !== barberId) {
      return { success: false, error: "Não autorizado" };
    }

    const startOfMonth = new Date(
      new Date().getFullYear(),
      new Date().getMonth(),
      1
    );
    const now = new Date();

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

    return {
      success: true,
      data: {
        // Métricas principais
        averageRating: Number(reviewsMetrics._avg.rating?.toFixed(1)) || 0,
        totalReviews: reviewsMetrics._count.rating || 0,
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
            reviewsMetrics._count.rating > 0
              ? Math.round(
                  (item._count.rating / reviewsMetrics._count.rating) * 100
                )
              : 0,
        })),

        // Metas do mês (podem ser configuráveis futuramente)
        goals: {
          averageRating: {
            target: 4.5,
            current: Number(monthlyReviews._avg.rating?.toFixed(1)) || 0,
          },
          monthlyReviews: {
            target: 20,
            current: monthlyReviews._count.rating || 0,
          },
          monthlyClients: { target: 100, current: monthlyClients.length || 0 },
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
    if (session.user.role !== UserRole.ADMIN && session.user.id !== userId) {
      return { success: false, error: "Não autorizado" };
    }

    const userRole = session.user.role;
    const startOfMonth = new Date(
      new Date().getFullYear(),
      new Date().getMonth(),
      1
    );

    if (userRole === UserRole.CLIENT) {
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
    } else if (userRole === UserRole.BARBER) {
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
