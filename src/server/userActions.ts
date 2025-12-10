"use server";

import { revalidatePath } from "next/cache";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import {
  UserFiltersSchema,
  type UserFiltersInput,
  UserInput,
  type UserInputType,
  type UserFormInputType,
  UserUpdateInput,
  type UserUpdateInputType,
  UserSoftDeleteSchema,
  type UserSoftDeleteInput,
  UserRestoreSchema,
  type UserRestoreInput,
} from "@/schemas/userSchemas";
import { UserService } from "./services/userService";
import { db } from "@/lib/prisma";
import bcrypt from "bcryptjs";
import { logger } from "@/lib/logger";

async function requireAdminSession() {
  const session = await getServerSession(authOptions);

  if (!session?.user?.id) {
    return { session: null, error: "Usuário não autenticado" as const };
  }

  if (session.user.role !== "ADMIN") {
    return {
      session: null,
      error: "Acesso negado. Apenas administradores podem realizar esta ação.",
    } as const;
  }

  return { session };
}

/**
 * Server Action para buscar barbeiros ativos
 */
export async function getBarbers() {
  try {
    const barbers = await UserService.findBarbers();

    return {
      success: true,
      data: barbers,
    };
  } catch (error) {
    console.error("Erro ao buscar barbeiros:", error);
    return {
      success: false,
      error: "Erro interno do servidor",
    };
  }
}

/**
 * Server Action para aplicar soft delete em um usuário
 */
export async function softDeleteUser(input: UserSoftDeleteInput) {
  try {
    const { session, error } = await requireAdminSession();

    if (!session) {
      return {
        success: false,
        error,
      };
    }

    const { id, reason } = UserSoftDeleteSchema.parse(input);

    if (session.user.id === id) {
      return {
        success: false,
        error: "Você não pode remover sua própria conta.",
      };
    }

    const user = await UserService.softDeleteUser(id, session.user.id);

    if (!user) {
      return {
        success: false,
        error: "Usuário não encontrado ou já removido.",
      };
    }

    logger.warn("User soft deleted", {
      actorId: session.user.id,
      userId: id,
      reason,
    });

    revalidatePath("/dashboard/admin/users");
    revalidatePath(`/dashboard/admin/users/${id}`);

    return {
      success: true,
      data: user,
      message: "Usuário marcado como removido",
    };
  } catch (error) {
    console.error("Erro ao aplicar soft delete:", error);
    return {
      success: false,
      error: "Erro interno do servidor",
    };
  }
}

/**
 * Server Action para restaurar um usuário removido
 */
export async function restoreUser(input: UserRestoreInput) {
  try {
    const { session, error } = await requireAdminSession();

    if (!session) {
      return {
        success: false,
        error,
      };
    }

    const { id } = UserRestoreSchema.parse(input);

    const user = await UserService.restoreUser(id, session.user.id);

    if (!user) {
      return {
        success: false,
        error: "Usuário não encontrado ou não está removido.",
      };
    }

    logger.info("User restored", { actorId: session.user.id, userId: id });

    revalidatePath("/dashboard/admin/users");
    revalidatePath(`/dashboard/admin/users/${id}`);

    return {
      success: true,
      data: user,
      message: "Usuário restaurado com sucesso",
    };
  } catch (error) {
    console.error("Erro ao restaurar usuário:", error);
    return {
      success: false,
      error: "Erro interno do servidor",
    };
  }
}

/**
 * Server Action para buscar barbeiro por ID
 */
export async function getBarberById(id: string) {
  try {
    const barber = await UserService.findBarberById(id);

    if (!barber) {
      return {
        success: false,
        error: "Barbeiro não encontrado",
      };
    }

    return {
      success: true,
      data: barber,
    };
  } catch (error) {
    console.error("Erro ao buscar barbeiro:", error);
    return {
      success: false,
      error: "Erro interno do servidor",
    };
  }
}

/**
 * Server Action para buscar usuários (admin)
 */
export async function getUsers(filters?: Partial<UserFiltersInput>) {
  try {
    const { session, error } = await requireAdminSession();

    if (!session) {
      return {
        success: false,
        error,
      };
    }

    const validatedFilters = UserFiltersSchema.parse({
      status: filters?.status ?? "ALL",
      includeDeleted: filters?.includeDeleted ?? true,
      page: 1,
      limit: 20,
      ...filters,
    });

    const result = await UserService.findMany({
      ...validatedFilters,
      includeDeleted: validatedFilters.includeDeleted || validatedFilters.status === "ALL",
    });

    return {
      success: true,
      data: result,
    };
  } catch (error) {
    console.error("Erro ao buscar usuários:", error);
    return {
      success: false,
      error: "Erro interno do servidor",
    };
  }
}

/**
 * Server Action para buscar usuário por ID
 */
export async function getUserById(id: string) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      return {
        success: false,
        error: "Usuário não autenticado",
      };
    }

    // Usuário pode ver próprios dados, admin pode ver qualquer um
    const canView = session.user.id === id || session.user.role === "ADMIN";

    if (!canView) {
      return {
        success: false,
        error: "Sem permissão para visualizar este usuário",
      };
    }

    const user = await UserService.findById(id, {
      includeDeleted: session.user.role === "ADMIN",
    });

    if (!user || (user.deletedAt && session.user.role !== "ADMIN")) {
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
      error: "Erro interno do servidor",
    };
  }
}

/**
 * Server Action para buscar estatísticas do usuário
 */
