"use server";

import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { db } from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import {
  CreateServiceSchema,
  UpdateServiceSchema,
  type CreateServiceInput,
  type UpdateServiceInput,
} from "@/schemas/serviceSchemas";
import { ZodError } from "zod";

/**
 * Criar novo serviço (apenas ADMIN)
 */
export async function createService(data: CreateServiceInput) {
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
        error: "Acesso negado: apenas administradores podem criar serviços",
      };
    }

    // Validar dados de entrada
    const validatedData = CreateServiceSchema.parse(data);

    // Verificar se já existe um serviço com o mesmo nome
    const existingService = await db.service.findFirst({
      where: {
        name: {
          equals: validatedData.name,
          mode: "insensitive",
        },
      },
    });

    if (existingService) {
      return {
        success: false,
        error: "Já existe um serviço com este nome",
      };
    }

    // Criar serviço
    const service = await db.service.create({
      data: {
        name: validatedData.name,
        description: validatedData.description || null,
        duration: validatedData.duration,
        price: validatedData.price,
        active: validatedData.active,
      },
    });

    // Revalidar páginas que exibem serviços
    revalidatePath("/dashboard/admin/services");
    revalidatePath("/scheduling");
    revalidatePath("/");

    return {
      success: true,
      data: service,
      message: "Serviço criado com sucesso",
    };
  } catch (error) {
    if (error instanceof ZodError) {
      return {
        success: false,
        error: error.issues.map((issue) => issue.message).join(", "),
      };
    }

    console.error("Erro ao criar serviço:", error);
    return {
      success: false,
      error: "Erro ao criar serviço",
    };
  }
}

/**
 * Atualizar serviço existente (apenas ADMIN)
 */
export async function updateService(serviceId: string, data: UpdateServiceInput) {
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
        error: "Acesso negado: apenas administradores podem editar serviços",
      };
    }

    // Validar dados de entrada
    const validatedData = UpdateServiceSchema.parse(data);

    // Verificar se o serviço existe
    const existingService = await db.service.findUnique({
      where: { id: serviceId },
    });

    if (!existingService) {
      return {
        success: false,
        error: "Serviço não encontrado",
      };
    }

    // Se está alterando o nome, verificar se não há conflito
    if (validatedData.name && validatedData.name !== existingService.name) {
      const nameConflict = await db.service.findFirst({
        where: {
          id: { not: serviceId },
          name: {
            equals: validatedData.name,
            mode: "insensitive",
          },
        },
      });

      if (nameConflict) {
        return {
          success: false,
          error: "Já existe outro serviço com este nome",
        };
      }
    }

    // Atualizar serviço
    const service = await db.service.update({
      where: { id: serviceId },
      data: validatedData,
    });

    // Revalidar páginas
    revalidatePath("/dashboard/admin/services");
    revalidatePath("/scheduling");
    revalidatePath("/");

    return {
      success: true,
      data: service,
      message: "Serviço atualizado com sucesso",
    };
  } catch (error) {
    if (error instanceof ZodError) {
      return {
        success: false,
        error: error.issues.map((issue) => issue.message).join(", "),
      };
    }

    console.error("Erro ao atualizar serviço:", error);
    return {
      success: false,
      error: "Erro ao atualizar serviço",
    };
  }
}

/**
 * Alternar status ativo/inativo de um serviço (apenas ADMIN)
 */
export async function toggleServiceStatus(serviceId: string) {
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
        error: "Acesso negado: apenas administradores podem alterar status de serviços",
      };
    }

    // Buscar serviço atual
    const existingService = await db.service.findUnique({
      where: { id: serviceId },
      select: { id: true, active: true, name: true },
    });

    if (!existingService) {
      return {
        success: false,
        error: "Serviço não encontrado",
      };
    }

    // Alternar status
    const service = await db.service.update({
      where: { id: serviceId },
      data: { active: !existingService.active },
    });

    // Revalidar páginas
    revalidatePath("/dashboard/admin/services");
    revalidatePath("/scheduling");
    revalidatePath("/");

    return {
      success: true,
      data: service,
      message: `Serviço ${service.active ? "ativado" : "desativado"} com sucesso`,
    };
  } catch (error) {
    console.error("Erro ao alterar status do serviço:", error);
    return {
      success: false,
      error: "Erro ao alterar status do serviço",
    };
  }
}

