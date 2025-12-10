"use server";

import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { UserFiltersSchema, type UserFiltersInput, UserInput, type UserInputType, type UserFormInputType } from "@/schemas/userSchemas";
import { UserService } from "./services/userService";
import { db } from "@/lib/prisma";
import bcrypt from "bcryptjs";

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
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.id) {
      return {
        success: false,
        error: "Usuário não autenticado",
      };
    }

    // Apenas admin pode listar usuários
    if (session.user.role !== "ADMIN") {
      return {
        success: false,
        error: "Sem permissão para listar usuários",
      };
    }

    const validatedFilters = filters ? UserFiltersSchema.parse(filters) : {
      page: 1,
      limit: 20
    };

    const result = await UserService.findMany(validatedFilters);

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

    const user = await UserService.findById(id);

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
    const canView = 
      session.user.id === targetUserId || 
      session.user.role === "ADMIN";
    
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
export async function checkBarberAvailability(data: {
  barberId: string;
  date: Date;
  duration: number;
}) {
  try {
    const isAvailable = await UserService.isBarberAvailable(
      data.barberId,
      data.date,
      data.duration
    );

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
export async function getBarberAvailableSlots(data: {
  barberId: string;
  date: Date;
  serviceDuration: number;
}) {
  try {
    const slots = await UserService.getBarberAvailableSlots(
      data.barberId,
      data.date,
      data.serviceDuration
    );

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
    const session = await getServerSession(authOptions);
    
    if (!session?.user || session.user.role !== "ADMIN") {
      return {
        success: false,
        error: "Acesso negado. Apenas administradores podem criar usuários.",
      };
    }

    // Validar dados de entrada e definir role padrão se não fornecido
    const validatedData = UserInput.parse({
      ...data,
      role: data.role || "CLIENT"
    });

    // Verificar se o email já está em uso
    const existingUser = await db.user.findUnique({
      where: { email: validatedData.email },
    });

    if (existingUser) {
      return {
        success: false,
        error: "Este email já está em uso.",
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
      },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        isActive: true,
        createdAt: true,
        updatedAt: true,
      },
    });

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
export async function updateUser(updateData: { id: string } & Partial<UserInputType>) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user || session.user.role !== "ADMIN") {
      return {
        success: false,
        error: "Acesso negado. Apenas administradores podem atualizar usuários.",
      };
    }

    const { id, ...data } = updateData;

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

    // Se o email está sendo alterado, verificar se não está em uso
    if (data.email && data.email !== existingUser.email) {
      const emailInUse = await db.user.findUnique({
        where: { email: data.email },
      });

      if (emailInUse) {
        return {
          success: false,
          error: "Este email já está em uso.",
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

    // Hash da nova senha se fornecida
    if (data.password) {
      updatePayload.password = await bcrypt.hash(data.password, 12);
    }

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
        createdAt: true,
        updatedAt: true,
      },
    });

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