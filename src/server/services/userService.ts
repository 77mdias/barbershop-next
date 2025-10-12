import { db } from "@/lib/prisma";
import { UserRole, Prisma } from "@prisma/client";
import type { UserFiltersInput } from "@/schemas/userSchemas";

export interface UserWithStats {
  id: string;
  name: string;
  email: string;
  image: string | null;
  role: UserRole;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
  _count?: {
    appointments: number;
    servicesProvided: number;
  };
}

export class UserService {
  /**
   * Buscar usuários com filtros
   */
  static async findMany(filters: Partial<UserFiltersInput> = {}) {
    const where: Prisma.UserWhereInput = {};

    if (filters.role) where.role = filters.role;
    if (filters.isActive !== undefined) where.isActive = filters.isActive;
    if (filters.search) {
      where.OR = [
        { name: { contains: filters.search, mode: "insensitive" } },
        { email: { contains: filters.search, mode: "insensitive" } },
      ];
    }

    const page = filters.page || 1;
    const limit = filters.limit || 20;

    const [users, total] = await Promise.all([
      db.user.findMany({
        where,
        select: {
          id: true,
          name: true,
          email: true,
          image: true,
          role: true,
          isActive: true,
          createdAt: true,
          updatedAt: true,
          _count: {
            select: {
              appointments: true,
              servicesProvided: true,
            },
          },
        },
        orderBy: [{ isActive: "desc" }, { name: "asc" }],
        skip: (page - 1) * limit,
        take: limit,
      }),
      db.user.count({ where }),
    ]);

    return {
      users,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  /**
   * Buscar usuário por ID
   */
  static async findById(id: string): Promise<UserWithStats | null> {
    return await db.user.findUnique({
      where: { id },
      select: {
        id: true,
        name: true,
        email: true,
        image: true,
        role: true,
        isActive: true,
        createdAt: true,
        updatedAt: true,
        _count: {
          select: {
            appointments: true,
            servicesProvided: true,
          },
        },
      },
    });
  }

  /**
   * Buscar todos os barbeiros ativos
   */
  static async findBarbers(): Promise<UserWithStats[]> {
    const result = await this.findMany({
      role: "BARBER",
      isActive: true,
      limit: 100,
      page: 1,
    });
    return result.users;
  }

  /**
   * Verificar se usuário é barbeiro ativo
   */
  static async isActiveBarber(id: string): Promise<boolean> {
    const user = await db.user.findUnique({
      where: {
        id,
        role: "BARBER",
        isActive: true,
      },
      select: { id: true },
    });
    return !!user;
  }

  /**
   * Buscar barbeiro por ID com detalhes
   */
  static async findBarberById(id: string) {
    return await db.user.findUnique({
      where: {
        id,
        role: "BARBER",
        isActive: true,
      },
      select: {
        id: true,
        name: true,
        email: true,
        image: true,
        role: true,
        isActive: true,
        createdAt: true,
        _count: {
          select: {
            servicesProvided: {
              where: {
                status: "COMPLETED",
              },
            },
          },
        },
      },
    });
  }

  /**
   * Buscar estatísticas do usuário/barbeiro
   */
  static async getUserStats(userId: string) {
    const user = await db.user.findUnique({
      where: { id: userId },
      select: { role: true },
    });

    if (!user) {
      throw new Error("Usuário não encontrado");
    }

    if (user.role === "BARBER") {
      return await this.getBarberStats(userId);
    } else {
      return await this.getClientStats(userId);
    }
  }

  /**
   * Estatísticas específicas do barbeiro
   */
  static async getBarberStats(barberId: string) {
    const [
      totalAppointments,
      completedAppointments,
      todayAppointments,
      weekAppointments,
      monthAppointments,
      averageRating,
      upcomingAppointments,
    ] = await Promise.all([
      // Total de agendamentos
      db.appointment.count({
        where: { barberId },
      }),

      // Agendamentos completados
      db.appointment.count({
        where: { barberId, status: "COMPLETED" },
      }),

      // Agendamentos hoje
      db.appointment.count({
        where: {
          barberId,
          date: {
            gte: new Date(new Date().setHours(0, 0, 0, 0)),
            lt: new Date(new Date().setHours(24, 0, 0, 0)),
          },
          status: {
            in: ["SCHEDULED", "CONFIRMED"],
          },
        },
      }),

      // Agendamentos esta semana
      db.appointment.count({
        where: {
          barberId,
          date: {
            gte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000),
          },
          status: {
            in: ["SCHEDULED", "CONFIRMED", "COMPLETED"],
          },
        },
      }),

      // Agendamentos este mês
      db.appointment.count({
        where: {
          barberId,
          date: {
            gte: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000),
          },
          status: {
            in: ["SCHEDULED", "CONFIRMED", "COMPLETED"],
          },
        },
      }),

      // Avaliação média
      db.serviceHistory.aggregate({
        where: {
          appointments: {
            some: {
              barberId,
            },
          },
        },
        _avg: { rating: true },
      }),

      // Próximos agendamentos
      db.appointment.findMany({
        where: {
          barberId,
          date: { gte: new Date() },
          status: {
            in: ["SCHEDULED", "CONFIRMED"],
          },
        },
        include: {
          user: {
            select: {
              id: true,
              name: true,
              image: true,
            },
          },
          service: {
            select: {
              id: true,
              name: true,
              duration: true,
            },
          },
        },
        orderBy: { date: "asc" },
        take: 5,
      }),
    ]);

    const completionRate =
      totalAppointments > 0
        ? (completedAppointments / totalAppointments) * 100
        : 0;

    return {
      totalAppointments,
      completedAppointments,
      todayAppointments,
      weekAppointments,
      monthAppointments,
      completionRate: Math.round(completionRate * 100) / 100,
      averageRating: averageRating._avg.rating
        ? Math.round(averageRating._avg.rating * 100) / 100
        : null,
      upcomingAppointments,
    };
  }

