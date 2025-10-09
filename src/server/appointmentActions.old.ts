"use server";

import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { revalidatePath } from "next/cache";
import { db } from "@/lib/prisma";
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

    // Verificar se o serviço existe e está ativo
    const service = await db.service.findUnique({
      where: { id: validatedData.serviceId, active: true },
    });

    if (!service) {
      return {
        success: false,
        error: "Serviço não encontrado ou inativo",
      };
    }

    // Verificar se o barbeiro existe e é ativo
    const barber = await db.user.findUnique({
      where: { 
        id: validatedData.barberId,
        role: "BARBER",
        isActive: true,
      },
    });

    if (!barber) {
      return {
        success: false,
        error: "Barbeiro não encontrado ou inativo",
      };
    }

    // Verificar disponibilidade do horário
    const conflictingAppointment = await db.appointment.findFirst({
      where: {
        barberId: validatedData.barberId,
        date: validatedData.date,
        status: {
          in: ["SCHEDULED", "CONFIRMED"],
        },
      },
    });

    if (conflictingAppointment) {
      return {
        success: false,
        error: "Horário já ocupado",
      };
    }

    // Verificar voucher se fornecido
    if (validatedData.voucherId) {
      const voucher = await db.voucher.findUnique({
        where: {
          id: validatedData.voucherId,
          userId: session.user.id,
          status: "ACTIVE",
        },
      });

      if (!voucher) {
        return {
          success: false,
          error: "Voucher inválido",
        };
      }

      // Verificar se o voucher é válido para a data
      const now = new Date();
      if (voucher.validUntil && voucher.validUntil < now) {
        return {
          success: false,
          error: "Voucher expirado",
        };
      }
    }

    // Usar transação para criar agendamento
    const appointment = await db.$transaction(async (tx) => {
      // Criar o agendamento
      const newAppointment = await tx.appointment.create({
        data: {
          ...validatedData,
          userId: session.user.id,
        },
        include: {
          service: true,
          barber: {
            select: {
              id: true,
              name: true,
              image: true,
              phone: true,
            },
          },
          voucher: true,
          appliedPromotion: true,
        },
      });

      // Se houver voucher, marcar como usado
      if (validatedData.voucherId) {
        await tx.voucher.update({
          where: { id: validatedData.voucherId },
          data: { status: "USED" },
        });
      }

      return newAppointment;
    });

    // Revalidar páginas relacionadas
    revalidatePath("/scheduling");
    revalidatePath("/scheduling/manage");
    revalidatePath("/profile");

    return {
      success: true,
      data: appointment,
    };

  } catch (error) {
    console.error("Erro ao criar agendamento:", error);
    
    if (error instanceof Error && error.name === "ZodError") {
      return {
        success: false,
        error: "Dados inválidos",
        details: error.message,
      };
    }

    return {
      success: false,
      error: "Erro interno do servidor",
    };
  }
}

/**
 * Server Action para buscar agendamentos do usuário
 */
