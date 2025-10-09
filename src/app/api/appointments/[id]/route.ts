import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { db } from "@/lib/prisma";
import {
  UpdateAppointmentSchema,
  CancelAppointmentSchema,
} from "@/schemas/appointmentSchemas";

/**
 * GET /api/appointments/[id]
 * Busca um agendamento específico
 */
export async function GET(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const params = await context.params;
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      return NextResponse.json(
        { error: "Usuário não autenticado" },
        { status: 401 }
      );
    }

    const appointment = await db.appointment.findUnique({
      where: {
        id: params.id,
        userId: session.user.id, // Só pode ver próprios agendamentos
      },
      include: {
        service: true,
        barber: {
          select: {
            id: true,
            name: true,
            image: true,
            phone: true,
            email: true,
          },
        },
        voucher: true,
        appliedPromotion: true,
        serviceHistory: true,
      },
    });

    if (!appointment) {
      return NextResponse.json(
        { error: "Agendamento não encontrado" },
        { status: 404 }
      );
    }

    return NextResponse.json(appointment);
  } catch (error) {
    console.error("Erro ao buscar agendamento:", error);
    return NextResponse.json(
      { error: "Erro interno do servidor" },
      { status: 500 }
    );
  }
}

/**
 * PUT /api/appointments/[id]
 * Atualiza um agendamento (reagendar, alterar status, etc.)
 */
export async function PUT(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const params = await context.params;
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      return NextResponse.json(
        { error: "Usuário não autenticado" },
        { status: 401 }
      );
    }

    const body = await request.json();
    const data = UpdateAppointmentSchema.parse(body);

    // Verificar se o agendamento existe e pertence ao usuário
    const existingAppointment = await db.appointment.findUnique({
      where: {
        id: params.id,
        userId: session.user.id,
      },
    });

    if (!existingAppointment) {
      return NextResponse.json(
        { error: "Agendamento não encontrado" },
        { status: 404 }
      );
    }

    // Verificar se pode ser alterado (regras de negócio)
    const now = new Date();
    const appointmentDate = new Date(existingAppointment.date);
    const hoursUntilAppointment =
      (appointmentDate.getTime() - now.getTime()) / (1000 * 60 * 60);

    // Não pode alterar agendamentos com menos de 2 horas
    if (hoursUntilAppointment < 2 && data.date) {
      return NextResponse.json(
        {
          error:
            "Não é possível reagendar com menos de 2 horas de antecedência",
        },
        { status: 400 }
      );
    }

    // Se mudando data, verificar disponibilidade
    if (data.date && data.barberId) {
      const conflictingAppointment = await db.appointment.findFirst({
        where: {
          barberId: data.barberId,
          date: data.date,
          status: {
            in: ["SCHEDULED", "CONFIRMED"],
          },
          id: {
            not: params.id, // Excluir o próprio agendamento
          },
        },
      });

      if (conflictingAppointment) {
        return NextResponse.json(
          { error: "Horário já ocupado" },
          { status: 409 }
        );
      }
    }

    // Atualizar agendamento
    const updatedAppointment = await db.appointment.update({
      where: { id: params.id },
      data,
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

    return NextResponse.json(updatedAppointment);
  } catch (error) {
    console.error("Erro ao atualizar agendamento:", error);

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

/**
 * DELETE /api/appointments/[id]
 * Cancela um agendamento
 */
export async function DELETE(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const params = await context.params;
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      return NextResponse.json(
        { error: "Usuário não autenticado" },
        { status: 401 }
      );
    }

    // Verificar se o agendamento existe e pertence ao usuário
    const existingAppointment = await db.appointment.findUnique({
      where: {
        id: params.id,
        userId: session.user.id,
      },
      include: {
        voucher: true,
      },
    });

    if (!existingAppointment) {
      return NextResponse.json(
        { error: "Agendamento não encontrado" },
        { status: 404 }
      );
    }

    // Verificar se pode ser cancelado
    if (existingAppointment.status === "COMPLETED") {
      return NextResponse.json(
        { error: "Não é possível cancelar agendamento já concluído" },
        { status: 400 }
      );
    }

    if (existingAppointment.status === "CANCELLED") {
      return NextResponse.json(
        { error: "Agendamento já está cancelado" },
        { status: 400 }
      );
    }

    // Verificar tempo para cancelamento (regra de negócio)
    const now = new Date();
    const appointmentDate = new Date(existingAppointment.date);
    const hoursUntilAppointment =
      (appointmentDate.getTime() - now.getTime()) / (1000 * 60 * 60);

    // Marcar como cancelado
    const cancelledAppointment = await db.appointment.update({
      where: { id: params.id },
      data: {
        status: "CANCELLED",
        notes: existingAppointment.notes
          ? `${existingAppointment.notes}\n[CANCELADO pelo usuário]`
          : "[CANCELADO pelo usuário]",
      },
    });

    // Se cancelado com menos de 2 horas, não devolver voucher
    if (hoursUntilAppointment >= 2 && existingAppointment.voucher) {
      await db.voucher.update({
        where: { id: existingAppointment.voucher.id },
        data: { status: "ACTIVE" }, // Devolver voucher
      });
    }

    return NextResponse.json({
      message: "Agendamento cancelado com sucesso",
      appointment: cancelledAppointment,
      voucherRestored:
        hoursUntilAppointment >= 2 && !!existingAppointment.voucher,
    });
  } catch (error) {
    console.error("Erro ao cancelar agendamento:", error);
    return NextResponse.json(
      { error: "Erro interno do servidor" },
      { status: 500 }
    );
  }
}