  /**
   * Estatísticas específicas do cliente
   */
  static async getClientStats(userId: string) {
    const [
      totalAppointments,
      completedAppointments,
      upcomingAppointments,
      favoriteServices,
      spentTotal,
    ] = await Promise.all([
      // Total de agendamentos
      db.appointment.count({
        where: { userId },
      }),

      // Agendamentos completados
      db.appointment.count({
        where: { userId, status: "COMPLETED" },
      }),

      // Próximos agendamentos
      db.appointment.findMany({
        where: {
          userId,
          date: { gte: new Date() },
          status: {
            in: ["SCHEDULED", "CONFIRMED"],
          },
        },
        include: {
          barber: {
            select: {
              id: true,
              name: true,
              image: true,
            },
          },
          service: {
            select: {
              id: true,
              name: true,
              duration: true,
              price: true,
            },
          },
        },
        orderBy: { date: "asc" },
        take: 3,
      }),

      // Serviços mais utilizados
      db.appointment.groupBy({
        by: ["serviceId"],
        where: {
          userId,
          status: "COMPLETED",
        },
        _count: true,
        orderBy: {
          _count: {
            serviceId: "desc",
          },
        },
        take: 3,
      }),

      // Total gasto
      db.serviceHistory.aggregate({
        where: { userId },
        _sum: { finalPrice: true },
      }),
    ]);

    // Buscar detalhes dos serviços favoritos
    const favoriteServicesDetails = await Promise.all(
      favoriteServices.map(async (item) => {
        const service = await db.service.findUnique({
          where: { id: item.serviceId },
          select: {
            id: true,
            name: true,
            price: true,
          },
        });
        return {
          service,
          count: item._count,
        };
      })
    );

    return {
      totalAppointments,
      completedAppointments,
      upcomingAppointments,
      favoriteServices: favoriteServicesDetails,
      totalSpent: spentTotal._sum.finalPrice || 0,
    };
  }

  /**
   * Verificar disponibilidade do barbeiro para uma data/hora
   */
  static async isBarberAvailable(
    barberId: string,
    date: Date,
    duration: number,
    excludeAppointmentId?: string
  ): Promise<boolean> {
    const endTime = new Date(date.getTime() + duration * 60000);

    const where: Prisma.AppointmentWhereInput = {
      barberId,
      status: {
        in: ["SCHEDULED", "CONFIRMED"],
      },
      OR: [
        {
          date: { lte: date },
        },
        {
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

    // Verificar sobreposição real
    for (const appointment of conflictingAppointments) {
      const appointmentEnd = new Date(
        appointment.date.getTime() + appointment.service.duration * 60000
      );

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
   * Buscar horários livres do barbeiro para um dia
   */
  static async getBarberAvailableSlots(
    barberId: string,
    date: Date,
    serviceDuration: number
  ) {
    // Horário de funcionamento: 8h às 18h
    const workStart = new Date(date);
    workStart.setHours(8, 0, 0, 0);

    const workEnd = new Date(date);
    workEnd.setHours(18, 0, 0, 0);

    const appointments = await db.appointment.findMany({
      where: {
        barberId,
        date: {
          gte: workStart,
          lt: workEnd,
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
      orderBy: { date: "asc" },
    });

    const slots: Date[] = [];
    // eslint-disable-next-line prefer-const
    let currentTime = new Date(workStart);

    while (
      currentTime.getTime() + serviceDuration * 60000 <=
      workEnd.getTime()
    ) {
      const slotEnd = new Date(currentTime.getTime() + serviceDuration * 60000);

      // Verificar se este slot não conflita com agendamentos
      const hasConflict = appointments.some((appointment) => {
        const appointmentEnd = new Date(
          appointment.date.getTime() + appointment.service.duration * 60000
        );

        return (
          (currentTime >= appointment.date && currentTime < appointmentEnd) ||
          (slotEnd > appointment.date && slotEnd <= appointmentEnd) ||
          (currentTime <= appointment.date && slotEnd >= appointmentEnd)
        );
      });

      if (!hasConflict) {
        slots.push(new Date(currentTime));
      }

      // Incrementar em 30 minutos
      currentTime.setMinutes(currentTime.getMinutes() + 30);
    }

    return slots;
  }
}