/**
 * Deletar serviço (soft delete - marca como inativo) (apenas ADMIN)
 */
export async function deleteService(serviceId: string) {
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
        error: "Acesso negado: apenas administradores podem deletar serviços",
      };
    }

    // Verificar se o serviço existe
    const existingService = await db.service.findUnique({
      where: { id: serviceId },
      include: {
        _count: {
          select: {
            appointments: true,
            serviceHistory: true,
          },
        },
      },
    });

    if (!existingService) {
      return {
        success: false,
        error: "Serviço não encontrado",
      };
    }

    // Verificar se há agendamentos ou histórico associados
    const hasAppointments = existingService._count.appointments > 0;
    const hasHistory = existingService._count.serviceHistory > 0;

    if (hasAppointments || hasHistory) {
      // Soft delete: apenas marca como inativo
      const service = await db.service.update({
        where: { id: serviceId },
        data: { active: false },
      });

      // Revalidar páginas
      revalidatePath("/dashboard/admin/services");
      revalidatePath("/scheduling");
      revalidatePath("/");

      return {
        success: true,
        data: service,
        message: "Serviço marcado como inativo (possui histórico de uso)",
      };
    }

    // Se não tem uso, pode deletar completamente
    await db.service.delete({
      where: { id: serviceId },
    });

    // Revalidar páginas
    revalidatePath("/dashboard/admin/services");
    revalidatePath("/scheduling");
    revalidatePath("/");

    return {
      success: true,
      message: "Serviço deletado com sucesso",
    };
  } catch (error) {
    console.error("Erro ao deletar serviço:", error);
    return {
      success: false,
      error: "Erro ao deletar serviço",
    };
  }
}

/**
 * Listar todos os serviços para admin (com filtros opcionais)
 */
export async function getServicesForAdmin(filters?: {
  active?: boolean;
  search?: string;
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

    const page = filters?.page || 1;
    const limit = filters?.limit || 20;
    const skip = (page - 1) * limit;

    // Construir filtros
    const where: any = {};

    if (filters?.active !== undefined) {
      where.active = filters.active;
    }

    if (filters?.search) {
      where.OR = [
        { name: { contains: filters.search, mode: "insensitive" } },
        { description: { contains: filters.search, mode: "insensitive" } },
      ];
    }

    // Buscar serviços e contagem total
    const [services, total] = await Promise.all([
      db.service.findMany({
        where,
        include: {
          _count: {
            select: {
              appointments: true,
              serviceHistory: true,
            },
          },
        },
        orderBy: { createdAt: "desc" },
        skip,
        take: limit,
      }),
      db.service.count({ where }),
    ]);

    return {
      success: true,
      data: services,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    };
  } catch (error) {
    console.error("Erro ao buscar serviços:", error);
    return {
      success: false,
      error: "Erro ao buscar serviços",
      data: [],
    };
  }
}

/**
 * Buscar serviço por ID para admin
 */
export async function getServiceByIdForAdmin(serviceId: string) {
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

    const service = await db.service.findUnique({
      where: { id: serviceId },
      include: {
        _count: {
          select: {
            appointments: true,
            serviceHistory: true,
            promotionServices: true,
            vouchers: true,
          },
        },
      },
    });

    if (!service) {
      return {
        success: false,
        error: "Serviço não encontrado",
      };
    }

    return {
      success: true,
      data: service,
    };
  } catch (error) {
    console.error("Erro ao buscar serviço:", error);
    return {
      success: false,
      error: "Erro ao buscar serviço",
    };
  }
}
