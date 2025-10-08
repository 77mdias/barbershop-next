"use server";

import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { revalidatePath } from "next/cache";
import { 
  CreateAppointmentSchema,
  UpdateAppointmentSchema,
  AppointmentFiltersSchema,
  CheckAvailabilitySchema,
  type CreateAppointmentInput,
  type UpdateAppointmentInput,
  type AppointmentFiltersInput,
} from "@/schemas/appointmentSchemas";
import { AppointmentService } from "./services/appointmentService";
import { ServiceService } from "./services/serviceService";
import { UserService } from "./services/userService";
import { serializeAppointment, serializeAppointmentsResult } from "@/lib/serializers";

/**
 * Server Action para criar um novo agendamento
 */
export async function createAppointment(data: CreateAppointmentInput) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.id) {
      return {
        success: false,
        error: "Usuário não autenticado",
      };
    }

    // Validar dados
    const validatedData = CreateAppointmentSchema.parse(data);

    // Verificar se o usuário pode agendar
    const canSchedule = await AppointmentService.canUserSchedule(session.user.id);
    if (!canSchedule.canSchedule) {
      return {
        success: false,
        error: canSchedule.reason,
      };
    }

    // Verificar se o serviço existe e está ativo
    const serviceExists = await ServiceService.isActive(validatedData.serviceId);
    if (!serviceExists) {
      return {
        success: false,
        error: "Serviço não encontrado ou inativo",
      };
    }

    // Verificar se o barbeiro existe e é ativo
    const barberExists = await UserService.isActiveBarber(validatedData.barberId);
    if (!barberExists) {
      return {
        success: false,
        error: "Barbeiro não encontrado ou inativo",
      };
    }

    // Verificar disponibilidade do horário
    const isAvailable = await AppointmentService.checkAvailability(
      validatedData.barberId,
      validatedData.date,
      validatedData.serviceId
    );

    if (!isAvailable) {
      return {
        success: false,
        error: "Horário não disponível",
      };
    }

    // Criar o agendamento
    const appointment = await AppointmentService.create(session.user.id, validatedData);

    revalidatePath("/scheduling");
    revalidatePath("/profile");

    return {
      success: true,
      data: serializeAppointment(appointment),
    };
  } catch (error) {
    console.error("Erro ao criar agendamento:", error);
    return {
      success: false,
      error: "Erro interno do servidor",
    };
  }
}

/**
 * Server Action para buscar agendamentos com filtros
 */
export async function getAppointments(filters: AppointmentFiltersInput) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.id) {
      return {
        success: false,
        error: "Usuário não autenticado",
      };
    }

    // Validar filtros
    const validatedFilters = AppointmentFiltersSchema.parse(filters);

    let result;
    
    // Se for barbeiro, buscar agendamentos que ele executa
    if (session.user.role === "BARBER") {
      result = await AppointmentService.findBarberAppointments(
        session.user.id,
        validatedFilters
      );
    } else {
      // Cliente vê apenas seus próprios agendamentos
      result = await AppointmentService.findUserAppointments(
        session.user.id,
        validatedFilters
      );
    }

    return {
      success: true,
      data: serializeAppointmentsResult(result),
    };
  } catch (error) {
    console.error("Erro ao buscar agendamentos:", error);
    return {
      success: false,
      error: "Erro interno do servidor",
    };
  }
}

/**
 * Server Action para buscar agendamento por ID
 */
export async function getAppointmentById(id: string) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.id) {
      return {
        success: false,
        error: "Usuário não autenticado",
      };
    }

    const appointment = await AppointmentService.findById(id);

    if (!appointment) {
      return {
        success: false,
        error: "Agendamento não encontrado",
      };
    }

    // Verificar se o usuário tem permissão para ver este agendamento
    const hasPermission = 
      appointment.user.id === session.user.id || 
      appointment.barber.id === session.user.id ||
      session.user.role === "ADMIN";

    if (!hasPermission) {
      return {
        success: false,
        error: "Sem permissão para visualizar este agendamento",
      };
    }

    return {
      success: true,
      data: serializeAppointment(appointment),
    };
  } catch (error) {
    console.error("Erro ao buscar agendamento:", error);
    return {
      success: false,
      error: "Erro interno do servidor",
    };
  }
}

/**
 * Server Action para atualizar agendamento
 */
