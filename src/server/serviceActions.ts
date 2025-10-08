"use server";

import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { ServiceFiltersSchema, type ServiceFiltersInput } from "@/schemas/serviceSchemas";
import { ServiceService } from "./services/serviceService";
import { UserService } from "./services/userService";
import { serializeServicesResult, serializeServices, serializeService } from "@/lib/serializers";

/**
 * Server Action para buscar serviços disponíveis
 */
export async function getServices(filters?: Partial<ServiceFiltersInput>) {
  try {
    const validatedFilters = filters ? ServiceFiltersSchema.parse(filters) : {
      active: true,
      page: 1,
      limit: 50
    };

    const result = await ServiceService.findMany(validatedFilters);

    return {
      success: true,
      data: serializeServicesResult(result),
    };
  } catch (error) {
    console.error("Erro ao buscar serviços:", error);
    return {
      success: false,
      error: "Erro interno do servidor",
    };
  }
}

/**
 * Server Action para buscar serviços ativos (para formulários)
 */
export async function getActiveServices() {
  try {
    const services = await ServiceService.findActive();

    return {
      success: true,
      data: serializeServices(services),
    };
  } catch (error) {
    console.error("Erro ao buscar serviços ativos:", error);
    return {
      success: false,
      error: "Erro interno do servidor",
    };
  }
}

/**
 * Server Action para buscar serviço por ID
 */
export async function getServiceById(id: string) {
  try {
    const service = await ServiceService.findById(id);

    if (!service) {
      return {
        success: false,
        error: "Serviço não encontrado",
      };
    }

    return {
      success: true,
      data: serializeService(service),
    };
  } catch (error) {
    console.error("Erro ao buscar serviço:", error);
    return {
      success: false,
      error: "Erro interno do servidor",
    };
  }
}

/**
 * Server Action para verificar disponibilidade de um serviço para uma data
 */
export async function checkServiceAvailability(serviceId: string, date: Date) {
  try {
    const availableSlots = await ServiceService.checkAvailabilityForDate(serviceId, date);

    return {
      success: true,
      data: availableSlots,
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
 * Server Action para buscar estatísticas de um serviço (admin/barber)
 */
export async function getServiceStats(serviceId: string) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.id) {
      return {
        success: false,
        error: "Usuário não autenticado",
      };
    }

    // Apenas admin ou barbeiro podem ver estatísticas
    if (!["ADMIN", "BARBER"].includes(session.user.role)) {
      return {
        success: false,
        error: "Sem permissão para visualizar estatísticas",
      };
    }

    const stats = await ServiceService.getServiceStats(serviceId);

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
 * Server Action para buscar serviços populares
 */
export async function getPopularServices(limit: number = 5) {
  try {
    const services = await ServiceService.findPopular(limit);

    return {
      success: true,
      data: services,
    };
  } catch (error) {
    console.error("Erro ao buscar serviços populares:", error);
    return {
      success: false,
      error: "Erro interno do servidor",
    };
  }
}

/**
 * Server Action para buscar serviços com promoções ativas
 */
export async function getServicesWithPromotions() {
  try {
    const services = await ServiceService.findWithActivePromotions();

    return {
      success: true,
      data: services,
    };
  } catch (error) {
    console.error("Erro ao buscar serviços com promoções:", error);
    return {
      success: false,
      error: "Erro interno do servidor",
    };
  }
}