"use server";

import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { UserFiltersSchema, type UserFiltersInput } from "@/schemas/userSchemas";
import { UserService } from "./services/userService";

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