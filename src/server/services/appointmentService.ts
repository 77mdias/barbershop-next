import { db } from "@/lib/prisma";
import { AppointmentStatus, Prisma } from "@prisma/client";
import type {
  CreateAppointmentInput,
  UpdateAppointmentInput,
  AppointmentFiltersInput,
} from "@/schemas/appointmentSchemas";

export interface AppointmentWithDetails {
  id: string;
  date: Date;
  status: AppointmentStatus;
  notes: string | null;
  createdAt: Date;
  updatedAt: Date;
  service: {
    id: string;
    name: string;
    duration: number;
    price: Prisma.Decimal;
  };
  barber: {
    id: string;
    name: string | null;
    email: string;
    image: string | null;
  };
  user: {
    id: string;
    name: string;
    email: string;
    image: string | null;
  };
  voucher?: {
    id: string;
    code: string;
    type: string;
    value: Prisma.Decimal;
  } | null;
}

export class AppointmentService {
  /**
   * Criar novo agendamento
   */
  static async create(
    userId: string,
    data: CreateAppointmentInput
  ): Promise<AppointmentWithDetails> {
    const appointment = await db.appointment.create({
      data: {
        userId,
        serviceId: data.serviceId,
        barberId: data.barberId,
        date: data.date,
        notes: data.notes,
        voucherId: data.voucherId,
        appliedPromotionId: data.appliedPromotionId,
      },
      include: {
        service: {
          select: {
            id: true,
            name: true,
            duration: true,
            price: true,
          },
        },
        barber: {
          select: {
            id: true,
            name: true,
            email: true,
            image: true,
          },
        },
        user: {
          select: {
            id: true,
            name: true,
            email: true,
            image: true,
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
      },
    });

    return appointment;
  }

  /**
   * Buscar agendamento por ID
   */
  static async findById(id: string): Promise<AppointmentWithDetails | null> {
    return await db.appointment.findUnique({
      where: { id },
      include: {
        service: {
          select: {
            id: true,
            name: true,
            duration: true,
            price: true,
          },
        },
        barber: {
          select: {
            id: true,
            name: true,
            email: true,
            image: true,
          },
        },
        user: {
          select: {
            id: true,
            name: true,
            email: true,
            image: true,
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
      },
    });
  }

  /**
   * Atualizar agendamento
   */
  static async update(
    id: string,
    data: UpdateAppointmentInput
  ): Promise<AppointmentWithDetails> {
    return await db.appointment.update({
      where: { id },
      data,
      include: {
        service: {
          select: {
            id: true,
            name: true,
            duration: true,
            price: true,
          },
        },
        barber: {
          select: {
            id: true,
            name: true,
            email: true,
            image: true,
          },
        },
        user: {
          select: {
            id: true,
            name: true,
            email: true,
            image: true,
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
      },
    });
  }

  /**
   * Listar agendamentos com filtros
   */
  static async findMany(
    filters: AppointmentFiltersInput & { userId?: string }
  ) {
    const where: Prisma.AppointmentWhereInput = {};

    if (filters.userId) where.userId = filters.userId;
    if (filters.status) where.status = filters.status;
    if (filters.serviceId) where.serviceId = filters.serviceId;
    if (filters.barberId) where.barberId = filters.barberId;
    if (filters.startDate || filters.endDate) {
      where.date = {};
      if (filters.startDate) where.date.gte = filters.startDate;
      if (filters.endDate) where.date.lte = filters.endDate;
    }

    const page = filters.page || 1;
    const limit = filters.limit || 10;

    const [appointments, total] = await Promise.all([
      db.appointment.findMany({
        where,
        include: {
          service: {
            select: {
              id: true,
              name: true,
              duration: true,
              price: true,
            },
          },
          barber: {
            select: {
              id: true,
              name: true,
              email: true,
              image: true,
            },
          },
          user: {
            select: {
              id: true,
              name: true,
              email: true,
              image: true,
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
        },
        orderBy: [{ date: "desc" }, { createdAt: "desc" }],
        skip: (page - 1) * limit,
        take: limit,
      }),
      db.appointment.count({ where }),
    ]);

    return {
      appointments,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  /**
   * Verificar disponibilidade de horário
   */
  static async checkAvailability(
    barberId: string,
    date: Date,
    serviceId: string,
    excludeAppointmentId?: string
  ): Promise<boolean> {
    // Buscar duração do serviço
    const service = await db.service.findUnique({
      where: { id: serviceId },
      select: { duration: true },
    });

    if (!service) {
      throw new Error("Serviço não encontrado");
    }

    const endTime = new Date(date.getTime() + service.duration * 60000);

    // Verificar conflitos
    const where: Prisma.AppointmentWhereInput = {
      barberId,
      status: {
        in: ["SCHEDULED", "CONFIRMED"],
      },
      OR: [
        {
          // Agendamento que começa antes e termina depois do início
          date: { lte: date },
          // Precisamos calcular o fim baseado na duração do serviço
        },
        {
          // Agendamento que começa antes do fim do novo agendamento
          date: { lt: endTime },
        },
      ],
    };

    if (excludeAppointmentId) {
      where.id = { not: excludeAppointmentId };
    }

    const conflictingAppointments = await db.appointment.findMany({
      where,
      include: {
        service: {
          select: { duration: true },
        },
      },
    });

    // Verificar se há sobreposição real de horários
    for (const appointment of conflictingAppointments) {
      const appointmentEnd = new Date(
        appointment.date.getTime() + appointment.service.duration * 60000
      );

      // Verifica sobreposição
      if (
        (date >= appointment.date && date < appointmentEnd) ||
        (endTime > appointment.date && endTime <= appointmentEnd) ||
        (date <= appointment.date && endTime >= appointmentEnd)
      ) {
        return false;
      }
    }

    return true;
  }

  /**
   * Cancelar agendamento
   */
  static async cancel(id: string): Promise<AppointmentWithDetails> {
    return await this.update(id, { status: "CANCELLED" });
  }

  /**
   * Confirmar agendamento
   */
  static async confirm(id: string): Promise<AppointmentWithDetails> {
    return await this.update(id, { status: "CONFIRMED" });
  }

  /**
   * Completar agendamento
   */
  static async complete(id: string): Promise<AppointmentWithDetails> {
    return await this.update(id, { status: "COMPLETED" });
  }

  /**
   * Buscar agendamentos do usuário
   */
  static async findUserAppointments(
    userId: string,
    filters?: Omit<AppointmentFiltersInput, "userId">
  ) {
    const mergedFilters = {
      page: 1,
      limit: 10,
      ...filters,
      userId,
    };
    return await this.findMany(mergedFilters);
  }

  /**
   * Buscar agendamentos do barbeiro
   */
  static async findBarberAppointments(
    barberId: string,
    filters?: Omit<AppointmentFiltersInput, "barberId">
  ) {
    const mergedFilters = {
      page: 1,
      limit: 10,
      ...filters,
      barberId,
    };
    return await this.findMany(mergedFilters);
  }

  /**
   * Verificar se usuário pode agendar (regras de negócio)
   */
  static async canUserSchedule(userId: string): Promise<{
    canSchedule: boolean;
    reason?: string;
  }> {
    // Verificar se há agendamentos pendentes demais
    const pendingAppointments = await db.appointment.count({
      where: {
        userId,
        status: {
          in: ["SCHEDULED", "CONFIRMED"],
        },
        date: {
          gte: new Date(),
        },
      },
    });

    if (pendingAppointments >= 3) {
      return {
        canSchedule: false,
        reason: "Você já possui o máximo de agendamentos permitidos (3)",
      };
    }

    return { canSchedule: true };
  }
}