export async function getUserAppointments(filters?: AppointmentFiltersInput) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.id) {
      return {
        success: false,
        error: "Usuário não autenticado",
      };
    }

    const validatedFilters = filters ? AppointmentFiltersSchema.parse(filters) : {
      page: 1,
      limit: 10
    };
    
    const where: any = {
      userId: session.user.id,
    };

    if (validatedFilters.status) where.status = validatedFilters.status;
    if (validatedFilters.serviceId) where.serviceId = validatedFilters.serviceId;
    if (validatedFilters.barberId) where.barberId = validatedFilters.barberId;
    if (validatedFilters.startDate || validatedFilters.endDate) {
      where.date = {};
      if (validatedFilters.startDate) where.date.gte = validatedFilters.startDate;
      if (validatedFilters.endDate) where.date.lte = validatedFilters.endDate;
    }

    const page = validatedFilters.page || 1;
    const limit = validatedFilters.limit || 10;

    const [appointments, total] = await Promise.all([
      db.appointment.findMany({
        where,
        include: {
          service: {
            select: {
              id: true,
              name: true,
              description: true,
              duration: true,
              price: true,
            },
          },
          barber: {
            select: {
              id: true,
              name: true,
              image: true,
              phone: true,
            },
          },
          voucher: {
            select: {
              id: true,
              code: true,
              type: true,
              value: true,
            },
          },
          appliedPromotion: {
            select: {
              id: true,
              name: true,
              type: true,
              value: true,
            },
          },
        },
        orderBy: {
          date: 'desc',
        },
        skip: (page - 1) * limit,
        take: limit,
      }),
      db.appointment.count({ where }),
    ]);

    return {
      success: true,
      data: {
        appointments,
        pagination: {
          page,
          limit,
          total,
          totalPages: Math.ceil(total / limit),
        },
      },
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
 * Server Action para atualizar agendamento
 */
export async function updateAppointment(
  appointmentId: string, 
  data: UpdateAppointmentInput
) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.id) {
      return {
        success: false,
        error: "Usuário não autenticado",
      };
    }

    const validatedData = UpdateAppointmentSchema.parse(data);

    // Verificar se o agendamento existe e pertence ao usuário
    const existingAppointment = await db.appointment.findUnique({
      where: {
        id: appointmentId,
        userId: session.user.id,
      },
    });

    if (!existingAppointment) {
      return {
        success: false,
        error: "Agendamento não encontrado",
      };
    }

    // Verificar se pode ser alterado (regras de negócio)
    const now = new Date();
    const appointmentDate = new Date(existingAppointment.date);
    const hoursUntilAppointment = (appointmentDate.getTime() - now.getTime()) / (1000 * 60 * 60);

    // Não pode alterar agendamentos com menos de 2 horas
    if (hoursUntilAppointment < 2 && validatedData.date) {
      return {
        success: false,
        error: "Não é possível reagendar com menos de 2 horas de antecedência",
      };
    }

    // Se mudando data, verificar disponibilidade
    if (validatedData.date && validatedData.barberId) {
      const conflictingAppointment = await db.appointment.findFirst({
        where: {
          barberId: validatedData.barberId,
          date: validatedData.date,
          status: {
            in: ["SCHEDULED", "CONFIRMED"],
          },
          id: {
            not: appointmentId,
          },
        },
      });

      if (conflictingAppointment) {
        return {
          success: false,
          error: "Horário já ocupado",
        };
      }
    }

    // Atualizar agendamento
    const updatedAppointment = await db.appointment.update({
      where: { id: appointmentId },
      data: validatedData,
      include: {
        service: true,
        barber: {
          select: {
            id: true,
            name: true,
            image: true,
            phone: true,
          },
        },
        voucher: true,
        appliedPromotion: true,
      },
    });

    // Revalidar páginas
    revalidatePath("/scheduling");
    revalidatePath("/scheduling/manage");

    return {
      success: true,
      data: updatedAppointment,
    };

  } catch (error) {
    console.error("Erro ao atualizar agendamento:", error);
    
    if (error instanceof Error && error.name === "ZodError") {
      return {
        success: false,
        error: "Dados inválidos",
        details: error.message,
      };
    }

    return {
      success: false,
      error: "Erro interno do servidor",
    };
  }
}

/**
 * Server Action para cancelar agendamento
 */
export async function cancelAppointment(appointmentId: string, reason?: string) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.id) {
      return {
        success: false,
        error: "Usuário não autenticado",
      };
    }

    // Verificar se o agendamento existe e pertence ao usuário
    const existingAppointment = await db.appointment.findUnique({
      where: {
        id: appointmentId,
        userId: session.user.id,
      },
      include: {
        voucher: true,
      },
    });

    if (!existingAppointment) {
      return {
        success: false,
        error: "Agendamento não encontrado",
      };
    }

    // Verificar se pode ser cancelado
    if (existingAppointment.status === "COMPLETED") {
      return {
        success: false,
        error: "Não é possível cancelar agendamento já concluído",
      };
    }

    if (existingAppointment.status === "CANCELLED") {
      return {
        success: false,
        error: "Agendamento já está cancelado",
      };
    }

    // Verificar tempo para cancelamento (regra de negócio)
    const now = new Date();
    const appointmentDate = new Date(existingAppointment.date);
    const hoursUntilAppointment = (appointmentDate.getTime() - now.getTime()) / (1000 * 60 * 60);

    // Usar transação para cancelar
    const result = await db.$transaction(async (tx) => {
      // Marcar como cancelado
      const cancelledAppointment = await tx.appointment.update({
        where: { id: appointmentId },
        data: { 
          status: "CANCELLED",
          notes: existingAppointment.notes 
            ? `${existingAppointment.notes}\n[CANCELADO: ${reason || 'Sem motivo especificado'}]`
            : `[CANCELADO: ${reason || 'Sem motivo especificado'}]`
        },
      });

      // Se cancelado com mais de 2 horas de antecedência, devolver voucher
      if (hoursUntilAppointment >= 2 && existingAppointment.voucher) {
        await tx.voucher.update({
          where: { id: existingAppointment.voucher.id },
          data: { status: "ACTIVE" },
        });
      }

      return {
        appointment: cancelledAppointment,
        voucherRestored: hoursUntilAppointment >= 2 && !!existingAppointment.voucher,
      };
    });

    // Revalidar páginas
    revalidatePath("/scheduling");
    revalidatePath("/scheduling/manage");

    return {
      success: true,
      data: result,
      message: "Agendamento cancelado com sucesso",
    };

  } catch (error) {
    console.error("Erro ao cancelar agendamento:", error);
    return {
      success: false,
      error: "Erro interno do servidor",
    };
  }
}