export async function getUserStats(userId?: string) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      return {
        success: false,
        error: "Usuário não autenticado",
      };
    }

    // Se não especificar userId, usar o usuário logado
    const targetUserId = userId || session.user.id;

    // Verificar permissões
    const canView = session.user.id === targetUserId || session.user.role === "ADMIN";

    if (!canView) {
      return {
        success: false,
        error: "Sem permissão para visualizar estatísticas",
      };
    }

    const stats = await UserService.getUserStats(targetUserId);

    return {
      success: true,
      data: stats,
    };
  } catch (error) {
    console.error("Erro ao buscar estatísticas:", error);
    return {
      success: false,
      error: "Erro interno do servidor",
    };
  }
}

/**
 * Server Action para verificar disponibilidade de barbeiro
 */
export async function checkBarberAvailability(data: { barberId: string; date: Date; duration: number }) {
  try {
    const isAvailable = await UserService.isBarberAvailable(data.barberId, data.date, data.duration);

    return {
      success: true,
      available: isAvailable,
    };
  } catch (error) {
    console.error("Erro ao verificar disponibilidade:", error);
    return {
      success: false,
      error: "Erro interno do servidor",
    };
  }
}

/**
 * Server Action para buscar horários disponíveis de barbeiro
 */
export async function getBarberAvailableSlots(data: { barberId: string; date: Date; serviceDuration: number }) {
  try {
    const slots = await UserService.getBarberAvailableSlots(data.barberId, data.date, data.serviceDuration);

    return {
      success: true,
      data: slots,
    };
  } catch (error) {
    console.error("Erro ao buscar horários disponíveis:", error);
    return {
      success: false,
      error: "Erro interno do servidor",
    };
  }
}

/**
 * Server Action para criar um novo usuário
 */
export async function createUser(data: UserFormInputType) {
  try {
    const { session, error } = await requireAdminSession();

    if (!session) {
      return {
        success: false,
        error,
      };
    }

    // Validar dados de entrada e definir role padrão se não fornecido
    const validatedData = UserInput.parse({
      ...data,
      role: data.role || "CLIENT",
      isActive: data.isActive ?? true,
    });

    // Verificar se o email já está em uso
    const existingUser = await db.user.findUnique({
      where: { email: validatedData.email },
    });

    if (existingUser) {
      return {
        success: false,
        error:
          existingUser.deletedAt !== null
            ? "Já existe um usuário removido com este email. Restaure-o ou use outro email."
            : "Este email já está em uso.",
      };
    }

    // Hash da senha se fornecida
    let hashedPassword: string | null = null;
    if (validatedData.password) {
      hashedPassword = await bcrypt.hash(validatedData.password, 12);
    }

    // Criar usuário
    const user = await db.user.create({
      data: {
        name: validatedData.name,
        nickname: validatedData.nickname,
        email: validatedData.email,
        password: hashedPassword,
        role: validatedData.role,
        isActive: validatedData.isActive ?? true,
        phone: validatedData.phone,
        updatedById: session.user.id,
      },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        isActive: true,
        createdAt: true,
        updatedAt: true,
        deletedAt: true,
      },
    });

    logger.info("User created", {
      actorId: session.user.id,
      userId: user.id,
      role: user.role,
    });

    revalidatePath("/dashboard/admin/users");

    return {
      success: true,
      data: user,
    };
  } catch (error) {
    console.error("Erro ao criar usuário:", error);
    return {
      success: false,
      error: "Erro interno do servidor",
    };
  }
}

/**
 * Server Action para atualizar um usuário
 */
export async function updateUser(updateData: UserUpdateInputType) {
  try {
    const { session, error } = await requireAdminSession();

    if (!session) {
      return {
        success: false,
        error,
      };
    }

    const { id, ...data } = UserUpdateInput.parse(updateData);

    // Verificar se o usuário existe
    const existingUser = await db.user.findUnique({
      where: { id },
    });

    if (!existingUser) {
      return {
        success: false,
        error: "Usuário não encontrado.",
      };
    }

    if (existingUser.deletedAt) {
      return {
        success: false,
        error: "Usuário está removido. Restaure-o antes de editar.",
      };
    }

    // Se o email está sendo alterado, verificar se não está em uso
    if (data.email && data.email !== existingUser.email) {
      const emailInUse = await db.user.findFirst({
        where: { email: data.email, id: { not: id } },
      });

      if (emailInUse) {
        return {
          success: false,
          error:
            emailInUse.deletedAt !== null
              ? "Já existe um usuário removido com este email. Restaure-o ou use outro email."
              : "Este email já está em uso.",
        };
      }
    }

    // Preparar dados para atualização
    const updatePayload: any = {};
    if (data.name) updatePayload.name = data.name;
    if (data.nickname !== undefined) updatePayload.nickname = data.nickname;
    if (data.email) updatePayload.email = data.email;
    if (data.role) updatePayload.role = data.role;
    if (data.isActive !== undefined) updatePayload.isActive = data.isActive;
    if (data.phone !== undefined) updatePayload.phone = data.phone;

    // Hash da nova senha se fornecida
    if (data.password) {
      updatePayload.password = await bcrypt.hash(data.password, 12);
    }
    updatePayload.updatedById = session.user.id;

    // Atualizar usuário
    const user = await db.user.update({
      where: { id },
      data: updatePayload,
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        isActive: true,
        deletedAt: true,
        updatedById: true,
        deletedById: true,
        createdAt: true,
        updatedAt: true,
      },
    });

    logger.info("User updated", {
      actorId: session.user.id,
      userId: id,
      role: user.role,
    });

    revalidatePath("/dashboard/admin/users");
    revalidatePath(`/dashboard/admin/users/${id}`);

    return {
      success: true,
      data: user,
    };
  } catch (error) {
    console.error("Erro ao atualizar usuário:", error);
    return {
      success: false,
      error: "Erro interno do servidor",
    };
  }
}
