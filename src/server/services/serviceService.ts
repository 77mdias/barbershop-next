import { db } from "@/lib/prisma";
import { Prisma } from "@prisma/client";
import type { ServiceFiltersInput } from "@/schemas/serviceSchemas";

export interface ServiceWithStats {
  id: string;
  name: string;
  description: string | null;
  duration: number;
  price: Prisma.Decimal;
  active: boolean;
  createdAt: Date;
  updatedAt: Date;
  _count?: {
    appointments: number;
  };
}

export class ServiceService {
  /**
   * Buscar todos os serviços com filtros
   */
  static async findMany(filters: Partial<ServiceFiltersInput> = {}) {
    const where: Prisma.ServiceWhereInput = {};

    if (filters.active !== undefined) where.active = filters.active;
    if (filters.search) {
      where.OR = [
        { name: { contains: filters.search, mode: "insensitive" } },
        { description: { contains: filters.search, mode: "insensitive" } },
      ];
    }
    if (filters.minPrice || filters.maxPrice) {
      where.price = {};
      if (filters.minPrice) where.price.gte = filters.minPrice;
      if (filters.maxPrice) where.price.lte = filters.maxPrice;
    }
    if (filters.maxDuration) {
      where.duration = { lte: filters.maxDuration };
    }

    const page = filters.page || 1;
    const limit = filters.limit || 50;

    const [services, total] = await Promise.all([
      db.service.findMany({
        where,
        include: {
          _count: {
            select: {
              appointments: true,
            },
          },
        },
        orderBy: [{ active: "desc" }, { name: "asc" }],
        skip: (page - 1) * limit,
        take: limit,
      }),
      db.service.count({ where }),
    ]);

    return {
      services,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  /**
   * Buscar serviço por ID
   */
  static async findById(id: string): Promise<ServiceWithStats | null> {
    return await db.service.findUnique({
      where: { id },
      include: {
        _count: {
          select: {
            appointments: true,
          },
        },
      },
    });
  }

  /**
   * Buscar apenas serviços ativos (para formulários de agendamento)
   */
  static async findActive(): Promise<ServiceWithStats[]> {
    const result = await this.findMany({ active: true, limit: 100, page: 1 });
    return result.services;
  }

  /**
   * Verificar se serviço existe e está ativo
   */
  static async isActive(id: string): Promise<boolean> {
    const service = await db.service.findUnique({
      where: { id, active: true },
      select: { id: true },
    });
    return !!service;
  }

  /**
   * Calcular estatísticas do serviço
   */
  static async getServiceStats(serviceId: string) {
    const [
      totalAppointments,
      completedAppointments,
      cancelledAppointments,
      averageRating,
      recentAppointments,
    ] = await Promise.all([
      // Total de agendamentos
      db.appointment.count({
        where: { serviceId },
      }),

      // Agendamentos completados
      db.appointment.count({
        where: { serviceId, status: "COMPLETED" },
      }),

      // Agendamentos cancelados
      db.appointment.count({
        where: { serviceId, status: "CANCELLED" },
      }),

      // Avaliação média (através do ServiceHistory)
      db.serviceHistory.aggregate({
        where: { serviceId },
        _avg: { rating: true },
      }),

      // Últimos agendamentos
      db.appointment.findMany({
        where: { serviceId },
        include: {
          user: {
            select: {
              id: true,
              name: true,
              image: true,
            },
          },
          barber: {
            select: {
              id: true,
              name: true,
              image: true,
            },
          },
        },
        orderBy: { createdAt: "desc" },
        take: 5,
      }),
    ]);

    const completionRate =
      totalAppointments > 0
        ? (completedAppointments / totalAppointments) * 100
        : 0;

    const cancellationRate =
      totalAppointments > 0
        ? (cancelledAppointments / totalAppointments) * 100
        : 0;

    return {
      totalAppointments,
      completedAppointments,
      cancelledAppointments,
      completionRate: Math.round(completionRate * 100) / 100,
      cancellationRate: Math.round(cancellationRate * 100) / 100,
      averageRating: averageRating._avg.rating
        ? Math.round(averageRating._avg.rating * 100) / 100
        : null,
      recentAppointments,
    };
  }

  /**
   * Buscar serviços mais populares
   */
  static async findPopular(limit: number = 5) {
    const services = await db.service.findMany({
      where: { active: true },
      include: {
        _count: {
          select: {
            appointments: {
              where: {
                status: "COMPLETED",
                date: {
                  gte: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000), // Últimos 30 dias
                },
              },
            },
          },
        },
      },
      orderBy: {
        appointments: {
          _count: "desc",
        },
      },
      take: limit,
    });

    return services;
  }

  /**
   * Verificar disponibilidade do serviço para uma data
   */
  static async checkAvailabilityForDate(serviceId: string, date: Date) {
    // Buscar barbeiros que podem executar esse serviço
    const barbersWithAppointments = await db.user.findMany({
      where: {
        role: "BARBER",
        isActive: true,
      },
      include: {
        servicesProvided: {
          where: {
            serviceId,
            date: {
              gte: new Date(
                date.getFullYear(),
                date.getMonth(),
                date.getDate()
              ),
              lt: new Date(
                date.getFullYear(),
                date.getMonth(),
                date.getDate() + 1
              ),
            },
            status: {
              in: ["SCHEDULED", "CONFIRMED"],
            },
          },
          include: {
            service: {
              select: { duration: true },
            },
          },
        },
      },
    });

    // Para cada barbeiro, calcular slots disponíveis
    const availableSlots = barbersWithAppointments.map((barber) => {
      const appointments = barber.servicesProvided;

      // Horário de funcionamento: 8h às 18h (pode ser configurável)
      const workStart = new Date(date);
      workStart.setHours(8, 0, 0, 0);

      const workEnd = new Date(date);
      workEnd.setHours(18, 0, 0, 0);

      const slots: Date[] = [];
      let currentTime = new Date(workStart);

      while (currentTime < workEnd) {
        // Verificar se este horário não conflita com agendamentos existentes
        const hasConflict = appointments.some((appointment) => {
          const appointmentEnd = new Date(
            appointment.date.getTime() + appointment.service.duration * 60000
          );
          return (
            currentTime >= appointment.date && currentTime < appointmentEnd
          );
        });

        if (!hasConflict) {
          slots.push(new Date(currentTime));
        }

        // Incrementar em 30 minutos
        currentTime.setMinutes(currentTime.getMinutes() + 30);
      }

      return {
        barberId: barber.id,
        barberName: barber.name,
        availableSlots: slots,
      };
    });

    return availableSlots;
  }

  /**
   * Buscar serviços com promoções ativas
   */
  static async findWithActivePromotions() {
    const now = new Date();

    return await db.service.findMany({
      where: {
        active: true,
        promotionServices: {
          some: {
            promotion: {
              active: true,
              validFrom: { lte: now },
              OR: [{ validUntil: null }, { validUntil: { gte: now } }],
            },
          },
        },
      },
      include: {
        promotionServices: {
          where: {
            promotion: {
              active: true,
              validFrom: { lte: now },
              OR: [{ validUntil: null }, { validUntil: { gte: now } }],
            },
          },
          include: {
            promotion: true,
          },
        },
      },
    });
  }
}
