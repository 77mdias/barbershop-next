import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { db } from "@/lib/prisma";
import { 
  CreateAppointmentSchema, 
  AppointmentFiltersSchema,
  type CreateAppointmentInput 
} from "@/schemas/appointmentSchemas";

/**
 * GET /api/appointments
 * Lista agendamentos do usuário autenticado com filtros opcionais
 */
export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.id) {
      return NextResponse.json(
        { error: "Usuário não autenticado" },
        { status: 401 }
      );
    }

    const { searchParams } = new URL(request.url);
    const filters = AppointmentFiltersSchema.parse({
      status: searchParams.get("status") || undefined,
      serviceId: searchParams.get("serviceId") || undefined,
      barberId: searchParams.get("barberId") || undefined,
      startDate: searchParams.get("startDate") ? new Date(searchParams.get("startDate")!) : undefined,
      endDate: searchParams.get("endDate") ? new Date(searchParams.get("endDate")!) : undefined,
      page: searchParams.get("page") ? parseInt(searchParams.get("page")!) : 1,
      limit: searchParams.get("limit") ? parseInt(searchParams.get("limit")!) : 10,
    });

    const where: any = {
      userId: session.user.id,
    };

    if (filters.status) where.status = filters.status;
    if (filters.serviceId) where.serviceId = filters.serviceId;
    if (filters.barberId) where.barberId = filters.barberId;
    if (filters.startDate || filters.endDate) {
      where.date = {};
      if (filters.startDate) where.date.gte = filters.startDate;
      if (filters.endDate) where.date.lte = filters.endDate;
    }

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
        skip: (filters.page - 1) * filters.limit,
        take: filters.limit,
      }),
      db.appointment.count({ where }),
    ]);

    return NextResponse.json({
      appointments,
      pagination: {
        page: filters.page,
        limit: filters.limit,
        total,
        totalPages: Math.ceil(total / filters.limit),
      },
    });

  } catch (error) {
    console.error("Erro ao buscar agendamentos:", error);
    return NextResponse.json(
      { error: "Erro interno do servidor" },
      { status: 500 }
    );
  }
}

/**
 * POST /api/appointments
 * Cria um novo agendamento
 */
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.id) {
      return NextResponse.json(
        { error: "Usuário não autenticado" },
        { status: 401 }
      );
    }

    const body = await request.json();
    const data = CreateAppointmentSchema.parse(body);

    // Verificar se o serviço existe e está ativo
    const service = await db.service.findUnique({
      where: { id: data.serviceId, active: true },
    });

    if (!service) {
      return NextResponse.json(
        { error: "Serviço não encontrado ou inativo" },
        { status: 404 }
      );
    }

    // Verificar se o barbeiro existe e é ativo
    const barber = await db.user.findUnique({
      where: { 
        id: data.barberId,
        role: "BARBER",
        isActive: true,
      },
    });

    if (!barber) {
      return NextResponse.json(
        { error: "Barbeiro não encontrado ou inativo" },
        { status: 404 }
      );
    }

    // Verificar disponibilidade do horário
    const conflictingAppointment = await db.appointment.findFirst({
      where: {
        barberId: data.barberId,
        date: data.date,
        status: {
          in: ["SCHEDULED", "CONFIRMED"],
        },
      },
    });

    if (conflictingAppointment) {
      return NextResponse.json(
        { error: "Horário já ocupado" },
        { status: 409 }
      );
    }

    // Verificar voucher se fornecido
    if (data.voucherId) {
      const voucher = await db.voucher.findUnique({
        where: {
          id: data.voucherId,
          userId: session.user.id,
          status: "ACTIVE",
        },
      });

      if (!voucher) {
        return NextResponse.json(
          { error: "Voucher inválido" },
          { status: 400 }
        );
      }

      // Verificar se o voucher é válido para a data
      const now = new Date();
      if (voucher.validUntil && voucher.validUntil < now) {
        return NextResponse.json(
          { error: "Voucher expirado" },
          { status: 400 }
        );
      }
    }

    // Criar o agendamento
    const appointment = await db.appointment.create({
      data: {
        ...data,
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

    // Se houver voucher, marcar como usado (implementar lógica específica)
    if (data.voucherId) {
      await db.voucher.update({
        where: { id: data.voucherId },
        data: { status: "USED" },
      });
    }

    return NextResponse.json(appointment, { status: 201 });

  } catch (error) {
    console.error("Erro ao criar agendamento:", error);
    
    if (error instanceof Error && error.name === "ZodError") {
      return NextResponse.json(
        { error: "Dados inválidos", details: error.message },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { error: "Erro interno do servidor" },
      { status: 500 }
    );
  }
}