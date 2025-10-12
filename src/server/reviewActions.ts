"use server";

import { revalidatePath } from "next/cache";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { db } from "@/lib/prisma";
import { 
  createReviewSchema, 
  updateReviewSchema, 
  deleteReviewSchema, 
  getReviewsSchema,
  type CreateReviewInput,
  type UpdateReviewInput,
  type DeleteReviewInput,
  type GetReviewsInput
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

    // Validar entrada
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
      }
    });

    if (!serviceHistory) {
      return { success: false, error: "Histórico de serviço não encontrado ou não autorizado" };
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
          }
        },
        service: {
          select: {
            id: true,
            name: true,
            description: true,
            price: true,
          }
        }
      }
    });

    // Revalidar páginas relacionadas
    revalidatePath("/dashboard");
    revalidatePath("/reviews");
    revalidatePath(`/services/${serviceHistory.service.id}`);

    return { 
      success: true, 
      data: updatedServiceHistory,
      message: "Avaliação criada com sucesso!" 
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
      return { success: false, error: "Avaliação não encontrada ou não autorizada" };
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
          }
        },
        service: {
          select: {
            id: true,
            name: true,
            description: true,
            price: true,
          }
        }
      }
    });

    // Revalidar páginas relacionadas
    revalidatePath("/dashboard");
    revalidatePath("/reviews");
    revalidatePath(`/services/${updatedServiceHistory.service.id}`);

    return { 
      success: true, 
      data: updatedServiceHistory,
      message: "Avaliação atualizada com sucesso!" 
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
        }
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
        }
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
            }
          },
          service: {
            select: {
              id: true,
              name: true,
              description: true,
              price: true,
            }
          },
          appointments: {
            select: {
              barber: {
                select: {
                  id: true,
                  name: true,
                  image: true,
                }
              }
            },
            take: 1, // Pegar apenas o primeiro barbeiro (assumindo um barbeiro por serviço)
          }
        },
        orderBy: {
          [validatedInput.sortBy]: validatedInput.sortOrder,
        },
        skip: offset,
        take: validatedInput.limit,
      }),
      db.serviceHistory.count({
        where: whereConditions,
      })
    ]);

    // Calcular informações de paginação
    const totalPages = Math.ceil(totalCount / validatedInput.limit);
    const hasNextPage = validatedInput.page < totalPages;
    const hasPreviousPage = validatedInput.page > 1;

    return {
      success: true,
      data: {
        reviews,
        pagination: {
          currentPage: validatedInput.page,
          totalPages,
          totalCount,
          hasNextPage,
          hasPreviousPage,
          limit: validatedInput.limit,
        }
      }
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
        ...(session.user.role !== UserRole.ADMIN && { userId: session.user.id }),
        rating: { not: null }, // Garantir que tem avaliação
      },
      include: {
        service: true,
      }
    });

    if (!serviceHistory) {
      return { success: false, error: "Avaliação não encontrada ou não autorizada" };
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
      message: "Avaliação removida com sucesso!" 
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
        }
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
      by: ['rating'],
      where: whereConditions,
      _count: {
        rating: true,
      },
      orderBy: {
        rating: 'desc',
      }
    });

    return {
      success: true,
      data: {
        averageRating: Number(stats._avg.rating?.toFixed(1)) || 0,
        totalReviews: stats._count.rating || 0,
        ratingDistribution: ratingDistribution.map(item => ({
          rating: item.rating,
          count: item._count.rating,
        })),
      }
    };
  } catch (error) {
    console.error("Erro ao buscar estatísticas de avaliações:", error);
    
    if (error instanceof Error) {
      return { success: false, error: error.message };
    }
    
    return { success: false, error: "Erro interno do servidor" };
  }
}