export async function updateAppointment(id: string, data: UpdateAppointmentInput) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.id) {
      return {
        success: false,
        error: "Usuário não autenticado",
      };
    }

    // Validar dados
    const validatedData = UpdateAppointmentSchema.parse(data);

    // Buscar agendamento atual
    const existingAppointment = await AppointmentService.findById(id);
    
    if (!existingAppointment) {
      return {
        success: false,
        error: "Agendamento não encontrado",
      };
    }

    // Verificar permissões
    const canUpdate = 
      existingAppointment.user.id === session.user.id || 
      existingAppointment.barber.id === session.user.id ||
      session.user.role === "ADMIN";

    if (!canUpdate) {
      return {
        success: false,
        error: "Sem permissão para atualizar este agendamento",
      };
    }

    // Se mudando data ou barbeiro, verificar disponibilidade
    if (validatedData.date || validatedData.barberId) {
      const newDate = validatedData.date || existingAppointment.date;
      const newBarberId = validatedData.barberId || existingAppointment.barber.id;
      
      if (newBarberId) {
        const isAvailable = await AppointmentService.checkAvailability(
          newBarberId,
          newDate,
          existingAppointment.service.id,
          id // excluir o agendamento atual da verificação
        );

        if (!isAvailable) {
          return {
            success: false,
            error: "Horário não disponível",
          };
        }
      }
    }

    const updatedAppointment = await AppointmentService.update(id, validatedData);

    revalidatePath("/scheduling");
    revalidatePath("/profile");

    return {
      success: true,
      data: updatedAppointment,
    };
  } catch (error) {
    console.error("Erro ao atualizar agendamento:", error);
    return {
      success: false,
      error: "Erro interno do servidor",
    };
  }
}

/**
 * Server Action para cancelar agendamento
 */
export async function cancelAppointment(id: string) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.id) {
      return {
        success: false,
        error: "Usuário não autenticado",
      };
    }

    const existingAppointment = await AppointmentService.findById(id);
    
    if (!existingAppointment) {
      return {
        success: false,
        error: "Agendamento não encontrado",
      };
    }

    // Verificar permissões
    const canCancel = 
      existingAppointment.user.id === session.user.id || 
      existingAppointment.barber.id === session.user.id ||
      session.user.role === "ADMIN";

    if (!canCancel) {
      return {
        success: false,
        error: "Sem permissão para cancelar este agendamento",
      };
    }

    // Verificar se pode ser cancelado (não pode cancelar agendamentos completados)
    if (existingAppointment.status === "COMPLETED") {
      return {
        success: false,
        error: "Não é possível cancelar agendamento já completado",
      };
    }

    const cancelledAppointment = await AppointmentService.cancel(id);

    revalidatePath("/scheduling");
    revalidatePath("/profile");

    return {
      success: true,
      data: cancelledAppointment,
    };
  } catch (error) {
    console.error("Erro ao cancelar agendamento:", error);
    return {
      success: false,
      error: "Erro interno do servidor",
    };
  }
}

/**
 * Server Action para confirmar agendamento (barbeiro)
 */
export async function confirmAppointment(id: string) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.id) {
      return {
        success: false,
        error: "Usuário não autenticado",
      };
    }

    const existingAppointment = await AppointmentService.findById(id);
    
    if (!existingAppointment) {
      return {
        success: false,
        error: "Agendamento não encontrado",
      };
    }

    // Apenas barbeiro pode confirmar
    const canConfirm = 
      existingAppointment.barber.id === session.user.id ||
      session.user.role === "ADMIN";

    if (!canConfirm) {
      return {
        success: false,
        error: "Apenas o barbeiro pode confirmar o agendamento",
      };
    }

    const confirmedAppointment = await AppointmentService.confirm(id);

    revalidatePath("/scheduling");
    revalidatePath("/profile");

    return {
      success: true,
      data: confirmedAppointment,
    };
  } catch (error) {
    console.error("Erro ao confirmar agendamento:", error);
    return {
      success: false,
      error: "Erro interno do servidor",
    };
  }
}

/**
 * Server Action para completar agendamento (barbeiro)
 */
export async function completeAppointment(id: string) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.id) {
      return {
        success: false,
        error: "Usuário não autenticado",
      };
    }

    const existingAppointment = await AppointmentService.findById(id);
    
    if (!existingAppointment) {
      return {
        success: false,
        error: "Agendamento não encontrado",
      };
    }

    // Apenas barbeiro pode completar
    const canComplete = 
      existingAppointment.barber.id === session.user.id ||
      session.user.role === "ADMIN";

    if (!canComplete) {
      return {
        success: false,
        error: "Apenas o barbeiro pode completar o agendamento",
      };
    }

    const completedAppointment = await AppointmentService.complete(id);

    revalidatePath("/scheduling");
    revalidatePath("/profile");

    return {
      success: true,
      data: completedAppointment,
    };
  } catch (error) {
    console.error("Erro ao completar agendamento:", error);
    return {
      success: false,
      error: "Erro interno do servidor",
    };
  }
}

/**
 * Server Action para verificar disponibilidade
 */
export async function checkAvailability(data: {
  barberId: string;
  date: Date;
  serviceId: string;
}) {
  try {
    const validatedData = CheckAvailabilitySchema.parse(data);
    
    const isAvailable = await AppointmentService.checkAvailability(
      validatedData.barberId!,
      validatedData.date,
      validatedData.serviceId!
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
 * Server Action para buscar horários disponíveis
 */
export async function getAvailableSlots(data: {
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